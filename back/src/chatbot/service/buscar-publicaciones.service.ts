import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CatalogosService } from '../../catalogos/service/catalogos.service';
import { monedaPublicacion } from '../../common/utils/importes';
import { PublicacionesService } from '../../publicaciones/service/publicaciones.service';
import { UbicacionService } from '../../ubicacion/service/ubicacion.service';
import { BuscarPublicacionesDto, DEFINICION_BUSCAR_PUBLICACIONES } from '../dto/buscar-publicaciones.dto';

export interface PublicacionChatbot {
  id: number;
  titulo: string;
  ciudad: string;
  modalidad: string;
  precio: number;
  moneda: string;
  ambientes: number;
}

const LIMITE_PUBLICACIONES = 5;
const FILTROS_INVALIDOS = { error: 'Filtros inválidos. Revisá los parámetros de búsqueda y el rango de precio.' } as const;

@Injectable()
export class BuscarPublicacionesService {
  constructor(private readonly publicaciones: PublicacionesService, private readonly ubicacion: UbicacionService, private readonly catalogos: CatalogosService) {}

  async buscar(argumentos: string): Promise<{ publicaciones: PublicacionChatbot[] } | typeof FILTROS_INVALIDOS> {
    let datos: unknown;
    try {
      if (argumentos.length > 2_000) return FILTROS_INVALIDOS;
      datos = JSON.parse(argumentos);
    } catch {
      return FILTROS_INVALIDOS;
    }

    if (!datos || typeof datos !== 'object' || Array.isArray(datos)) return FILTROS_INVALIDOS;
    const campos = DEFINICION_BUSCAR_PUBLICACIONES.function.parameters.properties;
    if (Object.keys(datos).some((campo) => !Object.hasOwn(campos, campo))) return FILTROS_INVALIDOS;

    const dto = plainToInstance(BuscarPublicacionesDto, datos);
    const errores = await validate(dto, { whitelist: true, forbidNonWhitelisted: true, forbidUnknownValues: true });
    if (errores.length || (dto.precioMin != null && dto.precioMax != null && dto.precioMin > dto.precioMax)) {
      return FILTROS_INVALIDOS;
    }

    const [idsCiudad, monedas] = await Promise.all([
      dto.ciudad ? this.ubicacion.buscarIdsCiudadesPorNombre(dto.ciudad) : undefined,
      dto.moneda ? this.catalogos.getTiposMoneda() : undefined,
    ]);
    const idsTipoMoneda = monedas?.filter(({ nombre }) => monedaPublicacion(nombre) === dto.moneda).map(({ id }) => id);
    // Un catálogo sin coincidencias no debe convertirse en una búsqueda sin filtro.
    if (idsCiudad?.length === 0 || idsTipoMoneda?.length === 0) return { publicaciones: [] };

    const resultado = await this.publicaciones.listarActivas(1, LIMITE_PUBLICACIONES, dto.modalidad ?? undefined, {
      busqueda: dto.q ?? undefined,
      ambientes: dto.ambientes ?? undefined,
      precioMin: dto.precioMin ?? undefined,
      precioMax: dto.precioMax ?? undefined,
      superficieMin: dto.superficieMin ?? undefined,
      idsCiudad,
      idsTipoMoneda,
    });
    return {
      publicaciones: resultado.datos.slice(0, LIMITE_PUBLICACIONES).map((publicacion) => ({
        id: publicacion.id,
        titulo: publicacion.titulo,
        ciudad: publicacion.ciudad.nombre,
        modalidad: publicacion.modalidad.nombre,
        precio: Number(publicacion.precio),
        moneda: publicacion.tipoMoneda.nombre,
        ambientes: publicacion.cantidad_ambientes,
      })),
    };
  }
}
