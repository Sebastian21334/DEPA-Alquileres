import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ANUNCIANTES_REPOSITORY } from '../repository/anunciantes.repository.interface';
import type { IAnunciantesRepository } from '../repository/anunciantes.repository.interface';
import { SolicitarAnuncianteDto } from '../dto/solicitar-anunciante.dto';
import { UsuariosService } from '../../usuarios/service/usuarios.service';
import { CatalogosService } from '../../catalogos/service/catalogos.service';
import { Anunciante } from '../entity/anunciante.entity';

@Injectable()
export class AnunciantesService {
  constructor(
    @Inject(ANUNCIANTES_REPOSITORY)
    private readonly anunciantesRepo: IAnunciantesRepository,
    private usuariosService: UsuariosService,
    private catalogosService: CatalogosService,
  ) {}

  /** Crea una solicitud pendiente y evita que un usuario tenga dos solicitudes. */
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

  /** Marca una solicitud pendiente como verificada para habilitar publicaciones. */
  async aprobar(idAnunciante: number): Promise<Anunciante> {
    const anunciante = await this.anunciantesRepo.buscarPorId(idAnunciante);
    if (!anunciante) throw new NotFoundException('Solicitud de anunciante no encontrada');
    if (anunciante.verificado) throw new ConflictException('El anunciante ya está verificado');

    anunciante.verificado = true;
    return this.anunciantesRepo.guardar(anunciante);
  }

  /** Elimina una solicitud pendiente sin afectar al usuario que la envio. */
  async rechazar(idAnunciante: number): Promise<{ mensaje: string }> {
    const anunciante = await this.anunciantesRepo.buscarPorId(idAnunciante);
    if (!anunciante) throw new NotFoundException('Solicitud de anunciante no encontrada');
    if (anunciante.verificado) throw new ConflictException('El anunciante ya está verificado, no se puede rechazar');

    await this.anunciantesRepo.eliminar(anunciante);
    return { mensaje: 'Solicitud de anunciante rechazada' };
  }

  /** Devuelve las solicitudes que todavia requieren una decision administrativa. */
  async getPendientes(): Promise<Anunciante[]> {
    return this.anunciantesRepo.buscarPendientes();
  }

  /** Busca la solicitud asociada a un usuario concreto. */
  async buscarPorUsuario(idUsuario: number) {
    return this.anunciantesRepo.buscarPorUsuario(idUsuario);
  }

}