import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    // 1. Leer los roles requeridos del decorador @Roles()
    const required = this.reflector.getAllAndOverride<string[] | undefined>(
      ROLES_KEY,
      [ctx.getHandler(), ctx.getClass()],
    );

    // 2. Si el handler no tiene @Roles(), dejar pasar
    if (!required?.length) return true;

    // 3. Leer el rol cargado por JwtAuthGuard (viene del payload del JWT)
    const req = ctx.switchToHttp().getRequest();
    const rol = req.user?.rol as string | undefined;

    // 4. Verificar que el rol del usuario está entre los requeridos
    return !!rol && required.includes(rol);
  }
}