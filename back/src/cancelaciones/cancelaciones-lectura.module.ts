import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SolicitudCancelacion } from './entity/solicitud-cancelacion.entity';
import { PoliticaCancelacion } from './entity/politica-cancelacion.entity';
import { CancelacionesRepository } from './repository/cancelaciones.repository';
import { CANCELACIONES_REPOSITORY } from './repository/cancelaciones.repository.interface';
import { CancelacionesLecturaService } from './service/cancelaciones-lectura.service';

// Usuarios consulta cancelaciones pendientes sin importar los controladores ni el servicio de gestión.
@Module({
  imports: [TypeOrmModule.forFeature([SolicitudCancelacion, PoliticaCancelacion])],
  providers: [CancelacionesRepository, { provide: CANCELACIONES_REPOSITORY, useExisting: CancelacionesRepository }, CancelacionesLecturaService],
  // El módulo principal reutiliza este repositorio; Usuarios entra por el servicio de lectura.
  exports: [CANCELACIONES_REPOSITORY, CancelacionesLecturaService],
})
export class CancelacionesLecturaModule {}
