import { MercadoPagoAdapter } from './repository/mercado-pago.adapter';
import { PASARELA_PAGOS } from './repository/pasarela-pagos.interface';
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

@Module({
  imports: [
    TypeOrmModule.forFeature([Pago]),
    ReservasModule,
    SeguridadModule,
    CotizacionesModule,
    PublicacionesModule,
    DisponibilidadModule,
  ],
  controllers: [PagosController],
  providers: [
    MercadoPagoAdapter,
    { provide: PASARELA_PAGOS, useExisting: MercadoPagoAdapter },
    PagosService,
    PresupuestosService,
    PagosRepository,
    { provide: PAGOS_REPOSITORY, useExisting: PagosRepository },
  ],
})
export class PagosModule {}
