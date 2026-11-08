import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pago } from '../pagos/entity/pago.entity';
import { Reserva } from '../reservas/entity/reserva.entity';
import { ReembolsosModule } from '../reembolsos/reembolsos.module';
import { ReservasModule } from '../reservas/reservas.module';
import { SeguridadModule } from '../seguridad/seguridad.module';
import { Disputa } from './entity/disputa.entity';
import { DisputasController } from './controller/disputas.controller';
import { DisputasService } from './service/disputas.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Disputa, Reserva, Pago]),
    ReembolsosModule,
    ReservasModule,
    SeguridadModule,
  ],
  controllers: [DisputasController],
  providers: [DisputasService],
  exports: [DisputasService],
})
export class DisputasModule {}
