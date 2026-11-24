/**
 * Nombre visible del rol. En la base el rol por defecto se llama "Usuario"
 * (lo asigna UsuariosService.crear), pero en la interfaz se muestra como "Inquilino".
 */
export function etiquetaRol(nombreRol) {
    return !nombreRol || nombreRol === 'Usuario' ? 'Inquilino' : nombreRol;
}
