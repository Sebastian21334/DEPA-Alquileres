import { CatalogosService } from '../../catalogos/service/catalogos.service';
import type { EntityManager } from 'typeorm';
import {
  type IReservaRepository,
  RESERVA_REPOSITORY,
} from '../repository/reserva.repository.interface';
import { importeTexto } from '../../common/utils/importes';
import { CotizacionDolar } from '../../cotizaciones/entity/cotizacion-dolar.entity';
import { ConfigService } from '@nestjs/config';
import { ReservaNotificacionesService } from './reserva-notificaciones.service';
import { LiquidacionesService } from '../../liquidaciones/service/liquidaciones.service';
import { generarCodigoAlojamiento } from './reservas.utils';
import { MAX_INTENTOS_CODIGO, ReservaEstadoService } from '../../reservas-consulta/service/reserva-estado.service';
import type { ReservaRespuestaDto } from '../../reservas-consulta/dto/reserva-respuesta.dto';
import { timingSafeEqual } from 'node:crypto';
import { diasInclusivos, esFechaCalendarioValida, fechaArgentina, fechaParaMostrar } from '../../common/utils/fechas';
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

import type { Publicacion } from '../../publicaciones/entity/publicacion.entity';
import type { Usuario } from '../../usuarios/entity/usuario.entity';

