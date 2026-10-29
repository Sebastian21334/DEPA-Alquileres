import { ReservaLiquidacionesService } from './service/reserva-liquidaciones.service';
import { ReservaNotificacionesService } from './service/reserva-notificaciones.service';
import { ReservaReprogramacionService } from './service/reserva-reprogramacion.service';
// reservas.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reserva } from './entity/reserva.entity';
import { ReprogramacionReserva } from './entity/reprogramacion-reserva.entity';
import { ReservasService } from './service/reservas.service';
import { ReservasController } from './controller/reservas.controller';
import { ReservaRepository } from './repository/reserva.repository';
import { RESERVA_REPOSITORY } from './repository/reserva.repository.interface';
import { DisponibilidadModule } from '../disponibilidad/disponibilidad.module';
import { SeguridadModule } from '../seguridad/seguridad.module';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { PublicacionesModule } from '../publicaciones/publicaciones.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    // Reserva se guarda con TypeORM y delega disponibilidad en otro módulo.
    TypeOrmModule.forFeature([Reserva, ReprogramacionReserva]),
    DisponibilidadModule,
    SeguridadModule,
    UsuariosModule,
    PublicacionesModule,
    MailModule,
  ],
  controllers: [ReservasController],
  providers: [
    ReservaLiquidacionesService,
    ReservaNotificacionesService,
    ReservaReprogramacionService,
    // El token desacopla el service de la implementación concreta del repositorio.
    ReservasService,
    ReservaRepository,
    {
      provide: RESERVA_REPOSITORY,
      useExisting: ReservaRepository, // el token apunta a la misma instancia de ReservaRepository
    },
  ],
  exports: [ReservasService],
})
export class ReservasModule {}
