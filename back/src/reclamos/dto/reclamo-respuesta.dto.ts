import type { Reclamo } from '../entity/reclamo.entity';
import type { VisibilidadMensajeReclamo } from '../entity/reclamo-mensaje.entity';

/** Datos mínimos de quien escribió un mensaje o subió una imagen. */
export interface AutorReclamo {
  id: number;
  nombre: string;
  apellido: string;
  rol: { nombre: string } | null;
}

/** T49: imagen de un reclamo con su autor y un enlace firmado de 15 minutos; sin la ruta interna del archivo. */
export interface ImagenReclamo {
  id: number;
  /** null: es de la descripción del reclamo (se subió al crearlo o antes de T49). */
  id_mensaje: number | null;
  nombre_archivo: string;
  creado_en: Date;
  autor: AutorReclamo | null;
  url: string;
}

export interface MensajeReclamoRespuesta {
  id: number;
  texto: string;
  visible_para: VisibilidadMensajeReclamo;
  creado_en: Date;
  autor: AutorReclamo | null;
  evidencias: ImagenReclamo[];
}

/** Reclamo tal como lo recibe el front: `evidencias` son las imágenes de la descripción y cada mensaje trae las suyas. */
export type ReclamoRespuesta = Omit<Reclamo, 'evidencias' | 'mensajes'> & {
  evidencias: ImagenReclamo[];
  mensajes: MensajeReclamoRespuesta[];
};
