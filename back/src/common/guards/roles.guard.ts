import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    // 1. Busca metadata tanto en el método como en la clase; el método tiene prioridad.
    const required = this.reflector.getAllAndOverride<string[] | undefined>(
      ROLES_KEY,
      [ctx.getHandler(), ctx.getClass()],
    );

    // 2. Sin metadata de roles no hay restricción de rol para este endpoint.
    if (!required?.length) return true;

    // 3. JwtStrategy ya validó el token y dejó el rol disponible en req.user.
    const req = ctx.switchToHttp().getRequest();
    const rol = req.user?.rol as string | undefined;

    // 4. La autorización es inclusiva: alcanza con que coincida uno de los roles.
    return !!rol && required.includes(rol);
  }
}