import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Anunciante } from './entity/anunciante.entity';
import { ANUNCIANTES_REPOSITORY } from './repository/anunciantes.repository.interface';
import { AnunciantesRepository } from './repository/anunciantes.repository';
import { AnunciantesService } from './service/anunciantes.service';
import { AnunciantesController } from './controller/anunciantes.controller';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { CatalogosModule } from '../catalogos/catalogos.module';
import { AuthModule } from '../auth/auth.module'; // <- agregar

@Module({
  // Agrupa endpoints, reglas de negocio y persistencia de solicitudes de anunciante.
  controllers: [AnunciantesController],
  providers: [
    AnunciantesRepository,
    {
      provide: ANUNCIANTES_REPOSITORY,
      useExisting: AnunciantesRepository,
    },
    AnunciantesService,
  ],
  imports: [
    // Habilita consultas TypeORM sobre la entidad Anunciante.
    TypeOrmModule.forFeature([Anunciante]),
    // Estas dependencias permiten validar el usuario, el tipo de anunciante y el JWT.
    UsuariosModule,
    CatalogosModule,
    AuthModule, 
    AnunciantesModule,
  ],
  exports: [AnunciantesService],
})
export class AnunciantesModule {}