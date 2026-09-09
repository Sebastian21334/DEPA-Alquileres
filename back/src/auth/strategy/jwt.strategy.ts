import { Injectable, Inject, UnauthorizedException, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsuariosService } from '../../usuarios/service/usuarios.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    cfg: ConfigService,
    @Inject(forwardRef(() => UsuariosService))
    private readonly usuariosService: UsuariosService,
  ) {
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
    // Se consulta el estado actual para revocar inmediatamente el acceso de usuarios bloqueados.
    const usuario = await this.usuariosService.buscarPorId(payload.sub);
    if (!usuario || usuario.bloqueado) {
      throw new UnauthorizedException('La cuenta no está habilitada');
    }

    // El rol actual también se refresca, evitando confiar en un rol antiguo del JWT.
    return { id: usuario.id, email: usuario.email, rol: usuario.rol?.nombre };
  }
}