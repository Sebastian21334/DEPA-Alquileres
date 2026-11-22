import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Not, Repository, type EntityManager } from 'typeorm';
import { guardarSinDuplicados } from '../../common/persistence/valor-duplicado.error';
import { Liquidacion } from '../entity/liquidacion.entity';
import { ILiquidacionRepository } from './liquidacion.repository.interface';

@Injectable()
export class LiquidacionRepository implements ILiquidacionRepository {
  constructor(@InjectRepository(Liquidacion) private readonly repository: Repository<Liquidacion>) {}

  buscarPorReservas(ids: number[]): Promise<Liquidacion[]> {
    return this.repository.find({ where: { reserva: { id: In(ids) } }, relations: { reserva: true } });
  }

  listarPorEstados(estados: string[]): Promise<Liquidacion[]> {
    return this.repository.find({
      where: { estado: In(estados) },
      relations: { reserva: { usuario: true, publicacion: { anunciante: { usuario: true }, ciudad: true, provincia: true } } },
      order: { reserva: { codigo_validado_en: 'ASC', id: 'DESC' } },
    });
  }

  async listarReservasPendientesDeAviso(estadoLiquidacion: string, estadoPago: string, fechaFinLimite: string): Promise<number[]> {
    const filas = await this.repository.createQueryBuilder('liquidacion')
      .innerJoin('liquidacion.reserva', 'reserva')
      .select('reserva.id', 'id')
      .where('liquidacion.estado = :estadoLiquidacion', { estadoLiquidacion })
      .andWhere('(liquidacion.aviso_pago_admin_en IS NULL OR liquidacion.aviso_pago_anunciante_en IS NULL)')
      .andWhere('reserva.estado_pago = :estadoPago', { estadoPago })
      .andWhere('reserva.cancelada = false')
      .andWhere('reserva.fecha_inicio <= reserva.fecha_fin AND reserva.fecha_fin <= :fechaFinLimite', { fechaFinLimite })
      .orderBy('reserva.id', 'ASC')
      .getRawMany<{ id: number }>();
    return filas.map(({ id }) => id);
  }

  async listarIngresosNoVerificadosVencidos(estadoLiquidacion: string, estadoPago: string, fechaFinLimite: string): Promise<number[]> {
    const filas = await this.repository.createQueryBuilder('liquidacion')
      .innerJoin('liquidacion.reserva', 'reserva')
      .select('reserva.id', 'id')
      .where('liquidacion.estado = :estadoLiquidacion', { estadoLiquidacion })
      .andWhere('reserva.estado_pago = :estadoPago', { estadoPago })
      .andWhere('reserva.cancelada = false AND reserva.codigo_validado_en IS NULL')
      .andWhere('reserva.fecha_inicio <= reserva.fecha_fin AND reserva.fecha_fin <= :fechaFinLimite', { fechaFinLimite })
      .getRawMany<{ id: number }>();
    return filas.map(({ id }) => id);
  }

  listarPagosRegistrados(estadoPagado: string, propietario?: { idUsuario: number; idPublicacion: number }): Promise<Liquidacion[]> {
    const filtroReserva = propietario ? { reserva: {
      publicacion: { id: propietario.idPublicacion, anunciante: { usuario: { id: propietario.idUsuario } } },
    } } : {};
    return this.repository.find({
      where: [{ estado: estadoPagado, ...filtroReserva }, { pagos_anunciante: Not(IsNull()), ...filtroReserva }],
      relations: propietario
        ? { reserva: true }
        : { reserva: { publicacion: { anunciante: { usuario: true } } }, admin_resolucion: true },
    });
  }

  crear(datos: Partial<Liquidacion>): Liquidacion {
    return this.repository.create(datos);
  }

  async guardar(liquidacion: Liquidacion, transaccion?: EntityManager): Promise<Liquidacion> {
    return guardarSinDuplicados(
      () => this.repositorio(transaccion).save(liquidacion),
      ['uq_liquidacion_reserva'],
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

  private repositorio(transaccion?: EntityManager): Repository<Liquidacion> {
    return transaccion
      ? transaccion.getRepository(Liquidacion)
      : this.repository;
  }
}
