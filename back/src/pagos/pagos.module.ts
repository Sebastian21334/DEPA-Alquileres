import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pago } from './entity/pago.entity';
import { PasarelaModule } from './pasarela.module';
import { PagosRepository } from './repository/pagos.repository';
import { PagosTransaccionales } from './repository/pagos-transaccionales';
import { PAGOS_TRANSACCIONALES } from './ports/pagos-transaccionales.interface';
import { PAGOS_REPOSITORY } from './repository/pagos.repository.interface';
import { PagosService } from './service/pagos.service';

/**
 * Núcleo de pagos: estado y persistencia del pago.
 * No importa módulos de dominio para que pueda ser consumido por reservas,
 * reembolsos y disputas sin crear ciclos.
 */
@Module({
  imports: [TypeOrmModule.forFeature([Pago]), PasarelaModule],
  providers: [
    PagosService,
    PagosRepository,
    { provide: PAGOS_REPOSITORY, useExisting: PagosRepository },
    PagosTransaccionales,
    { provide: PAGOS_TRANSACCIONALES, useExisting: PagosTransaccionales },
  ],
  exports: [PagosService, PAGOS_TRANSACCIONALES],
})
export class PagosModule {}
