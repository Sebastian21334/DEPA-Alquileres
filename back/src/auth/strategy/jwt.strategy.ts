import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(cfg: ConfigService) {
    super({
      // Solo acepta tokens enviados como "Authorization: Bearer <token>".
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // Passport rechaza automáticamente tokens vencidos.
      ignoreExpiration: false,
      // El mismo secreto usado al firmar permite verificar la firma del token.
      secretOrKey: cfg.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: { sub: number; email: string; rol?: string }) {
    // El payload ya trae lo necesario (firmado en AuthService.login).
    // Evitamos una query extra por cada request protegido.
    // Passport coloca este objeto en req.user para que lo usen controllers y guards.
    return { id: payload.sub, email: payload.email, rol: payload.rol };
  }
}