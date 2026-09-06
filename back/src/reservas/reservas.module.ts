// reservas.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reserva } from './entity/reserva.entity';
import { ReservasService } from './service/reservas.service';
import { ReservasController } from './controller/reservas.controller';
import { ReservaRepository } from './repository/reserva.repository';
import { RESERVA_REPOSITORY } from './repository/reserva.repository.interface';
import { DisponibilidadModule } from '../disponibilidad/disponibilidad.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Reserva]),
    DisponibilidadModule,
    AuthModule,
  ],
  controllers: [ReservasController],
  providers: [
    ReservasService,
    ReservaRepository,
    {
      provide: RESERVA_REPOSITORY,
      useExisting: ReservaRepository, // el token apunta a la misma instancia de ReservaRepository
    },
  ],
})
export class ReservasModule {}