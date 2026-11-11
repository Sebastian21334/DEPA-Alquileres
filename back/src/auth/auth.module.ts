import { Module } from '@nestjs/common';
import { AuthService } from './service/auth.service';
import { AuthController } from './controller/auth.controller';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { MailModule } from '../mail/mail.module';
import { SeguridadModule } from '../seguridad/seguridad.module';

@Module({
  imports: [UsuariosModule, MailModule, SeguridadModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
