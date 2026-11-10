import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PagosModule } from '../pagos/pagos.module';
import { PasarelaModule } from '../pagos/pasarela.module';
import { SeguridadModule } from '../seguridad/seguridad.module';
import { NotificacionesModule } from '../notificaciones/notificaciones.module';
import { Reembolso } from './entity/reembolso.entity';
import { ReembolsosRepository } from './repository/reembolsos.repository';
import { REEMBOLSOS_REPOSITORY } from './repository/reembolsos.repository.interface';
import { ReembolsosService } from './service/reembolsos.service';
import { DevolucionesUnitOfWork } from './persistence/devoluciones.unit-of-work';
import { DEVOLUCIONES_UOW } from './persistence/devoluciones.unit-of-work.interface';

@Module({
  imports: [
    TypeOrmModule.forFeature([Reembolso]),
    PagosModule,
    PasarelaModule,
    SeguridadModule,
    NotificacionesModule,
  ],
  providers: [
    ReembolsosService,
    DevolucionesUnitOfWork,
    { provide: DEVOLUCIONES_UOW, useExisting: DevolucionesUnitOfWork },
    ReembolsosRepository,
    { provide: REEMBOLSOS_REPOSITORY, useExisting: ReembolsosRepository },
  ],
  exports: [ReembolsosService],
})
export class ReembolsosModule {}
