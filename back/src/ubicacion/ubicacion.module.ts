import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Provincia } from './entity/provincia.entity';
import { Ciudad } from './entity/ciudad.entity';
import { UBICACION_REPOSITORY } from './repository/ubicacion.repository.interface';
import { UbicacionRepository } from './repository/ubicacion.repository';
import { UbicacionService } from './service/ubicacion.service';
import { UbicacionController } from './controller/ubicacion.controller';
import { SeguridadModule } from '../seguridad/seguridad.module';
import { GEOCODIFICACION } from './proveedor/geocodificacion.interface';
import { NominatimAdapter } from './proveedor/nominatim.adapter';

@Module({
  // Expone la jerarquía Provincia -> Ciudad usada por las publicaciones.
  controllers: [UbicacionController],
  providers: [
    NominatimAdapter,
    {
      provide: GEOCODIFICACION,
      useExisting: NominatimAdapter,
    },
    UbicacionRepository,
    {
      provide: UBICACION_REPOSITORY,
      useExisting: UbicacionRepository,
    },
    UbicacionService,
  ],
  imports: [TypeOrmModule.forFeature([Provincia, Ciudad]), SeguridadModule],
  exports: [UbicacionService],
})
export class UbicacionModule {}
