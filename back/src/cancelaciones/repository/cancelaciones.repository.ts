import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, Repository, type EntityManager } from 'typeorm';
import { PoliticaCancelacion } from '../entity/politica-cancelacion.entity';
import { SolicitudCancelacion } from '../entity/solicitud-cancelacion.entity';
import type { ICancelacionesRepository } from './cancelaciones.repository.interface';

@Injectable()
export class CancelacionesRepository implements ICancelacionesRepository {
  constructor(@InjectRepository(SolicitudCancelacion) private readonly repository: Repository<SolicitudCancelacion>) {}

  enTransaccion(transaccion: EntityManager): ICancelacionesRepository {
    return new CancelacionesRepository(transaccion.getRepository(SolicitudCancelacion));
  }

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

  buscarPolitica(fechaPago: string | null): Promise<PoliticaCancelacion | null> {
    return this.repository.manager.getRepository(PoliticaCancelacion).findOne({
      where: fechaPago ? { vigenteDesde: LessThanOrEqual(fechaPago) } : {},
      order: { vigenteDesde: fechaPago ? 'DESC' : 'ASC' },
    });
  }

}
