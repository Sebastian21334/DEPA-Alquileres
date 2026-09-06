import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './service/auth.service';
import { AuthController } from './controller/auth.controller';
import { Usuario } from '../usuarios/entity/usuario.entity';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategy/jwt.strategy';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    // Passport conecta los endpoints protegidos con la estrategia JWT.
    PassportModule.register({ defaultStrategy: 'jwt' }),
    // Hace disponible la entidad para cualquier repositorio TypeORM del módulo.
    TypeOrmModule.forFeature([Usuario]),
    // Auth y Usuarios se necesitan mutuamente; forwardRef retrasa la resolución circular.
    forwardRef(() => UsuariosModule),
    MailModule,
    JwtModule.registerAsync({
      imports: [ConfigModule], 
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        // El secreto firma los tokens; expiresIn limita su vigencia a una hora.
        secret: configService.get<string>('JWT_SECRET') || 'secreto_super_seguro',
        signOptions: { expiresIn: '1h' },
      }),
    }),
  ],
  controllers: [AuthController],
  // JwtStrategy es utilizada internamente por Passport para validar Bearer tokens.
  providers: [AuthService, JwtStrategy],
  // Otros módulos necesitan registrar guards basados en Passport/JWT.
  exports: [PassportModule, JwtModule],
})
export class AuthModule {}