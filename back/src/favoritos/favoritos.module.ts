import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { PublicacionesModule } from '../publicaciones/publicaciones.module';
import { Favorito } from './entity/favorito.entity';
import { FavoritosController } from './controller/favoritos.controller';
import { FavoritosService } from './service/favoritos.service';

@Module({
  imports: [TypeOrmModule.forFeature([Favorito]), AuthModule, PublicacionesModule],
  controllers: [FavoritosController],
  providers: [FavoritosService],
})
export class FavoritosModule {}
