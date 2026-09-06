import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  // JwtStrategy transforma sub del token en id antes de llegar al controller.
  user: {
    id: number; // ajustá el nombre si tu JwtStrategy devuelve otro campo (ej: id_usuario)
  };
}