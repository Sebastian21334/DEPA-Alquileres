import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CatalogosModule } from '../catalogos/catalogos.module';
import { PagosModule } from '../pagos/pagos.module';
import { ReembolsosModule } from '../reembolsos/reembolsos.module';
import { ReservasModule } from '../reservas/reservas.module';
import { SeguridadModule } from '../seguridad/seguridad.module';
import { Disputa } from './entity/disputa.entity';
import { DisputasController } from './controller/disputas.controller';
import { DisputasService } from './service/disputas.service';
import { DisputasRepository } from './repository/disputas.repository';
import { DISPUTAS_REPOSITORY } from './repository/disputas.repository.interface';

@Module({
  imports: [
    TypeOrmModule.forFeature([Disputa]),
    CatalogosModule,
    PagosModule,
    ReembolsosModule,
    ReservasModule,
    SeguridadModule,
  ],
  controllers: [DisputasController],
  providers: [
    DisputasService,
    DisputasRepository,
    { provide: DISPUTAS_REPOSITORY, useExisting: DisputasRepository },
  ],
  exports: [DisputasService],
})
export class DisputasModule {}
