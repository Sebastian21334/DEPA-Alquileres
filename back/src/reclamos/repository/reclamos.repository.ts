import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { EstadoReclamo, Reclamo } from '../entity/reclamo.entity';
import { ReclamoEvidencia } from '../entity/reclamo-evidencia.entity';
import { ReclamoMensaje } from '../entity/reclamo-mensaje.entity';
import type { IReclamosRepository } from './reclamos.repository.interface';

@Injectable()
export class ReclamosRepository implements IReclamosRepository {
  constructor(
    @InjectRepository(Reclamo)
    private readonly reclamos: Repository<Reclamo>,
    @InjectRepository(ReclamoEvidencia)
    private readonly evidencias: Repository<ReclamoEvidencia>,
    @InjectRepository(ReclamoMensaje)
    private readonly mensajes: Repository<ReclamoMensaje>,
  ) {}

  crear(datos: Partial<Reclamo>): Reclamo {
    return this.reclamos.create(datos);
  }

  guardar(reclamo: Reclamo): Promise<Reclamo> {
    return this.reclamos.save(reclamo);
  }

  buscarPorId(id: number): Promise<Reclamo | null> {
    return this.reclamos.findOne({
      where: { id },
      relations: {
        reserva: { publicacion: { anunciante: { usuario: true } }, usuario: true },
        inquilino: true,
        anunciante: true,
        evidencias: { usuario: true },
        mensajes: { autor: true },
      },
    });
  }

  buscarPorIdConBloqueo(id: number): Promise<Reclamo | null> {
    return this.reclamos.findOne({
      where: { id },
      lock: { mode: 'pessimistic_write' },
    });
  }

  buscarAbiertoPorReserva(idReserva: number): Promise<Reclamo | null> {
    return this.reclamos.findOne({
      where: {
        reserva: { id: idReserva },
        estado: In([EstadoReclamo.ABIERTO, EstadoReclamo.EN_REVISION]),
      },
    });
  }

  buscarPorUsuario(idUsuario: number): Promise<Reclamo[]> {
    return this.reclamos.find({
      where: [
        { inquilino: { id: idUsuario } },
        { anunciante: { id: idUsuario } },
      ],
      relations: {
        reserva: { publicacion: { anunciante: { usuario: true } }, usuario: true },
        inquilino: true,
        anunciante: true,
        evidencias: true,
        mensajes: { autor: true },
      },
      order: { id: 'DESC' },
    });
  }

  listarAdministracion(): Promise<Reclamo[]> {
    return this.reclamos.find({
      relations: {
        reserva: { publicacion: { anunciante: { usuario: true } }, usuario: true },
        inquilino: true,
        anunciante: true,
        evidencias: true,
        mensajes: { autor: true },
      },
      order: { id: 'DESC' },
      take: 200,
    });
  }

  contarEvidencias(idReclamo: number): Promise<number> {
    return this.evidencias.count({ where: { reclamo: { id: idReclamo } } });
  }

  crearEvidencia(datos: Partial<ReclamoEvidencia>): ReclamoEvidencia {
    return this.evidencias.create(datos);
  }

  guardarEvidencia(evidencia: ReclamoEvidencia): Promise<ReclamoEvidencia> {
    return this.evidencias.save(evidencia);
  }

  buscarEvidencia(
    idReclamo: number,
    idEvidencia: number,
  ): Promise<ReclamoEvidencia | null> {
    return this.evidencias.findOne({
      where: { id: idEvidencia, reclamo: { id: idReclamo } },
    });
  }

  crearMensaje(datos: Partial<ReclamoMensaje>): ReclamoMensaje {
    return this.mensajes.create(datos);
  }

  guardarMensaje(mensaje: ReclamoMensaje): Promise<ReclamoMensaje> {
    return this.mensajes.save(mensaje);
  }
}
