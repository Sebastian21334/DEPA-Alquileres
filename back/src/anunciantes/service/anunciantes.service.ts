import { Inject, Injectable } from '@nestjs/common';
import {
  ANUNCIANTES_REPOSITORY,
  type IAnunciantesRepository,
} from '../repository/anunciantes.repository.interface';
import { Anunciante } from '../entity/anunciante.entity';

@Injectable()
export class AnunciantesService {
  constructor(
    @Inject(ANUNCIANTES_REPOSITORY)
    private readonly anunciantesRepo: IAnunciantesRepository,
  ) {}

  buscarPorUsuario(idUsuario: number): Promise<Anunciante | null> {
    return this.anunciantesRepo.buscarPorUsuario(idUsuario);
  }

  /** El alta siempre queda pendiente de una resolución administrativa. */
  crearPendiente(
    datos: Pick<
      Anunciante,
      'usuario' | 'cuit_cuil' | 'numero_contacto' | 'tipoAnunciante'
    >,
  ): Promise<Anunciante> {
    const anunciante = this.anunciantesRepo.crear({
      idUsuario: datos.usuario.id,
      usuario: datos.usuario,
      cuit_cuil: datos.cuit_cuil,
      numero_contacto: datos.numero_contacto,
      tipoAnunciante: datos.tipoAnunciante,
      verificado: false,
    });
    return this.anunciantesRepo.guardar(anunciante);
  }
}
