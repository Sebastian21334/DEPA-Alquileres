import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pago } from '../../pagos/entity/pago.entity';
import {
  EstadoLiquidacionReserva,
  Reserva,
} from '../../reservas/entity/reserva.entity';
import {
  OrigenReembolso,
  TipoReembolso,
} from '../../reembolsos/entity/reembolso.entity';
import { ReembolsosService } from '../../reembolsos/service/reembolsos.service';
import { ReservasService } from '../../reservas/service/reservas.service';
import {
  Disputa,
  EstadoDisputa,
  OrigenDisputa,
} from '../entity/disputa.entity';
import { ResolverDisputaDto } from '../dto/resolver-disputa.dto';

@Injectable()
export class DisputasService {
  constructor(
    @InjectRepository(Disputa)
    private readonly disputas: Repository<Disputa>,
    @InjectRepository(Reserva)
    private readonly reservas: Repository<Reserva>,
    @InjectRepository(Pago)
    private readonly pagos: Repository<Pago>,
    private readonly reembolsos: ReembolsosService,
    private readonly reservasService: ReservasService,
  ) {}

  /**
   * Registra el contracargo y congela la liquidación. No cancela la reserva
   * ni libera fechas: primero hay que preservar la evidencia y resolver.
   */
  async registrarContracargo(datos: {
    idReserva: number;
    idPago: number;
    chargebackId: string;
    importe: number;
    motivo?: string;
  }): Promise<Disputa> {
    const existente = await this.disputas.findOne({
      where: { chargeback_id: datos.chargebackId },
    });
    if (existente) return existente;

    const reserva = await this.reservas.findOne({
      where: { id: datos.idReserva },
      relations: {
        usuario: true,
        publicacion: { anunciante: { usuario: true } },
      },
    });
    if (!reserva)
      throw new NotFoundException('No se encontró la reserva del contracargo');
    const pago = await this.pagos.findOne({ where: { id: datos.idPago } });
    if (!pago) throw new NotFoundException('No se encontró el pago');

    const disputa = this.disputas.create({
      reserva,
      pago,
      origen: OrigenDisputa.CONTRACARGO,
      estado: EstadoDisputa.ABIERTA,
      importe: datos.importe,
      moneda: pago.currency,
      motivo:
        datos.motivo?.trim().slice(0, 500) ||
        'Contracargo informado por Mercado Pago',
      chargeback_id: datos.chargebackId,
      referencia_externa: datos.chargebackId,
      evidencia: null,
      fecha_limite_respuesta: null,
      resolucion: null,
      estado_pago_previo: reserva.estado_pago,
      estado_liquidacion_previo: reserva.estado_liquidacion,
      resuelto_por: null,
      resuelto_en: null,
    });

    pago.status = 'charged_back';
    pago.chargeback_id = datos.chargebackId;
    await this.pagos.save(pago);

    reserva.marcarContracargo();
    reserva.estado_liquidacion = EstadoLiquidacionReserva.EN_REVISION;
    reserva.observacion_liquidacion =
      'Contracargo abierto: liquidación congelada hasta su resolución';
    await this.reservas.save(reserva);
    return this.disputas.save(disputa);
  }

  async listarAdministracion(): Promise<Disputa[]> {
    return this.disputas.find({
      relations: {
        reserva: {
          usuario: true,
          publicacion: { anunciante: { usuario: true } },
        },
        pago: true,
        resuelto_por: true,
      },
      order: { id: 'DESC' },
      take: 200,
    });
  }

  async resolver(
    id: number,
    dto: ResolverDisputaDto,
    idAdmin: number,
  ): Promise<Disputa> {
    const disputa = await this.disputas.findOne({
      where: { id },
      relations: {
        reserva: {
          usuario: true,
          publicacion: { anunciante: { usuario: true } },
        },
        pago: true,
      },
    });
    if (!disputa) throw new NotFoundException('Disputa no encontrada');
    if ([EstadoDisputa.GANADA, EstadoDisputa.PERDIDA].includes(disputa.estado))
      throw new ConflictException('La disputa ya fue resuelta');

    const { reserva, pago } = disputa;
    if (dto.resultado === 'GANADA') {
      pago.status = 'approved';
      pago.chargeback_id = null;
      await this.pagos.save(pago);
      reserva.restaurarPagoAprobado();
      reserva.estado_liquidacion =
        (disputa.estado_liquidacion_previo as EstadoLiquidacionReserva) ??
        EstadoLiquidacionReserva.RETENIDO;
      reserva.observacion_liquidacion = 'Contracargo resuelto a favor del Anunciante';
      await this.reservas.save(reserva);
      disputa.estado = EstadoDisputa.GANADA;
      disputa.resolucion = dto.observacion?.trim() || 'Contracargo ganado';
    } else {
      const importe = Number(disputa.importe);
      const total = importe >= Number(pago.amount) - 0.009;
      const reembolso = await this.reembolsos.crearSolicitud({
        reserva,
        pago,
        tipo: total ? TipoReembolso.CONTRACARGO : TipoReembolso.PARCIAL,
        origen: OrigenReembolso.CONTRACARGO,
        importe,
        motivo: 'Contracargo perdido',
        idSolicitadoPor: idAdmin,
      });
      // El contracargo ya revirtió el dinero en Mercado Pago: se registra,
      // pero no se dispara un segundo reembolso automático.
      await this.reembolsos.registrarManual(
        reembolso.id,
        dto.referencia?.trim() || disputa.chargeback_id || `contracargo-${disputa.id}`,
        idAdmin,
      );
      // El orquestador aplica el estado de la reserva y libera fechas solo
      // cuando el contracargo perdido ocurre antes del inicio.
      await this.reservasService.aplicarReembolsoConfirmado(reembolso.id);
      disputa.estado = EstadoDisputa.PERDIDA;
      disputa.resolucion = dto.observacion?.trim() || 'Contracargo perdido';
    }

    disputa.resuelto_por = { id: idAdmin } as never;
    disputa.resuelto_en = new Date();
    return this.disputas.save(disputa);
  }
}
