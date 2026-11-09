import { ForbiddenException, Injectable } from '@nestjs/common';
import { ReservaConsultaService } from '../../reservas/service/reserva-consulta.service';
import { ReservaEstadoService } from '../../reservas/service/reserva-estado.service';
import { ReservasService } from '../../reservas/service/reservas.service';
import { PagosService } from './pagos.service';

/** Consultas de pago para el inquilino. */
@Injectable()
export class PagosConsultaService {
  constructor(
    private readonly pagosService: PagosService,
    private readonly reservasService: ReservasService,
    private readonly estado: ReservaEstadoService,
    private readonly consulta: ReservaConsultaService,
  ) {}

  async consultarEstado(idReserva: number, idUsuario: number) {
    const reserva = await this.reservasService.buscarPorId(
      idReserva,
      idUsuario,
    );
    if (!this.estado.esDelInquilino(reserva, idUsuario)) {
      throw new ForbiddenException(
        'Solo el inquilino puede consultar el estado del pago',
      );
    }
    const pago = await this.pagosService.buscarPorReserva(idReserva);
    return {
      reserva_id: idReserva,
      estado_pago: reserva.estado_pago,
      mercado_pago_status: pago?.status ?? null,
      mercado_pago_status_detail: pago?.status_detail ?? null,
    };
  }

  async consultarResumen(idReserva: number, idUsuario: number) {
    const reserva = await this.reservasService.buscarPorId(
      idReserva,
      idUsuario,
    );
    const pago = await this.pagosService.buscarPorReserva(idReserva);
    return {
      reserva: this.consulta.paraRespuesta(reserva),
      pago: pago
        ? {
            preference_id: pago.preference_id,
            payment_id: pago.payment_id,
            status: pago.status,
            status_detail: pago.status_detail,
            amount: Number(pago.amount),
            currency: pago.currency,
            payment_method_id: pago.payment_method_id,
            approved_at: pago.approved_at,
            created_at: pago.created_at,
          }
        : null,
    };
  }
}
