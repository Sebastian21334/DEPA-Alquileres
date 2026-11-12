import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PagosPersistenciaModule } from '../pagos/pagos-persistencia.module';
import { PasarelaModule } from '../pagos/pasarela.module';
import { SeguridadModule } from '../seguridad/seguridad.module';
import { Reembolso } from './entity/reembolso.entity';
import { ReembolsosRepository } from './repository/reembolsos.repository';
import { REEMBOLSOS_REPOSITORY } from './repository/reembolsos.repository.interface';
import { ReembolsosController } from './controller/reembolsos.controller';
import { ReembolsosService } from './service/reembolsos.service';
import { ReservasConsultaModule } from '../reservas-consulta/reservas-consulta.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Reembolso]),
    PagosPersistenciaModule,
    PasarelaModule,
    SeguridadModule,
    ReservasConsultaModule,
  ],
  controllers: [ReembolsosController],
  providers: [
    ReembolsosService,
    ReembolsosRepository,
    { provide: REEMBOLSOS_REPOSITORY, useExisting: ReembolsosRepository },
  ],
  exports: [ReembolsosService],
})
export class ReembolsosModule {}
