import { TipoPropiedad } from './catalogo.model';
import { Provincia, Ciudad } from './ubicacion.model';

// NOTA: en el DER y en la entidad TypeORM `Publicacion`, los datos del inmueble
// (dirección, tipo, ambientes, superficie, ubicación) están embebidos directamente
// en la tabla `publicacion` — no existe una tabla/entidad `Propiedad` separada en
// el backend actual. Esta interfaz agrupa semánticamente esos campos (tal como
// pide el dominio del proyecto) tomando un subconjunto de `Publicacion`, sin
// agregar campos que no estén en el diagrama (ej.: no incluye "baños", que no
// existe en la entidad).
export interface Propiedad {
  direccion: string;
  cantidad_ambientes: number;
  superficie: number;
  tipoPropiedad?: TipoPropiedad;
  provincia?: Provincia;
  ciudad?: Ciudad;
}
