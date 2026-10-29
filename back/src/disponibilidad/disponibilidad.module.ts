// disponibilidad.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Fecha } from './entity/fecha.entity';
import { DisponibilidadService } from './service/disponibilidad.service';
import { DisponibilidadController } from './controller/disponibilidad.controller';
import { PropietarioPublicacionGuard } from './guards/propietario-publicacion.guard';
import { FechaRepository } from './repository/fecha.repository';
import { FECHA_REPOSITORY } from './repository/fecha.repository.interface';
import { SeguridadModule } from '../seguridad/seguridad.module';
import { PublicacionesModule } from '../publicaciones/publicaciones.module';
import { TransaccionCalendario } from './repository/transaccion-calendario';
import { TRANSACCION_CALENDARIO } from './repository/transaccion-calendario.interface';

@Module({
  imports: [
    // Se usan Fecha para el calendario y Publicacion para resolver propiedad.
    TypeOrmModule.forFeature([Fecha]),
    SeguridadModule,
    PublicacionesModule,
  ],
  controllers: [DisponibilidadController],
  providers: [
    // PropietarioPublicacionGuard evita modificar calendarios ajenos.
    DisponibilidadService,
    FechaRepository,
    { provide: TRANSACCION_CALENDARIO, useClass: TransaccionCalendario },
    {
      provide: FECHA_REPOSITORY,
      useExisting: FechaRepository,
    },
    PropietarioPublicacionGuard,
  ],
  exports: [DisponibilidadService, TRANSACCION_CALENDARIO],
})
export class DisponibilidadModule {}
