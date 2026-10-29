import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeguridadModule } from '../seguridad/seguridad.module';
import { PublicacionesModule } from '../publicaciones/publicaciones.module';
import { Favorito } from './entity/favorito.entity';
import { FavoritosController } from './controller/favoritos.controller';
import { FavoritosService } from './service/favoritos.service';

import { FavoritosRepository } from './repository/favoritos.repository';
import { FAVORITOS_REPOSITORY } from './repository/favoritos.repository.interface';

@Module({
  imports: [
    TypeOrmModule.forFeature([Favorito]),
    SeguridadModule,
    PublicacionesModule,
  ],
  controllers: [FavoritosController],
  providers: [
    FavoritosService,
    FavoritosRepository,
    { provide: FAVORITOS_REPOSITORY, useExisting: FavoritosRepository },
  ],
})
export class FavoritosModule {}
