import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CatalogosModule } from '../catalogos/catalogos.module';
import { CotizacionesModule } from '../cotizaciones/cotizaciones.module';
import { DisponibilidadModule } from '../disponibilidad/disponibilidad.module';
import { DisputasModule } from '../disputas/disputas.module';
import { MercadoPagoModule } from '../mercado-pago/mercado-pago.module';
import { PagosModule } from '../pagos/pagos.module';
import { PublicacionesModule } from '../publicaciones/publicaciones.module';
import { ReembolsosModule } from '../reembolsos/reembolsos.module';
import { ReclamosModule } from '../reclamos/reclamos.module';
import { ReservasModule } from '../reservas/reservas.module';
import { SeguridadModule } from '../seguridad/seguridad.module';
import { PagosController } from './controller/pagos.controller';
import { ReembolsosReservaController } from './controller/reembolsos-reserva.controller';
import { OperacionesPagoService } from './service/operaciones-pago.service';
import { OperacionesReembolsoService } from './service/operaciones-reembolso.service';
import { PresupuestosService } from './service/presupuestos.service';

@Module({
  imports: [
    ConfigModule,
    CatalogosModule,
    CotizacionesModule,
    DisponibilidadModule,
    DisputasModule,
    MercadoPagoModule,
    PagosModule,
    PublicacionesModule,
    ReembolsosModule,
    ReclamosModule,
    ReservasModule,
    SeguridadModule,
  ],
  controllers: [PagosController, ReembolsosReservaController],
  providers: [OperacionesPagoService, OperacionesReembolsoService, PresupuestosService],
})
export class OperacionesReservaModule {}
