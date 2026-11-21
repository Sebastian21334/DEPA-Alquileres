import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CatalogosService } from '../../catalogos/service/catalogos.service';
import { fechaArgentina } from '../../common/utils/fechas';
import {
  OrigenReembolso,
  Reembolso,
  TipoReembolso,
} from '../../reembolsos/entity/reembolso.entity';
import { ReembolsosService } from '../../reembolsos/service/reembolsos.service';
import type { ActorCancelacion, Reserva } from '../../reservas/entity/reserva.entity';
import { ReservasService } from '../../reservas/service/reservas.service';
import { ReservaNotificacionesService } from '../../reservas/service/reserva-notificaciones.service';
import { referenciaUsuario } from '../../usuarios/usuario-referencia';
import type { CondicionesCancelacionDto, DevolucionCancelacionDto } from '../dto/condiciones-cancelacion.dto';
import { ResolverSolicitudCancelacionDto } from '../dto/resolver-solicitud-cancelacion.dto';
import { SolicitarCancelacionDto } from '../dto/solicitar-cancelacion.dto';
import { SolicitudCancelacion } from '../entity/solicitud-cancelacion.entity';
import type { PoliticaCancelacion } from '../entity/politica-cancelacion.entity';
import type { EntityManager } from 'typeorm';
import {
  CANCELACIONES_REPOSITORY,
  type ICancelacionesRepository,
} from '../repository/cancelaciones.repository.interface';

type ResultadoResolucion =
  | { vencida: true; reserva: Reserva; idSolicitante?: number }
  | { vencida: false; reserva: Reserva; solicitud: SolicitudCancelacion; reembolso: Reembolso | null };

/**
 * Dueño de la solicitud de cancelación de una reserva pagada y de su decisión.
 * Aplica la política de devolución y pide a Reservas y a Reembolsos los
 * efectos sobre la estadía y el dinero.
 */
@Injectable()
export class CancelacionesService {
  constructor(@Inject(CANCELACIONES_REPOSITORY) private readonly cancelaciones: ICancelacionesRepository, private readonly reservas: ReservasService, private readonly reembolsos: ReembolsosService, private readonly catalogos: CatalogosService, private readonly notificaciones?: ReservaNotificacionesService) {}

  /**
   * Crea el pedido de cancelación de una reserva pagada. La reserva no se
   * cancela hasta que el Administrador resuelva y, si corresponde, se registre
   * el reembolso.
   */
  async solicitar(idReserva: number, dto: SolicitarCancelacionDto, idUsuario: number): Promise<SolicitudCancelacion> {
    const resultado = await this.cancelaciones.conTransaccion(async (cancelaciones, transaccion) => {
      const reserva = await this.reservas.buscarPorId(idReserva, idUsuario, transaccion);
      const activa = await this.buscarEnCurso(cancelaciones, reserva, transaccion);
      if (activa) return { solicitud: activa, creada: false };

      const creadaEn = new Date();
      const hoy = fechaArgentina(creadaEn);
      this.validarReserva(reserva, hoy);
      const politica = await this.politicaAplicable(cancelaciones, reserva);
      const motivoBloqueo = this.bloqueoPorPlazo(reserva, hoy, politica);
      if (motivoBloqueo) throw new BadRequestException(motivoBloqueo);
      await this.asegurarSinDevolucionActiva(reserva.id, transaccion);
      const solicitud = cancelaciones.crear({
        reserva,
        solicitante: referenciaUsuario(idUsuario),
        motivo: dto.motivo.trim(),
        estado: this.catalogos.codigoEstado('SOLICITUD_CANCELACION', 'PENDIENTE'),
        decidida_por: null,
        decidida_en: null,
        observacion: null,
        creada_en: creadaEn,
      });
      return { solicitud: await cancelaciones.guardar(solicitud), creada: true };
    });
    if (resultado.creada)
      await this.notificaciones?.avisarCambio(resultado.solicitud.reserva, ['admin'], 'Nueva solicitud de cancelación', 'Hay una solicitud de cancelación pendiente de revisión.');
    return this.prepararRespuesta(resultado.solicitud);
  }

