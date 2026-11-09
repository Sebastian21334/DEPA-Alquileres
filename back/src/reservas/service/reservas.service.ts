import {
  type IReservaRepository,
  RESERVA_REPOSITORY,
} from '../repository/reserva.repository.interface';
import {
  type ITransaccionCalendario,
  TRANSACCION_CALENDARIO,
} from '../../disponibilidad/repository/transaccion-calendario.interface';
import { ReservaNotificacionesService } from './reserva-notificaciones.service';
import { ReservaEstadoService } from './reserva-estado.service';
import { ReservaCicloVidaService } from './reserva-ciclo-vida.service';
import { ReservaVencimientoService } from './reserva-vencimiento.service';
import {
  ReservaCreacionService,
  type CondicionesCobro,
} from './reserva-creacion.service';

export type { CondicionesCobro } from './reserva-creacion.service';
import { generarCodigoAlojamiento } from './reservas.utils';
import {
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import {
  ActorCancelacion,
  EstadoPagoReserva,
  Reserva,
  EstadoLiquidacionReserva,
} from '../entity/reserva.entity';
import { CrearReservaDto } from '../dto/crear-reserva.dto';
import { DisponibilidadService } from '../../disponibilidad/service/disponibilidad.service';
import { PublicacionesService } from '../../publicaciones/service/publicaciones.service';
import { cuentaAnuncianteHabilitada } from '../../publicaciones/politica-publicacion';


@Injectable()
export class ReservasService {
  private readonly logger = new Logger(ReservasService.name);

  constructor(
    @Inject(TRANSACCION_CALENDARIO)
    private readonly transaccion: ITransaccionCalendario,
    @Inject(RESERVA_REPOSITORY)
    private readonly reservaRepository: IReservaRepository,
    private readonly disponibilidadService: DisponibilidadService,
    private readonly publicacionesService: PublicacionesService,
    private readonly notificacionesService: ReservaNotificacionesService,
    private readonly estado: ReservaEstadoService,
    private readonly ciclo: ReservaCicloVidaService,
    private readonly vencimiento: ReservaVencimientoService,
    private readonly creacion: ReservaCreacionService,
  ) {}

  /**
   * Crea una reserva y conserva una copia del periodo y de los datos del
   * inquilino para mantener el historial aunque la cuenta sea eliminada.
   * La validación del calendario, la reserva y sus fechas se confirman
   * en una única transacción, con el calendario bloqueado.
   */
  async crearPendiente(
    dto: CrearReservaDto,
    idUsuario: number,
    condiciones: CondicionesCobro,
  ): Promise<Reserva> {
    return this.creacion.crearPendiente(dto, idUsuario, condiciones);
  }

  /** Confirma la reserva únicamente después de verificar el pago con Mercado Pago. */
  async confirmarPago(id: number, fechaPago: Date): Promise<Reserva> {
    const guardada = await this.transaccion.ejecutar(
      async ({ reservas: reservaRepository, fechas: fechaRepository }) => {
        const reserva = await reservaRepository.buscarPorId(id);
        if (!reserva)
          throw new NotFoundException(`No se encontró la reserva ${id}`);

        // Mercado Pago puede notificar el mismo pago más de una vez.
        if (this.estado.pagoAprobado(reserva)) return reserva;
        if (this.estado.liquidacionResuelta(reserva)) return reserva;

        // Un anunciante bloqueado no puede confirmar ni reactivar reservas.
        // El pago queda retenido para revisión y devolución administrativa.
        if (
          reserva.publicacion &&
          !cuentaAnuncianteHabilitada(reserva.publicacion)
        ) {
          this.ciclo.cerrarSinPago(reserva, EstadoPagoReserva.CANCELADO);
          this.ciclo.registrarPagoParaRevision(
            reserva,
            fechaPago,
            'Pago aprobado sobre una reserva de un anunciante bloqueado o inactivo; requiere devolución',
          );
          const guardada = await reservaRepository.guardar(reserva);
          await this.disponibilidadService.liberarReserva(id, fechaRepository);
          this.logger.warn(
            `La reserva ${reserva.id} recibió un pago aprobado con el anunciante bloqueado o inactivo; requiere devolución`,
          );
          return guardada;
        }

        // Una reserva cancelada por bloqueo no se reactiva con un pago
        // tardío, aunque el Anunciante ya haya sido desbloqueado.
        if (this.estado.fueCanceladaPorBloqueo(reserva)) {
          this.ciclo.registrarPagoParaRevision(
            reserva,
            fechaPago,
            'Pago aprobado sobre una reserva cancelada por bloqueo; requiere revisión y devolución',
          );
          const guardada = await reservaRepository.guardar(reserva);
          this.logger.warn(
            `La reserva ${reserva.id} recibió un pago tardío tras una cancelación por bloqueo; requiere devolución`,
          );
          return guardada;
        }

        // Un pago aprobado después del vencimiento no puede confirmar la
        // reserva aunque el barrido periódico todavía no la haya cerrado.
        if (
          !reserva.cancelada &&
          reserva.estado_pago === EstadoPagoReserva.PENDIENTE &&
          reserva.pago_vencimiento != null &&
          !this.estado.pagoDentroDelPlazo(reserva, fechaPago)
        ) {
          this.ciclo.cerrarSinPago(reserva, EstadoPagoReserva.CANCELADO);
          this.ciclo.registrarPagoParaRevision(
            reserva,
            fechaPago,
            'Pago aprobado fuera del plazo de 15 minutos; requiere devolución',
          );
          const guardada = await reservaRepository.guardar(reserva);
          await this.disponibilidadService.liberarReserva(id, fechaRepository);
          this.logger.warn(
            `La reserva ${reserva.id} recibió un pago aprobado fuera del plazo; requiere devolución`,
          );
          return guardada;
        }

        if (reserva.cancelada) {
          const publicacion = reserva.publicacion;
          const inicio = reserva.fecha_inicio;
          const fin = reserva.fecha_fin;
          const puedeReactivar =
            !this.estado.fueCanceladaPorBloqueo(reserva) &&
            reserva.estado_pago === EstadoPagoReserva.CANCELADO &&
            this.estado.pagoDentroDelPlazo(reserva, fechaPago) &&
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
                fechaRepository,
              );
              this.ciclo.reactivarPago(reserva, fechaPago, generarCodigoAlojamiento());
              return reservaRepository.guardar(reserva);
            } catch (error) {
              if (
                !(error instanceof ConflictException) &&
                !(error instanceof NotFoundException)
              ) {
                throw error;
              }
            }
          }

          let motivo: string;
          if (
            reserva.estado_pago === EstadoPagoReserva.CANCELADO &&
            this.estado.pagoDentroDelPlazo(reserva, fechaPago)
          ) {
            motivo =
              'Pago aprobado dentro del plazo, pero las fechas ya fueron reasignadas; requiere devolución';
          } else if (reserva.estado_pago === EstadoPagoReserva.CANCELADO) {
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
          return reservaRepository.guardar(reserva);
        }

        this.ciclo.confirmarPago(reserva, fechaPago, generarCodigoAlojamiento());
        return reservaRepository.guardar(reserva);
      },
    );

    // Se reintentan únicamente los correos pendientes; los pagos en revisión
    // no se presentan como una reserva confirmada.
    if (this.estado.estaConfirmada(guardada)) {
      await this.notificacionesService.enviarConfirmacion(guardada);
    }
    return guardada;
  }

  /** Cierra una reserva cuyo pago falló o cuya preferencia no pudo crearse. */
  async rechazarPago(
    id: number,
    estado: EstadoPagoReserva = EstadoPagoReserva.RECHAZADO,
    actor?: ActorCancelacion,
    motivo?: string,
  ): Promise<Reserva> {
    return this.vencimiento.rechazarPago(id, estado, actor, motivo);
  }

  /**
   * Historial de reservas del inquilino logueado.
   */
  async listarPorUsuario(idUsuario: number): Promise<Reserva[]> {
    return this.reservaRepository.buscarPorUsuario(idUsuario);
  }

  /**
   * Reservas recibidas sobre una publicación puntual, para que el
   * anunciante vea quién reservó su propiedad.
   */
  async listarPorPublicacion(
    idPublicacion: number,
    idUsuarioQueOpera: number,
  ): Promise<Reserva[]> {
    await this.publicacionesService.obtenerPropia(
      idPublicacion,
      idUsuarioQueOpera,
      'No tenés permiso para consultar las reservas de esta publicación',
    );
    return this.reservaRepository.buscarPorPublicacion(idPublicacion);
  }

  /** Todas las reservas recibidas por publicaciones del anunciante autenticado. */
  async listarRecibidasPorAnunciante(
    idUsuarioAnunciante: number,
  ): Promise<Reserva[]> {
    return this.reservaRepository.buscarRecibidasPorAnunciante(
      idUsuarioAnunciante,
    );
  }

  async existeReservaAprobada(
    idPublicacion: number,
    idUsuarioInquilino: number,
  ): Promise<boolean> {
    return this.reservaRepository.existeAprobada(
      idPublicacion,
      idUsuarioInquilino,
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
    return reserva;
  }

  /** Lectura interna para otro módulo; no aplica permisos de participante. */
  async obtenerPorId(id: number): Promise<Reserva> {
    const reserva = await this.reservaRepository.buscarPorId(id);
    if (!reserva)
      throw new NotFoundException(`No se encontró la reserva ${id}`);
    return reserva;
  }

  /** El reclamo congela la liquidación mientras el Administrador resuelve. */
  async marcarEnRevisionPorReclamo(
    id: number,
    motivo: string,
  ): Promise<Reserva> {
    return this.transaccion.ejecutar(async ({ reservas }) => {
      const reserva = await reservas.buscarPorId(id);
      if (!reserva)
        throw new NotFoundException(`No se encontró la reserva ${id}`);
      if (this.estado.liquidacionResuelta(reserva)) {
        throw new ConflictException(
          'La liquidación ya fue resuelta; no se puede abrir un reclamo que la reabra',
        );
      }
      reserva.estado_liquidacion = EstadoLiquidacionReserva.EN_REVISION;
      reserva.observacion_liquidacion = motivo;
      reserva.fecha_resolucion_liquidacion = null;
      return reservas.guardar(reserva);
    });
  }

  /** Resolución sin devolución: se libera la retención o se paga al propietario. */
  async resolverReclamoSinDevolucion(
    id: number,
    observacion: string,
  ): Promise<Reserva> {
    return this.transaccion.ejecutar(async ({ reservas }) => {
      const reserva = await reservas.buscarPorId(id);
      if (!reserva)
        throw new NotFoundException(`No se encontró la reserva ${id}`);
      if (this.estado.liquidacionResuelta(reserva)) {
        throw new ConflictException(
          'La liquidación ya fue resuelta; no se puede reabrir desde el reclamo',
        );
      }
      if (
        (reserva.observacion_liquidacion ?? '').includes(
          'Devolución de',
        ) &&
        (reserva.observacion_liquidacion ?? '').includes(
          'en ejecución',
        )
      ) {
        throw new ConflictException(
          'Hay una devolución en ejecución; esperá su resultado antes de reabrir la liquidación',
        );
      }
      reserva.estado_liquidacion = this.estado.codigoValidado(reserva)
        ? EstadoLiquidacionReserva.PENDIENTE_PAGO_PROPIETARIO
        : EstadoLiquidacionReserva.RETENIDO;
      reserva.observacion_liquidacion = observacion;
      reserva.fecha_resolucion_liquidacion =
        this.estado.liquidacionResuelta(reserva) ? new Date() : null;
      return reservas.guardar(reserva);
    });
  }

  /** Agrega la observación administrativa sin alterar el estado de liquidación. */
  async observarLiquidacion(id: number, observacion: string): Promise<Reserva> {
    const reserva = await this.obtenerPorId(id);
    reserva.observacion_liquidacion = observacion;
    return this.reservaRepository.guardar(reserva);
  }

  /** Congela la reserva mientras Mercado Pago tramita un contracargo. */
  async marcarContracargo(id: number, motivo: string): Promise<Reserva> {
    const reserva = await this.obtenerPorId(id);
    reserva.estado_pago = EstadoPagoReserva.CONTRACARGO;
    reserva.estado_liquidacion = EstadoLiquidacionReserva.EN_REVISION;
    reserva.observacion_liquidacion = motivo;
    reserva.fecha_resolucion_liquidacion = null;
    return this.reservaRepository.guardar(reserva);
  }

  /** Restaura el estado previo cuando el contracargo se resuelve a favor. */
  async restaurarContracargo(
    id: number,
    estadoPago: EstadoPagoReserva,
    estadoLiquidacion: EstadoLiquidacionReserva,
    observacion: string,
  ): Promise<Reserva> {
    const reserva = await this.obtenerPorId(id);
    reserva.estado_pago = estadoPago;
    reserva.estado_liquidacion = estadoLiquidacion;
    reserva.observacion_liquidacion = observacion;
    return this.reservaRepository.guardar(reserva);
  }

  /** El inquilino participante o el anunciante dueño pueden cancelar. */
  async cancelar(id: number, idUsuarioQueOpera: number): Promise<Reserva> {
    return this.transaccion.ejecutar(
      async ({ reservas: reservaRepository, fechas: fechaRepository }) => {
        const reserva = await reservaRepository.buscarPorId(id);
        if (!reserva)
          throw new NotFoundException(`No se encontró la reserva ${id}`);
        this.verificarParticipanteOPropietario(reserva, idUsuarioQueOpera);
        if (reserva.finalizada)
          throw new BadRequestException(
            'No se puede cancelar una reserva finalizada',
          );
        if (reserva.cancelada) return reserva;
        if (this.estado.pagoAprobado(reserva)) {
          throw new BadRequestException(
            'La reserva está pagada. Solicitá la cancelación con devolución desde el detalle de la reserva.',
          );
        }

        this.ciclo.cancelar(
          reserva,
          this.estado.esDelInquilino(reserva, idUsuarioQueOpera)
            ? 'INQUILINO'
            : 'ANUNCIANTE',
          'Cancelación de reserva pendiente de pago',
        );
        const guardada = await reservaRepository.guardar(reserva);
        await this.disponibilidadService.liberarReserva(
          reserva.id,
          fechaRepository,
        );
        return guardada;
      },
    );
  }

  private verificarParticipanteOPropietario(
    reserva: Reserva,
    idUsuarioQueOpera: number,
  ): void {
    if (!this.estado.participa(reserva, idUsuarioQueOpera)) {
      throw new ForbiddenException(
        'No tenés permiso para consultar esta reserva',
      );
    }
  }
}
