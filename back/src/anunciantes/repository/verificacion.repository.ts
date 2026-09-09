import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RevisionVerificacion } from '../entity/revision-verificacion.entity';
import { SolicitudVerificacion } from '../entity/solicitud-verificacion.entity';
import { IVerificacionRepository } from './verificacion.repository.interface';

@Injectable()
export class VerificacionRepository implements IVerificacionRepository {
  constructor(
    // Repositorio TypeORM de la solicitud vigente por anunciante.
      // Repositorio separado para conservar todas las decisiones administrativas.
    @InjectRepository(SolicitudVerificacion)
    private readonly solicitudes: Repository<SolicitudVerificacion>,
    @InjectRepository(RevisionVerificacion)
    private readonly revisiones: Repository<RevisionVerificacion>,
  ) {}

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
        { estado: 'pendiente' as any },
        { estado: 'reenviada' as any },
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