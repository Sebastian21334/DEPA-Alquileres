import { InternalServerErrorException } from '@nestjs/common';
import { formatearNombreCompleto } from '../../common/utils/nombres';
import type { Resena } from '../entity/resena.entity';
import type { ResenaImagen } from '../entity/resena-imagen.entity';
import type {
  ObjetivoResenaDto,
  ResenaAdministracionDto,
  ResenaImagenDto,
  ResenaPublicaDto,
} from '../dto/resena-respuesta.dto';

interface ResenaPublicaConModeracionDto extends ResenaPublicaDto {
  visible: boolean;
  motivo_moderacion: string | null;
  fecha_moderacion: Date | null;
  denunciada: boolean;
}

/** Traduce la entidad a la respuesta pública; nunca expone datos privados del autor. */
export function prepararResena(resena: Resena, incluirModeracion: true): ResenaPublicaConModeracionDto;
export function prepararResena(resena: Resena, incluirModeracion?: false): ResenaPublicaDto;
export function prepararResena(resena: Resena, incluirModeracion = false): ResenaPublicaDto {
  const imagenes = [...(resena.imagenes ?? [])]
    .sort((a, b) => a.orden - b.orden || a.id - b.id);
  return {
    id: resena.id,
    puntaje: resena.puntaje,
    comentario: resena.comentario,
    fecha: resena.fecha,
    actualizada_en: resena.actualizada_en,
    autor: {
      id: resena.autor.id,
      nombre: resena.autor.nombre,
      apellido: resena.autor.apellido,
      foto_url: resena.autor.foto_url,
    },
    imagenes: imagenes.map(prepararImagen),
    denunciada: resena.denunciada,
    ...(incluirModeracion
      ? {
          visible: resena.visible,
          motivo_moderacion: resena.motivo_moderacion,
          fecha_moderacion: resena.fecha_moderacion,
        }
      : {}),
  };
}

/** El mapper base ya aporta visibilidad, moderación y denuncia. */
export function prepararResenaAdministracion(resena: Resena): ResenaAdministracionDto {
  return {
    ...prepararResena(resena, true),
    objetivo: objetivoDeResena(resena),
    moderador: resena.moderador
      ? {
          id: resena.moderador.id,
          nombre: resena.moderador.nombre,
          apellido: resena.moderador.apellido,
        }
      : null,
    motivo_denuncia: resena.motivo_denuncia,
    fecha_denuncia: resena.fecha_denuncia,
  };
}

export function objetivoDeResena(resena: Resena): ObjetivoResenaDto {
  if (resena.publicacion) {
    return {
      tipo: 'PUBLICACION',
      id: resena.publicacion.id,
      titulo: resena.publicacion.titulo,
    };
  }
  if (resena.anunciante) {
    const nombre = formatearNombreCompleto(
      resena.anunciante.usuario?.nombre,
      resena.anunciante.usuario?.apellido,
    );
    return {
      tipo: 'ANUNCIANTE',
      id: resena.anunciante.idUsuario,
      titulo: nombre || 'Anunciante',
    };
  }
  throw new InternalServerErrorException(
    `La reseña ${resena.id} no tiene un objetivo válido.`,
  );
}

export function prepararImagen(imagen: ResenaImagen): ResenaImagenDto {
  return { id: imagen.id, url: imagen.url, orden: imagen.orden };
}
