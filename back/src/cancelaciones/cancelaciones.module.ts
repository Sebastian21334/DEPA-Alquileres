import { CancelacionesLecturaModule } from './cancelaciones-lectura.module';
import { Module } from '@nestjs/common';
import { CatalogosModule } from '../catalogos/catalogos.module';
import { ReembolsosModule } from '../reembolsos/reembolsos.module';
import { ReservasModule } from '../reservas/reservas.module';
import { SeguridadModule } from '../seguridad/seguridad.module';
import { CancelacionesController } from './controller/cancelaciones.controller';
import { CancelacionesService } from './service/cancelaciones.service';

@Module({
  imports: [
    CancelacionesLecturaModule,
    CatalogosModule,
    ReservasModule,
    ReembolsosModule,
    SeguridadModule,
  ],
  controllers: [CancelacionesController],
  providers: [
    CancelacionesService,
  ],
  exports: [CancelacionesService],
})
export class CancelacionesModule {}
