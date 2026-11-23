import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, MoreThan, Not, Repository, type EntityManager } from 'typeorm';
import { OrigenReembolso, Reembolso } from '../entity/reembolso.entity';
import type { IReembolsosRepository, MensajeReembolso } from './reembolsos.repository.interface';

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
        reserva: { liquidacion: true, publicacion: { anunciante: { usuario: true } }, usuario: true },
        pago: true,
        solicitado_por: true,
        resuelto_por: true,
      },
    });
  }

  /** T44: la URL privada del comprobante y el inquilino que puede verlo. */
  async buscarComprobante(id: number): Promise<{ url: string | null; idInquilino: number | null } | null> {
    const fila = await this.repository.createQueryBuilder('reembolso')
      .leftJoin('reembolso.reserva', 'reserva')
      .leftJoin('reserva.usuario', 'inquilino')
      .select('reembolso.comprobante_url', 'url')
      .addSelect('inquilino.id', 'idInquilino')
      .where('reembolso.id = :id', { id })
      .getRawOne<{ url: string | null; idInquilino: number | null }>();
    return fila ? { url: fila.url, idInquilino: fila.idInquilino == null ? null : Number(fila.idInquilino) } : null;
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
      select: { id: true, importe: true, estado: true, origen: true, id_externo: true, referencia_externa: true,
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
      .andWhere('reembolso.origen <> :origen', { origen: OrigenReembolso.CONTRACARGO })
      .orderBy('reembolso.conciliar_en', 'ASC')
      .addOrderBy('reembolso.id', 'ASC')
      .limit(50)
      .getMany();
  }

  buscarPendientesAplicacion(estado: string, desdeId: number): Promise<Reembolso[]> {
    return this.repository.find({
      where: { id: MoreThan(desdeId), estado, aplicado_en: IsNull(), revision_aplicacion: false, origen: Not(OrigenReembolso.CONTRACARGO) },
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

  contarPorEstado(): Promise<Array<{ estado: string; cantidad: string }>> {
    return this.repository.createQueryBuilder('reembolso')
      .select('reembolso.estado', 'estado')
      .addSelect('COUNT(*)', 'cantidad')
      .groupBy('reembolso.estado')
      .getRawMany();
  }

  listarAdministracion(): Promise<Reembolso[]> {
    return this.repository.find({
      relations: {
        reserva: { liquidacion: true, publicacion: { anunciante: { usuario: true } }, usuario: true },
        pago: true,
        solicitado_por: true,
        resuelto_por: true,
      },
      order: { id: 'DESC' },
      take: 200,
    });
  }

  actividadInquilino(idUsuario: number, estados: string[]): ReturnType<IReembolsosRepository['actividadInquilino']> {
    return this.repository.query(
      `SELECT r.id_reembolso AS "reembolsoId", r.id_reserva AS "reservaId",
              r.estado = ANY($2) AS pendiente, m.id AS "mensajeId", left(m.texto, 120) AS texto, m.creado_en AS fecha
       FROM public.reembolso r
       JOIN public.reserva reserva ON reserva.id_reserva = r.id_reserva
       LEFT JOIN LATERAL (
         SELECT id, texto, creado_en FROM public.reembolso_mensaje
         WHERE id_reembolso = r.id_reembolso AND administracion AND id_autor IS DISTINCT FROM $1
         ORDER BY id DESC LIMIT 1
       ) m ON r.transferencia_manual
       WHERE reserva.id_usuario = $1 AND (r.estado = ANY($2) OR m.id IS NOT NULL)
       ORDER BY m.id DESC NULLS LAST`,
      [idUsuario, estados],
    );
  }

  listarMensajes(id: number, despuesDe: number): Promise<MensajeReembolso[]> {
    return this.repository.query(
      'SELECT id, autor, administracion, texto, creado_en FROM reembolso_mensaje WHERE id_reembolso = $1 AND id > $2 ORDER BY id LIMIT 100',
      [id, despuesDe],
    );
  }

  listarConversaciones(idReserva: number, idInquilino: number): Promise<Pick<Reembolso, 'id' | 'importe' | 'moneda' | 'estado' | 'comprobante_nombre' | 'referencia_externa' | 'observacion_transferencia'>[]> {
    return this.repository.find({
      select: { id: true, importe: true, moneda: true, estado: true, comprobante_nombre: true, referencia_externa: true, observacion_transferencia: true },
      where: { transferencia_manual: true, reserva: { id: idReserva, usuario: { id: idInquilino } } },
      order: { id: 'DESC' },
    });
  }

  async guardarMensaje(id: number, idAutor: number, administracion: boolean, texto: string): Promise<MensajeReembolso> {
    const [mensaje] = await this.repository.query(
      `INSERT INTO reembolso_mensaje (id_reembolso, id_autor, autor, administracion, texto)
       SELECT $1, id_usuario, concat_ws(' ', nombre, apellido), $3, $4 FROM usuario WHERE id_usuario = $2
       RETURNING id, autor, administracion, texto, creado_en`,
      [id, idAutor, administracion, texto],
    );
    return mensaje;
  }
}
