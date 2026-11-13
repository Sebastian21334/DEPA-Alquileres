import { CatalogosService } from '../../catalogos/service/catalogos.service';
import type { EntityManager } from 'typeorm';
import {
  type IReservaRepository,
  RESERVA_REPOSITORY,
} from '../repository/reserva.repository.interface';
import {
  decimalEntero,
  importeTexto,
  monedaPublicacion,
} from '../../common/utils/importes';
import { CotizacionDolar } from '../../cotizaciones/entity/cotizacion-dolar.entity';
import { ConfigService } from '@nestjs/config';
import { ReservaNotificacionesService } from './reserva-notificaciones.service';
import { LiquidacionesService } from '../../liquidaciones/service/liquidaciones.service';
import { generarCodigoAlojamiento } from './reservas.utils';
import { ReservaEstadoService } from '../../reservas-consulta/service/reserva-estado.service';
import type { ReservaRespuestaDto } from '../../reservas-consulta/dto/reserva-respuesta.dto';
import { timingSafeEqual } from 'node:crypto';
import { esFechaCalendarioValida, fechaArgentina } from '../../common/utils/fechas';
import {
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
  OnApplicationBootstrap,
  OnModuleDestroy,
} from '@nestjs/common';
import { Reserva, type ActorCancelacion, type CausaCancelacion } from '../entity/reserva.entity';
import { CrearReservaDto } from '../dto/crear-reserva.dto';
import { DisponibilidadService } from '../../disponibilidad/service/disponibilidad.service';
import { UsuariosService } from '../../usuarios/service/usuarios.service';
import { PublicacionesService } from '../../publicaciones/service/publicaciones.service';
import { ReembolsosService } from '../../reembolsos/service/reembolsos.service';
import { OrigenReembolso, Reembolso } from '../../reembolsos/entity/reembolso.entity';
import { TOLERANCIA_MONETARIA } from '../../common/utils/dinero';

export type CondicionesCobro = {
  precio_unitario_origen: string;
  moneda_origen: 'ARS' | 'USD';
  total_origen: string;
  total_cobro: string;
  cotizacion_id: number | null;
  emitida_en: string;
  vence_en: string;
};

