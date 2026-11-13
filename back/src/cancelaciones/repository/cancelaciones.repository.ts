import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, type EntityManager } from 'typeorm';
import { SolicitudCancelacion } from '../entity/solicitud-cancelacion.entity';
import type { ICancelacionesRepository } from './cancelaciones.repository.interface';

@Injectable()
export class CancelacionesRepository implements ICancelacionesRepository {
  constructor(@InjectRepository(SolicitudCancelacion) private readonly repository: Repository<SolicitudCancelacion>) {}

  conTransaccion<T>(operacion: (cancelaciones: ICancelacionesRepository, transaccion: EntityManager) => Promise<T>): Promise<T> {
    return this.repository.manager.transaction('READ COMMITTED', (transaccion) =>
      operacion(new CancelacionesRepository(transaccion.getRepository(SolicitudCancelacion)), transaccion),
    );
  }

  crear(datos: Partial<SolicitudCancelacion>): SolicitudCancelacion {
    return this.repository.create(datos);
  }

  guardar(solicitud: SolicitudCancelacion): Promise<SolicitudCancelacion> {
    return this.repository.save(solicitud);
  }

  /**
   * Dentro de una transacción toma la fila de la solicitud antes de leerla:
   * una segunda resolución espera y vuelve a ver el estado ya decidido.
   */
  async buscarParaResolver(id: number, idReserva: number): Promise<SolicitudCancelacion | null> {
    if (this.repository.manager.queryRunner?.isTransactionActive) {
      await this.repository
        .createQueryBuilder('solicitud')
        .where('solicitud.id = :id', { id })
        .setLock('pessimistic_write')
        .getOne();
    }
    return this.repository.findOne({
      where: { id, reserva: { id: idReserva } },
      relations: {
        solicitante: true,
        decidida_por: true,
        reserva: {
          usuario: true,
          publicacion: { anunciante: { usuario: true } },
        },
      },
    });
  }

  buscarActiva(idReserva: number, estado: string): Promise<SolicitudCancelacion | null> {
    return this.repository.findOne({
      where: {
        reserva: { id: idReserva },
        estado,
      },
      relations: { solicitante: true, decidida_por: true },
      order: { id: 'DESC' },
    });
  }

  listarPorEstado(estado: string): Promise<SolicitudCancelacion[]> {
    return this.repository.find({
      where: { estado },
      relations: {
        solicitante: true,
        reserva: {
          usuario: true,
          publicacion: { anunciante: { usuario: true } },
        },
      },
      order: { id: 'ASC' },
    });
  }
}
