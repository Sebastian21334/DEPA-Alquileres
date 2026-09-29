// reservas/repositorio/reserva.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { EstadoPagoReserva, Reserva } from '../entity/reserva.entity';
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
      relations: { usuario: true, publicacion: { anunciante: { usuario: true } }, metodoPago: true },
    });
  }

  buscarPorUsuario(idUsuario: number): Promise<Reserva[]> {
    // El orden descendente permite mostrar primero las reservas más recientes.
    return this.repository.find({
      where: { usuario: { id: idUsuario } },
      relations: { publicacion: true, metodoPago: true },
      order: { id: 'DESC' },
    });
  }

  buscarPorPublicacion(idPublicacion: number): Promise<Reserva[]> {
    // Se carga el usuario para que el anunciante pueda identificar al inquilino.
    return this.repository.find({
      where: { publicacion: { id: idPublicacion } },
      relations: { usuario: true, metodoPago: true },
      order: { id: 'DESC' },
    });
  }

  buscarRecibidasPorAnunciante(idUsuarioAnunciante: number): Promise<Reserva[]> {
    return this.repository.find({
      where: {
        publicacion: { anunciante: { idUsuario: idUsuarioAnunciante } },
        estado_pago: EstadoPagoReserva.APROBADO,
      },
      relations: { usuario: true, publicacion: true, metodoPago: true },
      order: { fecha_inicio: 'ASC' },
    });
  }

  buscarPendientesVencidas(fecha: Date): Promise<Reserva[]> {
    return this.repository.find({
      where: {
        estado_pago: EstadoPagoReserva.PENDIENTE,
        pago_vencimiento: LessThan(fecha),
      },
    });
  }
}
