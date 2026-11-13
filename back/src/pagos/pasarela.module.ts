import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MercadoPagoAdapter } from './proveedor/mercado-pago.adapter';
import { PASARELA_PAGOS } from './proveedor/pasarela-pagos.interface';
import { PASARELA_REEMBOLSOS } from '../reembolsos/proveedor/pasarela-reembolsos.interface';

/**
 * Adaptador externo compartido por pagos y reembolsos. No depende de los
 * módulos de dominio, así que puede importarse desde ambos sin crear ciclos.
 */
@Module({
  imports: [ConfigModule],
  providers: [
    MercadoPagoAdapter,
    { provide: PASARELA_PAGOS, useExisting: MercadoPagoAdapter },
    { provide: PASARELA_REEMBOLSOS, useExisting: MercadoPagoAdapter },
  ],
  exports: [PASARELA_PAGOS, PASARELA_REEMBOLSOS],
})
export class PasarelaModule {}
