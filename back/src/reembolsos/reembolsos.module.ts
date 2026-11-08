import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pago } from '../pagos/entity/pago.entity';
import { PasarelaModule } from '../pagos/pasarela.module';
import { SeguridadModule } from '../seguridad/seguridad.module';
import { Reembolso } from './entity/reembolso.entity';
import { ReembolsosRepository } from './repository/reembolsos.repository';
import { REEMBOLSOS_REPOSITORY } from './repository/reembolsos.repository.interface';
import { ReembolsosController } from './controller/reembolsos.controller';
import { ReembolsosService } from './service/reembolsos.service';
import { ReembolsosReconciliacionService } from './service/reembolsos-reconciliacion.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Reembolso, Pago]),
    PasarelaModule,
    SeguridadModule,
  ],
  controllers: [ReembolsosController],
  providers: [
    ReembolsosService,
    ReembolsosReconciliacionService,
    ReembolsosRepository,
    { provide: REEMBOLSOS_REPOSITORY, useExisting: ReembolsosRepository },
  ],
  exports: [ReembolsosService],
})
export class ReembolsosModule {}
