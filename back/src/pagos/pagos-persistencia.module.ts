import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pago } from './entity/pago.entity';
import { PAGOS_REPOSITORY } from './repository/pagos.repository.interface';
import { PagosRepository } from './repository/pagos.repository';
import { PagosRegistroService } from './service/pagos-registro.service';

@Module({
  imports: [TypeOrmModule.forFeature([Pago])],
  providers: [
    PagosRepository,
    { provide: PAGOS_REPOSITORY, useExisting: PagosRepository },
    PagosRegistroService,
  ],
  exports: [PagosRegistroService],
})
export class PagosPersistenciaModule {}
