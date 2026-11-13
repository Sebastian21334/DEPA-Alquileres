import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CatalogosModule } from '../catalogos/catalogos.module';
import { ReembolsosModule } from '../reembolsos/reembolsos.module';
import { ReservasModule } from '../reservas/reservas.module';
import { SeguridadModule } from '../seguridad/seguridad.module';
import { CancelacionesController } from './controller/cancelaciones.controller';
import { SolicitudCancelacion } from './entity/solicitud-cancelacion.entity';
import { PoliticaCancelacion } from './entity/politica-cancelacion.entity';
import { CancelacionesRepository } from './repository/cancelaciones.repository';
import { CANCELACIONES_REPOSITORY } from './repository/cancelaciones.repository.interface';
import { CancelacionesService } from './service/cancelaciones.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([SolicitudCancelacion, PoliticaCancelacion]),
    CatalogosModule,
    ReservasModule,
    ReembolsosModule,
    SeguridadModule,
  ],
  controllers: [CancelacionesController],
  providers: [
    CancelacionesService,
    CancelacionesRepository,
    // El token queda privado: los demás módulos piden efectos al servicio.
    { provide: CANCELACIONES_REPOSITORY, useExisting: CancelacionesRepository },
  ],
})
export class CancelacionesModule {}
