import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MercadoPagoAdapter } from './proveedor/mercado-pago.adapter';
import { MERCADO_PAGO_PROVEEDOR } from './proveedor/mercado-pago.interface';
import { MercadoPagoService } from './service/mercado-pago.service';

@Module({
  imports: [ConfigModule],
  providers: [MercadoPagoService, { provide: MERCADO_PAGO_PROVEEDOR, useClass: MercadoPagoAdapter }],
  exports: [MercadoPagoService],
})
export class MercadoPagoModule {}
