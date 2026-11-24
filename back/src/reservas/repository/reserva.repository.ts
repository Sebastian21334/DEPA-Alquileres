import type { ConsultaReservasAcceso } from './reserva.repository.interface';
import type { EstadosOperacionesReserva, OperacionesReservaPendientes } from '../dto/operaciones-pendientes-cuenta.dto';
import { filtrarReservasPorCuenta, type ParticipacionEnReserva } from '../../common/persistence/participacion-en-reserva';
// reservas/repositorio/reserva.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, LessThan, LessThanOrEqual, MoreThan, MoreThanOrEqual, Not, Repository, type EntityManager } from 'typeorm';
import { Reserva } from '../entity/reserva.entity';
import { IReservaRepository } from './reserva.repository.interface';
import { ReprogramacionReserva } from '../entity/reprogramacion-reserva.entity';

@Injectable()
export class ReservaRepository implements IReservaRepository {
  constructor(@InjectRepository(Reserva) private readonly repository: Repository<Reserva>) {}

  crear(datos: Partial<Reserva>): Reserva {
    return this.repository.create(datos);
  }

  async finalizarEstadiasVencidas(hoy: string, aprobado: string): Promise<number[]> {
    // PostgreSQL vuelve a comprobar las condiciones tras adquirir el bloqueo.
    const resultado = await this.repository.createQueryBuilder()
      .update(Reserva)
      .set({ finalizada: true })
      .where('finalizada = false')
      .andWhere('cancelada = false')
      .andWhere('estado_pago = :aprobado', { aprobado })
      .andWhere('codigo_validado_en IS NOT NULL')
      .andWhere('fecha_inicio IS NOT NULL AND fecha_fin IS NOT NULL')
      .andWhere('fecha_inicio <= fecha_fin')
      .andWhere('fecha_fin < :hoy', { hoy })
      .returning(['id'])
      .execute();
    return (resultado.raw as { id: number }[]).map(({ id }) => id);
  }

  conTransaccion<T>(operacion: (reservas: IReservaRepository, transaccion: EntityManager) => Promise<T>): Promise<T> {
    return this.repository.manager.transaction('READ COMMITTED', (transaccion) =>
      operacion(this.enTransaccion(transaccion), transaccion),
    );
  }

  /** Permite participar de la transacción que abrió el servicio coordinador. */
  enTransaccion(transaccion: EntityManager): IReservaRepository {
    return new ReservaRepository(transaccion.getRepository(Reserva));
  }

  guardarReprogramacion(datos: Partial<ReprogramacionReserva>): Promise<ReprogramacionReserva> {
    const repo = this.repository.manager.getRepository(ReprogramacionReserva);
    return repo.save(repo.create(datos));
  }

  buscarReprogramacion(id: number, idReserva: number): Promise<ReprogramacionReserva | null> {
    const consulta = this.repository.manager
      .getRepository(ReprogramacionReserva)
      .createQueryBuilder('cambio')
      .addSelect(['cambio.destinatario', 'cambio.detalle'])
      .where('cambio.id = :id AND cambio.id_reserva = :idReserva', {
        id,
        idReserva,
      });
    if (this.repository.manager.queryRunner?.isTransactionActive)
      consulta.setLock('pessimistic_write');
    return consulta.getOne();
  }

  async marcarReprogramacionNotificada(id: number): Promise<void> {
    await this.repository.manager
      .getRepository(ReprogramacionReserva)
      .update(id, { notificada_en: new Date() });
  }

  async registrarNotificaciones(id: number, datos: Partial<Pick<Reserva, | 'email_confirmacion_inquilino_enviado' | 'email_nueva_reserva_anunciante_enviado'>>): Promise<void> {
    // Un correo lento no debe restaurar fechas o estados leídos antes de otra operación.
    await this.repository.update(id, datos);
  }

  guardar(reserva: Reserva): Promise<Reserva> {
    return this.repository.save(reserva);
  }

