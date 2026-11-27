import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlmacenamientoModule } from '../almacenamiento/almacenamiento.module';
import { AnunciantesModule } from '../anunciantes/anunciantes.module';
import { MailModule } from '../mail/mail.module';
import { PublicacionesModule } from '../publicaciones/publicaciones.module';
import { ReservasModule } from '../reservas/reservas.module';
import { SeguridadModule } from '../seguridad/seguridad.module';
import { ResenasAdministracionController } from './controller/resenas-administracion.controller';
import { ResenasObjetivoController } from './controller/resenas-objetivo.controller';
import { ResenasController } from './controller/resenas.controller';
import { ResenaImagen } from './entity/resena-imagen.entity';
import { Resena } from './entity/resena.entity';
import { RESENA_IMAGEN_REPOSITORY } from './repository/resena-imagen.repository.interface';
import {
  RESENA_ACCESO_REPOSITORY,
  RESENA_REPOSITORY,
} from './repository/resena.repository.interface';
import { ResenasImagenesRepository } from './repository/resenas-imagenes.repository';
import { ResenasRepository } from './repository/resenas.repository';
import { ResenasAdministracionService } from './service/resenas-administracion.service';
import { ResenasImagenesService } from './service/resenas-imagenes.service';
import { ResenasResumenService } from './service/resenas-resumen.service';
import { ResenasService } from './service/resenas.service';

/**
 * Módulo independiente: una reseña apunta a una publicación o a un perfil.
 * Depende de los servicios dueños de cada objetivo, nunca de sus repositorios.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Resena, ResenaImagen]),
    PublicacionesModule,
    AnunciantesModule,
    ReservasModule,
    SeguridadModule,
    AlmacenamientoModule,
    MailModule,
  ],
  controllers: [
    ResenasObjetivoController,
    ResenasController,
    ResenasAdministracionController,
  ],
  providers: [
    ResenasRepository,
    ResenasImagenesRepository,
    { provide: RESENA_REPOSITORY, useExisting: ResenasRepository },
    { provide: RESENA_ACCESO_REPOSITORY, useExisting: ResenasRepository },
    { provide: RESENA_IMAGEN_REPOSITORY, useExisting: ResenasImagenesRepository },
    ResenasResumenService,
    ResenasService,
    ResenasAdministracionService,
    ResenasImagenesService,
  ],
})
export class ResenasModule {}
