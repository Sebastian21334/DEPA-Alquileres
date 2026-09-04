import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(cfg: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: cfg.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: { sub: number; email: string; rol?: string }) {
    // El payload ya trae lo necesario (firmado en AuthService.login).
    // Evitamos una query extra por cada request protegido.
    return { id: payload.sub, email: payload.email, rol: payload.rol };
  }
}