  private validarReserva(reserva: Reserva, hoy: string): void {
    if (!this.reservas.pagoAprobado(reserva))
      throw new BadRequestException(
        'La reserva no está pagada. Usá la cancelación inmediata de la reserva pendiente.',
      );
    if (reserva.cancelada)
      throw new ConflictException('La reserva ya está cancelada');
    if (reserva.finalizada)
      throw new BadRequestException(
        'La reserva ya finalizó. Solo podés abrir un reclamo.',
      );
    if (!reserva.fecha_inicio || reserva.fecha_inicio <= hoy)
      throw new BadRequestException(
        'La estadía ya comenzó. Para una devolución después del inicio, abrí un reclamo.',
      );
    if (this.reservas.codigoValidado(reserva))
      throw new BadRequestException(
        'No se puede cancelar una reserva con ingreso ya validado',
      );
    if (this.reservas.liquidacionResuelta(reserva))
      throw new ConflictException('La liquidación de la reserva ya está resuelta');
  }

  async consultarActiva(idReserva: number, idUsuario: number): Promise<SolicitudCancelacion | null> {
    const reserva = await this.reservas.buscarPorId(idReserva, idUsuario);
    return this.buscarEnCurso(this.cancelaciones, reserva);
  }

  async consultarCondiciones(idReserva: number, idUsuario: number): Promise<CondicionesCancelacionDto> {
    const reserva = await this.reservas.buscarPorId(idReserva, idUsuario);
    const solicitud = await this.buscarEnCurso(this.cancelaciones, reserva);
    const politica = await this.politicaAplicable(this.cancelaciones, reserva);
    const pago = await this.reembolsos.buscarPagoPorReserva(reserva.id);
    const hoy = fechaArgentina();
    const fechaSolicitud = solicitud ? fechaArgentina(solicitud.creada_en) : hoy;
    const actor = this.actorDeCancelacion(reserva, solicitud ? solicitud.solicitante?.id : idUsuario);
    return {
      solicitud,
      politica,
      motivoBloqueo: this.bloqueoPorPlazo(reserva, hoy, politica),
      admiteReembolso: pago != null,
      devolucionPorTransferencia: pago != null && pago.payment_method_id !== 'account_money',
      devolucion: pago ? { ...this.calcularDevolucion(reserva, actor, fechaSolicitud, politica), moneda: pago.currency } : null,
    };
  }

  private bloqueoPorPlazo(reserva: Reserva, hoy: string, politica: PoliticaCancelacion): string | null {
    const diasMinimos = politica.diasDevolucionParcial;
    return this.diasHastaIngreso(reserva, hoy) < diasMinimos
      ? `El plazo venció. Tenés que solicitar la cancelación al menos ${diasMinimos} días antes del ingreso.`
      : null;
  }

  private async politicaAplicable(cancelaciones: ICancelacionesRepository, reserva: Reserva): Promise<PoliticaCancelacion> {
    const politica = await cancelaciones.buscarPolitica(reserva.fecha_pago ? fechaArgentina(reserva.fecha_pago) : null);
    if (!politica) throw new InternalServerErrorException('Falta la política de cancelación aplicable a la reserva');
    return politica;
  }

  private async buscarEnCurso(cancelaciones: ICancelacionesRepository, reserva: Reserva, transaccion?: EntityManager): Promise<SolicitudCancelacion | null> {
    const pendiente = await cancelaciones.buscarActiva(reserva.id, this.catalogos.codigoEstado('SOLICITUD_CANCELACION', 'PENDIENTE'));
    if (pendiente || reserva.cancelada) return pendiente;
    const aprobada = await cancelaciones.buscarActiva(reserva.id, this.catalogos.codigoEstado('SOLICITUD_CANCELACION', 'APROBADA'));
    if (!aprobada || !(await this.reembolsos.tieneDevolucionDeCancelacionActiva(reserva.id, transaccion)))
      return null;
    return aprobada;
  }

  private async asegurarSinDevolucionActiva(idReserva: number, transaccion: EntityManager): Promise<void> {
    if (await this.reembolsos.tieneDevolucionDeCancelacionActiva(idReserva, transaccion))
      throw new ConflictException('La reserva ya tiene una devolución por cancelación en curso');
  }

  async listarPendientes(): Promise<SolicitudCancelacion[]> {
    const solicitudes = await this.cancelaciones.listarPorEstado(this.catalogos.codigoEstado('SOLICITUD_CANCELACION', 'PENDIENTE'));
    return solicitudes.map((solicitud) => this.prepararRespuesta(solicitud));
  }

