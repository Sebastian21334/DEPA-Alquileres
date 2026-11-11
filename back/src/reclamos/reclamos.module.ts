import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlmacenamientoModule } from '../almacenamiento/almacenamiento.module';
import { ReservasModule } from '../reservas/reservas.module';
import { ReembolsosModule } from '../reembolsos/reembolsos.module';
import { SeguridadModule } from '../seguridad/seguridad.module';
import { Reclamo } from './entity/reclamo.entity';
import { ReclamoEvidencia } from './entity/reclamo-evidencia.entity';
import { ReclamoMensaje } from './entity/reclamo-mensaje.entity';
import { ReclamosController } from './controller/reclamos.controller';
import { ReclamosService } from './service/reclamos.service';
import { ReclamosRepository } from './repository/reclamos.repository';
import { RECLAMOS_REPOSITORY } from './repository/reclamos.repository.interface';

@Module({
  imports: [
    TypeOrmModule.forFeature([Reclamo, ReclamoEvidencia, ReclamoMensaje]),
    ReservasModule,
    ReembolsosModule,
    AlmacenamientoModule,
    SeguridadModule,
  ],
  controllers: [ReclamosController],
  providers: [
    ReclamosService,
    ReclamosRepository,
    { provide: RECLAMOS_REPOSITORY, useExisting: ReclamosRepository },
  ],
  exports: [ReclamosService],
})
export class ReclamosModule {}
