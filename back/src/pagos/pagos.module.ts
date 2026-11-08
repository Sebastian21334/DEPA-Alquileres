import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pago } from './entity/pago.entity';
import { PagosController } from './controller/pagos.controller';
import { PagosService } from './service/pagos.service';
import { ReservasModule } from '../reservas/reservas.module';
import { SeguridadModule } from '../seguridad/seguridad.module';
import { CotizacionesModule } from '../cotizaciones/cotizaciones.module';
import { PublicacionesModule } from '../publicaciones/publicaciones.module';
import { DisponibilidadModule } from '../disponibilidad/disponibilidad.module';
import { PresupuestosService } from './service/presupuestos.service';

import { PagosRepository } from './repository/pagos.repository';
import { PAGOS_REPOSITORY } from './repository/pagos.repository.interface';
import { PasarelaModule } from './pasarela.module';
import { ReembolsosModule } from '../reembolsos/reembolsos.module';
import { DisputasModule } from '../disputas/disputas.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Pago]),
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
  providers: [
    PagosService,
    PresupuestosService,
    PagosRepository,
    { provide: PAGOS_REPOSITORY, useExisting: PagosRepository },
  ],
})
export class PagosModule {}
