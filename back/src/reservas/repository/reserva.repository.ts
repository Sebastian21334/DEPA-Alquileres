// reservas/repositorio/reserva.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reserva } from '../entity/reserva.entity';
import { IReservaRepository } from './reserva.repository.interface';

@Injectable()
export class ReservaRepository implements IReservaRepository {
  constructor(
    @InjectRepository(Reserva)
    private readonly repository: Repository<Reserva>,
  ) {}

  crear(datos: Partial<Reserva>): Reserva {
    return this.repository.create(datos);
  }

  guardar(reserva: Reserva): Promise<Reserva> {
    return this.repository.save(reserva);
  }

  guardarVarias(reservas: Reserva[]): Promise<Reserva[]> {
    return this.repository.save(reservas);
  }

  buscarPorId(id: number): Promise<Reserva | null> {
    return this.repository.findOne({
      where: { id },
      relations: { usuario: true, publicacion: true, metodoPago: true },
    });
  }

  buscarPorUsuario(idUsuario: number): Promise<Reserva[]> {
    // El orden descendente permite mostrar primero las reservas más recientes.
    return this.repository.find({
      where: { usuario: { id: idUsuario } },
      relations: { publicacion: true, metodoPago: true },
      order: { fecha_pago: 'DESC' },
    });
  }

  buscarPorPublicacion(idPublicacion: number): Promise<Reserva[]> {
    // Se carga el usuario para que el anunciante pueda identificar al inquilino.
    return this.repository.find({
      where: { publicacion: { id: idPublicacion } },
      relations: { usuario: true, metodoPago: true },
      order: { fecha_pago: 'DESC' },
    });
  }
}