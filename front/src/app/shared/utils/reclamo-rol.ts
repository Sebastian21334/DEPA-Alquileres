import type { Reclamo } from '../services/reservation.service';

export type RolEnReclamo = 'inquilino' | 'anunciante';

/** Con qué rol participa un usuario en un reclamo; null si no es parte (por ejemplo, el admin). */
export function rolEnReclamo(reclamo: Reclamo, idUsuario: number): RolEnReclamo | null {
  if (reclamo.inquilino?.id === idUsuario) return 'inquilino';
  if (reclamo.anunciante?.id === idUsuario) return 'anunciante';
  return null;
}
