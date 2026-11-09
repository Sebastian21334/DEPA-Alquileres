import type { AuthenticatedRequest } from '../../seguridad/guards/jwt-auth.guard';
import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../seguridad/guards/jwt-auth.guard';
import { CrearCheckoutDto } from '../dto/crear-checkout.dto';
import { ReconciliarPagoDto } from '../dto/reconciliar-pago.dto';
import { CheckoutService } from '../service/checkout.service';
import { PagosConsultaService } from '../service/pagos-consulta.service';
import { PagosWebhookService } from '../service/pagos-webhook.service';
import { PresupuestosService } from '../service/presupuestos.service';
import { CrearReservaDto } from '../../reservas/dto/crear-reserva.dto';

import type { WebhookPago } from '../dto/webhook-pago.dto';

@Controller('pagos')
export class PagosController {
  constructor(
    private readonly checkoutService: CheckoutService,
    private readonly webhookService: PagosWebhookService,
    private readonly consultaService: PagosConsultaService,
    private readonly presupuestos: PresupuestosService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('presupuesto')
  cotizar(@Body() dto: CrearReservaDto, @Req() req: AuthenticatedRequest) {
    return this.presupuestos.cotizar(dto, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('checkout')
  crearCheckout(
    @Body() dto: CrearCheckoutDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.checkoutService.crearCheckout(dto, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('reconciliar')
  reconciliarPago(
    @Body() dto: ReconciliarPagoDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.webhookService.reconciliarPago(dto.payment_id, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('reservas/:id/estado')
  consultarEstado(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.consultaService.consultarEstado(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('reservas/:id/resumen')
  consultarResumen(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.consultaService.consultarResumen(id, req.user.id);
  }

  @Post('webhook')
  recibirWebhook(
    @Body() body: WebhookPago,
    @Query('data.id') dataIdQuery: string | undefined,
    @Headers('x-signature') signature: string | undefined,
    @Headers('x-request-id') requestId: string | undefined,
  ) {
    return this.webhookService.procesarWebhook({
      body,
      dataId:
        dataIdQuery ??
        (body?.data?.id != null ? String(body.data.id) : undefined),
      signature,
      requestId,
    });
  }
}
