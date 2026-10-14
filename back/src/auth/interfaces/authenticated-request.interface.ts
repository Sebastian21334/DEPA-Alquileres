import { Request } from 'express';
import type { Anunciante } from '../../anunciantes/entity/anunciante.entity';

export interface AuthenticatedRequest extends Request {
  // JwtStrategy transforma sub del token en id antes de llegar al controller.
  user: {
    id: number;
    email?: string;
    rol?: string;
  };
}

/** Disponible después de JwtAuthGuard y AnuncianteGuard. */
export interface AnuncianteRequest extends AuthenticatedRequest {
  anunciante: Anunciante;
}
