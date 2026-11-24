export function moverImagen(imagenes, desde, hasta) {
    const lista = [...imagenes];
    if (!Number.isInteger(desde) || !Number.isInteger(hasta) ||
        desde < 0 || hasta < 0 || desde >= lista.length || hasta >= lista.length)
        return lista;
    const [imagen] = lista.splice(desde, 1);
    lista.splice(hasta, 0, imagen);
    return lista;
}
