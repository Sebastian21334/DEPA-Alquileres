import { Module } from '@nestjs/common';
import { MailModule } from '../mail/mail.module';
import { SeguridadModule } from '../seguridad/seguridad.module';
import { BloqueoAnuncianteController } from './controller/bloqueo-anunciante.controller';
import { BloqueoAnuncianteService } from './service/bloqueo-anunciante.service';

import { UsuariosModule } from '../usuarios/usuarios.module';

@Module({
  imports: [UsuariosModule, SeguridadModule, MailModule],
  controllers: [BloqueoAnuncianteController],
  providers: [BloqueoAnuncianteService],
})
export class BloqueoAnuncianteModule {}
