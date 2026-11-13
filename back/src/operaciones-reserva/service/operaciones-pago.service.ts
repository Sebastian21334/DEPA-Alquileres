import { CatalogosService } from '../../catalogos/service/catalogos.service';
import { PresupuestosService } from './presupuestos.service';
import { OperacionesReembolsoService } from './operaciones-reembolso.service';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PagosService } from '../../pagos/service/pagos.service';
import { MercadoPagoService, type FirmaWebhookPago, type PagoExterno } from '../../mercado-pago/service/mercado-pago.service';
import type { WebhookPago } from '../dto/webhook-pago.dto';
import { ReservasService } from '../../reservas/service/reservas.service';
import { ReembolsosService } from '../../reembolsos/service/reembolsos.service';
import { DisputasService } from '../../disputas/service/disputas.service';
import { CrearCheckoutDto } from '../dto/crear-checkout.dto';
import type { Pago } from '../../pagos/entity/pago.entity';

@Injectable()
export class OperacionesPagoService {
  private readonly logger = new Logger(OperacionesPagoService.name);

  constructor(private readonly presupuestos: PresupuestosService, private readonly pagos: PagosService, private readonly reservasService: ReservasService, private readonly reembolsosService: ReembolsosService, private readonly disputasService: DisputasService, private readonly config: ConfigService, private readonly pasarela: MercadoPagoService, private readonly catalogos: CatalogosService, private readonly operacionesReembolso: OperacionesReembolsoService) {}

  async crearCheckout(dto: CrearCheckoutDto, idUsuario: number) {
    this.pasarela.validarConfiguracionCheckout();
    const condiciones = await this.presupuestos.validar(
      dto.presupuesto_token,
      dto,
      idUsuario,
    );
    const reserva = await this.reservasService.crearPendiente(
      dto,
      idUsuario,
      condiciones,
    );
    const currency =
      reserva.moneda_contratada ??
      this.config.get<string>('MP_CURRENCY_ID') ??
      'ARS';

    try {
      const pago = await this.pagos.registrarInicio(reserva.id, Number(reserva.monto_pago), currency);

      const preference = await this.pasarela.crearCheckout({
        idReserva: reserva.id,
        titulo: reserva.publicacion?.titulo,
        inicio: reserva.fecha_inicio,
        fin: reserva.fecha_fin,
        importe: Number(pago.amount),
        moneda: pago.currency,
        nombre: reserva.usuario_nombre,
        apellido: reserva.usuario_apellido,
        email: reserva.usuario_email,
        vencimiento: reserva.pago_vencimiento,
        referencia: pago.external_reference,
        clave: pago.idempotency_key,
      });
      await this.pagos.registrarPreferencia(pago.id, preference.id);
      return {
        reserva_id: reserva.id,
        preference_id: preference.id,
        checkout_url: preference.url,
        expires_at: reserva.pago_vencimiento,
      };
    } catch (error) {
      await this.reservasService.rechazarPago(reserva.id);
      this.logger.error(
        'No se pudo crear la preferencia de Mercado Pago',
        error,
      );
      throw new ServiceUnavailableException(
        'No se pudo iniciar Mercado Pago. Verificá las credenciales y volvé a intentar.',
      );
    }
  }

  async procesarWebhook(entrada: FirmaWebhookPago & { body?: WebhookPago }) {
    if (entrada.body?.type && entrada.body.type !== 'payment') {
      return { received: true };
    }
    if (typeof entrada.dataId !== 'string' || !/^\d{1,100}$/.test(entrada.dataId))
      throw new BadRequestException('La notificación no contiene un identificador de pago válido');

    this.pasarela.validarWebhook(entrada);
    const payment = await this.pasarela.consultarPago(entrada.dataId);
    await this.aplicarPago(payment);

    return { received: true };
  }

  /**
   * Segunda vía de confirmación para el regreso desde Checkout Pro.
   * El navegador solo aporta el ID: el estado, importe y referencia siempre
   * se consultan nuevamente a Mercado Pago antes de modificar la reserva.
   */
  async reconciliarPago(paymentId: string, idUsuario: number) {
    const payment = await this.pasarela.consultarPago(paymentId);
    const externalReference = payment.external_reference;
    if (!externalReference?.startsWith('reserva:')) {
      throw new BadRequestException('El pago no corresponde a una reserva');
    }

    const idReserva = Number(externalReference.slice('reserva:'.length));
    if (!Number.isInteger(idReserva)) {
      throw new BadRequestException('La referencia del pago es inválida');
    }

    const reserva = await this.reservasService.buscarPorId(
      idReserva,
      idUsuario,
    );
    if (!this.reservasService.esDelInquilino(reserva, idUsuario)) {
      throw new ForbiddenException('Solo el inquilino puede validar este pago');
    }

    const pago = await this.aplicarPago(payment);
    const reservaActualizada = await this.reservasService.buscarPorId(
      idReserva,
      idUsuario,
    );
    return {
      reserva_id: pago.reserva.id,
      estado_pago: reservaActualizada.estado_pago,
      mercado_pago_status: pago.status,
      mercado_pago_status_detail: pago.status_detail,
    };
  }

