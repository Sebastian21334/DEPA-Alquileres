import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pago } from './entity/pago.entity';
import { PagosController } from './pagos.controller';
import { PagosService } from './pagos.service';
import { ReservasModule } from '../reservas/reservas.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Pago]), ReservasModule, AuthModule],
  controllers: [PagosController],
  providers: [PagosService],
})
export class PagosModule {}
