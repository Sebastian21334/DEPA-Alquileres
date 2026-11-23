import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reclamo } from './entity/reclamo.entity';
import { ReclamoEvidencia } from './entity/reclamo-evidencia.entity';
import { ReclamoMensaje } from './entity/reclamo-mensaje.entity';
import { ReclamosRepository } from './repository/reclamos.repository';
import { RECLAMOS_REPOSITORY } from './repository/reclamos.repository.interface';
import { ReclamosLecturaService } from './service/reclamos-lectura.service';

// Expone la consulta de pendientes sin importar los controladores ni el servicio que gestiona reclamos.
@Module({
  // El repositorio compartido también usa las entidades de mensajes y evidencias para el módulo principal.
  imports: [TypeOrmModule.forFeature([Reclamo, ReclamoEvidencia, ReclamoMensaje])],
  providers: [ReclamosRepository, { provide: RECLAMOS_REPOSITORY, useExisting: ReclamosRepository }, ReclamosLecturaService],
  // El módulo principal reutiliza el repositorio; Usuarios entra por el servicio de lectura.
  exports: [RECLAMOS_REPOSITORY, ReclamosLecturaService],
})
export class ReclamosLecturaModule {}
