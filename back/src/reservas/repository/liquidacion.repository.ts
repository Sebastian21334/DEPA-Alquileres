import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository, type EntityManager } from 'typeorm';
import { EstadoLiquidacionReserva } from '../../catalogos/estados';
import { guardarSinDuplicados } from '../../common/persistence/valor-duplicado.error';
import { Liquidacion } from '../entity/liquidacion.entity';
import { ILiquidacionRepository } from './liquidacion.repository.interface';

const RELACIONES_AUDITORIA = {
  reserva: {
    usuario: true,
    pago: true,
    reembolsos: true,
    publicacion: { anunciante: { usuario: true } },
  },
  admin_resolucion: true,
} as const;

@Injectable()
export class LiquidacionRepository implements ILiquidacionRepository {
  constructor(@InjectRepository(Liquidacion) private readonly repository: Repository<Liquidacion>) {}

  crear(datos: Partial<Liquidacion>): Liquidacion {
    return this.repository.create(datos);
  }

  async guardar(liquidacion: Liquidacion, transaccion?: EntityManager): Promise<Liquidacion> {
    return guardarSinDuplicados(
      () => this.repositorio(transaccion).save(liquidacion),
      ['uq_liquidacion_reserva'],
    );
  }

  conTransaccion<T>(operacion: (liquidaciones: ILiquidacionRepository, transaccion: EntityManager) => Promise<T>): Promise<T> {
    return this.repository.manager.transaction('READ COMMITTED', (transaccion) =>
      operacion(new LiquidacionRepository(transaccion.getRepository(Liquidacion)), transaccion),
    );
  }

  buscarPorReserva(idReserva: number, transaccion?: EntityManager): Promise<Liquidacion | null> {
    return this.repositorio(transaccion).findOne({
      where: { reserva: { id: idReserva } },
    });
  }

  async buscarPorReservaConBloqueo(idReserva: number, transaccion?: EntityManager): Promise<Liquidacion | null> {
    const repositorio = this.repositorio(transaccion);
    if (!repositorio.manager.queryRunner?.isTransactionActive)
      return repositorio.findOne({ where: { reserva: { id: idReserva } } });
    return repositorio
      .createQueryBuilder('liquidacion')
      .where('liquidacion.id_reserva = :idReserva', { idReserva })
      .setLock('pessimistic_write')
      .getOne();
  }

  buscarAdministracion(): Promise<Liquidacion[]> {
    return this.repository.find({
      where: {
        estado: In([
          EstadoLiquidacionReserva.PENDIENTE_PAGO_PROPIETARIO,
          EstadoLiquidacionReserva.EN_REVISION,
        ]),
      },
      relations: RELACIONES_AUDITORIA,
      order: { reserva: { codigo_validado_en: 'ASC' }, id: 'DESC' },
    });
  }

  buscarPorId(id: number, transaccion?: EntityManager): Promise<Liquidacion | null> {
    return this.repositorio(transaccion).findOne({
      where: { id },
      relations: RELACIONES_AUDITORIA,
    });
  }

  private repositorio(transaccion?: EntityManager): Repository<Liquidacion> {
    return transaccion
      ? transaccion.getRepository(Liquidacion)
      : this.repository;
  }
}
