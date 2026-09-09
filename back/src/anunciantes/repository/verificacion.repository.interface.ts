import { RevisionVerificacion } from '../entity/revision-verificacion.entity';
import { SolicitudVerificacion } from '../entity/solicitud-verificacion.entity';

export const VERIFICACION_REPOSITORY = 'VERIFICACION_REPOSITORY';

export interface IVerificacionRepository {
  crearSolicitud(datos: Partial<SolicitudVerificacion>): SolicitudVerificacion;
  guardarSolicitud(solicitud: SolicitudVerificacion): Promise<SolicitudVerificacion>;
  buscarSolicitudPorAnunciante(idAnunciante: number): Promise<SolicitudVerificacion | null>;
  buscarPendientes(): Promise<SolicitudVerificacion[]>;
  crearRevision(datos: Partial<RevisionVerificacion>): RevisionVerificacion;
  guardarRevision(revision: RevisionVerificacion): Promise<RevisionVerificacion>;
  buscarRevisiones(idAnunciante: number): Promise<RevisionVerificacion[]>;
}