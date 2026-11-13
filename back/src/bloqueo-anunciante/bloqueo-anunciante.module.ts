import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailModule } from '../mail/mail.module';
import { PublicacionesModule } from '../publicaciones/publicaciones.module';
import { ReservasModule } from '../reservas/reservas.module';
import { SeguridadModule } from '../seguridad/seguridad.module';
import { Usuario } from '../usuarios/entity/usuario.entity';
import { BloqueoAnuncianteController } from './controller/bloqueo-anunciante.controller';
import { BLOQUEO_ANUNCIANTE_REPOSITORY } from './repository/bloqueo-anunciante.repository.interface';
import { BloqueoAnuncianteRepository } from './repository/bloqueo-anunciante.repository';
import { BloqueoAnuncianteService } from './service/bloqueo-anunciante.service';

@Module({
  imports: [TypeOrmModule.forFeature([Usuario]), ReservasModule, SeguridadModule, PublicacionesModule, MailModule],
  controllers: [BloqueoAnuncianteController],
  providers: [
    BloqueoAnuncianteService,
    BloqueoAnuncianteRepository,
    { provide: BLOQUEO_ANUNCIANTE_REPOSITORY, useExisting: BloqueoAnuncianteRepository },
  ],
})
export class BloqueoAnuncianteModule {}
