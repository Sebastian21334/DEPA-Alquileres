import { Module } from '@nestjs/common';
import { ReservasModule } from '../reservas/reservas.module';
import { ReembolsosModule } from './reembolsos.module';
import { ReembolsosReconciliacionService } from './service/reembolsos-reconciliacion.service';

@Module({
  imports: [ReembolsosModule, ReservasModule],
  providers: [ReembolsosReconciliacionService],
})
export class ReembolsosAplicacionModule {}
