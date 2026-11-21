import type { PoliticaCancelacion } from '../entity/politica-cancelacion.entity';
import type { SolicitudCancelacion } from '../entity/solicitud-cancelacion.entity';

export interface DevolucionCancelacionDto {
  fechaSolicitud: string;
  diasAnticipacion: number;
  porcentaje: number;
  importe: number;
  moneda: string;
}

export interface SolicitudCancelacionAdministracionDto extends SolicitudCancelacion {
  devolucion: DevolucionCancelacionDto | null;
}

export interface CondicionesCancelacionDto {
  solicitud: SolicitudCancelacion | null;
  politica: PoliticaCancelacion;
  motivoBloqueo: string | null;
  advertencia: string | null;
  admiteReembolso: boolean;
  devolucionPorTransferencia: boolean;
  devolucion: DevolucionCancelacionDto | null;
}
