import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pago } from './entity/pago.entity';
import { PagosRepository } from './repository/pagos.repository';
import { PAGOS_REPOSITORY } from './repository/pagos.repository.interface';
import { PagosService } from './service/pagos.service';

@Module({
  imports: [TypeOrmModule.forFeature([Pago])],
  providers: [PagosService, { provide: PAGOS_REPOSITORY, useClass: PagosRepository }],
  exports: [PagosService],
})
export class PagosModule {}
