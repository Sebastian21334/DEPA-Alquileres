import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CatalogosModule } from '../catalogos/catalogos.module';
import { Liquidacion } from './entity/liquidacion.entity';
import { LIQUIDACION_REPOSITORY } from './repository/liquidacion.repository.interface';
import { LiquidacionRepository } from './repository/liquidacion.repository';
import { LiquidacionesService } from './service/liquidaciones.service';

@Module({
  imports: [TypeOrmModule.forFeature([Liquidacion]), CatalogosModule],
  providers: [
    LiquidacionesService,
    LiquidacionRepository,
    { provide: LIQUIDACION_REPOSITORY, useExisting: LiquidacionRepository },
  ],
  exports: [LiquidacionesService],
})
export class LiquidacionesModule {}
