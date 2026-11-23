import { ReembolsosLecturaModule } from './reembolsos-lectura.module';
import { CatalogosModule } from '../catalogos/catalogos.module';
import { Module } from '@nestjs/common';
import { PagosModule } from '../pagos/pagos.module';
import { MercadoPagoModule } from '../mercado-pago/mercado-pago.module';
import { SeguridadModule } from '../seguridad/seguridad.module';
import { ReembolsosController } from './controller/reembolsos.controller';
import { ReembolsosService } from './service/reembolsos.service';
import { ReservasConsultaModule } from '../reservas-consulta/reservas-consulta.module';
import { AlmacenamientoModule } from '../almacenamiento/almacenamiento.module';

@Module({
  imports: [
    AlmacenamientoModule,
    CatalogosModule,
    ReembolsosLecturaModule,
    PagosModule,
    MercadoPagoModule,
    SeguridadModule,
    ReservasConsultaModule,
  ],
  controllers: [ReembolsosController],
  providers: [
    ReembolsosService,
  ],
  exports: [ReembolsosService],
})
export class ReembolsosModule {}
