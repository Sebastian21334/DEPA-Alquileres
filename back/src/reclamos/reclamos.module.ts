import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlmacenamientoModule } from '../common/almacenamiento/almacenamiento.module';
import { Reserva } from '../reservas/entity/reserva.entity';
import { ReembolsosModule } from '../reembolsos/reembolsos.module';
import { SeguridadModule } from '../seguridad/seguridad.module';
import { Reclamo } from './entity/reclamo.entity';
import { ReclamoEvidencia } from './entity/reclamo-evidencia.entity';
import { ReclamoMensaje } from './entity/reclamo-mensaje.entity';
import { ReclamosController } from './controller/reclamos.controller';
import { ReclamosService } from './service/reclamos.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Reclamo,
      ReclamoEvidencia,
      ReclamoMensaje,
      Reserva,
    ]),
    ReembolsosModule,
    AlmacenamientoModule,
    SeguridadModule,
  ],
  controllers: [ReclamosController],
  providers: [ReclamosService],
  exports: [ReclamosService],
})
export class ReclamosModule {}
