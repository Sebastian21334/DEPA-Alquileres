import { Anunciante } from './anunciante.model';
import { Ciudad, Provincia } from './ubicacion.model';
import { Imagen } from './imagen.model';
import { Modalidad, TipoMoneda, TipoPropiedad } from './catalogo.model';

// Refleja la entidad `Publicacion` (back/src/publicaciones/entity/publicacion.entity.ts),
// tal como la serializa GET /publicaciones. RN-10/RN-21: solo llegan publicaciones
// activas (el backend actual no tiene una columna "validada" separada de "activa";
// `activa` cumple ese rol hoy).
export interface Publicacion {
  id: number;
  titulo: string;
  descripcion: string;
  fecha_publicacion: string;
  precio: number;
  activa: boolean;
  /** Cantidad de reservas no canceladas; llega desde GET /publicaciones/destacadas. */
  cantidad_reservas?: number;

  // Datos del inmueble, embebidos (ver Propiedad en propiedad.model.ts).
  direccion: string;
  latitud?: number | null;
  longitud?: number | null;
  cantidad_ambientes: number;
  superficie: number;

  tipoMoneda?: TipoMoneda;
  modalidad?: Modalidad;
  tipoPropiedad?: TipoPropiedad;
  provincia?: Provincia;
  ciudad?: Ciudad;

  anunciante?: Anunciante;
  imagenes?: Imagen[];
}

export interface PublicacionPayload {
  titulo: string;
  descripcion: string;
  precio: number;
  direccion: string;
  latitud: number;
  longitud: number;
  cantidad_ambientes: number;
  superficie: number;
  idTipoMoneda: number;
  idModalidad: number;
  idProvincia: number;
  idCiudad: number;
  idTipoPropiedad: number;
}
