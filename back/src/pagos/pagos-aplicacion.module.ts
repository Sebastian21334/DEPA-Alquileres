import { Module } from '@nestjs/common';
import { CotizacionesModule } from '../cotizaciones/cotizaciones.module';
import { DisponibilidadModule } from '../disponibilidad/disponibilidad.module';
import { ReembolsosModule } from '../reembolsos/reembolsos.module';
import { ReservasModule } from '../reservas/reservas.module';
import { DisputasModule } from '../disputas/disputas.module';
import { PublicacionesModule } from '../publicaciones/publicaciones.module';
import { SeguridadModule } from '../seguridad/seguridad.module';
import { PagosController } from './controller/pagos.controller';
import { PagosModule } from './pagos.module';
import { PasarelaModule } from './pasarela.module';
import { CheckoutService } from './service/checkout.service';
import { PagosConsultaService } from './service/pagos-consulta.service';
import { PagosWebhookService } from './service/pagos-webhook.service';
import { PresupuestosService } from './service/presupuestos.service';

/**
 * Casos de uso que cruzan pagos con reservas, reembolsos y disputas.
 * Este módulo es el único que conoce a los tres.
 */
@Module({
  imports: [
    PagosModule,
    PasarelaModule,
    ReservasModule,
    ReembolsosModule,
    DisputasModule,
    SeguridadModule,
    CotizacionesModule,
    PublicacionesModule,
    DisponibilidadModule,
  ],
  controllers: [PagosController],
  providers: [
    PresupuestosService,
    CheckoutService,
    PagosWebhookService,
    PagosConsultaService,
  ],
})
export class PagosAplicacionModule {}
