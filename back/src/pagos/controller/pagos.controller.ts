import type { AuthenticatedRequest } from '../../auth/interfaces/authenticated-request.interface';
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
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CrearCheckoutDto } from '../dto/crear-checkout.dto';
import { ReconciliarPagoDto } from '../dto/reconciliar-pago.dto';
import { PagosService } from '../service/pagos.service';
import { PresupuestosService } from '../service/presupuestos.service';
import { CrearReservaDto } from '../../reservas/dto/crear-reserva.dto';

import type { WebhookPago } from '../interfaces/webhook.interface';

@Controller('pagos')
export class PagosController {
  constructor(
    private readonly pagosService: PagosService,
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
    return this.pagosService.crearCheckout(dto, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('reconciliar')
  reconciliarPago(
    @Body() dto: ReconciliarPagoDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.pagosService.reconciliarPago(dto.payment_id, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('reservas/:id/estado')
  consultarEstado(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.pagosService.consultarEstado(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('reservas/:id/resumen')
  consultarResumen(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.pagosService.consultarResumen(id, req.user.id);
  }

  @Post('webhook')
  recibirWebhook(
    @Body() body: WebhookPago,
    @Query('data.id') dataIdQuery: string | undefined,
    @Headers('x-signature') signature: string | undefined,
    @Headers('x-request-id') requestId: string | undefined,
  ) {
    return this.pagosService.procesarWebhook({
      body,
      dataId:
        dataIdQuery ??
        (body?.data?.id != null ? String(body.data.id) : undefined),
      signature,
      requestId,
    });
  }
}