const PLAZO_INICIO_PAGO_MS = 15 * 60_000;

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
        const cerrada = await this.reservaRepository.conTransaccion(async (repositorio, transaccion) => {
          const actual = await repositorio.buscarPorId(reserva.id);
          if (!actual || actual.cancelada ||
            actual.estado_pago !== this.catalogos.codigoEstado('PAGO_RESERVA', 'PENDIENTE') ||
            !actual.pago_vencimiento || new Date(actual.pago_vencimiento).getTime() > Date.now()) return false;

          this.cerrarSinPago(actual, this.catalogos.codigoEstado('PAGO_RESERVA', 'CANCELADO'), undefined, 'Venció el plazo de pago');
          const guardada = await repositorio.guardar(actual);
          await this.liquidaciones.sincronizarDesdeReserva(guardada, transaccion);
          await this.disponibilidadService.liberarReserva(actual.id, transaccion);
          return true;
        });
        if (cerrada) cerradas += 1;
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
    this.publicacionesService.validarNuevaReserva(publicacion, idUsuario, 'reserva');
    const hoy = fechaArgentina();
    if (dto.fecha_inicio < hoy || dto.fecha_fin < hoy) {
      throw new BadRequestException(
        'Las fechas de la reserva no pueden ser anteriores a hoy',
      );
    }
    const tarifa = this.publicacionesService.calcularTarifaReserva(publicacion, diasInclusivos(inicio, fin), 'reserva');
    if ((this.config.get<string>('MP_CURRENCY_ID') ?? 'ARS') !== 'ARS') {
      throw new BadRequestException(
        'Esta integración solo admite cobros en ARS',
      );
    }
    if (
      condiciones.moneda_origen !== tarifa.moneda ||
      condiciones.total_origen !== tarifa.total ||
      condiciones.precio_unitario_origen !== importeTexto(tarifa.unitario)
    ) {
      throw new ConflictException(
        'El precio o la moneda cambiaron. Solicitá un nuevo presupuesto.',
      );
    }
    const precioDiario = Number(publicacion.precio);

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
        await this.usuariosService.validarCuentaParaNuevaReserva(idUsuario, transaccion);
        await this.publicacionesService.bloquearParaModificacion(dto.id_publicacion, transaccion);
        await this.validarPresupuestoBajoBloqueo(dto.id_publicacion, precioDiario, tarifa.moneda, condiciones, transaccion);
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

        const ahora = new Date();
        const comision = await this.catalogos.obtenerComision(transaccion);
        const reserva = reservaRepository.crear(this.datosReservaPendiente(
          publicacion, usuario, { inicio, fin }, tarifa, condiciones, { ahora, comision },
        ));

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
    return this.prepararRespuesta(guardada, true);
  }

  /** Vuelve a comprobar el precio, la moneda, la publicación y el vencimiento mientras la publicación está bloqueada. */
  private async validarPresupuestoBajoBloqueo(idPublicacion: number, precio: number, moneda: CondicionesCobro['moneda_origen'], condiciones: CondicionesCobro, transaccion: EntityManager): Promise<void> {
    const actual = await this.publicacionesService.buscarCondicionesDeReserva(idPublicacion, transaccion);
    this.publicacionesService.validarAnuncianteDisponible(actual);
    let monedaActual: CondicionesCobro['moneda_origen'] | undefined;
    try {
      monedaActual = this.publicacionesService.monedaParaReserva(actual);
    } catch {
      monedaActual = undefined;
    }
    if (!actual?.activa || actual.eliminada || !this.publicacionesService.cuentaAnuncianteHabilitada(actual) ||
        Number(actual.precio) !== precio || monedaActual !== moneda) {
      throw new ConflictException('La publicación cambió. Volvé a cotizar antes de pagar.');
    }
    if (new Date(condiciones.vence_en).getTime() <= Date.now()) {
      throw new ConflictException('El presupuesto venció. Volvé a cotizar antes de pagar.');
    }
  }

  /** Prepara el registro inicial y conserva las condiciones contratadas y los datos históricos del inquilino. */
  private datosReservaPendiente(publicacion: Publicacion, usuario: Usuario, { inicio, fin }: { inicio: Date; fin: Date }, tarifa: ReturnType<PublicacionesService['calcularTarifaReserva']>, condiciones: CondicionesCobro, { ahora, comision }: { ahora: Date; comision: number }): Partial<Reserva> {
    const montoCalculado = Number(condiciones.total_cobro);
    const precioDiario = Number(publicacion.precio);
    return {
      finalizada: false,
      cancelada: false,
      fecha_cancelacion: null,
      monto_pago: montoCalculado,
      porcentaje_comision_depa: comision,
      precio_unitario_contratado: precioDiario,
      importe_contratado: montoCalculado,
      moneda_contratada: 'ARS',
      moneda_origen: tarifa.moneda,
      importe_origen: Number(tarifa.total),
      cotizacion_dolar: condiciones.cotizacion_id
        ? Object.assign(new CotizacionDolar(), {
            id: condiciones.cotizacion_id,
          })
        : null,
      cotizacion_aceptada_en: ahora,
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
      pago_vencimiento: new Date(ahora.getTime() + PLAZO_INICIO_PAGO_MS),
      fecha_inicio: inicio.toISOString().slice(0, 10),
      fecha_fin: fin.toISOString().slice(0, 10),
      usuario_nombre: usuario.nombre,
      usuario_apellido: usuario.apellido,
      usuario_email: usuario.email,
      usuario_telefono: usuario.telefono,
      usuario,
      publicacion,
    };
  }

  async confirmarPago(id: number, fechaPago: Date): Promise<Reserva> {
    const { reserva: guardada, devolucionPendiente } = await this.reservaRepository.conTransaccion(
      async (reservaRepository, transaccion) => {
        const reserva = await reservaRepository.buscarPorId(id);
        if (!reserva)
          throw new NotFoundException(`No se encontró la reserva ${id}`);
        await this.liquidaciones.proyectarEnReserva(reserva, transaccion);

        // Mercado Pago puede notificar el mismo pago más de una vez.
        if (this.pagoAprobado(reserva) || this.liquidacionResuelta(reserva)) return { reserva };

        // Los pagos de reservas anteriores siguen su curso durante el acceso limitado.
        const anunciante = reserva.publicacion?.anunciante;
        if (
          reserva.publicacion &&
          !this.publicacionesService.cuentaAnuncianteHabilitada(reserva.publicacion) &&
          !(anunciante?.usuario?.activa && anunciante.usuario.bloqueado &&
            await this.usuariosService.consultarAccesoPendiente(anunciante.idUsuario, transaccion))
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
          const devolucionPendiente = await this.reembolsosService.registrarPagoTardio(guardada, guardada.observacion_liquidacion!, transaccion);
          this.logger.warn(
            `La reserva ${reserva.id} recibió un pago aprobado con el anunciante bloqueado o inactivo; requiere devolución`,
          );
          return { reserva: guardada, devolucionPendiente };
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
          const devolucionPendiente = await this.reembolsosService.registrarPagoTardio(guardada, guardada.observacion_liquidacion!, transaccion);
          this.logger.warn(
            `La reserva ${reserva.id} recibió un pago tardío tras una cancelación por bloqueo; requiere devolución`,
          );
          return { reserva: guardada, devolucionPendiente };
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
              return { reserva: reactivada };
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
          const devolucionPendiente = await this.reembolsosService.registrarPagoTardio(enRevision, motivo, transaccion);
          return { reserva: enRevision, devolucionPendiente };
        }

        this.registrarConfirmacionPago(reserva, fechaPago, generarCodigoAlojamiento());
        const aprobada = await reservaRepository.guardar(reserva);
        await this.liquidaciones.sincronizarDesdeReserva(aprobada, transaccion);
        return { reserva: aprobada };
      },
    );

    // Se reintentan únicamente los correos pendientes; los pagos en revisión
    // no se presentan como una reserva confirmada.
    if (this.estaConfirmada(guardada)) {
      await this.notificacionesService.enviarConfirmacion(guardada);
    } else if (devolucionPendiente) {
      await this.notificacionesService.avisarCambio(guardada, ['inquilino', 'admin'], 'Pago recibido para una reserva sin confirmar', 'El pago se recibió, pero la reserva no pudo confirmarse. La devolución quedó pendiente de gestión.');
    }
    return this.prepararRespuesta(guardada);
  }

  /** Cierra una reserva cuyo pago falló o cuya preferencia no pudo crearse. */
  async rechazarPago(id: number, estado: string = this.catalogos.codigoEstado('PAGO_RESERVA', 'RECHAZADO'), actor?: ActorCancelacion, motivo?: string, causa?: CausaCancelacion): Promise<Reserva> {
    const resultado = await this.reservaRepository.conTransaccion(
      async (reservaRepository, transaccion) => {
        const reserva = await reservaRepository.buscarPorId(id);
        if (!reserva)
          throw new NotFoundException(`No se encontró la reserva ${id}`);
        await this.liquidaciones.proyectarEnReserva(reserva, transaccion);
        if (this.pagoAprobado(reserva) || (reserva.cancelada && reserva.estado_pago === estado))
          return { reserva, cambio: false };

        this.cerrarSinPago(reserva, estado, actor, motivo, causa);
        const guardada = await reservaRepository.guardar(reserva);
        await this.liquidaciones.sincronizarDesdeReserva(
          guardada,
          transaccion,
        );
        await this.disponibilidadService.liberarReserva(id, transaccion);
        return { reserva: guardada, cambio: true };
      },
    );
    if (resultado.cambio && causa === 'BLOQUEO_ANUNCIANTE')
      await this.notificacionesService.avisarCambio(resultado.reserva, ['inquilino'], 'Reserva cancelada por DEPA', 'La reserva pendiente de pago fue cancelada por DEPA.');
    return this.prepararRespuesta(resultado.reserva);
  }

  /**
   * Historial de reservas del inquilino logueado.
   */
  async listarPorUsuario(idUsuario: number): Promise<Reserva[]> {
    const reservas = await this.reservaRepository.buscarPorUsuario(idUsuario);
    return (await this.liquidaciones.proyectarListado(reservas)).map(reserva => this.prepararRespuesta(reserva, true));
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
      idUsuarioAnunciante, [
        this.catalogos.codigoEstado('PAGO_RESERVA', 'APROBADO'),
        this.catalogos.codigoEstado('PAGO_RESERVA', 'REEMBOLSADO'),
      ],
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
    return this.prepararRespuesta(reserva, this.esDelInquilino(reserva, idUsuarioQueOpera));
  }

  /** Detalle de cualquier reserva para el panel admin, sin el control de participante. */
  async buscarParaAdministracion(id: number): Promise<Reserva> {
    return this.prepararRespuesta(await this.obtenerReserva(id), true);
  }

  async obtenerReserva(id: number, transaccion?: EntityManager): Promise<Reserva> {
    const reservas = transaccion ? this.reservaRepository.enTransaccion(transaccion) : this.reservaRepository;
    // Serializa cambios de la reserva y permite las lecturas de clave foránea.
    const reserva = await reservas.buscarPorId(id, transaccion ? 'for_no_key_update' : undefined);
    if (!reserva)
      throw new NotFoundException(`No se encontró la reserva ${id}`);
    return this.liquidaciones.proyectarEnReserva(reserva, transaccion);
  }

  conReservaParaReclamo<T>(id: number, crearReclamo: (reserva: Reserva, transaccion: EntityManager) => Promise<T>, motivo = 'Reclamo del inquilino en revisión'): Promise<T> {
    return this.reservaRepository.conTransaccion(async (reservas, transaccion) => {
      const reserva = await reservas.buscarParaReclamo(id);
      if (!reserva) throw new NotFoundException('No se encontró la reserva');
      // El reclamo decide con el estado real de la liquidación, no con el valor sin proyectar.
      await this.liquidaciones.proyectarEnReserva(reserva, transaccion);
      const reclamo = await crearReclamo(reserva, transaccion);
      // Conserva un motivo de revisión previo, por ejemplo el código bloqueado.
      const previo = this.liquidacionEnRevision(reserva) ? reserva.observacion_liquidacion?.trim() : null;
      reserva.estado_liquidacion = this.catalogos.codigoEstado('LIQUIDACION_RESERVA', 'EN_REVISION');
      reserva.observacion_liquidacion = previo && !previo.includes(motivo) ? `${previo} · ${motivo}` : motivo;
      reserva.fecha_resolucion_liquidacion = null;
      await reservas.guardar(reserva);
      await this.liquidaciones.sincronizarDesdeReserva(reserva, transaccion);
      return reclamo;
    });
  }

  prepararRespuesta(reserva: Reserva, incluirContactoInquilino = false): ReservaRespuestaDto {
    return this.estadoService.prepararRespuesta(reserva, incluirContactoInquilino);
  }

  calcularEstadoEstadia(reserva: Reserva, ahora = new Date()) {
    return this.estadoService.calcularEstadoEstadia(reserva, ahora);
  }

  finPlazoReclamo(reserva: Reserva): string | null {
    return this.estadoService.finPlazoReclamo(reserva);
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
    const codigoValidado = this.codigoValidado(reserva);
    reserva.estado_liquidacion = codigoValidado
      ? this.catalogos.codigoEstado('LIQUIDACION_RESERVA', 'PENDIENTE_PAGO_PROPIETARIO')
      : this.catalogos.codigoEstado('LIQUIDACION_RESERVA', 'RETENIDO');
    // Al volver a RETENIDO el anunciante puede cargar el código otra vez durante la estadía.
    if (!codigoValidado) reserva.intentos_codigo = 0;
    reserva.observacion_liquidacion =
      observacion?.trim() || 'Reclamo resuelto a favor del Anunciante';
    await this.liquidaciones.sincronizarDesdeReserva(reserva, transaccion);
    return reserva;
  }

  /**
   * Administración da por bueno el ingreso sin el código. La liquidación queda
   * pendiente de pago y el pago se habilita en la fecha habitual.
   * El ingreso queda validado desde ahora, como con el código, para que la estadía se vea
   * «En curso» y después «Finalizada»; quién lo decidió y por qué queda en el reclamo.
   */
  async confirmarIngresoSinCodigo(reserva: Reserva, observacion: string | undefined, transaccion: EntityManager): Promise<Reserva> {
    if (this.liquidacionResuelta(reserva))
      throw new ConflictException('La liquidación de la reserva ya fue resuelta');
    reserva.codigo_validado_en = new Date();
    reserva.estado_liquidacion = this.catalogos.codigoEstado('LIQUIDACION_RESERVA', 'PENDIENTE_PAGO_PROPIETARIO');
    reserva.observacion_liquidacion =
      observacion?.trim() || 'Ingreso confirmado por Administración sin el código de alojamiento';
    await this.liquidaciones.sincronizarDesdeReserva(reserva, transaccion);
    return reserva;
  }

  /** El inquilino participante o el anunciante dueño pueden cancelar. */
  async cancelar(id: number, idUsuarioQueOpera: number): Promise<Reserva> {
    const resultado = await this.reservaRepository.conTransaccion(
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
        if (reserva.cancelada) return { reserva, cambio: false };
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
        return { reserva: guardada, cambio: true };
      },
    );
    if (resultado.cambio)
      await this.notificacionesService.avisarCambio(resultado.reserva, ['inquilino', 'anunciante'], 'Reserva cancelada', 'La reserva pendiente de pago fue cancelada.', idUsuarioQueOpera);
    return this.prepararRespuesta(resultado.reserva);
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
    if (reserva.estado_liquidacion === this.catalogos.codigoEstado('LIQUIDACION_RESERVA', 'PAGADO_PROPIETARIO') &&
        !esReclamo)
      throw new ConflictException('La reserva ya fue pagada al propietario; requiere revisar la devolución');

    const pago = await this.reembolsosService.buscarPagoPorReserva(reserva.id, transaccion);
    if (!pago) throw new NotFoundException('La reserva no tiene un pago registrado');
    const importeDevuelto = Number(pago.amount_refunded);
    const esTotal = Number(pago.amount) - importeDevuelto <= TOLERANCIA_MONETARIA;
    const puedeLiberarFechas = !!reserva.fecha_inicio && !this.codigoValidado(reserva) &&
      (reserva.fecha_inicio > fechaArgentina() || reembolso.origen === OrigenReembolso.CANCELACION);
    const ajusteAdmin = reembolso.origen === OrigenReembolso.AJUSTE_ADMIN;
    const resolucionAdmin = ajusteAdmin && reembolso.referencia_interna === `liq:${reserva.id}`;
    const reversionSinPago = esTotal && !this.pagoAprobado(reserva) &&
      reserva.estado_pago !== this.catalogos.codigoEstado('PAGO_RESERVA', 'CONTRACARGO') &&
      reserva.estado_pago !== this.catalogos.codigoEstado('PAGO_RESERVA', 'REEMBOLSADO');
    const cancelaReserva = !reserva.cancelada && (
      reversionSinPago ||
      reembolso.origen === OrigenReembolso.CANCELACION ||
      (esTotal && resolucionAdmin) ||
      (esTotal && puedeLiberarFechas && ajusteAdmin)
    );

    if (esTotal) this.aplicarReembolsoTotal(reserva);
    else this.aplicarReembolsoParcial(reserva);
    if (this.reembolsosService.esSimulado(reembolso)) {
      reserva.referencia_liquidacion = reembolso.referencia_externa;
      reserva.observacion_liquidacion = 'Devolución simulada con tarjeta. No se transfirió dinero.';
    }
    if (cancelaReserva) {
      const solicitante = reembolso.referencia_interna?.startsWith('auto-can:') ? reembolso.solicitado_por?.id : undefined;
      const actor = solicitante && this.esDelInquilino(reserva, solicitante) ? 'INQUILINO'
        : solicitante && this.esDelAnunciante(reserva, solicitante) ? 'ANUNCIANTE' : 'ADMINISTRADOR';
      this.marcarCancelada(reserva, actor, reembolso.motivo);
    }
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
          !['CONFIRMADA', 'PENDIENTE_INGRESO', 'EN_CURSO'].includes(this.calcularEstadoEstadia(reserva)) &&
          !(this.calcularEstadoEstadia(reserva) === 'INGRESO_NO_VERIFICADO' &&
            !!this.liquidaciones.fechaDisponiblePagoManual(reserva) &&
            fechaArgentina() < this.liquidaciones.fechaDisponiblePagoManual(reserva)!)
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
          throw new ConflictException('La reserva no está confirmada: el código solo se valida en reservas pagas y vigentes.');
        }
        if (this.codigoValidado(reserva)) {
          throw new ConflictException(
            `El ingreso ya se validó el ${fechaParaMostrar(fechaArgentina(reserva.codigo_validado_en!))}. No hace falta volver a cargar el código.`,
          );
        }
        // El bloqueo se informa antes que las fechas, porque es lo que el anunciante tiene que resolver.
        if (this.codigoBloqueado(reserva)) throw new ConflictException(this.mensajeCodigoBloqueado());
        const estadoEstadia = this.calcularEstadoEstadia(reserva);
        const vencimiento = this.liquidaciones.fechaDisponiblePagoManual(reserva);
        if (estadoEstadia !== 'PENDIENTE_INGRESO' &&
            !(estadoEstadia === 'INGRESO_NO_VERIFICADO' && vencimiento && fechaArgentina() < vencimiento &&
              reserva.estado_liquidacion === this.catalogos.codigoEstado('LIQUIDACION_RESERVA', 'RETENIDO'))) {
          throw new ConflictException(this.mensajeCodigoFueraDeFecha(reserva, estadoEstadia));
        }
        if (this.liquidacionEnRevision(reserva))
          throw new ConflictException('La liquidación de esta reserva está en revisión de Administración. Vas a poder validar el código cuando se resuelva.');
        if (await this.reembolsosService.tieneDevolucionDeCancelacionActiva(id, transaccion))
          throw new ConflictException('La reserva tiene una cancelación aprobada con devolución en gestión');

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
          const restantes = this.intentosCodigoRestantes(reserva);
          return new BadRequestException(restantes
            ? `Código incorrecto. Te ${restantes === 1 ? 'queda 1 intento' : `quedan ${restantes} intentos`} de ${MAX_INTENTOS_CODIGO}.`
            : `Código incorrecto. ${this.mensajeCodigoBloqueado()}`);
        }
        const actualizada = await reservaRepository.buscarPorId(id);
        if (!actualizada)
          throw new NotFoundException(`No se encontró la reserva ${id}`);
        return this.liquidaciones.proyectarEnReserva(actualizada, transaccion);
      },
    );
    // El intento incorrecto debe persistir aunque la respuesta sea un error.
    if (resultado instanceof BadRequestException) throw resultado;
    await this.notificacionesService.avisarCambio(resultado, ['inquilino'], 'Ingreso confirmado', 'El anunciante validó tu ingreso al alojamiento.');
    return this.prepararRespuesta(resultado);
  }

  /** El reclamo del inquilino congela cualquier liquidación manual pendiente. */
  async reportarProblema(id: number, motivo: string, idUsuario: number): Promise<Reserva> {
    return this.reservaRepository.conTransaccion(
      async (reservaRepository, transaccion) => {
        const reserva = await this.obtenerReserva(id, transaccion);
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
        const vencimiento = this.liquidaciones.fechaDisponiblePagoManual(reserva);
        const hoy = fechaArgentina();
        if (!vencimiento || !reserva.fecha_inicio || hoy < reserva.fecha_inicio || hoy >= vencimiento)
          throw new ConflictException('El reporte solo está disponible desde el inicio de la estadía hasta el vencimiento del plazo de reclamos');
        await this.liquidaciones.registrarRevision(
          reserva,
          Array.from(`Reclamo del inquilino: ${motivo.trim()}`).slice(0, 500).join(''),
          transaccion,
        );
        return this.prepararRespuesta(await reservaRepository.guardar(reserva));
      },
    );
  }

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

  private mensajeCodigoBloqueado(): string {
    return `El código se bloqueó tras ${MAX_INTENTOS_CODIGO} intentos incorrectos. Pedí el reinicio a Administración desde la reserva.`;
  }

  /** Dice desde o hasta cuándo se puede cargar el código. */
  private mensajeCodigoFueraDeFecha(reserva: Reserva, estadoEstadia: string): string {
    if (estadoEstadia === 'CONFIRMADA' && reserva.fecha_inicio)
      return `Vas a poder validar el código desde el ${fechaParaMostrar(reserva.fecha_inicio)}, cuando empieza la estadía.`;
    const ultimoDia = this.finPlazoReclamo(reserva);
    if (estadoEstadia === 'INGRESO_NO_VERIFICADO' && ultimoDia && fechaArgentina() > ultimoDia)
      return `El plazo para validar el código terminó el ${fechaParaMostrar(ultimoDia)}.`;
    return 'El código solo puede validarse durante la estadía o hasta el día anterior a que se habilite el pago.';
  }

  codigoBloqueado(reserva: Reserva): boolean {
    return this.intentosCodigoRestantes(reserva) === 0;
  }

  intentosCodigoRestantes(reserva: Reserva): number {
    return this.estadoService.intentosCodigoRestantes(reserva);
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
    reserva.motivo_cancelacion = null;
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
