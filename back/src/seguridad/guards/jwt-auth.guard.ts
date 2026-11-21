import { ExecutionContext, ForbiddenException, Injectable, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';

/** JwtStrategy deja el usuario autenticado disponible en la solicitud. */
export type AuthenticatedRequest = Request & {
  user: {
    id: number;
    email?: string;
    rol?: string;
    accesoLimitado?: boolean;
    anuncianteVerificado?: boolean;
  };
};

const ACCESO_LIMITADO = 'acceso-limitado';
export const PermitirAccesoLimitado = () => SetMetadata(ACCESO_LIMITADO, true);

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (!await super.canActivate(context)) return false;
    const { user } = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if (!user.accesoLimitado) return true;
    const permitido = this.reflector.getAllAndOverride<boolean>(ACCESO_LIMITADO, [
      context.getHandler(), context.getClass(),
    ]);
    if (!permitido) {
      throw new ForbiddenException({
        codigo: 'ACCESO_LIMITADO',
        anuncianteVerificado: user.anuncianteVerificado === true,
        message: 'Tu cuenta solo tiene acceso a operaciones pendientes y a la apelación del bloqueo.',
      });
    }
    return true;
  }
}
