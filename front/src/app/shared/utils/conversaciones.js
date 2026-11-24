/** Devuelve el participante que no es el usuario autenticado. */
export function interlocutor(conversacion) {
    const mensaje = conversacion.ultimoMensaje;
    return mensaje.origenUsuario.id === conversacion.idOtroUsuario
        ? mensaje.origenUsuario
        : mensaje.destinoUsuario;
}
export function nombreInterlocutor(conversacion) {
    const usuario = interlocutor(conversacion);
    return [usuario.nombre, usuario.apellido].filter(Boolean).join(' ').trim();
}
