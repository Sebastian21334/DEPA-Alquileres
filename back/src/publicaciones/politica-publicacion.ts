import type { Publicacion } from './entity/publicacion.entity';

/** No modifica activa: al habilitar la cuenta se respeta la pausa elegida por el dueño. */
export function cuentaAnuncianteHabilitada(publicacion: Publicacion): boolean {
  const usuario = publicacion.anunciante?.usuario;
  return usuario?.activa === true && usuario.bloqueado === false;
}

export function publicacionVisible(publicacion: Publicacion): boolean {
  return publicacion.activa && cuentaAnuncianteHabilitada(publicacion) &&
    !publicacion.motivo_baja_admin && (publicacion.imagenes?.length ?? 0) > 0;
}
