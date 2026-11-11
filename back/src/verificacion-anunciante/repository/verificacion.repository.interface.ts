import type { EntityManager } from 'typeorm';
import { RevisionVerificacion } from '../entity/revision-verificacion.entity';
import { SolicitudVerificacion } from '../entity/solicitud-verificacion.entity';
import type { EliminacionDocumento } from '../entity/eliminacion-documento.entity';

export interface PersistenciaEliminacion {
  guardar(documento: EliminacionDocumento): Promise<EliminacionDocumento>;
  eliminar(id: number): Promise<void>;
}

export interface PersistenciaVerificacion {
  programarEliminacionDocumentos(urls: string[]): Promise<void>;
  guardarSolicitud(solicitud: SolicitudVerificacion): Promise<SolicitudVerificacion>;
  guardarRevision(revision: RevisionVerificacion): Promise<RevisionVerificacion>;
}

export const VERIFICACION_REPOSITORY = 'VERIFICACION_REPOSITORY';

export interface IVerificacionRepository {
  conTransaccion<T>(operacion: (transaccion: EntityManager) => Promise<T>): Promise<T>;
  conEliminacionesPendientes<T>(operacion: (documentos: EliminacionDocumento[], persistencia: PersistenciaEliminacion) => Promise<T>, ahora?: Date): Promise<T>;
  conSolicitudBloqueada<T>(idAnunciante: number, operacion: (solicitud: SolicitudVerificacion | null, persistencia: PersistenciaVerificacion, transaccion: EntityManager) => Promise<T>): Promise<T>;
  crearSolicitud(datos: Partial<SolicitudVerificacion>): SolicitudVerificacion;
  guardarSolicitud(solicitud: SolicitudVerificacion, transaccion?: EntityManager): Promise<SolicitudVerificacion>;
  buscarSolicitudPorAnunciante(idAnunciante: number): Promise<SolicitudVerificacion | null>;
  buscarPendientes(): Promise<SolicitudVerificacion[]>;
  crearRevision(datos: Partial<RevisionVerificacion>): RevisionVerificacion;
  guardarRevision(revision: RevisionVerificacion): Promise<RevisionVerificacion>;
  buscarRevisiones(idAnunciante: number): Promise<RevisionVerificacion[]>;
}
