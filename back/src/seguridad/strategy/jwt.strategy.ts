import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { SeguridadService } from '../service/seguridad.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(cfg: ConfigService, private readonly seguridadService: SeguridadService) {
    super({
      // Solo acepta tokens enviados como "Authorization: Bearer <token>".
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // Passport rechaza automáticamente tokens vencidos.
      ignoreExpiration: false,
      // El mismo secreto usado al firmar permite verificar la firma del token.
      secretOrKey: cfg.getOrThrow<string>('JWT_SECRET'),
    });
  }

  validate(payload: { sub?: unknown } | null) {
    return this.seguridadService.validarSesion(payload?.sub);
  }
}
