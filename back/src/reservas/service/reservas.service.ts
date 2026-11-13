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
import { ReservaDecisionService } from './reserva-decision.service';
import { ReservaCicloVidaService } from './reserva-ciclo-vida.service';
import { ReservaReembolsoAplicacionService } from './reserva-reembolso-aplicacion.service';
import { LiquidacionesService, type ResolucionLiquidacionDatos } from '../../liquidaciones/service/liquidaciones.service';
import { generarCodigoAlojamiento } from './reservas.utils';
import { ReservaEstadoService } from '../../reservas-consulta/service/reserva-estado.service';
import type { ReservaRespuestaDto } from '../../reservas-consulta/dto/reserva-respuesta.dto';
import { fechaArgentina } from '../../common/utils/fechas';
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
import { SolicitudCancelacion } from '../entity/solicitud-cancelacion.entity';
import { CrearReservaDto } from '../dto/crear-reserva.dto';
import { SolicitarCancelacionDto } from '../dto/solicitar-cancelacion.dto';
import { ResolverSolicitudCancelacionDto } from '../dto/resolver-solicitud-cancelacion.dto';
import { DisponibilidadService } from '../../disponibilidad/service/disponibilidad.service';
import { UsuariosService } from '../../usuarios/service/usuarios.service';
import { referenciaUsuario } from '../../usuarios/usuario-referencia';
import { PublicacionesService } from '../../publicaciones/service/publicaciones.service';
import { ReembolsosService } from '../../reembolsos/service/reembolsos.service';
import {
  OrigenReembolso,
  Reembolso,
  TipoReembolso,
} from '../../reembolsos/entity/reembolso.entity';

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

  constructor(private readonly config: ConfigService, @Inject(RESERVA_REPOSITORY) private readonly reservaRepository: IReservaRepository, private readonly disponibilidadService: DisponibilidadService, private readonly usuariosService: UsuariosService, private readonly publicacionesService: PublicacionesService, private readonly notificacionesService: ReservaNotificacionesService, private readonly reembolsosService: ReembolsosService, private readonly estadoService: ReservaEstadoService, private readonly decision: ReservaDecisionService, private readonly liquidaciones: LiquidacionesService, private readonly ciclo: ReservaCicloVidaService, private readonly aplicacionReembolsos: ReservaReembolsoAplicacionService, private readonly catalogos: CatalogosService) {}

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

        // Mercado Pago puede notificar el mismo pago más de una vez.
        if (this.pagoAprobado(reserva)) return reserva;
        if (this.liquidacionResuelta(reserva)) return reserva;

        // Un anunciante bloqueado o inactivo no puede confirmar ni reactivar reservas.
        if (
          reserva.publicacion &&
          !this.publicacionesService.cuentaAnuncianteHabilitada(reserva.publicacion)
        ) {
          this.ciclo.cerrarSinPago(reserva, this.catalogos.codigoEstado('PAGO_RESERVA', 'CANCELADO'));
          this.ciclo.registrarPagoParaRevision(
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
        if (this.decision.fueCanceladaPorBloqueo(reserva)) {
          this.ciclo.registrarPagoParaRevision(
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
            this.decision.pagoDentroDelPlazo(reserva, fechaPago) &&
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
              this.ciclo.reactivarPago(reserva, fechaPago, generarCodigoAlojamiento());
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
            this.decision.pagoDentroDelPlazo(reserva, fechaPago)
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
          this.ciclo.registrarPagoParaRevision(reserva, fechaPago, motivo);
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

        this.ciclo.confirmarPago(reserva, fechaPago, generarCodigoAlojamiento());
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
        if (this.pagoAprobado(reserva)) return reserva;
        if (reserva.cancelada && reserva.estado_pago === estado) return reserva;

        this.ciclo.cerrarSinPago(reserva, estado, actor, motivo, causa);
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
    return reservas.map((reserva) => this.prepararRespuesta(reserva));
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
    return reservas.map((reserva) => this.prepararRespuesta(reserva));
  }

  /** Todas las reservas recibidas por publicaciones del anunciante autenticado. */
  async listarRecibidasPorAnunciante(idUsuarioAnunciante: number): Promise<Reserva[]> {
    const reservas = await this.reservaRepository.buscarRecibidasPorAnunciante(
      idUsuarioAnunciante, this.catalogos.codigoEstado('PAGO_RESERVA', 'APROBADO'),
    );
    return reservas.map((reserva) => this.prepararRespuesta(reserva));
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
  async buscarPorId(id: number, idUsuarioQueOpera: number): Promise<Reserva> {
    const reserva = await this.reservaRepository.buscarPorId(id);
    if (!reserva)
      throw new NotFoundException(`No se encontró la reserva ${id}`);
    this.verificarParticipanteOPropietario(reserva, idUsuarioQueOpera);
    return this.prepararRespuesta(reserva);
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

  private respuestaSolicitudCancelacion(solicitud: SolicitudCancelacion): SolicitudCancelacion {
    if (solicitud.reserva?.estado_pago) {
      solicitud.reserva = this.prepararRespuesta(solicitud.reserva);
    }
    return solicitud;
  }

  esDelInquilino(reserva: Reserva, idUsuario: number): boolean {
    return reserva.usuario?.id === idUsuario;
  }

  esDelAnunciante(reserva: Reserva, idUsuario: number): boolean {
    return this.publicacionesService.perteneceA(reserva.publicacion, idUsuario);
  }

  pagoAprobado(reserva: Reserva): boolean {
    return this.decision.pagoAprobado(reserva);
  }

  /** Pagada y vigente: habilita el código de alojamiento, los reclamos y la liquidación. */
  estaConfirmada(reserva: Reserva): boolean {
    return this.decision.estaConfirmada(reserva);
  }

  liquidacionEnRevision(reserva: Reserva): boolean {
    return this.decision.liquidacionEnRevision(reserva);
  }

  /** El dinero ya se pagó al propietario o se devolvió al inquilino. */
  liquidacionResuelta(reserva: Reserva): boolean {
    return this.decision.liquidacionResuelta(reserva);
  }

  codigoValidado(reserva: Reserva): boolean {
    return this.decision.codigoValidado(reserva);
  }

  marcarCancelada(reserva: Reserva, actor?: ActorCancelacion, motivo?: string): void {
    this.ciclo.cancelar(reserva, actor, motivo);
  }

  async resolverReclamoSinDevolucion(reserva: Reserva, observacion?: string): Promise<Reserva> {
    return this.actualizarLiquidacion(reserva.id, (actual) => {
      if (this.liquidacionResuelta(actual))
        throw new ConflictException('La liquidación de la reserva ya fue resuelta');
      actual.estado_liquidacion = this.codigoValidado(actual)
        ? this.catalogos.codigoEstado('LIQUIDACION_RESERVA', 'PENDIENTE_PAGO_PROPIETARIO')
        : this.catalogos.codigoEstado('LIQUIDACION_RESERVA', 'RETENIDO');
      actual.observacion_liquidacion =
        observacion?.trim() || 'Reclamo resuelto a favor del Anunciante';
    });
  }

  async resolverReclamoConDevolucion(idReserva: number, reembolso: Pick<Reembolso, 'importe' | 'moneda'>, total: boolean, observacion?: string): Promise<Reserva> {
    return this.actualizarLiquidacion(idReserva, (actual) => {
      if (total) this.ciclo.aplicarReembolsoTotal(actual);
      else this.ciclo.aplicarReembolsoParcial(actual);
      actual.observacion_liquidacion =
        observacion?.trim() || 'Reclamo resuelto a favor del Inquilino';
    }, { importe: Number(reembolso.importe), moneda: reembolso.moneda });
  }

  async buscarParaContracargo(id: number): Promise<Reserva> {
    const reserva = await this.reservaRepository.buscarPorId(id);
    if (!reserva) {
      throw new NotFoundException('No se encontró la reserva del contracargo');
    }
    return this.prepararRespuesta(reserva);
  }

  async congelarPorContracargo(reserva: Reserva): Promise<Reserva> {
    return this.actualizarLiquidacion(reserva.id, (actual) => {
      actual.estado_pago = this.catalogos.codigoEstado('PAGO_RESERVA', 'CONTRACARGO');
      actual.estado_liquidacion = this.catalogos.codigoEstado('LIQUIDACION_RESERVA', 'EN_REVISION');
      actual.observacion_liquidacion =
        'Contracargo abierto: liquidación congelada hasta su resolución';
    });
  }

  async restaurarPorContracargoGanado(reserva: Reserva, estadoLiquidacionPrevio: string | null): Promise<Reserva> {
    return this.actualizarLiquidacion(reserva.id, (actual) => {
      if (actual.estado_pago !== this.catalogos.codigoEstado('PAGO_RESERVA', 'CONTRACARGO')) return;
      this.ciclo.restaurarPagoAprobado(actual);
      actual.estado_liquidacion =
        (estadoLiquidacionPrevio as string) ??
        this.catalogos.codigoEstado('LIQUIDACION_RESERVA', 'RETENIDO');
      actual.observacion_liquidacion =
        'Contracargo resuelto a favor del Anunciante';
    });
  }

  private async actualizarLiquidacion(id: number, actualizar: (reserva: Reserva) => void, datos?: ResolucionLiquidacionDatos): Promise<Reserva> {
    const guardada = await this.reservaRepository.conTransaccion(async (reservas, transaccion) => {
      const actual = await reservas.buscarPorId(id);
      if (!actual) throw new NotFoundException(`No se encontró la reserva ${id}`);
      actualizar(actual);
      const reserva = await reservas.guardar(actual);
      await this.liquidaciones.sincronizarDesdeReserva(reserva, transaccion, datos);
      return reserva;
    });
    return this.prepararRespuesta(guardada);
  }

  /** El inquilino participante o el anunciante dueño pueden cancelar. */
  async cancelar(id: number, idUsuarioQueOpera: number): Promise<Reserva> {
    const guardada = await this.reservaRepository.conTransaccion(
      async (reservaRepository, transaccion) => {
        const reserva = await reservaRepository.buscarPorId(id);
        if (!reserva)
          throw new NotFoundException(`No se encontró la reserva ${id}`);
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
   * Crea el pedido de cancelación de una reserva pagada. La reserva no se
   * cancela hasta que el Administrador resuelva y, si corresponde, se registre
   * el reembolso.
   */
  async solicitarCancelacion(id: number, dto: SolicitarCancelacionDto, idUsuario: number): Promise<SolicitudCancelacion> {
    const reserva = await this.reservaRepository.buscarPorId(id);
    if (!reserva)
      throw new NotFoundException(`No se encontró la reserva ${id}`);
    this.verificarParticipanteOPropietario(reserva, idUsuario);
    if (!this.pagoAprobado(reserva))
      throw new BadRequestException(
        'La reserva no está pagada. Usá la cancelación inmediata de la reserva pendiente.',
      );
    if (reserva.cancelada)
      throw new ConflictException('La reserva ya está cancelada');
    if (reserva.finalizada)
      throw new BadRequestException(
        'La reserva ya finalizó. Solo podés abrir un reclamo.',
      );
    const hoy = fechaArgentina();
    if (!reserva.fecha_inicio || reserva.fecha_inicio <= hoy)
      throw new BadRequestException(
        'La estadía ya comenzó. Para una devolución después del inicio, abrí un reclamo.',
      );
    if (this.codigoValidado(reserva))
      throw new BadRequestException(
        'No se puede cancelar una reserva con ingreso ya validado',
      );

    const activa =
      await this.reservaRepository.buscarSolicitudCancelacionActiva(id, this.catalogos.codigoEstado('SOLICITUD_CANCELACION', 'PENDIENTE'));
    if (activa) return this.respuestaSolicitudCancelacion(activa);

    const solicitud = this.reservaRepository.crearSolicitudCancelacion({
      reserva,
      solicitante: referenciaUsuario(idUsuario),
      motivo: dto.motivo.trim(),
      estado: this.catalogos.codigoEstado('SOLICITUD_CANCELACION', 'PENDIENTE'),
      decidida_por: null,
      decidida_en: null,
      observacion: null,
    });
    return this.respuestaSolicitudCancelacion(await this.reservaRepository.guardarSolicitudCancelacion(solicitud));
  }

  async consultarSolicitudCancelacion(id: number, idUsuario: number): Promise<SolicitudCancelacion | null> {
    const reserva = await this.reservaRepository.buscarPorId(id);
    if (!reserva)
      throw new NotFoundException(`No se encontró la reserva ${id}`);
    this.verificarParticipanteOPropietario(reserva, idUsuario);
    const solicitud = await this.reservaRepository.buscarSolicitudCancelacionActiva(id, this.catalogos.codigoEstado('SOLICITUD_CANCELACION', 'PENDIENTE'));
    return solicitud ? this.respuestaSolicitudCancelacion(solicitud) : null;
  }

  async listarSolicitudesCancelacion(): Promise<SolicitudCancelacion[]> {
    const solicitudes = await this.reservaRepository.listarSolicitudesCancelacionAdministracion(this.catalogos.codigoEstado('SOLICITUD_CANCELACION', 'PENDIENTE'));
    return solicitudes.map((solicitud) => this.respuestaSolicitudCancelacion(solicitud));
  }

  /**
   * Resuelve el pedido. Si se aprueba, calcula la devolución con la política
   * vigente y crea el reembolso. Las fechas se liberan recién cuando el
   * reembolso queda aprobado (o de inmediato si el porcentaje es 0).
   */
  async resolverSolicitudCancelacion(idReserva: number, idSolicitud: number, dto: ResolverSolicitudCancelacionDto, idAdmin: number): Promise<{ solicitud: SolicitudCancelacion; reembolso: Reembolso | null; }> {
    const solicitud =
      await this.reservaRepository.buscarSolicitudCancelacion(
        idSolicitud,
        idReserva,
      );
    if (!solicitud)
      throw new NotFoundException('No se encontró la solicitud de cancelación');
    if (solicitud.estado !== this.catalogos.codigoEstado('SOLICITUD_CANCELACION', 'PENDIENTE'))
      throw new ConflictException('La solicitud ya fue resuelta');

    const reserva = solicitud.reserva;
    const hoy = fechaArgentina();
    if (!reserva.fecha_inicio || reserva.fecha_inicio <= hoy) {
      solicitud.estado = this.catalogos.codigoEstado('SOLICITUD_CANCELACION', 'VENCIDA');
      solicitud.decidida_por = referenciaUsuario(idAdmin);
      solicitud.decidida_en = new Date();
      solicitud.observacion =
        'La estadía comenzó antes de resolver la solicitud';
      await this.reservaRepository.guardarSolicitudCancelacion(solicitud);
      throw new ConflictException(
        'La estadía ya comenzó; la solicitud quedó vencida',
      );
    }

    solicitud.decidida_por = referenciaUsuario(idAdmin);
    solicitud.decidida_en = new Date();
    solicitud.observacion = dto.observacion?.trim() || null;

    if (dto.decision === 'RECHAZADA') {
      solicitud.estado = this.catalogos.codigoEstado('SOLICITUD_CANCELACION', 'RECHAZADA');
      const guardada = await this.reservaRepository.guardarSolicitudCancelacion(solicitud);
      return {
        solicitud: this.respuestaSolicitudCancelacion(guardada),
        reembolso: null,
      };
    }

    const actor = this.actorDeCancelacion(reserva, solicitud.solicitante?.id);
    const porcentaje = this.porcentajeCancelacion(reserva, actor, hoy);
    const importe = this.redondear(
      (Number(reserva.monto_pago) * porcentaje) / 100,
    );

    if (importe > 0) {
      // Se crea primero el reembolso para no aprobar una solicitud sin
      // registro económico si falla la creación.
      const pago = await this.reembolsosService.buscarPagoPorReserva(idReserva);
      if (!pago)
        throw new ConflictException('La reserva no tiene un pago registrado');
      const reembolso = await this.reembolsosService.crearSolicitud({
        reserva,
        pago,
        tipo:
          porcentaje >= 100 ? TipoReembolso.TOTAL : TipoReembolso.PARCIAL,
        origen: OrigenReembolso.CANCELACION,
        importe,
        motivo: `Cancelación de reserva: ${solicitud.motivo}`,
        idSolicitadoPor: idAdmin,
      });
      solicitud.estado = this.catalogos.codigoEstado('SOLICITUD_CANCELACION', 'APROBADA');
      const solicitudGuardada =
        await this.reservaRepository.guardarSolicitudCancelacion(solicitud);
      return { solicitud: this.respuestaSolicitudCancelacion(solicitudGuardada), reembolso };
    }

    // Sin devolución: la reserva se cancela y las fechas se liberan.
    solicitud.estado = this.catalogos.codigoEstado('SOLICITUD_CANCELACION', 'APROBADA');
    const solicitudGuardada =
      await this.reservaRepository.guardarSolicitudCancelacion(solicitud);
    await this.reservaRepository.conTransaccion(
      async (reservaRepository, transaccion) => {
        const actual = await reservaRepository.buscarPorId(idReserva);
        if (!actual) return;
        this.marcarCancelada(actual, actor, solicitud.motivo);
        actual.estado_liquidacion = this.catalogos.codigoEstado('LIQUIDACION_RESERVA', 'EN_REVISION');
        actual.observacion_liquidacion =
          'Cancelación con retención total; liquidación pendiente de revisión';
        await reservaRepository.guardar(actual);
        await this.liquidaciones.sincronizarDesdeReserva(
          actual,
          transaccion,
        );
        await this.disponibilidadService.liberarReserva(
          idReserva,
          transaccion,
        );
      },
    );
    return { solicitud: this.respuestaSolicitudCancelacion(solicitudGuardada), reembolso: null };
  }

  /** Registra manualmente la devolución y aplica el resultado a la reserva. */
  async registrarReembolsoManual(idReembolso: number, referencia: string | undefined, idAdmin: number): Promise<{ reembolso: Reembolso; reserva: Reserva }> {
    await this.reembolsosService.registrarOejecutar(
      idReembolso,
      referencia,
      idAdmin,
    );
    return this.aplicarReembolsoConfirmado(idReembolso);
  }

  /** Aplica a la reserva un reembolso ya aprobado por el módulo de reembolsos. */
  async aplicarReembolsoConfirmado(idReembolso: number): Promise<{ reembolso: Reembolso; reserva: Reserva }> {
    const { reembolso, reserva } = await this.aplicacionReembolsos.aplicarReembolsoConfirmado(idReembolso);
    return { reembolso, reserva: this.prepararRespuesta(reserva) };
  }

  async listarReembolsosReserva(idReserva: number, idUsuario: number): Promise<Reembolso[]> {
    const reserva = await this.reservaRepository.buscarPorId(idReserva);
    if (!reserva)
      throw new NotFoundException(`No se encontró la reserva ${idReserva}`);
    this.verificarParticipanteOPropietario(reserva, idUsuario);
    return this.reembolsosService.listarPorReserva(idReserva);
  }

  /** Política: el Anunciante/Administrador solo devuelve antes del inicio. */
  private actorDeCancelacion(reserva: Reserva, idSolicitante?: number): ActorCancelacion {
    if (idSolicitante && this.esDelInquilino(reserva, idSolicitante))
      return 'INQUILINO';
    if (idSolicitante && this.esDelAnunciante(reserva, idSolicitante))
      return 'ANUNCIANTE';
    return 'ADMINISTRADOR';
  }

  private porcentajeCancelacion(reserva: Reserva, actor: ActorCancelacion, hoy: string): number {
    if (actor !== 'INQUILINO') return 100;
    if (!reserva.fecha_inicio) return 0;
    const inicio = new Date(`${reserva.fecha_inicio}T12:00:00Z`).getTime();
    const ahora = new Date(`${hoy}T12:00:00Z`).getTime();
    const dias = Math.ceil((inicio - ahora) / 86_400_000);
    if (dias >= 7) return 100;
    if (dias >= 2) return 50;
    return 0;
  }

  private redondear(valor: number): number {
    return Math.round((valor + Number.EPSILON) * 100) / 100;
  }

  private verificarParticipanteOPropietario(reserva: Reserva, idUsuarioQueOpera: number): void {
    if (!this.esDelInquilino(reserva, idUsuarioQueOpera) && !this.esDelAnunciante(reserva, idUsuarioQueOpera)) {
      throw new ForbiddenException(
        'No tenés permiso para consultar esta reserva',
      );
    }
  }
}
