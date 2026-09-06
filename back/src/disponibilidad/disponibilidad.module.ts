// disponibilidad.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Fecha } from './entity/fecha.entity';
import { Publicacion } from '../publicaciones/entity/publicacion.entity';
import { DisponibilidadService } from './service/disponibilidad.service';
import { DisponibilidadController } from './controller/disponibilidad.controller';
import { PropietarioPublicacionGuard } from '../common/guards/propietario-publicacion.guard';
import { FechaRepository } from './repository/fecha.repository';
import { FECHA_REPOSITORY } from './repository/fecha.repository.interface';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Fecha, Publicacion]),
    AuthModule,
  ],
  controllers: [DisponibilidadController],
  providers: [
    DisponibilidadService,
    FechaRepository,
    {
      provide: FECHA_REPOSITORY,
      useExisting: FechaRepository,
    },
    PropietarioPublicacionGuard,
  ],
  exports: [DisponibilidadService],
})
export class DisponibilidadModule {}