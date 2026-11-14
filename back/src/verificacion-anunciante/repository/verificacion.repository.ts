import {
  type IVerificacionRepository,
  type PersistenciaVerificacion,
  type PersistenciaEliminacion,
} from './verificacion.repository.interface';
import { Injectable } from '@nestjs/common';
import { CAMPOS_PRUEBA_PRIVADOS } from '../dto/solicitud-verificacion-respuesta.dto';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, type EntityManager } from 'typeorm';
import { RevisionVerificacion } from '../entity/revision-verificacion.entity';
import { SolicitudVerificacion } from '../entity/solicitud-verificacion.entity';
import { EliminacionDocumento } from '../entity/eliminacion-documento.entity';

@Injectable()
export class VerificacionRepository implements IVerificacionRepository {
  // Repositorio TypeORM de la solicitud vigente por anunciante.
  // Repositorio separado para conservar todas las decisiones administrativas.
  constructor(@InjectRepository(SolicitudVerificacion) private readonly solicitudes: Repository<SolicitudVerificacion>, @InjectRepository(RevisionVerificacion) private readonly revisiones: Repository<RevisionVerificacion>, @InjectDataSource() private readonly dataSource: DataSource) {}

  conTransaccion<T>(operacion: (transaccion: EntityManager) => Promise<T>): Promise<T> {
    return this.dataSource.transaction(operacion);
  }

  conSolicitudBloqueada<T>(idAnunciante: number, operacion: (solicitud: SolicitudVerificacion | null, persistencia: PersistenciaVerificacion, transaccion: EntityManager) => Promise<T>): Promise<T> {
    return this.conTransaccion(async (manager) => {
      const solicitudes = manager.getRepository(SolicitudVerificacion);
      const solicitud = await solicitudes
        .createQueryBuilder('solicitud')
        .addSelect(
          CAMPOS_PRUEBA_PRIVADOS.map(
            (campo) => `solicitud.${campo}`,
          ),
        )
        .leftJoinAndSelect('solicitud.anunciante', 'anunciante')
        .leftJoinAndSelect('anunciante.usuario', 'usuario')
        .leftJoinAndSelect('anunciante.tipoAnunciante', 'tipoAnunciante')
        .where('anunciante.idUsuario = :idAnunciante', { idAnunciante })
        .setLock('pessimistic_write', undefined, ['solicitud'])
        .getOne();
      return operacion(
        solicitud,
        {
          programarEliminacionDocumentos: async (urls) => {
            if (!urls.length) return;
            await manager
              .getRepository(EliminacionDocumento)
              .createQueryBuilder()
              .insert()
              .values([...new Set(urls)].map((url) => ({ url })))
              .orIgnore()
              .execute();
          },
          guardarSolicitud: (actual) => solicitudes.save(actual),
          guardarRevision: (revision) =>
            manager.getRepository(RevisionVerificacion).save(revision),
        },
        manager,
      );
    });
  }

  /** Solo bloquea la cola; no mantiene bloqueada la solicitud durante Azure. */
  conEliminacionesPendientes<T>(operacion: (documentos: EliminacionDocumento[], persistencia: PersistenciaEliminacion) => Promise<T>, ahora = new Date()): Promise<T> {
    return this.conTransaccion(async (manager) => {
      const cola = manager.getRepository(EliminacionDocumento);
      const documentos = await cola
        .createQueryBuilder('documento')
        .where('documento.proximo_intento <= :ahora', { ahora })
        .orderBy('documento.proximo_intento', 'ASC')
        .addOrderBy('documento.id', 'ASC')
        .take(25)
        .setLock('pessimistic_write')
        .setOnLocked('skip_locked')
        .getMany();
      return operacion(documentos, {
        guardar: (documento) => cola.save(documento),
        eliminar: async (id) => { await cola.delete(id); },
      });
    });
  }

  crearSolicitud(datos: Partial<SolicitudVerificacion>) {
    // Crea la entidad en memoria; la escritura ocurre en guardarSolicitud.
    return this.solicitudes.create(datos);
  }

  guardarSolicitud(solicitud: SolicitudVerificacion, transaccion?: EntityManager) {
    // Inserta una solicitud nueva o actualiza la existente.
    return (transaccion?.getRepository(SolicitudVerificacion) ?? this.solicitudes).save(solicitud);
  }

  buscarSolicitudPorAnunciante(idAnunciante: number) {
    // Carga también los datos del anunciante para que el servicio pueda notificarlo.
    return this.solicitudes.findOne({
      where: { anunciante: { idUsuario: idAnunciante } },
      relations: { anunciante: { usuario: true, tipoAnunciante: true } },
    });
  }

  buscarPendientes(estados: string[]) {
    // Solo devuelve estados que todavía requieren una decisión administrativa.
    return this.solicitudes.find({
      where: estados.map((estado) => ({ estado })),
      relations: { anunciante: { usuario: true, tipoAnunciante: true } },
      order: { actualizada_en: 'ASC' },
    });
  }

  crearRevision(datos: Partial<RevisionVerificacion>) {
    // Prepara una entrada inmutable del historial de revisión.
    return this.revisiones.create(datos);
  }

  guardarRevision(revision: RevisionVerificacion) {
    // Persiste la decisión del administrador.
    return this.revisiones.save(revision);
  }

  buscarRevisiones(idAnunciante: number) {
    // Devuelve el historial más reciente primero para mostrarlo en el perfil.
    return this.revisiones.find({
      where: { anunciante: { idUsuario: idAnunciante } },
      order: { creada_en: 'DESC' },
    });
  }
}
