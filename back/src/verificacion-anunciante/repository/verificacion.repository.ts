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
        guardarSolicitud: (actual) => solicitudes.save(actual),
        guardarAnunciante: (actual) =>
          manager.getRepository(Anunciante).save(actual),
        guardarRevision: (revision) =>
          manager.getRepository(RevisionVerificacion).save(revision),
      });
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
