import { filtrarReservasPorCuenta } from '../../common/persistence/participacion-en-reserva';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, LessThanOrEqual, MoreThan, Repository, type EntityManager } from 'typeorm';
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
          liquidacion: true,
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

  buscarPolitica(fechaPago: string | null): Promise<PoliticaCancelacion | null> {
    return this.repository.manager.getRepository(PoliticaCancelacion).findOne({
      where: fechaPago ? { vigenteDesde: LessThanOrEqual(fechaPago) } : {},
      order: { vigenteDesde: fechaPago ? 'DESC' : 'ASC' },
    });
  }

  listarVencibles(hoy: string, despuesDe: number): Promise<SolicitudCancelacion[]> {
    return this.repository.find({ where: { id: MoreThan(despuesDe), estado: 'PENDIENTE', reserva: { fecha_inicio: LessThanOrEqual(hoy) } }, relations: { reserva: true }, order: { id: 'ASC' }, take: 100 });
  }

  buscarDemorada(idReserva: number, idUsuario: number): Promise<SolicitudCancelacion | null> {
    return this.repository.findOne({ where: { reserva: { id: idReserva }, solicitante: { id: idUsuario }, estado: In(['PENDIENTE','VENCIDA','RECHAZADA']) }, relations: { solicitante: true, decidida_por: true }, order: { id: 'DESC' } });
  }

  listarDemoradasDelSolicitante(idUsuario: number, hoy: string): Promise<SolicitudCancelacion[]> {
    return this.repository.find({ where: { solicitante: { id: idUsuario }, estado: In(['PENDIENTE','VENCIDA','RECHAZADA']), reserva: { fecha_inicio: LessThanOrEqual(hoy) } },
      relations: { solicitante: true, decidida_por: true, reserva: { usuario: true, publicacion: { anunciante: { usuario: true } } } }, order: { id: 'DESC' } });
  }

  listarPorEstado(estado: string): Promise<SolicitudCancelacion[]> {
    return this.repository.find({
      where: { estado },
      relations: {
        solicitante: true,
        reserva: {
          liquidacion: true,
          usuario: true,
          publicacion: { anunciante: { usuario: true } },
        },
      },
      order: { id: 'ASC' },
    });
  }

  /** Busca una solicitud en el estado indicado y verifica su vínculo con la cuenta a través de la reserva. */
  tienePendientesDeCuenta(idUsuario: number, anuncianteVerificado: boolean, transaccion: EntityManager, estado: string): Promise<boolean> {
    const consulta = transaccion.getRepository(SolicitudCancelacion).createQueryBuilder('tramite')
      .innerJoin('tramite.reserva', 'reserva')
      .andWhere('tramite.estado = :estado', { estado });
    return filtrarReservasPorCuenta(consulta, idUsuario, anuncianteVerificado ? 'Ambos' : 'Inquilino').getExists();
  }

}
