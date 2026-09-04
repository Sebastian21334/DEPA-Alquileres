import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Anunciante } from './entity/anunciante.entity';
import { AnunciantesRepository } from './repository/anunciantes.repository';
import { ANUNCIANTES_REPOSITORY } from './repository/anunciantes.repository.interface';
import { AnunciantesService } from './service/anunciantes.service';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { CatalogosModule } from '../catalogos/catalogos.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Anunciante]),
        UsuariosModule,
        CatalogosModule,
      ],
    providers: [
        AnunciantesRepository,
        {
          provide: ANUNCIANTES_REPOSITORY,
          useExisting: AnunciantesRepository,
        },
        AnunciantesService,
      ],
    exports: [AnunciantesService],
})
export class AnunciantesModule {}
