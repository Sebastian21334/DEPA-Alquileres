import { Module } from '@nestjs/common';
import { AuthService } from './service/auth.service';
import { AuthController } from './controller/auth.controller';
import { JwtStrategy } from './strategy/jwt.strategy';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { MailModule } from '../mail/mail.module';
import { SeguridadModule } from '../seguridad/seguridad.module';

@Module({
  imports: [UsuariosModule, MailModule, SeguridadModule],
  controllers: [AuthController],
  // Consulta el usuario actual; se registra una sola vez junto a los flujos de acceso.
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
