import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlmacenamientoModule } from '../common/almacenamiento/almacenamiento.module';
import { PagosModule } from '../pagos/pagos.module';
import { ReembolsosModule } from '../reembolsos/reembolsos.module';
import { ReservasModule } from '../reservas/reservas.module';
import { SeguridadModule } from '../seguridad/seguridad.module';
import { NotificacionesModule } from '../notificaciones/notificaciones.module';
import { Reclamo } from './entity/reclamo.entity';
import { ReclamoEvidencia } from './entity/reclamo-evidencia.entity';
import { ReclamoMensaje } from './entity/reclamo-mensaje.entity';
import { ReclamosController } from './controller/reclamos.controller';
import { ReclamosRepository } from './repository/reclamos.repository';
import { RECLAMOS_REPOSITORY } from './repository/reclamos.repository.interface';
import { ReclamosService } from './service/reclamos.service';
import { ReclamosUnitOfWork } from './persistence/reclamos.unit-of-work';
import { RECLAMOS_UOW } from './persistence/reclamos.unit-of-work.interface';

@Module({
  imports: [
    TypeOrmModule.forFeature([Reclamo, ReclamoEvidencia, ReclamoMensaje]),
    ReservasModule,
    PagosModule,
    ReembolsosModule,
    AlmacenamientoModule,
    SeguridadModule,
    NotificacionesModule,
  ],
  controllers: [ReclamosController],
  providers: [
    ReclamosService,
    ReclamosRepository,
    { provide: RECLAMOS_REPOSITORY, useExisting: ReclamosRepository },
    ReclamosUnitOfWork,
    { provide: RECLAMOS_UOW, useExisting: ReclamosUnitOfWork },
  ],
})
export class ReclamosModule {}
