import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ANUNCIANTES_REPOSITORY } from '../repository/anunciantes.repository.interface';
import type { IAnunciantesRepository } from '../repository/anunciantes.repository.interface';
import { SolicitarAnuncianteDto } from '../dto/solicitar-anunciante.dto';
import { UsuariosService } from '../../usuarios/service/usuarios.service';
import { CatalogosService } from '../../catalogos/service/catalogos.service';

@Injectable()
export class AnunciantesService {
  constructor(
    @Inject(ANUNCIANTES_REPOSITORY)
    private readonly anunciantesRepo: IAnunciantesRepository,
    private usuariosService: UsuariosService,
    private catalogosService: CatalogosService,
  ) {}

  async solicitarAlta(idUsuario: number, dto: SolicitarAnuncianteDto) {
    const usuario = await this.usuariosService.buscarPorId(idUsuario);
    if (!usuario) throw new NotFoundException('Usuario no encontrado');

    const existeAnunciante = await this.anunciantesRepo.buscarPorUsuario(idUsuario);
    if (existeAnunciante) throw new ConflictException('El usuario ya solicitó ser anunciante');

    const tipoAnunciante = await this.catalogosService.getTipoAnunciantePorId(dto.idTipoAnunciante);
    
    if (!tipoAnunciante) throw new NotFoundException('Tipo de anunciante no válido');

    const nuevoAnunciante = this.anunciantesRepo.crear({
      idUsuario,
      usuario,
      cuit_cuil: dto.cuit,
      numero_contacto: dto.numero_contacto,
      tipoAnunciante,
      verificado: false,
    });

    return this.anunciantesRepo.guardar(nuevoAnunciante);
  }
}