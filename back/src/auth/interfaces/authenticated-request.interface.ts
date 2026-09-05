import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user: {
    id: number; // ajustá el nombre si tu JwtStrategy devuelve otro campo (ej: id_usuario)
  };
}