  private async bloquear(id: number, modo: 'pessimistic_write' | 'for_no_key_update' = 'pessimistic_write'): Promise<void> {
    if (this.repository.manager.queryRunner?.isTransactionActive) {
      await this.repository
        .createQueryBuilder('reserva')
        .where('reserva.id = :id', { id })
        .setLock(modo)
        .getOne();
    }
  }

  async buscarPorId(id: number, modoBloqueo?: 'pessimistic_write' | 'for_no_key_update'): Promise<Reserva | null> {
    await this.bloquear(id, modoBloqueo);
    return this.repository.findOne({
      where: { id },
      relations: {
        reprogramaciones: true,
        cotizacion_dolar: true,
        usuario: true,
        publicacion: {
          anunciante: { usuario: true },
          ciudad: true,
          provincia: true,
          tipoMoneda: true,
          imagenes: true,
        },
      },
      order: { publicacion: { imagenes: { orden: 'ASC', id: 'ASC' } } },
    });
  }

  async buscarPorIdConCodigo(id: number): Promise<Reserva | null> {
    await this.bloquear(id);
    return this.repository
      .createQueryBuilder('reserva')
      .addSelect('reserva.codigo_alojamiento')
      .leftJoinAndSelect('reserva.usuario', 'usuario')
      .leftJoinAndSelect('reserva.publicacion', 'publicacion')
      .leftJoinAndSelect('publicacion.anunciante', 'anunciante')
      .leftJoinAndSelect('anunciante.usuario', 'usuarioAnunciante')
      .leftJoinAndSelect('publicacion.ciudad', 'ciudad')
      .leftJoinAndSelect('publicacion.provincia', 'provincia')
      .where('reserva.id = :id', { id })
      .getOne();
  }

  async buscarParaReclamo(id: number): Promise<Reserva | null> {
    await this.bloquear(id);
    return this.repository.findOne({
      where: { id },
      relations: { usuario: true, publicacion: { anunciante: { usuario: true } } },
    });
  }

  buscarPorUsuario(idUsuario: number): Promise<Reserva[]> {
    // El orden descendente permite mostrar primero las reservas más recientes.
    return this.repository.find({
      where: { usuario: { id: idUsuario } },
      relations: {
        reprogramaciones: true,
        cotizacion_dolar: true,
        publicacion: {
          imagenes: true,
          anunciante: { usuario: true },
          ciudad: true,
          provincia: true,
        },
      },
      order: { id: 'DESC', publicacion: { imagenes: { orden: 'ASC', id: 'ASC' } } },
    });
  }

  buscarPorPublicacion(idPublicacion: number): Promise<Reserva[]> {
    // Se carga el usuario para que el anunciante pueda identificar al inquilino.
    return this.repository.find({
      where: { publicacion: { id: idPublicacion } },
      relations: { usuario: true },
      order: { id: 'DESC' },
    });
  }

  buscarPorAnunciante(idUsuarioAnunciante: number): Promise<Reserva[]> {
    // Sin filtro de estado: el bloqueo de la cuenta debe resolver también
    // las reservas pendientes o cerradas del anunciante.
    return this.repository.find({
      where: {
        publicacion: { anunciante: { idUsuario: idUsuarioAnunciante } },
      },
      relations: {
        usuario: true,
        publicacion: {
          anunciante: { usuario: true },
          ciudad: true,
          provincia: true,
        },
      },
      order: { fecha_inicio: 'ASC' },
    });
  }

  buscarRecibidasPorAnunciante(idUsuarioAnunciante: number, estados: string[]): Promise<Reserva[]> {
    return this.repository.find({
      where: {
        publicacion: { anunciante: { idUsuario: idUsuarioAnunciante } },
        estado_pago: In(estados),
      },
      relations: {
        reprogramaciones: true,
        cotizacion_dolar: true,
        usuario: true,
        publicacion: {
          imagenes: true,
          anunciante: { usuario: true },
          ciudad: true,
          provincia: true,
        },
      },
      order: { fecha_inicio: 'ASC', publicacion: { imagenes: { orden: 'ASC', id: 'ASC' } } },
    });
  }

  buscarPendientesVencidas(fecha: Date, pendiente: string): Promise<Reserva[]> {
    return this.repository.find({
      where: {
        estado_pago: pendiente,
        cancelada: false,
        pago_vencimiento: LessThan(fecha),
      },
    });
  }

