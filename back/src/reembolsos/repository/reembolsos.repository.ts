import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, MoreThan, Repository, type EntityManager } from 'typeorm';
import { Reembolso } from '../entity/reembolso.entity';
import type { IReembolsosRepository } from './reembolsos.repository.interface';

@Injectable()
export class ReembolsosRepository implements IReembolsosRepository {
  constructor(@InjectRepository(Reembolso) private readonly repository: Repository<Reembolso>) {}

  conTransaccion<T>(operacion: (repositorio: IReembolsosRepository, transaccion: EntityManager) => Promise<T>): Promise<T> {
    return this.repository.manager.transaction((transaccion) =>
      operacion(this.enTransaccion(transaccion), transaccion),
    );
  }

  /** Permite participar de la transacción que abrió el servicio coordinador. */
  enTransaccion(transaccion: EntityManager): IReembolsosRepository {
    return new ReembolsosRepository(transaccion.getRepository(Reembolso));
  }

  crear(datos: Partial<Reembolso>): Reembolso {
    return this.repository.create(datos);
  }

  guardar(reembolso: Reembolso): Promise<Reembolso> {
    return this.repository.save(reembolso);
  }

  async actualizar(id: number, datos: Partial<Reembolso>): Promise<void> {
    await this.repository.update(id, datos);
  }

  buscarPorId(id: number): Promise<Reembolso | null> {
    return this.repository.findOne({
      where: { id },
      relations: {
        reserva: { publicacion: { anunciante: { usuario: true } }, usuario: true },
        pago: true,
        solicitado_por: true,
        resuelto_por: true,
      },
    });
  }

  buscarPorIdempotencyKey(clave: string): Promise<Reembolso | null> {
    return this.repository.findOne({ where: { idempotency_key: clave } });
  }

  buscarPorReferenciaExterna(referencia: string): Promise<Reembolso | null> {
    return this.repository.findOne({ where: { referencia_externa: referencia } });
  }

  buscarPorPago(idPago: number): Promise<Reembolso[]> {
    return this.repository.find({
      where: { pago: { id: idPago } },
      select: { id: true, importe: true, estado: true, id_externo: true, referencia_externa: true,
        conciliar_en: true, aplicado_en: true, revision_aplicacion: true },
      order: { id: 'DESC' },
    });
  }

  buscarPorIdExterno(id_externo: string): Promise<Reembolso | null> {
    return this.repository.findOneBy({ id_externo });
  }

  buscarRegistro(id: number, { bloquear, idsRelaciones }: { bloquear?: boolean; idsRelaciones?: boolean } = {}): Promise<Reembolso | null> {
    const consulta = this.repository.createQueryBuilder('reembolso')
      .addSelect('reembolso.conciliar_en')
      .addSelect('reembolso.primer_intento_en')
      .where('reembolso.id = :id', { id });
    if (bloquear) consulta.setLock('pessimistic_write');
    if (idsRelaciones) consulta.loadAllRelationIds({ relations: ['pago', 'resuelto_por'], disableMixedMap: true });
    return consulta.getOne();
  }

  buscarPorReserva(idReserva: number): Promise<Reembolso[]> {
    return this.repository.find({
      where: { reserva: { id: idReserva } },
      order: { id: 'DESC' },
    });
  }

  buscarPorReservasConEstados(idsReserva: number[], estados: string[]): Promise<Reembolso[]> {
    if (idsReserva.length === 0) return Promise.resolve([]);
    return this.repository.find({
      where: {
        reserva: { id: In(idsReserva) },
        estado: In(estados),
      },
      relations: { reserva: true },
    });
  }

  async sumarImportesReservados(idPago: number, estados: string[]): Promise<number> {
    const filas = await this.repository.find({
      where: {
        pago: { id: idPago },
        estado: In(estados),
      },
    });
    return filas.reduce((total, fila) => total + Number(fila.importe), 0);
  }

  actualizarEnTransaccion(id: number, operacion: (reembolso: Reembolso) => void | Promise<void>): Promise<Reembolso | null> {
    return this.repository.manager.transaction(async (manager) => {
      const repo = this.enTransaccion(manager);
      const reembolso = await repo.buscarRegistro(id, { bloquear: true });
      if (!reembolso) return null;
      await operacion(reembolso);
      return repo.guardar(reembolso);
    });
  }

  buscarPendientesConciliacion(estados: string[], hasta: Date): Promise<Reembolso[]> {
    return this.repository.createQueryBuilder('reembolso')
      .innerJoinAndSelect('reembolso.pago', 'pago')
      .addSelect('reembolso.conciliar_en')
      .where('reembolso.estado IN (:...estados)', { estados })
      .andWhere('reembolso.conciliar_en <= :hasta', { hasta })
      .orderBy('reembolso.conciliar_en', 'ASC')
      .addOrderBy('reembolso.id', 'ASC')
      .limit(50)
      .getMany();
  }

  buscarPendientesAplicacion(estado: string, desdeId: number): Promise<Reembolso[]> {
    return this.repository.find({
      where: { id: MoreThan(desdeId), estado, aplicado_en: IsNull(), revision_aplicacion: false },
      select: { id: true },
      order: { id: 'ASC' },
      take: 50,
    });
  }

  buscarPorOrigen(origen: Reembolso['origen'], referencia_interna: string): Promise<Reembolso | null> {
    return this.repository.findOne({
      where: { origen, referencia_interna },
      order: { id: 'DESC' },
    });
  }

  listarAdministracion(): Promise<Reembolso[]> {
    return this.repository.find({
      relations: {
        reserva: { publicacion: { anunciante: { usuario: true } }, usuario: true },
        pago: true,
        solicitado_por: true,
        resuelto_por: true,
      },
      order: { id: 'DESC' },
      take: 200,
    });
  }
}
