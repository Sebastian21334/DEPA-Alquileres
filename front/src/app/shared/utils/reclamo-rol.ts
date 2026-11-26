import type { AutorReclamo, Reclamo } from '../services/reservation.service';

export type RolEnReclamo = 'inquilino' | 'anunciante';

/** Con qué rol participa un usuario en un reclamo; null si no es parte (por ejemplo, el admin). */
export function rolEnReclamo(reclamo: Reclamo, idUsuario: number): RolEnReclamo | null {
  if (reclamo.inquilino?.id === idUsuario) return 'inquilino';
  if (reclamo.anunciante?.id === idUsuario) return 'anunciante';
  return null;
}

/** El reclamo más reciente de una reserva: al que llevan los avisos por correo, que solo conocen la reserva. */
export function reclamoDeLaReserva(reclamos: readonly Reclamo[], idReserva: number): Reclamo | undefined {
  return reclamos.filter((reclamo) => reclamo.reserva?.id === idReserva).sort((a, b) => b.id - a.id)[0];
}

const ETIQUETAS_ROL: Record<RolEnReclamo, string> = { inquilino: 'Inquilino', anunciante: 'Anunciante' };

/**
 * Cómo se presenta el autor de un mensaje o una imagen del reclamo: «Admin» solo si escribió desde el panel de
 * Administración; si es parte de la reserva, con su rol en ella aunque su cuenta sea de administrador.
 */
export function etiquetaAutorReclamo(reclamo: Reclamo, autor: AutorReclamo | null | undefined, desdeAdministracion = false): string {
  if (!autor) return '';
  if (desdeAdministracion) return 'Admin';
  const rol = rolEnReclamo(reclamo, autor.id);
  if (rol) return ETIQUETAS_ROL[rol];
  // Un administrador que no es parte, por ejemplo en las imágenes que sumó a la descripción.
  return autor.rol?.nombre === 'Administrador' ? 'Admin' : '';
}