  existeAprobada(idPublicacion: number, idUsuarioInquilino: number, aprobado: string): Promise<boolean> {
    return this.repository.exists({
      where: {
        publicacion: { id: idPublicacion },
        usuario: { id: idUsuarioInquilino },
        estado_pago: aprobado,
        cancelada: false,
      },
    });
  }

  /** Reservas pagadas que el propio inquilino canceló en la publicación y que tocan el rango pedido. */
  buscarCanceladasPorInquilino(idPublicacion: number, idUsuarioInquilino: number, inicio: string, fin: string): Promise<Reserva[]> {
    return this.repository.find({
      select: { id: true, fecha_inicio: true, fecha_fin: true },
      where: {
        publicacion: { id: idPublicacion },
        usuario: { id: idUsuarioInquilino },
        cancelada: true,
        cancelada_por: 'INQUILINO',
        fecha_pago: Not(IsNull()),
        fecha_inicio: LessThanOrEqual(fin),
        fecha_fin: MoreThanOrEqual(inicio),
      },
    });
  }

  /** Cuenta por separado los pendientes de cobro, estadía y liquidación de las reservas de la cuenta. */
  async contarPendientesDeCuenta(idUsuario: number, participacion: ParticipacionEnReserva, hoy: string, transaccion: EntityManager, estados: EstadosOperacionesReserva): Promise<OperacionesReservaPendientes> {
    const esAnunciante = participacion === 'Anunciante';
    const reservas = () => filtrarReservasPorCuenta(
      transaccion.getRepository(Reserva).createQueryBuilder('reserva'), idUsuario, participacion,
    );
    const reservasPendientes = await reservas()
      .andWhere('reserva.estado_pago = :pendiente', { pendiente: estados.pagoPendiente })
      .getCount();
    // Conserva como pendientes las reservas aprobadas con fechas faltantes o inconsistentes.
    const estadiasVigentes = await reservas()
      .andWhere('reserva.estado_pago = :aprobado', { aprobado: estados.pagoAprobado })
      .andWhere('reserva.cancelada = false')
      .andWhere('reserva.finalizada = false')
      .andWhere(`(
        reserva.fecha_inicio IS NULL OR reserva.fecha_fin IS NULL
        OR reserva.fecha_inicio > reserva.fecha_fin
        OR reserva.fecha_fin >= :hoy
      )`, { hoy })
      .getCount();

    // Para el anunciante cuenta las liquidaciones sin resolver; para el inquilino, las que están en revisión.
    const liquidaciones = reservas().leftJoin('reserva.liquidacion', 'liquidacion');
    if (esAnunciante) {
      liquidaciones
        .andWhere('reserva.estado_pago = :aprobado', { aprobado: estados.pagoAprobado })
        .andWhere('(liquidacion.estado IS NULL OR liquidacion.estado NOT IN (:...resueltas))', {
          resueltas: estados.liquidacionesResueltas,
        });
    } else {
      liquidaciones.andWhere('liquidacion.estado = :enRevision', {
        enRevision: estados.enRevision,
      });
    }
    const liquidacionesPendientes = await liquidaciones.getCount();

    return { reservasPendientes, estadiasVigentes, liquidacionesPendientes };
  }

  /** Busca una reserva de ese inquilino y publicación que cumpla las condiciones de fecha y pago recibidas. */
  existeReserva(consulta: ConsultaReservasAcceso): Promise<boolean> {
    const vigente = {
      publicacion: { id: consulta.idPublicacion },
      usuario: { id: consulta.idUsuario },
      cancelada: consulta.cancelada,
      finalizada: consulta.finalizada,
      fecha_fin: MoreThanOrEqual(consulta.fechaFinDesde),
    };
    return this.repository.exists({
      where: consulta.pagos.map(({ estado, venceDespues }) => ({
        ...vigente,
        estado_pago: estado,
        ...(venceDespues ? { pago_vencimiento: MoreThan(venceDespues) } : {}),
      })),
    });
  }

}
