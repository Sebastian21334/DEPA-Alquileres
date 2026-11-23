import { ReclamosLecturaModule } from './reclamos-lectura.module';
import { CatalogosModule } from '../catalogos/catalogos.module';
import { CancelacionesModule } from '../cancelaciones/cancelaciones.module';
import { Module } from '@nestjs/common';
import { AlmacenamientoModule } from '../almacenamiento/almacenamiento.module';
import { ReservasModule } from '../reservas/reservas.module';
import { ReembolsosModule } from '../reembolsos/reembolsos.module';
import { SeguridadModule } from '../seguridad/seguridad.module';
import { ReclamosController } from './controller/reclamos.controller';
import { ReclamosService } from './service/reclamos.service';

@Module({
  imports: [
    CatalogosModule,
    CancelacionesModule,
    ReclamosLecturaModule,
    ReservasModule,
    ReembolsosModule,
    AlmacenamientoModule,
    SeguridadModule,
  ],
  controllers: [ReclamosController],
  providers: [
    ReclamosService,
  ],
  exports: [ReclamosService],
})
export class ReclamosModule {}
