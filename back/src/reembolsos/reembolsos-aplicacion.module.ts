import { Module } from '@nestjs/common';
import { ReservasModule } from '../reservas/reservas.module';
import { SeguridadModule } from '../seguridad/seguridad.module';
import { ReembolsosAplicacionController } from './controller/reembolsos-aplicacion.controller';
import { ReembolsosController } from './controller/reembolsos.controller';
import { ReembolsosModule } from './reembolsos.module';
import { ReembolsosReconciliacionService } from './service/reembolsos-reconciliacion.service';

@Module({
  imports: [ReembolsosModule, ReservasModule, SeguridadModule],
  controllers: [ReembolsosAplicacionController, ReembolsosController],
  providers: [ReembolsosReconciliacionService],
})
export class ReembolsosAplicacionModule {}
