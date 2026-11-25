import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository, type EntityManager, type SelectQueryBuilder } from 'typeorm';
import { guardarSinDuplicados } from '../../common/persistence/valor-duplicado.error';
import { Liquidacion, type PagoAnuncianteRegistrado } from '../entity/liquidacion.entity';
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

  async listarReservasPendientesDeAviso(estadosLiquidacion: string[], estadoPago: string, fechaFinLimite: string): Promise<number[]> {
    const filas = await this.repository.createQueryBuilder('liquidacion')
      .innerJoin('liquidacion.reserva', 'reserva')
      .select('reserva.id', 'id')
      .where('liquidacion.estado IN (:...estadosLiquidacion)', { estadosLiquidacion })
      .andWhere('(liquidacion.aviso_pago_admin_en IS NULL OR liquidacion.aviso_pago_anunciante_en IS NULL)')
      .andWhere('reserva.estado_pago = :estadoPago', { estadoPago })
      .andWhere('(reserva.cancelada = true OR (reserva.fecha_inicio <= reserva.fecha_fin AND reserva.fecha_fin <= :fechaFinLimite))', { fechaFinLimite })
      .orderBy('reserva.id', 'ASC')
      .getRawMany<{ id: number }>();
    return filas.map(({ id }) => id);
  }

  async listarIngresosNoVerificadosVencidos(estados: { retenido: string; revision: string; maxIntentosCodigo: number }, estadoPago: string, fechaFinLimite: string): Promise<number[]> {
    const filas = await this.repository.createQueryBuilder('liquidacion')
      .innerJoin('liquidacion.reserva', 'reserva')
      .select('reserva.id', 'id')
      // En revisión solo entra la que se bloqueó por el código; las otras revisiones siguen esperando al admin.
      .where('(liquidacion.estado = :retenido OR (liquidacion.estado = :revision AND reserva.intentos_codigo >= :maxIntentosCodigo))', estados)
      .andWhere('reserva.estado_pago = :estadoPago', { estadoPago })
      .andWhere('reserva.cancelada = false AND reserva.codigo_validado_en IS NULL')
      .andWhere('reserva.fecha_inicio <= reserva.fecha_fin AND reserva.fecha_fin <= :fechaFinLimite', { fechaFinLimite })
      .getRawMany<{ id: number }>();
    return filas.map(({ id }) => id);
  }

  listarPagosRegistrados(estadoPagado: string, propietario?: { idUsuario: number; idPublicacion?: number }): Promise<Liquidacion[]> {
    const consulta = this.repository.createQueryBuilder('liquidacion')
      .addSelect('liquidacion.pagos_anunciante')
      .innerJoinAndSelect('liquidacion.reserva', 'reserva')
      .where('(liquidacion.estado = :estadoPagado OR liquidacion.pagos_anunciante IS NOT NULL)', { estadoPagado });
    if (!propietario)
      return consulta.leftJoinAndSelect('reserva.publicacion', 'publicacion')
        .leftJoinAndSelect('publicacion.anunciante', 'anunciante')
        .leftJoinAndSelect('anunciante.usuario', 'usuarioAnunciante')
        .leftJoinAndSelect('liquidacion.admin_resolucion', 'administrador')
        .getMany();
    // Sin publicación, el anunciante ve los pagos de todas sus publicaciones.
    consulta.innerJoinAndSelect('reserva.publicacion', 'publicacion')
      .innerJoin('publicacion.anunciante', 'anunciante')
      .andWhere('anunciante.idUsuario = :idUsuario', { idUsuario: propietario.idUsuario });
    if (propietario.idPublicacion !== undefined)
      consulta.andWhere('publicacion.id = :idPublicacion', { idPublicacion: propietario.idPublicacion });
    return consulta.getMany();
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

  // Incluyen los pagos registrados para que una resolución los conserve al agregar uno nuevo.
  buscarPorReserva(idReserva: number, transaccion?: EntityManager): Promise<Liquidacion | null> {
    return this.conPagos(idReserva, transaccion).getOne();
  }

  async buscarPorReservaConBloqueo(idReserva: number, transaccion?: EntityManager): Promise<Liquidacion | null> {
    const consulta = this.conPagos(idReserva, transaccion);
    if (!this.repositorio(transaccion).manager.queryRunner?.isTransactionActive) return consulta.getOne();
    return consulta.setLock('pessimistic_write').getOne();
  }

  async buscarPagosConAnunciante(idReserva: number): Promise<{ pagos: PagoAnuncianteRegistrado[]; idAnunciante: number | null } | null> {
    const fila = await this.repository.createQueryBuilder('liquidacion')
      .innerJoin('liquidacion.reserva', 'reserva')
      .leftJoin('reserva.publicacion', 'publicacion')
      .leftJoin('publicacion.anunciante', 'anunciante')
      .select('liquidacion.pagos_anunciante', 'pagos')
      .addSelect('anunciante.idUsuario', 'idAnunciante')
      .where('reserva.id = :idReserva', { idReserva })
      .getRawOne<{ pagos: PagoAnuncianteRegistrado[] | null; idAnunciante: number | null }>();
    return fila ? { pagos: fila.pagos ?? [], idAnunciante: fila.idAnunciante } : null;
  }

  private conPagos(idReserva: number, transaccion?: EntityManager): SelectQueryBuilder<Liquidacion> {
    return this.repositorio(transaccion).createQueryBuilder('liquidacion')
      .addSelect('liquidacion.pagos_anunciante')
      .where('liquidacion.id_reserva = :idReserva', { idReserva });
  }

  private repositorio(transaccion?: EntityManager): Repository<Liquidacion> {
    return transaccion
      ? transaccion.getRepository(Liquidacion)
      : this.repository;
  }
}
