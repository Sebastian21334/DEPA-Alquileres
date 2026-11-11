import { Module } from '@nestjs/common';
import { PagosController } from './controller/pagos.controller';
import { PagosService } from './service/pagos.service';
import { ReservasModule } from '../reservas/reservas.module';
import { SeguridadModule } from '../seguridad/seguridad.module';
import { CotizacionesModule } from '../cotizaciones/cotizaciones.module';
import { PublicacionesModule } from '../publicaciones/publicaciones.module';
import { DisponibilidadModule } from '../disponibilidad/disponibilidad.module';
import { PresupuestosService } from './service/presupuestos.service';

import { PagosPersistenciaModule } from './pagos-persistencia.module';
import { PasarelaModule } from './pasarela.module';
import { ReembolsosModule } from '../reembolsos/reembolsos.module';
import { DisputasModule } from '../disputas/disputas.module';

@Module({
  imports: [
    PagosPersistenciaModule,
    ReservasModule,
    SeguridadModule,
    CotizacionesModule,
    PublicacionesModule,
    DisponibilidadModule,
    PasarelaModule,
    ReembolsosModule,
    DisputasModule,
  ],
  controllers: [PagosController],
  providers: [PagosService, PresupuestosService],
})
export class PagosModule {}
