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
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CrearCheckoutDto } from './dto/crear-checkout.dto';
import { ReconciliarPagoDto } from './dto/reconciliar-pago.dto';
import { PagosService } from './pagos.service';

@Controller('pagos')
export class PagosController {
  constructor(private readonly pagosService: PagosService) {}

  @UseGuards(JwtAuthGuard)
  @Post('checkout')
  crearCheckout(@Body() dto: CrearCheckoutDto, @Req() req: any) {
    return this.pagosService.crearCheckout(dto, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('reconciliar')
  reconciliarPago(@Body() dto: ReconciliarPagoDto, @Req() req: any) {
    return this.pagosService.reconciliarPago(dto.payment_id, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('reservas/:id/estado')
  consultarEstado(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.pagosService.consultarEstado(id, req.user.id);
  }

  @Post('webhook')
  recibirWebhook(
    @Body() body: any,
    @Query('data.id') dataIdQuery: string | undefined,
    @Headers('x-signature') signature: string | undefined,
    @Headers('x-request-id') requestId: string | undefined,
  ) {
    return this.pagosService.procesarWebhook({
      body,
      dataId: dataIdQuery ?? body?.data?.id,
      signature,
      requestId,
    });
  }
}
