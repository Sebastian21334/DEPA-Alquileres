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
import { OperacionesPagoService } from '../service/operaciones-pago.service';
import { PresupuestosService } from '../service/presupuestos.service';
import { CrearReservaDto } from '../../reservas/dto/crear-reserva.dto';

import type { WebhookPago } from '../dto/webhook-pago.dto';

@Controller('pagos')
export class PagosController {
  constructor(private readonly operaciones: OperacionesPagoService, private readonly presupuestos: PresupuestosService) {}

  @UseGuards(JwtAuthGuard)
  @Post('presupuesto')
  cotizar(@Body() dto: CrearReservaDto, @Req() req: AuthenticatedRequest) {
    return this.presupuestos.cotizar(dto, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('checkout')
  crearCheckout(@Body() dto: CrearCheckoutDto, @Req() req: AuthenticatedRequest) {
    return this.operaciones.crearCheckout(dto, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('reconciliar')
  reconciliarPago(@Body() dto: ReconciliarPagoDto, @Req() req: AuthenticatedRequest) {
    return this.operaciones.reconciliarPago(dto.payment_id, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('reservas/:id/reintentar')
  reintentarCheckout(@Param('id', ParseIntPipe) id: number, @Req() req: AuthenticatedRequest) {
    return this.operaciones.reintentarCheckout(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('reservas/:id/estado')
  consultarEstado(@Param('id', ParseIntPipe) id: number, @Req() req: AuthenticatedRequest) {
    return this.operaciones.consultarEstado(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('reservas/:id/resumen')
  consultarResumen(@Param('id', ParseIntPipe) id: number, @Req() req: AuthenticatedRequest) {
    return this.operaciones.consultarResumen(id, req.user.id);
  }

  @Post('webhook')
  recibirWebhook(@Body() body: WebhookPago, @Query('data.id') dataIdQuery: string | undefined, @Headers('x-signature') signature: string | undefined, @Headers('x-request-id') requestId: string | undefined) {
    return this.operaciones.procesarWebhook({
      body,
      dataId:
        dataIdQuery ??
        (body?.data?.id != null ? String(body.data.id) : undefined),
      signature,
      requestId,
    });
  }
}