  private async aplicarPago(payment: PagoExterno): Promise<Pago> {
    const externalReference = payment.external_reference;
    if (!externalReference?.startsWith('reserva:')) {
      throw new BadRequestException('El pago no corresponde a una reserva');
    }

    const pago = await this.pagos.buscarPorReferencia(externalReference);
    if (!pago) throw new BadRequestException('No existe el pago informado');

    if (payment.status === 'charged_back') {
      this.pagos.validarDatosExternos(pago, payment);
      await this.disputasService.registrarContracargo({
        idReserva: pago.reserva.id,
        idPago: pago.id,
        chargebackId:
          payment.chargeback_id ??
          `payment:${payment.id}:charged_back`,
        importe: Number(payment.transaction_amount ?? pago.amount),
        motivo: payment.status_detail ?? 'Contracargo informado por Mercado Pago',
        pagoExterno: payment,
      });
      const actual = await this.pagos.buscarPorId(pago.id);
      return Object.assign(actual, { reserva: pago.reserva });
    }

    await this.pagos.registrarEstadoExterno(pago, payment);

    if (payment.status === 'refunded' || payment.refunds?.length) {
      const movimientos = payment.refunds?.length ? payment.refunds :
        await this.pasarela.listarReembolsos(String(payment.id));
      if (payment.status === 'refunded' && !movimientos.some(movimiento => movimiento.status === 'approved'))
        throw new ServiceUnavailableException('Mercado Pago todavía no informó los movimientos del reembolso');
      const ids = await this.reembolsosService.registrarMovimientosExternos(pago, movimientos);
      for (const id of ids) await this.operacionesReembolso.aplicarReembolsoConfirmado(id);
      if (payment.status === 'approved' && !movimientos.some(movimiento => movimiento.status === 'approved')) {
        await this.reservasService.confirmarPago(pago.reserva.id, pago.approved_at ?? new Date());
      }
    } else if (payment.status === 'approved') {
      await this.reservasService.confirmarPago(pago.reserva.id, pago.approved_at ?? new Date());
    }

    return pago;
  }

  async consultarEstado(idReserva: number, idUsuario: number) {
    const reserva = await this.reservasService.buscarPorId(
      idReserva,
      idUsuario,
    );
    if (!this.reservasService.esDelInquilino(reserva, idUsuario)) {
      throw new ForbiddenException(
        'Solo el inquilino puede consultar el estado del pago',
      );
    }
    const pago = await this.pagos.buscarPorReserva(idReserva, false);
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
    const pago = await this.pagos.buscarPorReserva(idReserva, false);
    return {
      reserva,
      puede_reintentar: this.puedeReintentar(reserva, pago, idUsuario),
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

  async reintentarCheckout(idReserva: number, idUsuario: number) {
    const reserva = await this.reservasService.buscarPorId(idReserva, idUsuario);
    const pago = await this.pagos.buscarPorReserva(idReserva, false);
    if (!this.puedeReintentar(reserva, pago, idUsuario) || !pago?.preference_id)
      throw new ConflictException('La reserva no está disponible para reintentar el pago');

    const checkout_url = await this.pasarela.consultarCheckout(pago.preference_id);
    const vigente = await this.reservasService.buscarPorId(idReserva, idUsuario);
    const pagoVigente = await this.pagos.buscarPorReserva(idReserva, false);
    if (!this.puedeReintentar(vigente, pagoVigente, idUsuario))
      throw new ConflictException('La reserva ya no está disponible para reintentar el pago');

    return { reserva_id: idReserva, preference_id: pago.preference_id, checkout_url, expires_at: vigente.pago_vencimiento };
  }

  private puedeReintentar(reserva: Awaited<ReturnType<ReservasService['buscarPorId']>>, pago: Pago | null, idUsuario: number): boolean {
    return this.reservasService.esDelInquilino(reserva, idUsuario) && !reserva.cancelada &&
      reserva.estado_pago === this.catalogos.codigoEstado('PAGO_RESERVA', 'PENDIENTE') &&
      !!reserva.pago_vencimiento && new Date(reserva.pago_vencimiento).getTime() > Date.now() &&
      !!pago?.preference_id && (pago.status === 'rejected' || pago.status === 'cancelled' ||
        (pago.status === 'pending' && !pago.payment_id));
  }
}
