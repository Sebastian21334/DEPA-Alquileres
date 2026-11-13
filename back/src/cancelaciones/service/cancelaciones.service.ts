import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
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
import { referenciaUsuario } from '../../usuarios/usuario-referencia';
import { ResolverSolicitudCancelacionDto } from '../dto/resolver-solicitud-cancelacion.dto';
import { SolicitarCancelacionDto } from '../dto/solicitar-cancelacion.dto';
import { SolicitudCancelacion } from '../entity/solicitud-cancelacion.entity';
import {
  CANCELACIONES_REPOSITORY,
  type ICancelacionesRepository,
} from '../repository/cancelaciones.repository.interface';

type ResultadoResolucion =
  | { vencida: true }
  | { vencida: false; solicitud: SolicitudCancelacion; reembolso: Reembolso | null };

/**
 * Dueño de la solicitud de cancelación de una reserva pagada y de su decisión.
 * Aplica la política de devolución y pide a Reservas y a Reembolsos los
 * efectos sobre la estadía y el dinero.
 */
@Injectable()
export class CancelacionesService {
  constructor(@Inject(CANCELACIONES_REPOSITORY) private readonly cancelaciones: ICancelacionesRepository, private readonly reservas: ReservasService, private readonly reembolsos: ReembolsosService, private readonly catalogos: CatalogosService) {}

  /**
   * Crea el pedido de cancelación de una reserva pagada. La reserva no se
   * cancela hasta que el Administrador resuelva y, si corresponde, se registre
   * el reembolso.
   */
  async solicitar(idReserva: number, dto: SolicitarCancelacionDto, idUsuario: number): Promise<SolicitudCancelacion> {
    const reserva = await this.reservas.buscarPorId(idReserva, idUsuario);
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
    if (!reserva.fecha_inicio || reserva.fecha_inicio <= fechaArgentina())
      throw new BadRequestException(
        'La estadía ya comenzó. Para una devolución después del inicio, abrí un reclamo.',
      );
    if (this.reservas.codigoValidado(reserva))
      throw new BadRequestException(
        'No se puede cancelar una reserva con ingreso ya validado',
      );

    const pendiente = this.catalogos.codigoEstado('SOLICITUD_CANCELACION', 'PENDIENTE');
    const activa = await this.cancelaciones.buscarActiva(idReserva, pendiente);
    if (activa) return this.prepararRespuesta(activa);

    const solicitud = this.cancelaciones.crear({
      reserva,
      solicitante: referenciaUsuario(idUsuario),
      motivo: dto.motivo.trim(),
      estado: pendiente,
      decidida_por: null,
      decidida_en: null,
      observacion: null,
    });
    // El repositorio copia la reserva al crear la solicitud: se proyecta la copia guardada.
    return this.prepararRespuesta(await this.cancelaciones.guardar(solicitud));
  }

  async consultarActiva(idReserva: number, idUsuario: number): Promise<SolicitudCancelacion | null> {
    // Solo los participantes de la reserva pueden ver su solicitud.
    await this.reservas.buscarPorId(idReserva, idUsuario);
    return this.cancelaciones.buscarActiva(idReserva, this.catalogos.codigoEstado('SOLICITUD_CANCELACION', 'PENDIENTE'));
  }

  async listarPendientes(): Promise<SolicitudCancelacion[]> {
    const solicitudes = await this.cancelaciones.listarPorEstado(this.catalogos.codigoEstado('SOLICITUD_CANCELACION', 'PENDIENTE'));
    return solicitudes.map((solicitud) => this.prepararRespuesta(solicitud));
  }

  /**
   * Resuelve el pedido. Si se aprueba, calcula la devolución con la política
   * vigente y crea el reembolso. Las fechas se liberan recién cuando el
   * reembolso queda aprobado (o de inmediato si el porcentaje es 0).
   *
   * La decisión y sus efectos locales comparten una transacción con la
   * solicitud bloqueada: dos resoluciones simultáneas dejan una sola devolución
   * y un fallo al cancelar o liberar fechas revierte la aprobación.
   */
  async resolver(idReserva: number, idSolicitud: number, dto: ResolverSolicitudCancelacionDto, idAdmin: number): Promise<{ solicitud: SolicitudCancelacion; reembolso: Reembolso | null }> {
    const resultado = await this.cancelaciones.conTransaccion<ResultadoResolucion>(async (cancelaciones, transaccion) => {
      const solicitud = await cancelaciones.buscarParaResolver(idSolicitud, idReserva);
      if (!solicitud)
        throw new NotFoundException('No se encontró la solicitud de cancelación');
      if (solicitud.estado !== this.catalogos.codigoEstado('SOLICITUD_CANCELACION', 'PENDIENTE'))
        throw new ConflictException('La solicitud ya fue resuelta');

      const reserva = solicitud.reserva;
      const hoy = fechaArgentina();
      solicitud.decidida_por = referenciaUsuario(idAdmin);
      solicitud.decidida_en = new Date();

      if (!reserva.fecha_inicio || reserva.fecha_inicio <= hoy) {
        solicitud.estado = this.catalogos.codigoEstado('SOLICITUD_CANCELACION', 'VENCIDA');
        solicitud.observacion =
          'La estadía comenzó antes de resolver la solicitud';
        await cancelaciones.guardar(solicitud);
        return { vencida: true };
      }

      solicitud.observacion = dto.observacion?.trim() || null;

      if (dto.decision === 'RECHAZADA') {
        solicitud.estado = this.catalogos.codigoEstado('SOLICITUD_CANCELACION', 'RECHAZADA');
        return { vencida: false, solicitud: await cancelaciones.guardar(solicitud), reembolso: null };
      }

      const actor = this.actorDeCancelacion(reserva, solicitud.solicitante?.id);
      const porcentaje = this.porcentajeDevolucion(reserva, actor, hoy);
      const importe = this.redondear(
        (Number(reserva.monto_pago) * porcentaje) / 100,
      );
      solicitud.estado = this.catalogos.codigoEstado('SOLICITUD_CANCELACION', 'APROBADA');

      if (importe > 0) {
        // El reembolso y la aprobación se confirman juntos: no queda una
        // solicitud aprobada sin registro económico ni un registro sin decisión.
        const pago = await this.reembolsos.buscarPagoPorReserva(idReserva);
        if (!pago)
          throw new ConflictException('La reserva no tiene un pago registrado');
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
            idempotencyKey: this.claveReembolso(solicitud.id),
          },
          transaccion,
        );
        return { vencida: false, solicitud: await cancelaciones.guardar(solicitud), reembolso };
      }

      // Sin devolución: la reserva se cancela y las fechas se liberan.
      const guardada = await cancelaciones.guardar(solicitud);
      await this.reservas.cancelarConRetencionTotal(idReserva, actor, solicitud.motivo, transaccion);
      return { vencida: false, solicitud: guardada, reembolso: null };
    });

    // El vencimiento se confirma antes de informar el conflicto.
    if (resultado.vencida)
      throw new ConflictException(
        'La estadía ya comenzó; la solicitud quedó vencida',
      );
    return {
      solicitud: this.prepararRespuesta(resultado.solicitud),
      reembolso: resultado.reembolso,
    };
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

  private porcentajeDevolucion(reserva: Reserva, actor: ActorCancelacion, hoy: string): number {
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

  private prepararRespuesta(solicitud: SolicitudCancelacion): SolicitudCancelacion {
    if (solicitud.reserva?.estado_pago) {
      solicitud.reserva = this.reservas.prepararRespuesta(solicitud.reserva);
    }
    return solicitud;
  }
}
