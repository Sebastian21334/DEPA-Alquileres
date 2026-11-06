import {
  type IVerificacionRepository,
  type PersistenciaVerificacion,
} from './verificacion.repository.interface';
import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { RevisionVerificacion } from '../entity/revision-verificacion.entity';
import {
  EstadoVerificacion,
  SolicitudVerificacion,
} from '../entity/solicitud-verificacion.entity';
import { Anunciante } from '../../anunciantes/entity/anunciante.entity';
import { EliminacionDocumento } from '../entity/eliminacion-documento.entity';

@Injectable()
export class VerificacionRepository implements IVerificacionRepository {
  constructor(
    // Repositorio TypeORM de la solicitud vigente por anunciante.
    // Repositorio separado para conservar todas las decisiones administrativas.
    @InjectRepository(SolicitudVerificacion)
    private readonly solicitudes: Repository<SolicitudVerificacion>,
    @InjectRepository(RevisionVerificacion)
    private readonly revisiones: Repository<RevisionVerificacion>,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  conSolicitudBloqueada<T>(
    idAnunciante: number,
    operacion: (
      solicitud: SolicitudVerificacion | null,
      persistencia: PersistenciaVerificacion,
    ) => Promise<T>,
  ): Promise<T> {
    return this.dataSource.transaction(async (manager) => {
      const solicitudes = manager.getRepository(SolicitudVerificacion);
      const solicitud = await solicitudes
        .createQueryBuilder('solicitud')
        .addSelect(
          SolicitudVerificacion.CAMPOS_PRUEBA_PRIVADOS.map(
            (campo) => `solicitud.${campo}`,
          ),
        )
        .leftJoinAndSelect('solicitud.anunciante', 'anunciante')
        .leftJoinAndSelect('anunciante.usuario', 'usuario')
        .leftJoinAndSelect('anunciante.tipoAnunciante', 'tipoAnunciante')
        .where('anunciante.idUsuario = :idAnunciante', { idAnunciante })
        .setLock('pessimistic_write', undefined, ['solicitud'])
        .getOne();
      return operacion(solicitud, {
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
        guardarAnunciante: (actual) =>
          manager.getRepository(Anunciante).save(actual),
        guardarRevision: (revision) =>
          manager.getRepository(RevisionVerificacion).save(revision),
      });
    });
  }

  /** Solo bloquea la cola; no mantiene bloqueada la solicitud durante Azure. */
  procesarEliminacionesPendientes(
    eliminar: (url: string) => Promise<void>,
    ahora = new Date(),
  ): Promise<{ eliminados: number; fallidos: number }> {
    return this.dataSource.transaction(async (manager) => {
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
      let eliminados = 0;
      let fallidos = 0;
      for (const documento of documentos) {
        try {
          await eliminar(documento.url);
        } catch {
          documento.intentos += 1;
          // Reintenta sin vencimiento, con espera creciente hasta una hora.
          const espera = Math.min(
            3_600_000,
            30_000 * 2 ** Math.min(documento.intentos - 1, 7),
          );
          documento.proximo_intento = new Date(ahora.getTime() + espera);
          await cola.save(documento);
          fallidos += 1;
          continue;
        }
        // Si falla el COMMIT, repetir el borrado es seguro (deleteIfExists).
        await cola.delete(documento.id);
        eliminados += 1;
      }
      return { eliminados, fallidos };
    });
  }

  crearSolicitud(datos: Partial<SolicitudVerificacion>) {
    // Crea la entidad en memoria; la escritura ocurre en guardarSolicitud.
    return this.solicitudes.create(datos);
  }

  guardarSolicitud(solicitud: SolicitudVerificacion) {
    // Inserta una solicitud nueva o actualiza la existente.
    return this.solicitudes.save(solicitud);
  }

  buscarSolicitudPorAnunciante(idAnunciante: number) {
    // Carga también los datos del anunciante para que el servicio pueda notificarlo.
    return this.solicitudes.findOne({
      where: { anunciante: { idUsuario: idAnunciante } },
      relations: { anunciante: { usuario: true, tipoAnunciante: true } },
    });
  }

  buscarPendientes() {
    // Solo devuelve estados que todavía requieren una decisión administrativa.
    return this.solicitudes.find({
      where: [
        { estado: EstadoVerificacion.PENDIENTE },
        { estado: EstadoVerificacion.REENVIADA },
      ],
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
