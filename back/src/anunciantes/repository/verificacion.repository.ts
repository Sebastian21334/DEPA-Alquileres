import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RevisionVerificacion } from '../entity/revision-verificacion.entity';
import { SolicitudVerificacion } from '../entity/solicitud-verificacion.entity';
import { IVerificacionRepository } from './verificacion.repository.interface';

@Injectable()
export class VerificacionRepository implements IVerificacionRepository {
  constructor(
    @InjectRepository(SolicitudVerificacion)
    private readonly solicitudes: Repository<SolicitudVerificacion>,
    @InjectRepository(RevisionVerificacion)
    private readonly revisiones: Repository<RevisionVerificacion>,
  ) {}

  crearSolicitud(datos: Partial<SolicitudVerificacion>) {
    return this.solicitudes.create(datos);
  }

  guardarSolicitud(solicitud: SolicitudVerificacion) {
    return this.solicitudes.save(solicitud);
  }

  buscarSolicitudPorAnunciante(idAnunciante: number) {
    return this.solicitudes.findOne({
      where: { anunciante: { idUsuario: idAnunciante } },
      relations: { anunciante: { usuario: true, tipoAnunciante: true } },
    });
  }

  buscarPendientes() {
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
    return this.revisiones.create(datos);
  }

  guardarRevision(revision: RevisionVerificacion) {
    return this.revisiones.save(revision);
  }

  buscarRevisiones(idAnunciante: number) {
    return this.revisiones.find({
      where: { anunciante: { idUsuario: idAnunciante } },
      order: { creada_en: 'DESC' },
    });
  }
}