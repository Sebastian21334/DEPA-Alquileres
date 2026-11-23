import type { EntityManager } from 'typeorm';
import type { SolicitudCancelacion } from '../entity/solicitud-cancelacion.entity';
import type { PoliticaCancelacion } from '../entity/politica-cancelacion.entity';

export const CANCELACIONES_REPOSITORY = 'CANCELACIONES_REPOSITORY';

export interface ICancelacionesRepository {
  tienePendientesDeCuenta(idUsuario: number, anuncianteVerificado: boolean, transaccion: EntityManager, estado: string): Promise<boolean>;
  enTransaccion(transaccion: EntityManager): ICancelacionesRepository;
  conTransaccion<T>(operacion: (cancelaciones: ICancelacionesRepository, transaccion: EntityManager) => Promise<T>): Promise<T>;
  crear(datos: Partial<SolicitudCancelacion>): SolicitudCancelacion;
  guardar(solicitud: SolicitudCancelacion): Promise<SolicitudCancelacion>;
  buscarParaResolver(id: number, idReserva: number): Promise<SolicitudCancelacion | null>;
  buscarActiva(idReserva: number, estado: string): Promise<SolicitudCancelacion | null>;
  buscarPolitica(fechaPago: string | null): Promise<PoliticaCancelacion | null>;
  listarVencibles(hoy: string, despuesDe: number): Promise<SolicitudCancelacion[]>;
  buscarDemorada(idReserva: number, idUsuario: number): Promise<SolicitudCancelacion | null>;
  listarDemoradasDelSolicitante(idUsuario: number, hoy: string): Promise<SolicitudCancelacion[]>;
  listarPorEstado(estado: string): Promise<SolicitudCancelacion[]>;
}
