import { Module } from '@nestjs/common';
import { MailModule } from '../mail/mail.module';
import { ReservasModule } from '../reservas/reservas.module';
import { SeguridadModule } from '../seguridad/seguridad.module';
import { BloqueoAnuncianteController } from './controller/bloqueo-anunciante.controller';
import { BloqueoAnuncianteService } from './service/bloqueo-anunciante.service';

import { UsuariosModule } from '../usuarios/usuarios.module';

@Module({
  imports: [UsuariosModule, ReservasModule, SeguridadModule, MailModule],
  controllers: [BloqueoAnuncianteController],
  providers: [BloqueoAnuncianteService],
})
export class BloqueoAnuncianteModule {}
