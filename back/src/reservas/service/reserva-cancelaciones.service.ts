import { Injectable, Optional } from '@nestjs/common';
import { ReembolsosService } from '../../reembolsos/service/reembolsos.service';
import {
  EstadoReembolso,
  Reembolso,
} from '../../reembolsos/entity/reembolso.entity';
import { NotificacionesService } from '../../notificaciones/service/notificaciones.service';
import { Reserva } from '../entity/reserva.entity';
import { SolicitudCancelacion } from '../entity/solicitud-cancelacion.entity';
import { ResolverSolicitudCancelacionDto } from '../dto/resolver-solicitud-cancelacion.dto';
import { SolicitarCancelacionDto } from '../dto/solicitar-cancelacion.dto';
import { ReservaReembolsoAplicacionService } from './reserva-reembolso-aplicacion.service';
import { ReservaSolicitudCancelacionResolucionService } from './reserva-solicitud-cancelacion-resolucion.service';
import { ReservaSolicitudCancelacionService } from './reserva-solicitud-cancelacion.service';

/** Fachada de compatibilidad: solicitudes y aplicación de reembolsos. */
@Injectable()
export class ReservaCancelacionesService {
  constructor(
    private readonly solicitudes: ReservaSolicitudCancelacionService,
    private readonly resolucion: ReservaSolicitudCancelacionResolucionService,
    private readonly reembolsosService: ReembolsosService,
    private readonly aplicacion: ReservaReembolsoAplicacionService,
    @Optional()
    private readonly notificaciones?: NotificacionesService,
  ) {}

  solicitarCancelacion(
    id: number,
    dto: SolicitarCancelacionDto,
    idUsuario: number,
  ): Promise<SolicitudCancelacion> {
    return this.solicitudes.solicitarCancelacion(id, dto, idUsuario);
  }

  consultarSolicitudCancelacion(
    id: number,
    idUsuario: number,
  ): Promise<SolicitudCancelacion | null> {
    return this.solicitudes.consultarSolicitudCancelacion(id, idUsuario);
  }

  listarSolicitudesCancelacion(): Promise<SolicitudCancelacion[]> {
    return this.solicitudes.listarSolicitudesCancelacion();
  }

  resolverSolicitudCancelacion(
    id: number,
    idSolicitud: number,
    dto: ResolverSolicitudCancelacionDto,
    idAdmin: number,
  ): Promise<{ solicitud: SolicitudCancelacion; reembolso: Reembolso | null }> {
    return this.resolucion.resolverSolicitudCancelacion(
      id,
      idSolicitud,
      dto,
      idAdmin,
    );
  }

  listarReembolsosReserva(
    idReserva: number,
    idUsuario: number,
  ): Promise<Reembolso[]> {
    return this.solicitudes.listarReembolsosReserva(idReserva, idUsuario);
  }

  async registrarReembolsoManual(
    idReembolso: number,
    referencia: string,
    idAdmin: number,
  ): Promise<{ reembolso: Reembolso; reserva: Reserva }> {
    const ejecutado = await this.reembolsosService.registrarManual(
      idReembolso,
      referencia,
      idAdmin,
    );
    if (ejecutado.estado !== EstadoReembolso.APROBADO)
      throw new Error(
        'La devolución manual no quedó aprobada; revisá la referencia',
      );
    const aplicado = await this.aplicacion.aplicarReembolsoConfirmado(
      idReembolso,
    );
    await this.notificaciones?.reembolso(aplicado.reembolso);
    return aplicado;
  }

  aplicarReembolsoConfirmado(
    idReembolso: number,
  ): Promise<{ reembolso: Reembolso; reserva: Reserva }> {
    return this.aplicacion.aplicarReembolsoConfirmado(idReembolso);
  }
}
