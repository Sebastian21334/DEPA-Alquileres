import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Publicacion } from './entity/publicacion.entity';
import { PublicacionesController } from './controller/publicaciones.controller';
import { PublicacionesRepository } from './repository/publicaciones.repository';
import { PUBLICACIONES_REPOSITORY } from './repository/publicaciones.repository.interface';
import { PublicacionesService } from './service/publicaciones.service';
import { CatalogosModule } from '../catalogos/catalogos.module';
import { UbicacionModule } from '../ubicacion/ubicacion.module';
import { AuthModule } from '../auth/auth.module'; // <-- cambio
import { AnunciantesModule } from '../anunciantes/anunciantes.module';

@Module({
  // La publicación coordina catálogos, ubicación y anunciante propietario.
  controllers: [PublicacionesController],
  providers: [
    PublicacionesRepository,
    {
      provide: PUBLICACIONES_REPOSITORY,
      useExisting: PublicacionesRepository,
    },
    PublicacionesService,
  ],
  imports: [
    // Registra el repositorio TypeORM de publicaciones.
    TypeOrmModule.forFeature([Publicacion]),
    // Se necesitan para resolver los IDs relacionales al crear una publicación.
    CatalogosModule,
    UbicacionModule,
    AuthModule, 
    AnunciantesModule,
  ],
  exports: [PublicacionesService],
})
export class PublicacionesModule {}