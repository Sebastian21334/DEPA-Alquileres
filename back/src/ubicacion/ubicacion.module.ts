import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Provincia } from './entity/provincia.entity';
import { Ciudad } from './entity/ciudad.entity';
import { UBICACION_REPOSITORY } from './repository/ubicacion.repository.interface';
import { UbicacionRepository } from './repository/ubicacion.repository';
import { UbicacionService } from './service/ubicacion.service';
import { UbicacionController } from './controller/ubicacion.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [UbicacionController],
  providers: [
    UbicacionRepository,
    {
      provide: UBICACION_REPOSITORY,
      useExisting: UbicacionRepository,
    },
    UbicacionService,
  ],
  imports: [
    TypeOrmModule.forFeature([Provincia, Ciudad]),
    AuthModule,
  ],
  exports: [UbicacionService],
})
export class UbicacionModule {}