  /**
   * Resuelve el pedido. Si se aprueba, calcula la devolución a la fecha de
   * solicitud con la política contratada y crea el reembolso.
   * Las fechas se liberan cuando el
   * reembolso queda aprobado (o de inmediato si el porcentaje es 0).
   *
   * La decisión y sus efectos locales comparten una transacción con la
   * solicitud bloqueada: dos resoluciones simultáneas dejan una sola devolución
   * y un fallo al cancelar o liberar fechas revierte la aprobación.
   */
  async resolver(idReserva: number, idSolicitud: number, dto: ResolverSolicitudCancelacionDto, idAdmin: number): Promise<{ solicitud: SolicitudCancelacion; reembolso: Reembolso | null }> {
    const resultado = await this.cancelaciones.conTransaccion((cancelaciones, transaccion) =>
      this.resolverEnTransaccion(idReserva, idSolicitud, dto, idAdmin, cancelaciones, transaccion),
    );

    await this.notificarResolucion(resultado);
    if (resultado.vencida)
      throw new ConflictException('La estadía ya comenzó; la solicitud quedó vencida');

    return {
      solicitud: this.prepararRespuesta(resultado.solicitud),
      reembolso: resultado.reembolso,
    };
  }

  private async resolverEnTransaccion(idReserva: number, idSolicitud: number, dto: ResolverSolicitudCancelacionDto, idAdmin: number, cancelaciones: ICancelacionesRepository, transaccion: EntityManager): Promise<ResultadoResolucion> {
    // El alta y la resolución bloquean primero la reserva y después consultan sus solicitudes.
    const reserva = await this.reservas.obtenerReserva(idReserva, transaccion);
    const solicitud = await cancelaciones.buscarParaResolver(idSolicitud, idReserva);
    if (!solicitud)
      throw new NotFoundException('No se encontró la solicitud de cancelación');
    if (solicitud.estado !== this.catalogos.codigoEstado('SOLICITUD_CANCELACION', 'PENDIENTE'))
      throw new ConflictException('La solicitud ya fue resuelta');

    const hoy = fechaArgentina();
    solicitud.decidida_por = referenciaUsuario(idAdmin);
    solicitud.decidida_en = new Date();

    if (!reserva.fecha_inicio || reserva.fecha_inicio <= hoy) {
      solicitud.estado = this.catalogos.codigoEstado('SOLICITUD_CANCELACION', 'VENCIDA');
      solicitud.observacion =
        'La estadía comenzó antes de resolver la solicitud';
      await cancelaciones.guardar(solicitud);
      return { vencida: true, reserva, idSolicitante: solicitud.solicitante?.id };
    }

    solicitud.observacion = dto.observacion?.trim() || null;

    const rechazada = this.catalogos.codigoEstado('SOLICITUD_CANCELACION', 'RECHAZADA');
    if (dto.decision === rechazada) {
      solicitud.estado = rechazada;
      return { vencida: false, reserva, solicitud: await cancelaciones.guardar(solicitud), reembolso: null };
    }

    return this.aprobarSolicitud(reserva, solicitud, hoy, idAdmin, cancelaciones, transaccion);
  }

  private async aprobarSolicitud(reserva: Reserva, solicitud: SolicitudCancelacion, hoy: string, idAdmin: number, cancelaciones: ICancelacionesRepository, transaccion: EntityManager): Promise<ResultadoResolucion> {
    this.validarReserva(reserva, hoy);
    await this.asegurarSinDevolucionActiva(reserva.id, transaccion);
    const politica = await this.politicaAplicable(cancelaciones, reserva);

    const actor = this.actorDeCancelacion(reserva, solicitud.solicitante?.id);
    const { porcentaje, importe } = this.calcularDevolucion(reserva, actor, fechaArgentina(solicitud.creada_en), politica);
    solicitud.estado = this.catalogos.codigoEstado('SOLICITUD_CANCELACION', 'APROBADA');

    const pago = importe > 0 ? await this.reembolsos.buscarPagoPorReserva(reserva.id, transaccion) : null;
    if (importe > 0 && !pago)
      throw new ConflictException('La reserva no tiene un pago registrado');
    if (importe > 0 && pago) {
      // El reembolso y la aprobación se confirman juntos: no queda una
      // solicitud aprobada sin registro económico ni un registro sin decisión.
      const referencia = this.claveReembolso(solicitud.id);
      const reembolso = await this.reembolsos.crearSolicitud(
        {
          reserva,
          pago,
          tipo:
            porcentaje >= 100 ? TipoReembolso.TOTAL : TipoReembolso.PARCIAL,
          origen: OrigenReembolso.CANCELACION,
          importe,
          motivo: `Cancelación de reserva: ${solicitud.motivo}`,
          idSolicitadoPor: idAdmin,
          idempotencyKey: referencia,
          referenciaInterna: referencia,
        },
        transaccion,
      );
      return { vencida: false, reserva, solicitud: await cancelaciones.guardar(solicitud), reembolso };
    }

    // Sin devolución: la reserva se cancela y las fechas se liberan.
    const guardada = await cancelaciones.guardar(solicitud);
    await this.reservas.cancelarConRetencionTotal(reserva.id, actor, solicitud.motivo, transaccion);
    return { vencida: false, reserva, solicitud: guardada, reembolso: null };
  }

