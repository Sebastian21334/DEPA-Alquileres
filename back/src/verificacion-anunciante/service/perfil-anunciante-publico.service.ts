import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { AnunciantesService } from '../../anunciantes/service/anunciantes.service';
import { CatalogosService } from '../../catalogos/service/catalogos.service';
import type { AnunciantePublicoDto } from '../dto/anunciante-publico.dto';
import {
  VERIFICACION_REPOSITORY,
  type IVerificacionRepository,
} from '../repository/verificacion.repository.interface';

@Injectable()
export class PerfilAnunciantePublicoService {
  constructor(
    private readonly anunciantesService: AnunciantesService,
    private readonly catalogosService: CatalogosService,
    @Inject(VERIFICACION_REPOSITORY) private readonly verificacionRepo: IVerificacionRepository,
  ) {}

  async buscarPerfilPublico(idUsuario: number): Promise<AnunciantePublicoDto> {
    const anunciante = await this.anunciantesService.buscarPorId(idUsuario);
    if (!anunciante?.verificado) throw new NotFoundException('Anunciante no encontrado');

    const solicitud = await this.verificacionRepo.buscarSolicitudPorAnunciante(idUsuario);
    const aprobada = solicitud?.estado === this.catalogosService.codigoEstado('VERIFICACION_ANUNCIANTE', 'aprobada');
    const razonSocial = aprobada ? solicitud?.razon_social?.trim() : '';

    return {
      idUsuario: anunciante.idUsuario,
      nombre_publico: razonSocial || this.anunciantesService.datosContacto(anunciante).nombre || 'Anunciante',
      tipoAnunciante: anunciante.tipoAnunciante
        ? { id: anunciante.tipoAnunciante.id, nombre: anunciante.tipoAnunciante.nombre }
        : null,
      verificado: anunciante.verificado,
      numero_contacto: anunciante.numero_contacto,
      foto_url: anunciante.usuario?.foto_url ?? null,
      cantidad_resenas: anunciante.cantidad_resenas,
      promedio_resenas: anunciante.promedio_resenas == null
        ? null
        : Number(anunciante.promedio_resenas),
    };
  }
}
