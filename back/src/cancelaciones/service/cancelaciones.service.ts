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
import { referenciaUsuario } from '../../usuarios/usuario-referencia';
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
    return this.cancelaciones.conTransaccion(async (cancelaciones, transaccion) => {
      const reserva = await this.reservas.buscarPorId(idReserva, idUsuario, transaccion);
      const activa = await this.buscarEnCurso(cancelaciones, reserva, transaccion);
      if (activa) return this.prepararRespuesta(activa);

      this.validarReserva(reserva, fechaArgentina());
      await this.asegurarSinDevolucionActiva(reserva.id, transaccion);
      const solicitud = cancelaciones.crear({
        reserva,
        solicitante: referenciaUsuario(idUsuario),
        motivo: dto.motivo.trim(),
        estado: this.catalogos.codigoEstado('SOLICITUD_CANCELACION', 'PENDIENTE'),
        decidida_por: null,
        decidida_en: null,
        observacion: null,
      });
      return this.prepararRespuesta(await cancelaciones.guardar(solicitud));
    });
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
        return { vencida: true };
      }

      solicitud.observacion = dto.observacion?.trim() || null;

      const rechazada = this.catalogos.codigoEstado('SOLICITUD_CANCELACION', 'RECHAZADA');
      if (dto.decision === rechazada) {
        solicitud.estado = rechazada;
        return { vencida: false, solicitud: await cancelaciones.guardar(solicitud), reembolso: null };
      }

      this.validarReserva(reserva, hoy);
      await this.asegurarSinDevolucionActiva(idReserva, transaccion);
      const politica = await cancelaciones.buscarPolitica(reserva.fecha_pago ? fechaArgentina(reserva.fecha_pago) : null);
      if (!politica) throw new InternalServerErrorException('Falta la política de cancelación aplicable a la reserva');

      const actor = this.actorDeCancelacion(reserva, solicitud.solicitante?.id);
      const porcentaje = this.porcentajeDevolucion(reserva, actor, hoy, politica);
      const importe = this.redondear(
        (Number(reserva.monto_pago) * porcentaje) / 100,
      );
      solicitud.estado = this.catalogos.codigoEstado('SOLICITUD_CANCELACION', 'APROBADA');

      if (importe > 0) {
        // El reembolso y la aprobación se confirman juntos: no queda una
        // solicitud aprobada sin registro económico ni un registro sin decisión.
        const pago = await this.reembolsos.buscarPagoPorReserva(idReserva, transaccion);
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
              referenciaInterna: this.claveReembolso(solicitud.id),
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

  private porcentajeDevolucion(reserva: Reserva, actor: ActorCancelacion, hoy: string, politica: PoliticaCancelacion): number {
    if (actor !== 'INQUILINO') return politica.porcentajeOtrosActores;
    const inicio = new Date(`${reserva.fecha_inicio}T12:00:00Z`).getTime();
    const ahora = new Date(`${hoy}T12:00:00Z`).getTime();
    const dias = Math.ceil((inicio - ahora) / 86_400_000);
    if (dias >= politica.diasDevolucionTotal) return politica.porcentajeTotal;
    if (dias >= politica.diasDevolucionParcial) return politica.porcentajeParcial;
    return politica.porcentajeFueraDePlazo;
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
