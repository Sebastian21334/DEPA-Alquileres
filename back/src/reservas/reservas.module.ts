import { ReservaFinalizacionService } from './service/reserva-finalizacion.service';
import { ReservaCreacionService } from './service/reserva-creacion.service';
import { ReservaConsultaService } from './service/reserva-consulta.service';
import { ReservaVencimientoService } from './service/reserva-vencimiento.service';
import { ReservaBloqueoAnuncianteService } from './service/reserva-bloqueo-anunciante.service';
import { ReservaBloqueoDevolucionService } from './service/reserva-bloqueo-devolucion.service';
import { ReservaCancelacionesService } from './service/reserva-cancelaciones.service';
import { ReservaSolicitudCancelacionService } from './service/reserva-solicitud-cancelacion.service';
import { ReservaSolicitudCancelacionResolucionService } from './service/reserva-solicitud-cancelacion-resolucion.service';
import { ReservaReembolsoAplicacionService } from './service/reserva-reembolso-aplicacion.service';
import { ReservaCicloVidaService } from './service/reserva-ciclo-vida.service';
import { ReservaEstadoService } from './service/reserva-estado.service';
import { ReservaLiquidacionesService } from './service/reserva-liquidaciones.service';
import { ReservaNotificacionesService } from './service/reserva-notificaciones.service';
import { ReservaReprogramacionService } from './service/reserva-reprogramacion.service';
// reservas.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reserva } from './entity/reserva.entity';
import { ReprogramacionReserva } from './entity/reprogramacion-reserva.entity';
import { SolicitudCancelacion } from './entity/solicitud-cancelacion.entity';
import { ReservasService } from './service/reservas.service';
import { ReservasController } from './controller/reservas.controller';
import { ReservaRepository } from './repository/reserva.repository';
import { RESERVA_REPOSITORY } from './repository/reserva.repository.interface';
import { DisponibilidadModule } from '../disponibilidad/disponibilidad.module';
import { SeguridadModule } from '../seguridad/seguridad.module';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { PublicacionesModule } from '../publicaciones/publicaciones.module';
import { MailModule } from '../mail/mail.module';
import { ReembolsosModule } from '../reembolsos/reembolsos.module';
import { PagosModule } from '../pagos/pagos.module';

@Module({
  imports: [
    // Reserva se guarda con TypeORM y delega disponibilidad en otro módulo.
    TypeOrmModule.forFeature([
      Reserva,
      ReprogramacionReserva,
      SolicitudCancelacion,
    ]),
    DisponibilidadModule,
    SeguridadModule,
    UsuariosModule,
    PublicacionesModule,
    MailModule,
    ReembolsosModule,
    PagosModule,
  ],
  controllers: [ReservasController],
  providers: [
    ReservaFinalizacionService,
    ReservaCreacionService,
    ReservaEstadoService,
    ReservaCicloVidaService,
    ReservaCancelacionesService,
    ReservaSolicitudCancelacionService,
    ReservaSolicitudCancelacionResolucionService,
    ReservaBloqueoAnuncianteService,
    ReservaBloqueoDevolucionService,
    ReservaReembolsoAplicacionService,
    ReservaConsultaService,
    ReservaVencimientoService,
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
  exports: [
    ReservasService,
    ReservaEstadoService,
    ReservaCancelacionesService,
    ReservaBloqueoAnuncianteService,
    ReservaReembolsoAplicacionService,
    ReservaConsultaService,
  ],
})
export class ReservasModule {}
