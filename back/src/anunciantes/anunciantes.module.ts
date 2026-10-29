import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Anunciante } from './entity/anunciante.entity';
import { AnunciantesRepository } from './repository/anunciantes.repository';
import { ANUNCIANTES_REPOSITORY } from './repository/anunciantes.repository.interface';
import { AnunciantesService } from './service/anunciantes.service';
import { AnuncianteGuard } from './guards/anunciante.guard';

@Module({
  imports: [TypeOrmModule.forFeature([Anunciante])],
  providers: [
    AnunciantesRepository,
    { provide: ANUNCIANTES_REPOSITORY, useExisting: AnunciantesRepository },
    AnunciantesService,
    AnuncianteGuard,
  ],
  exports: [AnunciantesService, AnuncianteGuard],
})
export class AnunciantesModule {}
