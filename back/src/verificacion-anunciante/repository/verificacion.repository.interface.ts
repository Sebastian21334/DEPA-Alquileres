import { RevisionVerificacion } from '../entity/revision-verificacion.entity';
import { SolicitudVerificacion } from '../entity/solicitud-verificacion.entity';

import { Anunciante } from '../../anunciantes/entity/anunciante.entity';

export interface PersistenciaVerificacion {
  guardarSolicitud(
    solicitud: SolicitudVerificacion,
  ): Promise<SolicitudVerificacion>;
  guardarAnunciante(anunciante: Anunciante): Promise<Anunciante>;
  guardarRevision(
    revision: RevisionVerificacion,
  ): Promise<RevisionVerificacion>;
}

export const VERIFICACION_REPOSITORY = 'VERIFICACION_REPOSITORY';

export interface IVerificacionRepository {
  conSolicitudBloqueada<T>(
    idAnunciante: number,
    operacion: (
      solicitud: SolicitudVerificacion | null,
      persistencia: PersistenciaVerificacion,
    ) => Promise<T>,
  ): Promise<T>;
  crearSolicitud(datos: Partial<SolicitudVerificacion>): SolicitudVerificacion;
  guardarSolicitud(
    solicitud: SolicitudVerificacion,
  ): Promise<SolicitudVerificacion>;
  buscarSolicitudPorAnunciante(
    idAnunciante: number,
  ): Promise<SolicitudVerificacion | null>;
  buscarPendientes(): Promise<SolicitudVerificacion[]>;
  crearRevision(datos: Partial<RevisionVerificacion>): RevisionVerificacion;
  guardarRevision(
    revision: RevisionVerificacion,
  ): Promise<RevisionVerificacion>;
  buscarRevisiones(idAnunciante: number): Promise<RevisionVerificacion[]>;
}
