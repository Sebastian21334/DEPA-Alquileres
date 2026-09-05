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
    TypeOrmModule.forFeature([Imagen]),
    PublicacionesModule,
    AnunciantesModule,
    AuthModule,
  ],
})
export class ImagenesModule {}