  private async notificarResolucion(resultado: ResultadoResolucion): Promise<void> {
    const idSolicitante = resultado.vencida ? resultado.idSolicitante : resultado.solicitud.solicitante?.id;
    const destinatario = this.actorDeCancelacion(resultado.reserva, idSolicitante);
    const solicitante = destinatario === 'ANUNCIANTE' ? ['anunciante'] as const
      : destinatario === 'INQUILINO' ? ['inquilino'] as const : [] as const;
    if (resultado.vencida) {
      await this.notificaciones?.avisarCambio(resultado.reserva, solicitante, 'Solicitud de cancelación vencida', 'La solicitud venció porque la estadía ya comenzó.');
      return;
    }
    if (resultado.solicitud.estado === this.catalogos.codigoEstado('SOLICITUD_CANCELACION', 'RECHAZADA'))
      await this.notificaciones?.avisarCambio(resultado.reserva, solicitante, 'Solicitud de cancelación rechazada', 'La administración rechazó la solicitud. Consultá el detalle en DEPA.');
    else if (resultado.reembolso)
      await this.notificaciones?.avisarCambio(resultado.reserva, ['inquilino', 'anunciante'], 'Solicitud de cancelación aprobada', 'La devolución está en gestión. La cancelación se hará efectiva cuando se confirme.');
    else
      await this.notificaciones?.avisarCambio(resultado.reserva, ['inquilino', 'anunciante'], 'Reserva cancelada', 'La administración aprobó la cancelación y la reserva quedó cancelada.');
  }

  /** Identidad estable de la devolución de una solicitud: repetir la resolución no crea otra. */
  private claveReembolso(idSolicitud: number): string {
    return `can:${idSolicitud}`;
  }

  /** Política: el Anunciante/Administrador solo devuelve antes del inicio. */
  private actorDeCancelacion(reserva: Reserva, idSolicitante?: number): ActorCancelacion {
    if (idSolicitante && this.reservas.esDelInquilino(reserva, idSolicitante))
      return 'INQUILINO';
    if (idSolicitante && this.reservas.esDelAnunciante(reserva, idSolicitante))
      return 'ANUNCIANTE';
    return 'ADMINISTRADOR';
  }

  private porcentajeDevolucion(reserva: Reserva, actor: ActorCancelacion, hoy: string, politica: PoliticaCancelacion): number {
    if (actor !== 'INQUILINO') return politica.porcentajeOtrosActores;
    const dias = this.diasHastaIngreso(reserva, hoy);
    if (dias >= politica.diasDevolucionTotal) return politica.porcentajeTotal;
    if (dias >= politica.diasDevolucionParcial) return politica.porcentajeParcial;
    return politica.porcentajeFueraDePlazo;
  }

  private calcularDevolucion(reserva: Reserva, actor: ActorCancelacion, fechaSolicitud: string, politica: PoliticaCancelacion): Omit<DevolucionCancelacionDto, 'moneda'> {
    const porcentaje = this.porcentajeDevolucion(reserva, actor, fechaSolicitud, politica);
    return {
      fechaSolicitud,
      diasAnticipacion: this.diasHastaIngreso(reserva, fechaSolicitud),
      porcentaje,
      importe: this.redondear((Number(reserva.monto_pago) * porcentaje) / 100),
    };
  }

  private diasHastaIngreso(reserva: Reserva, hoy: string): number {
    if (!reserva.fecha_inicio) return 0;
    const inicio = new Date(`${reserva.fecha_inicio}T12:00:00Z`).getTime();
    const ahora = new Date(`${hoy}T12:00:00Z`).getTime();
    return (inicio - ahora) / 86_400_000;
  }

  private redondear(valor: number): number {
    return Math.round((valor + Number.EPSILON) * 100) / 100;
  }

  private prepararRespuesta(solicitud: SolicitudCancelacion): SolicitudCancelacion {
    if (solicitud.reserva?.estado_pago) {
      solicitud.reserva = this.reservas.prepararRespuesta(solicitud.reserva);
    }
    return solicitud;
  }
}