@Injectable()
export class ReservasService
  implements OnApplicationBootstrap, OnModuleDestroy
{
  private readonly logger = new Logger(ReservasService.name);
  private timer?: ReturnType<typeof setInterval>;
  private expiracion?: Promise<number>;

  constructor(private readonly config: ConfigService, @Inject(RESERVA_REPOSITORY) private readonly reservaRepository: IReservaRepository, private readonly disponibilidadService: DisponibilidadService, private readonly usuariosService: UsuariosService, private readonly publicacionesService: PublicacionesService, private readonly notificacionesService: ReservaNotificacionesService, private readonly reembolsosService: ReembolsosService, private readonly estadoService: ReservaEstadoService, private readonly liquidaciones: LiquidacionesService, private readonly catalogos: CatalogosService) {}

  /**
   * Libera las reservas vencidas al iniciar y cada minuto. El estado se
   * persiste en la base, por lo que un reinicio no pierde los vencimientos.
   */
  onApplicationBootstrap(): void {
    void this.expirarPendientes().catch((error) =>
      this.logger.error(
        'No se pudieron liberar las reservas vencidas al iniciar',
        error as Error,
      ),
    );
    this.timer = setInterval(() => {
      void this.expirarPendientes().catch((error) =>
        this.logger.error(
          'No se pudieron liberar las reservas vencidas',
          error as Error,
        ),
      );
    }, 60_000);
    this.timer.unref();
  }

  onModuleDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }

  /**
   * Cierra las reservas pendientes cuyo plazo de pago venció y libera sus
   * fechas. Es idempotente: el bloqueo de cada reserva evita duplicados si
   * el temporizador y una creación de reserva se ejecutan a la vez.
   */
  async expirarPendientes(): Promise<number> {
    if (this.expiracion) return this.expiracion;
    this.expiracion = this.ejecutarExpiracion();
    try {
      return await this.expiracion;
    } finally {
      this.expiracion = undefined;
    }
  }

  private async ejecutarExpiracion(): Promise<number> {
    let vencidas: Reserva[];
    try {
      vencidas = await this.reservaRepository.buscarPendientesVencidas(
        new Date(), this.catalogos.codigoEstado('PAGO_RESERVA', 'PENDIENTE'),
      );
    } catch (error) {
      this.logger.error(
        'No se pudieron consultar las reservas vencidas',
        error as Error,
      );
      return 0;
    }

    let cerradas = 0;
    for (const reserva of vencidas) {
      try {
        await this.rechazarPago(reserva.id, this.catalogos.codigoEstado('PAGO_RESERVA', 'CANCELADO'));
        cerradas += 1;
      } catch (error) {
        this.logger.error(
          `No se pudo liberar la reserva vencida ${reserva.id}`,
          error as Error,
        );
      }
    }
    if (cerradas > 0)
      this.logger.log(`Reservas vencidas liberadas: ${cerradas}`);
    return cerradas;
  }

  /**
   * Crea una reserva y conserva una copia del periodo y de los datos del
   * inquilino para mantener el historial aunque la cuenta sea eliminada.
   * La validación del calendario, la reserva y sus fechas se confirman
   * en una única transacción, con el calendario bloqueado.
   */
  async crearPendiente(dto: CrearReservaDto, idUsuario: number, condiciones: CondicionesCobro): Promise<Reserva> {
    if (!condiciones) {
      throw new BadRequestException(
        'Primero debés cotizar y aceptar un presupuesto antes de pagar',
      );
    }
    // El DTO trae el rango; Reserva conserva el periodo y Fecha mantiene
    // cada dia para bloquearlo en el calendario.
    const inicio = new Date(dto.fecha_inicio);
    const fin = new Date(dto.fecha_fin);

    if (inicio > fin) {
      throw new BadRequestException(
        'La fecha de inicio no puede ser posterior a la de fin',
      );
    }

    const publicacion = await this.publicacionesService.buscarPorId(
      dto.id_publicacion,
    );
    if (publicacion.eliminada || !publicacion.activa || !this.publicacionesService.cuentaAnuncianteHabilitada(publicacion)) {
      throw new BadRequestException(
        'No se puede reservar: la publicación no está disponible',
      );
    }
    if (this.publicacionesService.perteneceA(publicacion, idUsuario)) {
      throw new BadRequestException('No podés reservar tu propia publicación');
    }
    if (!this.publicacionesService.admiteReservaPorFecha(publicacion)) {
      throw new BadRequestException(
        'Solo las publicaciones temporales o de alquiler diario admiten reservas por fecha',
      );
    }
    const hoy = fechaArgentina();
    if (dto.fecha_inicio < hoy || dto.fecha_fin < hoy) {
      throw new BadRequestException(
        'Las fechas de la reserva no pueden ser anteriores a hoy',
      );
    }
    const cantidadDias =
      Math.floor((fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24)) +
      1;
    let moneda: 'ARS' | 'USD', original: string;
    try {
      moneda = monedaPublicacion(publicacion.tipoMoneda?.nombre);
      original = importeTexto(
        decimalEntero(publicacion.precio, 2) * BigInt(cantidadDias),
      );
      if (decimalEntero(original, 2) <= 0n)
        throw new Error('El precio debe ser mayor a cero');
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Precio inválido',
      );
    }
    if ((this.config.get<string>('MP_CURRENCY_ID') ?? 'ARS') !== 'ARS') {
      throw new BadRequestException(
        'Esta integración solo admite cobros en ARS',
      );
    }
    if (
      condiciones.moneda_origen !== moneda ||
      condiciones.total_origen !== original ||
      condiciones.precio_unitario_origen !==
        importeTexto(decimalEntero(publicacion.precio, 2))
    ) {
      throw new ConflictException(
        'El precio o la moneda cambiaron. Solicitá un nuevo presupuesto.',
      );
    }
    const precioDiario = Number(publicacion.precio);
    const montoCalculado = Number(condiciones.total_cobro);

    const usuario = await this.usuariosService.buscarPorId(idUsuario);
    if (!usuario) {
      throw new NotFoundException(
        'No se encontró el usuario que realiza la reserva',
      );
    }

    // Una preferencia vencida no debe dejar bloqueado el calendario para siempre.
    await this.expirarPendientes();

    const guardada = await this.reservaRepository.conTransaccion(
      async (reservaRepository, transaccion) => {
        await this.publicacionesService.bloquearParaModificacion(dto.id_publicacion, transaccion);
        const actual = await this.publicacionesService.buscarCondicionesDeReserva(
          dto.id_publicacion,
          transaccion,
        );
        let monedaActual: 'ARS' | 'USD' | undefined;
        try {
          monedaActual = monedaPublicacion(actual?.tipoMoneda?.nombre);
        } catch {
          monedaActual = undefined;
        }
        if (
          !actual?.activa ||
          actual.eliminada ||
          !this.publicacionesService.cuentaAnuncianteHabilitada(actual) ||
          Number(actual.precio) !== precioDiario ||
          monedaActual !== moneda
        ) {
          throw new ConflictException(
            'La publicación cambió. Volvé a cotizar antes de pagar.',
          );
        }
        if (new Date(condiciones.vence_en).getTime() <= Date.now()) {
          throw new ConflictException(
            'El presupuesto venció. Volvé a cotizar antes de pagar.',
          );
        }
        // Delegamos la pregunta "¿está libre este rango?" al módulo que es
        // dueño de esa lógica (Disponibilidad), en vez de duplicarla acá
        const disponible =
          await this.disponibilidadService.verificarDisponibilidad(
            dto.id_publicacion,
            inicio,
            fin,
            transaccion,
          );

        if (!disponible) {
          throw new ConflictException(
            'El rango de fechas seleccionado no está disponible',
          );
        }

        // Las relaciones se crean con solo el ID: TypeORM puede resolver las FK sin cargar entidades completas.
        const reserva = reservaRepository.crear({
          finalizada: false,
          cancelada: false,
          fecha_cancelacion: null,
          monto_pago: montoCalculado,
          precio_unitario_contratado: precioDiario,
          importe_contratado: montoCalculado,
          moneda_contratada: 'ARS',
          moneda_origen: moneda,
          importe_origen: Number(original),
          cotizacion_dolar: condiciones.cotizacion_id
            ? Object.assign(new CotizacionDolar(), {
                id: condiciones.cotizacion_id,
              })
            : null,
          cotizacion_aceptada_en: new Date(),
          presupuesto_emitido_en: new Date(condiciones.emitida_en),
          presupuesto_vence_en: new Date(condiciones.vence_en),
          fecha_pago: null,
          estado_pago: this.catalogos.codigoEstado('PAGO_RESERVA', 'PENDIENTE'),
          estado_liquidacion: this.catalogos.codigoEstado('LIQUIDACION_RESERVA', 'NO_APLICA'),
          codigo_alojamiento: null,
          codigo_generado_en: null,
          codigo_validado_en: null,
          intentos_codigo: 0,
          fecha_resolucion_liquidacion: null,
          referencia_liquidacion: null,
          observacion_liquidacion: null,
          pago_vencimiento: new Date(condiciones.vence_en),
          fecha_inicio: inicio.toISOString().slice(0, 10),
          fecha_fin: fin.toISOString().slice(0, 10),
          usuario_nombre: usuario.nombre,
          usuario_apellido: usuario.apellido,
          usuario_email: usuario.email,
          usuario_telefono: usuario.telefono,
          usuario,
          publicacion,
        });

        // Persistimos la reserva primero para obtener su ID antes de asociarlo a las fechas.
        const reservaGuardada = await reservaRepository.guardar(reserva);
        await this.liquidaciones.sincronizarDesdeReserva(
          reservaGuardada,
          transaccion,
        );

        // Primero se guarda la reserva para no enlazar fechas a una reserva sin ID.
        await this.disponibilidadService.marcarComoReservadas(
          dto.id_publicacion,
          inicio,
          fin,
          reservaGuardada.id,
          transaccion,
        );

        return reservaGuardada;
      },
    );
    return this.prepararRespuesta(guardada);
  }

  /** Confirma la reserva únicamente después de verificar el pago con Mercado Pago. */
  async confirmarPago(id: number, fechaPago: Date): Promise<Reserva> {
    const guardada = await this.reservaRepository.conTransaccion(
      async (reservaRepository, transaccion) => {
        const reserva = await reservaRepository.buscarPorId(id);
        if (!reserva)
          throw new NotFoundException(`No se encontró la reserva ${id}`);
        await this.liquidaciones.proyectarEnReserva(reserva, transaccion);

        // Mercado Pago puede notificar el mismo pago más de una vez.
        if (this.pagoAprobado(reserva)) return reserva;
        if (this.liquidacionResuelta(reserva)) return reserva;

        // Un anunciante bloqueado o inactivo no puede confirmar ni reactivar reservas.
        if (
          reserva.publicacion &&
          !this.publicacionesService.cuentaAnuncianteHabilitada(reserva.publicacion)
        ) {
          this.cerrarSinPago(reserva, this.catalogos.codigoEstado('PAGO_RESERVA', 'CANCELADO'));
          this.registrarPagoParaRevision(
            reserva,
            fechaPago,
            'Pago aprobado sobre una reserva de un anunciante bloqueado o inactivo; requiere devolución',
          );
          const guardada = await reservaRepository.guardar(reserva);
          await this.liquidaciones.sincronizarDesdeReserva(
            guardada,
            transaccion,
          );
          await this.disponibilidadService.liberarReserva(id, transaccion);
          this.logger.warn(
            `La reserva ${reserva.id} recibió un pago aprobado con el anunciante bloqueado o inactivo; requiere devolución`,
          );
          return guardada;
        }

        // Una reserva cancelada por bloqueo no se reactiva con un pago tardío.
        if (this.fueCanceladaPorBloqueo(reserva)) {
          this.registrarPagoParaRevision(
            reserva,
            fechaPago,
            'Pago aprobado sobre una reserva cancelada por bloqueo; requiere revisión y devolución',
          );
          const guardada = await reservaRepository.guardar(reserva);
          await this.liquidaciones.sincronizarDesdeReserva(
            guardada,
            transaccion,
          );
          this.logger.warn(
            `La reserva ${reserva.id} recibió un pago tardío tras una cancelación por bloqueo; requiere devolución`,
          );
          return guardada;
        }

        if (reserva.cancelada) {
          const publicacion = reserva.publicacion;
          const inicio = reserva.fecha_inicio;
          const fin = reserva.fecha_fin;
          const puedeReactivar =
            reserva.estado_pago === this.catalogos.codigoEstado('PAGO_RESERVA', 'CANCELADO') &&
            this.pagoDentroDelPlazo(reserva, fechaPago) &&
            publicacion != null &&
            inicio != null &&
            fin != null;

          // Si el pago se aprobó dentro del plazo y las fechas siguen libres,
          // se recupera la misma reserva. Si ya fueron tomadas, queda en revisión.
          if (puedeReactivar && publicacion && inicio && fin) {
            try {
              await this.disponibilidadService.marcarComoReservadas(
                publicacion.id,
                new Date(inicio),
                new Date(fin),
                reserva.id,
                transaccion,
              );
              this.reactivarPago(reserva, fechaPago, generarCodigoAlojamiento());
            } catch (error) {
              if (
                !(error instanceof ConflictException) &&
                !(error instanceof NotFoundException)
              ) {
                throw error;
              }
            }
            if (!reserva.cancelada) {
              const reactivada = await reservaRepository.guardar(reserva);
              await this.liquidaciones.sincronizarDesdeReserva(
                reactivada,
                transaccion,
              );
              return reactivada;
            }
          }

          let motivo: string;
          if (
            reserva.estado_pago === this.catalogos.codigoEstado('PAGO_RESERVA', 'CANCELADO') &&
            this.pagoDentroDelPlazo(reserva, fechaPago)
          ) {
            motivo =
              'Pago aprobado dentro del plazo, pero las fechas ya fueron reasignadas; requiere devolución';
          } else if (reserva.estado_pago === this.catalogos.codigoEstado('PAGO_RESERVA', 'CANCELADO')) {
            motivo =
              'Pago aprobado fuera del plazo de 15 minutos; requiere devolución';
          } else {
            motivo =
              'Pago aprobado sobre una reserva cancelada; requiere revisión y devolución';
          }
          this.registrarPagoParaRevision(reserva, fechaPago, motivo);
          this.logger.warn(
            `La reserva ${reserva.id} recibió un pago aprobado que no puede confirmarse: ${motivo}`,
          );
          const enRevision = await reservaRepository.guardar(reserva);
          await this.liquidaciones.sincronizarDesdeReserva(
            enRevision,
            transaccion,
          );
          return enRevision;
        }

        this.registrarConfirmacionPago(reserva, fechaPago, generarCodigoAlojamiento());
        const aprobada = await reservaRepository.guardar(reserva);
        await this.liquidaciones.sincronizarDesdeReserva(aprobada, transaccion);
        return aprobada;
      },
    );

    // Se reintentan únicamente los correos pendientes; los pagos en revisión
    // no se presentan como una reserva confirmada.
    if (this.estaConfirmada(guardada)) {
      await this.notificacionesService.enviarConfirmacion(guardada);
    }
    return this.prepararRespuesta(guardada);
  }

  /** Cierra una reserva cuyo pago falló o cuya preferencia no pudo crearse. */
  async rechazarPago(id: number, estado: string = this.catalogos.codigoEstado('PAGO_RESERVA', 'RECHAZADO'), actor?: ActorCancelacion, motivo?: string, causa?: CausaCancelacion): Promise<Reserva> {
    const guardada = await this.reservaRepository.conTransaccion(
      async (reservaRepository, transaccion) => {
        const reserva = await reservaRepository.buscarPorId(id);
        if (!reserva)
          throw new NotFoundException(`No se encontró la reserva ${id}`);
        await this.liquidaciones.proyectarEnReserva(reserva, transaccion);
        if (this.pagoAprobado(reserva)) return reserva;
        if (reserva.cancelada && reserva.estado_pago === estado) return reserva;

        this.cerrarSinPago(reserva, estado, actor, motivo, causa);
        const guardada = await reservaRepository.guardar(reserva);
        await this.liquidaciones.sincronizarDesdeReserva(
          guardada,
          transaccion,
        );
        await this.disponibilidadService.liberarReserva(id, transaccion);
        return guardada;
      },
    );
    return this.prepararRespuesta(guardada);
  }

  /**
   * Historial de reservas del inquilino logueado.
   */
  async listarPorUsuario(idUsuario: number): Promise<Reserva[]> {
    const reservas = await this.reservaRepository.buscarPorUsuario(idUsuario);
    return (await this.liquidaciones.proyectarListado(reservas)).map(reserva => this.prepararRespuesta(reserva));
  }

  /**
   * Reservas recibidas sobre una publicación puntual, para que el
   * anunciante vea quién reservó su propiedad.
   */
  async listarPorPublicacion(idPublicacion: number, idUsuarioQueOpera: number): Promise<Reserva[]> {
    await this.publicacionesService.obtenerPropia(
      idPublicacion,
      idUsuarioQueOpera,
      'No tenés permiso para consultar las reservas de esta publicación',
    );
    const reservas = await this.reservaRepository.buscarPorPublicacion(idPublicacion);
    return (await this.liquidaciones.proyectarListado(reservas)).map(reserva => this.prepararRespuesta(reserva));
  }

  /** Todas las reservas recibidas por publicaciones del anunciante autenticado. */
  async listarRecibidasPorAnunciante(idUsuarioAnunciante: number): Promise<Reserva[]> {
    const reservas = await this.reservaRepository.buscarRecibidasPorAnunciante(
      idUsuarioAnunciante, this.catalogos.codigoEstado('PAGO_RESERVA', 'APROBADO'),
    );
    return (await this.liquidaciones.proyectarListado(reservas)).map(reserva => this.prepararRespuesta(reserva));
  }

  async existeReservaAprobada(idPublicacion: number, idUsuarioInquilino: number): Promise<boolean> {
    return this.reservaRepository.existeAprobada(
      idPublicacion,
      idUsuarioInquilino, this.catalogos.codigoEstado('PAGO_RESERVA', 'APROBADO'),
    );
  }

  /**
   * El detalle de una reserva solo corresponde al inquilino que la realizó o
   * al anunciante dueño de la publicación. Así no basta un JWT y un ID válido.
   */
  async buscarPorId(id: number, idUsuarioQueOpera: number, transaccion?: EntityManager): Promise<Reserva> {
    const reserva = await this.obtenerReserva(id, transaccion);
    this.verificarParticipanteOPropietario(reserva, idUsuarioQueOpera);
    return this.prepararRespuesta(reserva);
  }

  async obtenerReserva(id: number, transaccion?: EntityManager): Promise<Reserva> {
    const reservas = transaccion ? this.reservaRepository.enTransaccion(transaccion) : this.reservaRepository;
    // Serializa cambios de la reserva y permite las lecturas de clave foránea.
    const reserva = await reservas.buscarPorId(id, transaccion ? 'for_no_key_update' : undefined);
    if (!reserva)
      throw new NotFoundException(`No se encontró la reserva ${id}`);
    return this.liquidaciones.proyectarEnReserva(reserva, transaccion);
  }

  conReservaParaReclamo<T>(id: number, crearReclamo: (reserva: Reserva, transaccion: EntityManager) => Promise<T>): Promise<T> {
    return this.reservaRepository.conTransaccion(async (reservas, transaccion) => {
      const reserva = await reservas.buscarParaReclamo(id);
      if (!reserva) throw new NotFoundException('No se encontró la reserva');
      const reclamo = await crearReclamo(reserva, transaccion);
      reserva.estado_liquidacion = this.catalogos.codigoEstado('LIQUIDACION_RESERVA', 'EN_REVISION');
      reserva.observacion_liquidacion = 'Reclamo del inquilino en revisión';
      reserva.fecha_resolucion_liquidacion = null;
      await reservas.guardar(reserva);
      await this.liquidaciones.sincronizarDesdeReserva(reserva, transaccion);
      return reclamo;
    });
  }

  prepararRespuesta(reserva: Reserva): ReservaRespuestaDto {
    return this.estadoService.prepararRespuesta(reserva);
  }

  calcularEstadoEstadia(reserva: Reserva, ahora = new Date()) {
    return this.estadoService.calcularEstadoEstadia(reserva, ahora);
  }

  esDelInquilino(reserva: Reserva, idUsuario: number): boolean {
    return reserva.usuario?.id === idUsuario;
  }

  esDelAnunciante(reserva: Reserva, idUsuario: number): boolean {
    return this.publicacionesService.perteneceA(reserva.publicacion, idUsuario);
  }


  /** Pagada y vigente: habilita el código de alojamiento, los reclamos y la liquidación. */


  /** El dinero ya se pagó al propietario o se devolvió al inquilino. */



  async resolverReclamoSinDevolucion(reserva: Reserva, observacion: string | undefined, transaccion: EntityManager): Promise<Reserva> {
    if (this.liquidacionResuelta(reserva))
      throw new ConflictException('La liquidación de la reserva ya fue resuelta');
    reserva.estado_liquidacion = this.codigoValidado(reserva)
      ? this.catalogos.codigoEstado('LIQUIDACION_RESERVA', 'PENDIENTE_PAGO_PROPIETARIO')
      : this.catalogos.codigoEstado('LIQUIDACION_RESERVA', 'RETENIDO');
    reserva.observacion_liquidacion =
      observacion?.trim() || 'Reclamo resuelto a favor del Anunciante';
    await this.liquidaciones.sincronizarDesdeReserva(reserva, transaccion);
    return reserva;
  }

  async congelarPorContracargo(reserva: Reserva, transaccion: EntityManager): Promise<void> {
    reserva.estado_pago = this.catalogos.codigoEstado('PAGO_RESERVA', 'CONTRACARGO');
    reserva.estado_liquidacion = this.catalogos.codigoEstado('LIQUIDACION_RESERVA', 'EN_REVISION');
    reserva.observacion_liquidacion = 'Contracargo abierto: liquidación congelada hasta su resolución';
    const guardada = await this.reservaRepository.enTransaccion(transaccion).guardar(reserva);
    await this.liquidaciones.sincronizarDesdeReserva(guardada, transaccion);
  }

  async restaurarPorContracargoGanado(reserva: Reserva, estadoPrevio: string | null, transaccion: EntityManager): Promise<Reserva> {
    this.restaurarPagoAprobado(reserva);
    reserva.estado_liquidacion = estadoPrevio ?? this.catalogos.codigoEstado('LIQUIDACION_RESERVA', 'RETENIDO');
    reserva.observacion_liquidacion = 'Contracargo resuelto a favor del Anunciante';
    await this.liquidaciones.sincronizarDesdeReserva(reserva, transaccion);
    return this.prepararRespuesta(await this.reservaRepository.enTransaccion(transaccion).guardar(reserva));
  }

  /** El inquilino participante o el anunciante dueño pueden cancelar. */
  async cancelar(id: number, idUsuarioQueOpera: number): Promise<Reserva> {
    const guardada = await this.reservaRepository.conTransaccion(
      async (reservaRepository, transaccion) => {
        const reserva = await reservaRepository.buscarPorId(id);
        if (!reserva)
          throw new NotFoundException(`No se encontró la reserva ${id}`);
        await this.liquidaciones.proyectarEnReserva(reserva, transaccion);
        this.verificarParticipanteOPropietario(reserva, idUsuarioQueOpera);
        if (reserva.finalizada)
          throw new BadRequestException(
            'No se puede cancelar una reserva finalizada',
          );
        if (reserva.cancelada) return reserva;
        if (this.pagoAprobado(reserva)) {
          throw new BadRequestException(
            'La reserva está pagada. Solicitá la cancelación con devolución desde el detalle de la reserva.',
          );
        }

        this.marcarCancelada(reserva,
          this.esDelInquilino(reserva, idUsuarioQueOpera)
            ? 'INQUILINO'
            : 'ANUNCIANTE',
          'Cancelación de reserva pendiente de pago',
        );
        const guardada = await reservaRepository.guardar(reserva);
        await this.liquidaciones.sincronizarDesdeReserva(
          guardada,
          transaccion,
        );
        await this.disponibilidadService.liberarReserva(
          reserva.id,
          transaccion,
        );
        return guardada;
      },
    );
    return this.prepararRespuesta(guardada);
  }

  /**
   * Cancela una estadía pagada sin devolución: conserva el pago, deja la
   * liquidación en revisión y libera el calendario. Participa de la transacción
   * de quien coordina la decisión, para que un fallo revierta todo el conjunto.
   */
  async cancelarConRetencionTotal(idReserva: number, actor: ActorCancelacion, motivo: string, transaccion: EntityManager): Promise<Reserva> {
    const reservas = this.reservaRepository.enTransaccion(transaccion);
    const reserva = await this.obtenerReserva(idReserva, transaccion);
    this.marcarCancelada(reserva, actor, motivo);
    reserva.estado_liquidacion = this.catalogos.codigoEstado('LIQUIDACION_RESERVA', 'EN_REVISION');
    reserva.observacion_liquidacion =
      'Cancelación con retención total; liquidación pendiente de revisión';
    const guardada = await reservas.guardar(reserva);
    await this.liquidaciones.sincronizarDesdeReserva(guardada, transaccion);
    await this.disponibilidadService.liberarReserva(idReserva, transaccion);
    return guardada;
  }

  async aplicarEfectoReembolso(reembolso: Reembolso, transaccion: EntityManager, observacion?: string): Promise<Reserva> {
    const reserva = await this.obtenerReserva(reembolso.reserva.id, transaccion);
    const esReclamo = reembolso.origen === OrigenReembolso.RECLAMO;
    const esContracargo = reembolso.origen === OrigenReembolso.CONTRACARGO;
    if (reserva.estado_liquidacion === this.catalogos.codigoEstado('LIQUIDACION_RESERVA', 'PAGADO_PROPIETARIO') &&
        !esReclamo && !esContracargo)
      throw new ConflictException('La reserva ya fue pagada al propietario; requiere revisar la devolución');

    const pago = await this.reembolsosService.buscarPagoPorReserva(reserva.id, transaccion);
    if (!pago) throw new NotFoundException('La reserva no tiene un pago registrado');
    const importeDevuelto = Number(pago.amount_refunded);
    const esTotal = Number(pago.amount) - importeDevuelto <= TOLERANCIA_MONETARIA;
    const puedeLiberarFechas = !!reserva.fecha_inicio && reserva.fecha_inicio > fechaArgentina() &&
      !this.codigoValidado(reserva);
    const ajusteAdmin = reembolso.origen === OrigenReembolso.AJUSTE_ADMIN;
    const resolucionAdmin = ajusteAdmin && reembolso.referencia_interna === `liq:${reserva.id}`;
    const reversionSinPago = esTotal && !this.pagoAprobado(reserva) &&
      reserva.estado_pago !== this.catalogos.codigoEstado('PAGO_RESERVA', 'CONTRACARGO') &&
      reserva.estado_pago !== this.catalogos.codigoEstado('PAGO_RESERVA', 'REEMBOLSADO');
    const cancelaReserva = !reserva.cancelada && (
      reversionSinPago ||
      reembolso.origen === OrigenReembolso.CANCELACION ||
      (esTotal && resolucionAdmin) ||
      (esTotal && puedeLiberarFechas && (esContracargo || ajusteAdmin))
    );

    if (esTotal) this.aplicarReembolsoTotal(reserva);
    else {
      if (esContracargo) this.restaurarPagoAprobado(reserva);
      this.aplicarReembolsoParcial(reserva);
    }
    if (cancelaReserva) this.marcarCancelada(reserva, 'ADMINISTRADOR', reembolso.motivo);
    if (esReclamo) reserva.observacion_liquidacion = observacion?.trim() || 'Reclamo resuelto a favor del Inquilino';
    const datos = {
      importe: importeDevuelto,
      moneda: reembolso.moneda,
      referencia: reembolso.referencia_externa,
      observacion: observacion?.trim() || reembolso.motivo,
    };
    const administrador = reembolso.resuelto_por?.id ?? reembolso.solicitado_por?.id;
    if (resolucionAdmin && administrador != null) {
      await this.liquidaciones.registrarResolucion(reserva, reserva.estado_liquidacion, datos, administrador, transaccion);
    } else {
      await this.liquidaciones.sincronizarDesdeReserva(reserva, transaccion, datos);
    }
    const guardada = await this.reservaRepository.enTransaccion(transaccion).guardar(reserva);
    if ((cancelaReserva && puedeLiberarFechas) || reversionSinPago) {
      await this.disponibilidadService.liberarReserva(reserva.id, transaccion);
    }
    return this.prepararRespuesta(guardada);
  }

  async listarReembolsosReserva(idReserva: number, idUsuario: number): Promise<Reembolso[]> {
    const reserva = await this.reservaRepository.buscarPorId(idReserva);
    if (!reserva)
      throw new NotFoundException(`No se encontró la reserva ${idReserva}`);
    this.verificarParticipanteOPropietario(reserva, idUsuario);
    return this.reembolsosService.listarPorReserva(idReserva);
  }

  private verificarParticipanteOPropietario(reserva: Reserva, idUsuarioQueOpera: number): void {
    if (!this.esDelInquilino(reserva, idUsuarioQueOpera) && !this.esDelAnunciante(reserva, idUsuarioQueOpera)) {
      throw new ForbiddenException(
        'No tenés permiso para consultar esta reserva',
      );
    }
  }
  async conReservaBloqueada(id: number, operar: (reserva: Reserva, transaccion: EntityManager) => Promise<void>): Promise<Reserva> {
    const guardada = await this.reservaRepository.conTransaccion(async (reservas, transaccion) => {
      const reserva = await this.obtenerReserva(id, transaccion);
      await operar(reserva, transaccion);
      return reservas.guardar(reserva);
    });
    return this.prepararRespuesta(guardada);
  }

  /** Devuelve el código únicamente al inquilino que realizó la reserva. */
  async consultarCodigoAlojamiento(id: number, idUsuario: number) {
    return this.reservaRepository.conTransaccion(
      async (reservaRepository, transaccion) => {
        const reserva = await reservaRepository.buscarPorIdConCodigo(id);
        if (!reserva)
          throw new NotFoundException(`No se encontró la reserva ${id}`);
        await this.liquidaciones.proyectarEnReserva(reserva, transaccion);
        if (!this.esDelInquilino(reserva, idUsuario)) {
          throw new ForbiddenException(
            'Solo el inquilino puede consultar el código de alojamiento',
          );
        }
        if (!this.estaConfirmada(reserva)) {
          throw new ConflictException(
            'El código estará disponible cuando el pago se encuentre aprobado',
          );
        }
        if (
          !['CONFIRMADA', 'PENDIENTE_INGRESO', 'EN_CURSO'].includes(
            this.calcularEstadoEstadia(reserva),
          )
        ) {
          throw new ConflictException(
            'El código no está disponible para una estadía cerrada o sin fechas verificables',
          );
        }
        // Compatibilidad con reservas aprobadas antes de incorporar RF21.
        const emitido = this.asegurarCodigoAlojamiento(
          reserva,
          generarCodigoAlojamiento(),
        );
        if (emitido) {
          await reservaRepository.guardar(reserva);
          await this.liquidaciones.sincronizarDesdeReserva(reserva, transaccion);
        }
        return {
          reserva_id: reserva.id,
          codigo: reserva.codigo_alojamiento,
          generado_en: reserva.codigo_generado_en,
          validado_en: reserva.codigo_validado_en,
          estado_liquidacion: reserva.estado_liquidacion,
        };
      },
    );
  }

  /** El anunciante presenta el código entregado físicamente por el huésped. */
  async validarCodigoAlojamiento(id: number, codigo: string, idUsuarioAnunciante: number): Promise<Reserva> {
    const resultado = await this.reservaRepository.conTransaccion(
      async (reservaRepository, transaccion) => {
        const reserva = await reservaRepository.buscarPorIdConCodigo(id);
        if (!reserva)
          throw new NotFoundException(`No se encontró la reserva ${id}`);
        await this.liquidaciones.proyectarEnReserva(reserva, transaccion);
        if (!this.esDelAnunciante(reserva, idUsuarioAnunciante)) {
          throw new ForbiddenException(
            'Solo el anunciante de la publicación puede validar el código',
          );
        }
        if (!this.estaConfirmada(reserva)) {
          throw new ConflictException('La reserva no se encuentra confirmada');
        }
        if (this.codigoValidado(reserva)) {
          throw new ConflictException(
            'El código de esta reserva ya fue utilizado',
          );
        }
        if (this.calcularEstadoEstadia(reserva) !== 'PENDIENTE_INGRESO') {
          throw new ConflictException(
            'El código solo puede validarse durante las fechas de la estadía',
          );
        }
        if (this.codigoBloqueado(reserva)) {
          throw new ConflictException(
            'Se alcanzó el límite de intentos. Contactá a un administrador',
          );
        }
        if (this.liquidacionEnRevision(reserva))
          throw new ConflictException('La reserva tiene un reclamo abierto y debe revisarla un administrador');

        const coincide = this.registrarIntentoCodigo(reserva, codigo);
        if (!coincide && this.codigoBloqueado(reserva))
          await this.liquidaciones.registrarRevision(
            reserva,
            reserva.observacion_liquidacion ??
              'Código bloqueado después de cinco intentos incorrectos',
            transaccion,
          );
        if (coincide)
          await this.liquidaciones.registrarValidacionCodigo(reserva, transaccion);
        await reservaRepository.guardar(reserva);
        if (!coincide) {
          return new BadRequestException(
            `Código incorrecto. Quedan ${this.intentosCodigoRestantes(reserva)} intentos`,
          );
        }
        const actualizada = await reservaRepository.buscarPorId(id);
        if (!actualizada)
          throw new NotFoundException(`No se encontró la reserva ${id}`);
        return this.liquidaciones.proyectarEnReserva(actualizada, transaccion);
      },
    );
    // El intento incorrecto debe persistir aunque la respuesta sea un error.
    if (resultado instanceof BadRequestException) throw resultado;
    return this.prepararRespuesta(resultado);
  }

  /** El reclamo del inquilino congela cualquier liquidación manual pendiente. */
  async reportarProblema(id: number, motivo: string, idUsuario: number): Promise<Reserva> {
    return this.reservaRepository.conTransaccion(
      async (reservaRepository, transaccion) => {
        const reserva = await reservaRepository.buscarPorId(id);
        if (!reserva)
          throw new NotFoundException(`No se encontró la reserva ${id}`);
        await this.liquidaciones.proyectarEnReserva(reserva, transaccion);
        if (!this.esDelInquilino(reserva, idUsuario)) {
          throw new ForbiddenException(
            'Solo el inquilino de la reserva puede reportar un problema',
          );
        }
        if (!this.estaConfirmada(reserva)) {
          throw new ConflictException(
            'Solo se pueden reportar problemas sobre reservas confirmadas',
          );
        }
        if (this.liquidacionResuelta(reserva)) {
          throw new ConflictException(
            'La liquidación de esta reserva ya fue resuelta',
          );
        }
        await this.liquidaciones.registrarRevision(
          reserva,
          Array.from(`Reclamo del inquilino: ${motivo.trim()}`).slice(0, 500).join(''),
          transaccion,
        );
        return this.prepararRespuesta(await reservaRepository.guardar(reserva));
      },
    );
  }

  private readonly maxIntentosCodigo = 5;

  pagoAprobado(reserva: Reserva): boolean {
    return reserva.estado_pago === this.catalogos.codigoEstado('PAGO_RESERVA', 'APROBADO');
  }

  estaConfirmada(reserva: Reserva): boolean {
    return this.pagoAprobado(reserva) && !reserva.cancelada;
  }

  liquidacionEnRevision(reserva: Reserva): boolean {
    return reserva.estado_liquidacion === this.catalogos.codigoEstado('LIQUIDACION_RESERVA', 'EN_REVISION');
  }

  liquidacionResuelta(reserva: Reserva): boolean {
    return this.liquidaciones.esLiquidacionResuelta(reserva.estado_liquidacion);
  }

  codigoValidado(reserva: Reserva): boolean {
    return !!reserva.codigo_validado_en;
  }

  esEstadiaEnCurso(reserva: Reserva, ahora = new Date()): boolean {
    if (reserva.cancelada || reserva.finalizada) return false;
    if (!this.pagoAprobado(reserva) || !this.codigoValidado(reserva))
      return false;
    if (
      !esFechaCalendarioValida(reserva.fecha_inicio) ||
      !esFechaCalendarioValida(reserva.fecha_fin) ||
      reserva.fecha_inicio > reserva.fecha_fin
    )
      return false;
    const hoy = fechaArgentina(ahora);
    return hoy >= reserva.fecha_inicio && hoy <= reserva.fecha_fin;
  }

  esEstadiaFinalizada(reserva: Reserva, ahora = new Date()): boolean {
    if (reserva.finalizada) return true;
    if (!esFechaCalendarioValida(reserva.fecha_fin)) return false;
    return fechaArgentina(ahora) > reserva.fecha_fin;
  }

  fueCanceladaPorBloqueo(reserva: Reserva): boolean {
    return (
      reserva.cancelada &&
      reserva.cancelada_por === 'ADMINISTRADOR' &&
      reserva.causa_cancelacion === 'BLOQUEO_ANUNCIANTE'
    );
  }

  pagoDentroDelPlazo(reserva: Reserva, fechaPago: Date): boolean {
    if (!reserva.pago_vencimiento) return false;
    return (
      new Date(fechaPago).getTime() <=
      new Date(reserva.pago_vencimiento).getTime()
    );
  }

  codigoBloqueado(reserva: Reserva): boolean {
    return reserva.intentos_codigo >= this.maxIntentosCodigo;
  }

  intentosCodigoRestantes(reserva: Reserva): number {
    return Math.max(0, this.maxIntentosCodigo - reserva.intentos_codigo);
  }

  registrarConfirmacionPago(reserva: Reserva, fechaPago: Date, codigoAlojamiento: string): void {
    reserva.estado_pago = this.catalogos.codigoEstado('PAGO_RESERVA', 'APROBADO');
    reserva.fecha_pago = fechaPago;
    reserva.pago_vencimiento = null;
    reserva.codigo_alojamiento = codigoAlojamiento;
    reserva.codigo_generado_en = new Date();
    reserva.codigo_validado_en = null;
    reserva.intentos_codigo = 0;
    reserva.estado_liquidacion = this.catalogos.codigoEstado('LIQUIDACION_RESERVA', 'RETENIDO');
  }

  marcarCancelada(reserva: Reserva, actor?: ActorCancelacion, motivo?: string, causa?: CausaCancelacion): void {
    reserva.cancelada = true;
    reserva.fecha_cancelacion = new Date();
    if (actor) reserva.cancelada_por = actor;
    if (causa) reserva.causa_cancelacion = causa;
    if (motivo?.trim()) reserva.motivo_cancelacion = motivo.trim();
  }

  cerrarSinPago(reserva: Reserva, estado: string, actor?: ActorCancelacion, motivo?: string, causa?: CausaCancelacion): void {
    reserva.estado_pago = estado;
    reserva.estado_liquidacion =
      estado === this.catalogos.codigoEstado('PAGO_RESERVA', 'REEMBOLSADO')
        ? this.catalogos.codigoEstado('LIQUIDACION_RESERVA', 'DEVUELTO_INQUILINO')
        : this.catalogos.codigoEstado('LIQUIDACION_RESERVA', 'NO_APLICA');
    this.marcarCancelada(reserva, actor, motivo, causa);
  }

  reactivarPago(reserva: Reserva, fechaPago: Date, codigoAlojamiento: string): void {
    reserva.cancelada = false;
    reserva.fecha_cancelacion = null;
    reserva.causa_cancelacion = null;
    this.registrarConfirmacionPago(reserva, fechaPago, codigoAlojamiento);
  }

  registrarPagoParaRevision(reserva: Reserva, fechaPago: Date, motivo: string): void {
    reserva.estado_pago = this.catalogos.codigoEstado('PAGO_RESERVA', 'APROBADO');
    reserva.fecha_pago = fechaPago;
    reserva.estado_liquidacion = this.catalogos.codigoEstado('LIQUIDACION_RESERVA', 'EN_REVISION');
    reserva.observacion_liquidacion = motivo.trim();
    reserva.fecha_resolucion_liquidacion = null;
    reserva.codigo_alojamiento = null;
    reserva.codigo_generado_en = null;
    reserva.codigo_validado_en = null;
    reserva.intentos_codigo = 0;
  }

  asegurarCodigoAlojamiento(reserva: Reserva, codigo: string): boolean {
    if (reserva.codigo_alojamiento) return false;
    reserva.codigo_alojamiento = codigo;
    reserva.codigo_generado_en = new Date();
    if (reserva.estado_liquidacion === this.catalogos.codigoEstado('LIQUIDACION_RESERVA', 'NO_APLICA'))
      reserva.estado_liquidacion = this.catalogos.codigoEstado('LIQUIDACION_RESERVA', 'RETENIDO');
    return true;
  }

  registrarIntentoCodigo(reserva: Reserva, codigo: string): boolean {
    const recibido = Buffer.from(codigo.trim().toUpperCase());
    const esperado = Buffer.from(reserva.codigo_alojamiento ?? '');
    const coincide =
      esperado.length > 0 &&
      recibido.length === esperado.length &&
      timingSafeEqual(recibido, esperado);
    if (!coincide) {
      reserva.intentos_codigo += 1;
      if (this.codigoBloqueado(reserva)) {
        reserva.estado_liquidacion = this.catalogos.codigoEstado('LIQUIDACION_RESERVA', 'EN_REVISION');
        reserva.observacion_liquidacion =
          'Código bloqueado después de cinco intentos incorrectos';
      }
      return false;
    }
    reserva.codigo_validado_en = new Date();
    reserva.estado_liquidacion =
      this.catalogos.codigoEstado('LIQUIDACION_RESERVA', 'PENDIENTE_PAGO_PROPIETARIO');
    reserva.observacion_liquidacion =
      'Código de alojamiento validado por el anunciante';
    return true;
  }

  restaurarPagoAprobado(reserva: Reserva): void {
    if (reserva.estado_pago === this.catalogos.codigoEstado('PAGO_RESERVA', 'CONTRACARGO'))
      reserva.estado_pago = this.catalogos.codigoEstado('PAGO_RESERVA', 'APROBADO');
  }

  aplicarReembolsoTotal(reserva: Reserva): void {
    reserva.estado_pago = this.catalogos.codigoEstado('PAGO_RESERVA', 'REEMBOLSADO');
    reserva.estado_liquidacion = this.catalogos.codigoEstado('LIQUIDACION_RESERVA', 'DEVUELTO_INQUILINO');
    reserva.fecha_resolucion_liquidacion = new Date();
  }

  aplicarReembolsoParcial(reserva: Reserva): void {
    reserva.estado_liquidacion =
      this.catalogos.codigoEstado('LIQUIDACION_RESERVA', 'DEVUELTO_PARCIAL_INQUILINO');
    reserva.fecha_resolucion_liquidacion = new Date();
  }
}
