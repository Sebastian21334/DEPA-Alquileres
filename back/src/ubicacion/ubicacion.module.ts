import { GEOCODIFICACION_REPOSITORY } from './repository/geocodificacion.repository.interface';
import { NominatimGeocodificacionRepository } from './repository/nominatim-geocodificacion.repository';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Provincia } from './entity/provincia.entity';
import { Ciudad } from './entity/ciudad.entity';
import { UBICACION_REPOSITORY } from './repository/ubicacion.repository.interface';
import { UbicacionRepository } from './repository/ubicacion.repository';
import { UbicacionService } from './service/ubicacion.service';
import { UbicacionController } from './controller/ubicacion.controller';
import { SeguridadModule } from '../seguridad/seguridad.module';

@Module({
  // Expone la jerarquía Provincia -> Ciudad usada por las publicaciones.
  controllers: [UbicacionController],
  providers: [
    NominatimGeocodificacionRepository,
    {
      provide: GEOCODIFICACION_REPOSITORY,
      useExisting: NominatimGeocodificacionRepository,
    },
    UbicacionRepository,
    {
      provide: UBICACION_REPOSITORY,
      useExisting: UbicacionRepository,
    },
    UbicacionService,
  ],
  imports: [
    // Ambos repositorios usan las entidades registradas en este módulo.
    TypeOrmModule.forFeature([Provincia, Ciudad]),
    SeguridadModule,
  ],
  exports: [UbicacionService],
})
export class UbicacionModule {}
