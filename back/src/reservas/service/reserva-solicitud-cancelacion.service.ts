import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import { fechaArgentina } from '../../common/utils/fechas';
import { ReembolsosService } from '../../reembolsos/service/reembolsos.service';
import {
  EstadoReembolso,
  Reembolso,
} from '../../reembolsos/entity/reembolso.entity';
import { Reserva } from '../entity/reserva.entity';
import {
  EstadoSolicitudCancelacion,
  SolicitudCancelacion,
} from '../entity/solicitud-cancelacion.entity';
import { SolicitarCancelacionDto } from '../dto/solicitar-cancelacion.dto';
import {
  RESERVA_REPOSITORY,
  type IReservaRepository,
} from '../repository/reserva.repository.interface';
import { ReservaEstadoService } from './reserva-estado.service';
import { referenciaUsuario } from '../../usuarios/usuario-referencia';
import { NotificacionesService } from '../../notificaciones/service/notificaciones.service';

@Injectable()
export class ReservaSolicitudCancelacionService {
  constructor(
    @Inject(RESERVA_REPOSITORY)
    private readonly reservaRepository: IReservaRepository,
    private readonly reembolsosService: ReembolsosService,
    private readonly estado: ReservaEstadoService,
    @Optional()
    private readonly notificaciones?: NotificacionesService,
  ) {}

  async solicitarCancelacion(
    id: number,
    dto: SolicitarCancelacionDto,
    idUsuario: number,
  ): Promise<SolicitudCancelacion> {
    const reserva = await this.reservaRepository.buscarPorId(id);
    if (!reserva)
      throw new NotFoundException(`No se encontró la reserva ${id}`);
    this.verificarParticipante(reserva, idUsuario);
    if (!this.estado.pagoAprobado(reserva))
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
    if (this.estado.codigoValidado(reserva))
      throw new BadRequestException(
        'No se puede cancelar una reserva con ingreso ya validado',
      );
    if (this.estado.liquidacionEnRevision(reserva))
      throw new ConflictException(
        'La liquidación está en revisión; no se puede solicitar una cancelación',
      );

    const activa =
      await this.reservaRepository.buscarSolicitudCancelacionActiva(id);
    if (activa) return activa;

    const reembolsos = await this.reembolsosService.listarPorReserva(id);
    if (
      reembolsos.some(
        (reembolso) =>
          reembolso.estado === EstadoReembolso.PENDIENTE ||
          reembolso.estado === EstadoReembolso.EN_PROCESO ||
          reembolso.estado === EstadoReembolso.FALLIDO ||
          reembolso.estado === EstadoReembolso.APROBADO,
      )
    )
      throw new ConflictException(
        'Ya existe una devolución en curso para esta reserva',
      );

    const solicitud = this.reservaRepository.crearSolicitudCancelacion({
      reserva,
      solicitante: referenciaUsuario(idUsuario),
      motivo: dto.motivo.trim(),
      estado: EstadoSolicitudCancelacion.PENDIENTE,
      decidida_por: null,
      decidida_en: null,
      observacion: null,
    });
    const guardada =
      await this.reservaRepository.guardarSolicitudCancelacion(solicitud);
    await this.notificaciones?.cancelacionSolicitada(
      reserva,
      dto.motivo.trim(),
    );
    return guardada;
  }

  async consultarSolicitudCancelacion(
    id: number,
    idUsuario: number,
  ): Promise<SolicitudCancelacion | null> {
    const reserva = await this.reservaRepository.buscarPorId(id);
    if (!reserva)
      throw new NotFoundException(`No se encontró la reserva ${id}`);
    this.verificarParticipante(reserva, idUsuario);
    return this.reservaRepository.buscarSolicitudCancelacionActiva(id);
  }

  async listarSolicitudesCancelacion(): Promise<SolicitudCancelacion[]> {
    return this.reservaRepository.listarSolicitudesCancelacionAdministracion();
  }

  /**
   * Resuelve el pedido. Si se aprueba, calcula la devolución con la política
   * vigente y crea el reembolso. Las fechas se liberan recién cuando el
   * reembolso queda aprobado (o de inmediato si el porcentaje es 0).
   */

  async listarReembolsosReserva(
    idReserva: number,
    idUsuario: number,
  ): Promise<Reembolso[]> {
    const reserva = await this.reservaRepository.buscarPorId(idReserva);
    if (!reserva)
      throw new NotFoundException(`No se encontró la reserva ${idReserva}`);
    this.verificarParticipante(reserva, idUsuario);
    return this.reembolsosService.listarPorReserva(idReserva);
  }


  private verificarParticipante(reserva: Reserva, idUsuario: number): void {
    if (!this.estado.participa(reserva, idUsuario))
      throw new ForbiddenException(
        'No formás parte de esta reserva',
      );
  }
}
