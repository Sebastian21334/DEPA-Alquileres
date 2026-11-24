import { SetMetadata } from '@nestjs/common';
import type { NombreRol } from '../../catalogos/codigos-catalogo';

export const ROLES_KEY = 'roles';

// @Roles(ROL.ADMINISTRADOR) guarda metadata que luego lee RolesGuard.
export const Roles = (...roles: NombreRol[]) => SetMetadata(ROLES_KEY, roles);
