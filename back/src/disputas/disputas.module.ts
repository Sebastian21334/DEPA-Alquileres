import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PagosModule } from '../pagos/pagos.module';
import { ReembolsosModule } from '../reembolsos/reembolsos.module';
import { ReservasModule } from '../reservas/reservas.module';
import { SeguridadModule } from '../seguridad/seguridad.module';
import { NotificacionesModule } from '../notificaciones/notificaciones.module';
import { Disputa } from './entity/disputa.entity';
import { DisputasController } from './controller/disputas.controller';
import { DisputasRepository } from './repository/disputas.repository';
import { DISPUTAS_REPOSITORY } from './repository/disputas.repository.interface';
import { DisputasService } from './service/disputas.service';
import { DisputasUnitOfWork } from './persistence/disputas.unit-of-work';
import { DISPUTAS_UOW } from './persistence/disputas.unit-of-work.interface';

@Module({
  imports: [
    TypeOrmModule.forFeature([Disputa]),
    ReservasModule,
    PagosModule,
    ReembolsosModule,
    SeguridadModule,
    NotificacionesModule,
  ],
  controllers: [DisputasController],
  providers: [
    DisputasService,
    DisputasRepository,
    { provide: DISPUTAS_REPOSITORY, useExisting: DisputasRepository },
    DisputasUnitOfWork,
    { provide: DISPUTAS_UOW, useExisting: DisputasUnitOfWork },
  ],
  exports: [DisputasService],
})
export class DisputasModule {}
