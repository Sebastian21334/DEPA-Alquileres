import {
  Inject,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'node:crypto';
import { ReservasService } from '../../reservas/service/reservas.service';
import { CrearCheckoutDto } from '../dto/crear-checkout.dto';
import {
  PASARELA_PAGOS,
  type IPasarelaPagos,
} from '../repository/pasarela-pagos.interface';
import { PresupuestosService } from './presupuestos.service';
import { PagosService } from './pagos.service';

/** Caso de uso de checkout: reserva pendiente + preferencia de Mercado Pago. */
@Injectable()
export class CheckoutService {
  private readonly logger = new Logger(CheckoutService.name);

  constructor(
    private readonly presupuestos: PresupuestosService,
    private readonly reservasService: ReservasService,
    private readonly pagosService: PagosService,
    private readonly config: ConfigService,
    @Inject(PASARELA_PAGOS)
    private readonly pasarela: IPasarelaPagos,
  ) {}

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
    const externalReference = `reserva:${reserva.id}`;
    const idempotencyKey = randomUUID();
    const currency =
      reserva.moneda_contratada ??
      this.config.get<string>('MP_CURRENCY_ID') ??
      'ARS';

    try {
      let pago = this.pagosService.crear({
        reserva,
        external_reference: externalReference,
        preference_id: null,
        payment_id: null,
        status: 'pending',
        status_detail: null,
        amount: Number(reserva.monto_pago),
        currency,
        payment_method_id: null,
        idempotency_key: idempotencyKey,
        approved_at: null,
      });
      pago = await this.pagosService.guardar(pago);

      const preference = await this.pasarela.crearCheckout(
        reserva,
        externalReference,
        idempotencyKey,
        currency,
      );
      this.pagosService.registrarPreferencia(pago, preference.id);
      await this.pagosService.guardar(pago);
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
}
