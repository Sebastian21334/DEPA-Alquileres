import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Imagen } from './entity/imagen.entity';
import { IMAGENES_REPOSITORY } from './repository/imagenes.repository.interface';
import { ImagenesRepository } from './repository/imagenes.repository';
import { ImagenesService } from './service/imagenes.service';
import { ImagenesController } from './controller/imagenes.controller';
import { PublicacionesModule } from '../publicaciones/publicaciones.module';
import { AnunciantesModule } from '../anunciantes/anunciantes.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  // Coordina el archivo recibido, el almacenamiento externo y su registro en DB.
  controllers: [ImagenesController],
  providers: [
    ImagenesRepository,
    {
      provide: IMAGENES_REPOSITORY,
      useExisting: ImagenesRepository,
    }, 
    ImagenesService,
  ],
  imports: [
    // La entidad guarda la URL final, no los bytes de la imagen.
    TypeOrmModule.forFeature([Imagen]),
    // Se consultan publicación, anunciante y usuario para validar propiedad.
    PublicacionesModule,
    AnunciantesModule,
    AuthModule,
  ],
})
export class ImagenesModule {}