import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reserva } from './entity/reserva.entity';
import { ReprogramacionReserva } from './entity/reprogramacion-reserva.entity';
import { ReservaRepository } from './repository/reserva.repository';
import { RESERVA_REPOSITORY } from './repository/reserva.repository.interface';
import { ReservasLecturaService } from './service/reservas-lectura.service';

// Usuarios consulta pendientes y Publicaciones verifica acceso a publicaciones eliminadas sin importar todo ReservasModule.
@Module({
  imports: [TypeOrmModule.forFeature([Reserva, ReprogramacionReserva])],
  providers: [ReservaRepository, { provide: RESERVA_REPOSITORY, useExisting: ReservaRepository }, ReservasLecturaService],
  // ReservasModule reutiliza el mismo repositorio para gestionar reservas y reprogramaciones.
  exports: [RESERVA_REPOSITORY, ReservasLecturaService],
})
export class ReservasLecturaModule {}
