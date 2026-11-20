import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from './guards/optional-jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { SeguridadService } from './service/seguridad.service';
import { JwtStrategy } from './strategy/jwt.strategy';

@Module({
  imports: [
    ConfigModule,
    // Usuarios, Catálogos y Publicaciones también importan Seguridad.
    // La carga diferida evita resolverlos mientras este módulo se está definiendo.
    forwardRef(() => (require('../usuarios/usuarios.module') as typeof import('../usuarios/usuarios.module')).UsuariosModule),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const segundos = Number(
          configService.get<string>('JWT_EXPIRES_SEC') ?? 3600,
        );
        return {
          secret: configService.getOrThrow<string>('JWT_SECRET'),
          signOptions: {
            expiresIn:
              Number.isFinite(segundos) && segundos > 0 ? segundos : 3600,
          },
        };
      },
    }),
  ],
  providers: [JwtAuthGuard, OptionalJwtAuthGuard, RolesGuard, JwtStrategy, SeguridadService],
  exports: [JwtModule, PassportModule, JwtAuthGuard, OptionalJwtAuthGuard, RolesGuard],
})
export class SeguridadModule {}
