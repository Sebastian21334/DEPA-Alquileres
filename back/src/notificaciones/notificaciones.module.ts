import { Module } from '@nestjs/common';
import { MailModule } from '../mail/mail.module';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { NotificacionesService } from './service/notificaciones.service';

@Module({
  imports: [MailModule, UsuariosModule],
  providers: [NotificacionesService],
  exports: [NotificacionesService],
})
export class NotificacionesModule {}
