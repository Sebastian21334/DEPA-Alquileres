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

  // Datos del inmueble, embebidos (ver Propiedad en propiedad.model.ts).
  direccion: string;
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
