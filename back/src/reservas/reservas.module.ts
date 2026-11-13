import { CatalogosModule } from '../catalogos/catalogos.module';
import { LiquidacionesModule } from '../liquidaciones/liquidaciones.module';
import { ReservaCicloVidaService } from './service/reserva-ciclo-vida.service';
import { ReservaDecisionService } from './service/reserva-decision.service';
import { ReservaFinalizacionService } from './service/reserva-finalizacion.service';
import { ReservaLiquidacionesService } from './service/reserva-liquidaciones.service';
import { ReservaNotificacionesService } from './service/reserva-notificaciones.service';
import { ReservaReprogramacionService } from './service/reserva-reprogramacion.service';
import { ReservaBloqueoAnuncianteService } from './service/reserva-bloqueo-anunciante.service';
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
import { AnunciantesModule } from '../anunciantes/anunciantes.module';
import { MailModule } from '../mail/mail.module';
import { ReembolsosModule } from '../reembolsos/reembolsos.module';
import { ReservasConsultaModule } from '../reservas-consulta/reservas-consulta.module';

@Module({
  imports: [
    CatalogosModule,
    LiquidacionesModule,
    // Reserva se guarda con TypeORM y delega disponibilidad en otro módulo.
    TypeOrmModule.forFeature([
      Reserva,
      ReprogramacionReserva,
    ]),
    DisponibilidadModule,
    SeguridadModule,
    UsuariosModule,
    PublicacionesModule,
    AnunciantesModule,
    MailModule,
    ReembolsosModule,
    ReservasConsultaModule,
  ],
  controllers: [ReservasController],
  providers: [
    ReservaCicloVidaService,
    ReservaDecisionService,
    ReservaFinalizacionService,
    ReservaLiquidacionesService,
    ReservaNotificacionesService,
    ReservaReprogramacionService,
    ReservaBloqueoAnuncianteService,
    // El token desacopla el service de la implementación concreta del repositorio.
    ReservasService,
    ReservaRepository,
    {
      provide: RESERVA_REPOSITORY,
      useExisting: ReservaRepository, // el token apunta a la misma instancia de ReservaRepository
    },
  ],
  exports: [
    ReservasService,
    ReservaCicloVidaService,
    ReservaDecisionService,
    ReservaBloqueoAnuncianteService,
  ],
})
export class ReservasModule {}
