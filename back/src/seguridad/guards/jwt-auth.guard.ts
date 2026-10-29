import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';

/** JwtStrategy deja el usuario autenticado disponible en la solicitud. */
export type AuthenticatedRequest = Request & {
  user: {
    id: number;
    email?: string;
    rol?: string;
  };
};

@Injectable()
// Wrapper pequeño: delega toda la validación de Bearer/JWT a Passport.
export class JwtAuthGuard extends AuthGuard('jwt') {}
