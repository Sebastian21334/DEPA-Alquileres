import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository, type EntityManager, type FindOptionsRelations } from 'typeorm';
import { Usuario } from '../../usuarios/entity/usuario.entity';
import { Reclamo } from '../entity/reclamo.entity';
import { ReclamoEvidencia } from '../entity/reclamo-evidencia.entity';
import { ReclamoMensaje } from '../entity/reclamo-mensaje.entity';
import type { IReclamosRepository } from './reclamos.repository.interface';

const RELACIONES_RECLAMO: FindOptionsRelations<Reclamo> = {
  reserva: { publicacion: { anunciante: { usuario: true } }, usuario: true },
  inquilino: true,
  anunciante: true,
  evidencias: true,
  mensajes: { autor: { rol: true } },
};

@Injectable()
export class ReclamosRepository implements IReclamosRepository {
  constructor(@InjectRepository(Reclamo) private readonly reclamos: Repository<Reclamo>, @InjectRepository(ReclamoEvidencia) private readonly evidencias: Repository<ReclamoEvidencia>, @InjectRepository(ReclamoMensaje) private readonly mensajes: Repository<ReclamoMensaje>) {}

  enTransaccion(transaccion: EntityManager): IReclamosRepository {
    return new ReclamosRepository(
      transaccion.getRepository(Reclamo),
      transaccion.getRepository(ReclamoEvidencia),
      transaccion.getRepository(ReclamoMensaje),
    );
  }

  existeAbierto(idReserva: number, estados: string[]): Promise<boolean> {
    return this.reclamos.existsBy({
      reserva: { id: idReserva },
      estado: In(estados),
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

  async listarAdministracion(): Promise<Reclamo[]> {
    const reclamos = await this.reclamos.find({
      relations: {
        ...RELACIONES_RECLAMO,
        reserva: { publicacion: { imagenes: true, anunciante: { usuario: true } }, usuario: true },
      },
      order: { id: 'DESC' },
      take: 200,
    });
    for (const reclamo of reclamos) {
      reclamo.reserva?.publicacion?.imagenes?.sort((a, b) => a.orden - b.orden || a.id - b.id);
    }
    return reclamos;
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

  async guardarMensaje(mensaje: Omit<Partial<ReclamoMensaje>, 'autor'> & { autor: Pick<Usuario, 'id'> }): Promise<ReclamoMensaje> {
    const autor = await this.mensajes.manager.getRepository(Usuario).findOneOrFail({
      where: { id: mensaje.autor.id },
      select: { id: true, nombre: true, apellido: true, rol: { id: true, nombre: true } },
      relations: { rol: true },
    });
    return this.mensajes.save(this.mensajes.create({ ...mensaje, autor }));
  }
}
