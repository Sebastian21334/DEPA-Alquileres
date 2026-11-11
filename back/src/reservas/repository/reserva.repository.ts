// reservas/repositorio/reserva.repository.ts
import {
  EstadoLiquidacionReserva,
  EstadoPagoReserva,
  EstadoSolicitudCancelacion,
} from '../../catalogos/estados';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, LessThan, Repository, type EntityManager } from 'typeorm';
import { Reserva } from '../entity/reserva.entity';
import { IReservaRepository } from './reserva.repository.interface';
import { ReprogramacionReserva } from '../entity/reprogramacion-reserva.entity';
import { SolicitudCancelacion } from '../entity/solicitud-cancelacion.entity';

@Injectable()
export class ReservaRepository implements IReservaRepository {
  constructor(@InjectRepository(Reserva) private readonly repository: Repository<Reserva>) {}

  crear(datos: Partial<Reserva>): Reserva {
    return this.repository.create(datos);
  }

  async finalizarEstadiasVencidas(hoy: string): Promise<void> {
    // PostgreSQL vuelve a comprobar las condiciones tras adquirir el bloqueo.
    await this.repository.createQueryBuilder()
      .update(Reserva)
      .set({ finalizada: true })
      .where('finalizada = false')
      .andWhere('cancelada = false')
      .andWhere('estado_pago = :aprobado', { aprobado: EstadoPagoReserva.APROBADO })
      .andWhere('codigo_validado_en IS NOT NULL')
      .andWhere('fecha_inicio IS NOT NULL AND fecha_fin IS NOT NULL')
      .andWhere('fecha_inicio <= fecha_fin')
      .andWhere('fecha_fin < :hoy', { hoy })
      .execute();
  }

  conTransaccion<T>(operacion: (reservas: IReservaRepository, transaccion: EntityManager) => Promise<T>): Promise<T> {
    return this.repository.manager.transaction('READ COMMITTED', (transaccion) =>
      operacion(new ReservaRepository(transaccion.getRepository(Reserva)), transaccion),
    );
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

  guardarVarias(reservas: Reserva[]): Promise<Reserva[]> {
    return this.repository.save(reservas);
  }

  private async bloquear(id: number): Promise<void> {
    if (this.repository.manager.queryRunner?.isTransactionActive) {
      await this.repository
        .createQueryBuilder('reserva')
        .where('reserva.id = :id', { id })
        .setLock('pessimistic_write')
        .getOne();
    }
  }

  async buscarPorId(id: number): Promise<Reserva | null> {
    await this.bloquear(id);
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
        },
      },
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

  buscarRecibidasPorAnunciante(idUsuarioAnunciante: number): Promise<Reserva[]> {
    return this.repository.find({
      where: {
        publicacion: { anunciante: { idUsuario: idUsuarioAnunciante } },
        estado_pago: EstadoPagoReserva.APROBADO,
        cancelada: false,
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

  buscarPendientesVencidas(fecha: Date): Promise<Reserva[]> {
    return this.repository.find({
      where: {
        estado_pago: EstadoPagoReserva.PENDIENTE,
        cancelada: false,
        pago_vencimiento: LessThan(fecha),
      },
    });
  }

  existeAprobada(idPublicacion: number, idUsuarioInquilino: number): Promise<boolean> {
    return this.repository.exists({
      where: {
        publicacion: { id: idPublicacion },
        usuario: { id: idUsuarioInquilino },
        estado_pago: EstadoPagoReserva.APROBADO,
        cancelada: false,
      },
    });
  }

  buscarLiquidacionesAdministracion(): Promise<Reserva[]> {
    return this.repository.find({
      where: {
        estado_liquidacion: In([
          EstadoLiquidacionReserva.PENDIENTE_PAGO_PROPIETARIO,
          EstadoLiquidacionReserva.EN_REVISION,
        ]),
      },
      relations: {
        usuario: true,
        publicacion: {
          anunciante: { usuario: true },
          ciudad: true,
          provincia: true,
        },
      },
      order: { codigo_validado_en: 'ASC', id: 'DESC' },
    });
  }

  private solicitudes() {
    return this.repository.manager.getRepository(SolicitudCancelacion);
  }

  crearSolicitudCancelacion(datos: Partial<SolicitudCancelacion>): SolicitudCancelacion {
    return this.solicitudes().create(datos);
  }

  guardarSolicitudCancelacion(solicitud: SolicitudCancelacion): Promise<SolicitudCancelacion> {
    return this.solicitudes().save(solicitud);
  }

  buscarSolicitudCancelacion(id: number, idReserva: number): Promise<SolicitudCancelacion | null> {
    return this.solicitudes().findOne({
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

  buscarSolicitudCancelacionActiva(idReserva: number): Promise<SolicitudCancelacion | null> {
    return this.solicitudes().findOne({
      where: {
        reserva: { id: idReserva },
        estado: EstadoSolicitudCancelacion.PENDIENTE,
      },
      relations: { solicitante: true, decidida_por: true },
      order: { id: 'DESC' },
    });
  }

  listarSolicitudesCancelacionAdministracion(): Promise<SolicitudCancelacion[]> {
    return this.solicitudes().find({
      where: { estado: EstadoSolicitudCancelacion.PENDIENTE },
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
