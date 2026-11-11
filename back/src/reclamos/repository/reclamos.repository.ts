import { EstadoReclamo } from '../../catalogos/estados';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository, type FindOptionsRelations } from 'typeorm';
import { Reclamo } from '../entity/reclamo.entity';
import { ReclamoEvidencia } from '../entity/reclamo-evidencia.entity';
import { ReclamoMensaje } from '../entity/reclamo-mensaje.entity';
import type { IReclamosRepository } from './reclamos.repository.interface';

const RELACIONES_RECLAMO: FindOptionsRelations<Reclamo> = {
  reserva: { publicacion: { anunciante: { usuario: true } }, usuario: true },
  inquilino: true,
  anunciante: true,
  evidencias: true,
  mensajes: { autor: true },
};

@Injectable()
export class ReclamosRepository implements IReclamosRepository {
  constructor(@InjectRepository(Reclamo) private readonly reclamos: Repository<Reclamo>, @InjectRepository(ReclamoEvidencia) private readonly evidencias: Repository<ReclamoEvidencia>, @InjectRepository(ReclamoMensaje) private readonly mensajes: Repository<ReclamoMensaje>) {}

  existeAbierto(idReserva: number): Promise<boolean> {
    return this.reclamos.existsBy({
      reserva: { id: idReserva },
      estado: In([EstadoReclamo.ABIERTO, EstadoReclamo.EN_REVISION]),
    });
  }

  guardar(reclamo: Partial<Reclamo>): Promise<Reclamo> {
    return this.reclamos.save(this.reclamos.create(reclamo));
  }

  listarPorParticipante(idUsuario: number): Promise<Reclamo[]> {
    return this.reclamos.find({
      where: [{ inquilino: { id: idUsuario } }, { anunciante: { id: idUsuario } }],
      relations: RELACIONES_RECLAMO,
      order: { id: 'DESC' },
    });
  }

  listarAdministracion(): Promise<Reclamo[]> {
    return this.reclamos.find({
      relations: RELACIONES_RECLAMO,
      order: { id: 'DESC' },
      take: 200,
    });
  }

  buscarPorId(id: number): Promise<Reclamo | null> {
    return this.reclamos.findOne({
      where: { id },
      relations: { ...RELACIONES_RECLAMO, evidencias: { usuario: true } },
    });
  }

  contarEvidencias(idReclamo: number): Promise<number> {
    return this.evidencias.countBy({ reclamo: { id: idReclamo } });
  }

  guardarEvidencia(evidencia: Partial<ReclamoEvidencia>): Promise<ReclamoEvidencia> {
    return this.evidencias.save(this.evidencias.create(evidencia));
  }

  buscarEvidencia(idReclamo: number, idEvidencia: number): Promise<ReclamoEvidencia | null> {
    return this.evidencias.findOneBy({ id: idEvidencia, reclamo: { id: idReclamo } });
  }

  guardarMensaje(mensaje: Partial<ReclamoMensaje>): Promise<ReclamoMensaje> {
    return this.mensajes.save(this.mensajes.create(mensaje));
  }
}
