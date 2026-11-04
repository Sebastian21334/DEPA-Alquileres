export function moverImagen<T>(imagenes: readonly T[], desde: number, hasta: number): T[] {
  const lista = [...imagenes];
  if (!Number.isInteger(desde) || !Number.isInteger(hasta) ||
      desde < 0 || hasta < 0 || desde >= lista.length || hasta >= lista.length) return lista;
  const [imagen] = lista.splice(desde, 1);
  lista.splice(hasta, 0, imagen);
  return lista;
}
