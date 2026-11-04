import { ConflictException, Inject, Injectable } from '@nestjs/common';
import {
  ANUNCIANTES_REPOSITORY,
  type IAnunciantesRepository,
} from '../repository/anunciantes.repository.interface';
import { Anunciante } from '../entity/anunciante.entity';
import { ValorDuplicadoError } from '../../common/persistence/valor-duplicado.error';

/** Mensaje común para la validación previa y para la carrera resuelta por el índice. */
export const MENSAJE_CUIT_EN_USO =
  'El CUIT/CUIL ingresado ya está registrado en otra cuenta. Si es tuyo y no tenés acceso a esa cuenta, contactá a un administrador.';

@Injectable()
export class AnunciantesService {
  constructor(
    @Inject(ANUNCIANTES_REPOSITORY)
    private readonly anunciantesRepo: IAnunciantesRepository,
  ) {}

  buscarPorUsuario(idUsuario: number): Promise<Anunciante | null> {
    return this.anunciantesRepo.buscarPorUsuario(idUsuario);
  }

  /**
   * El alta siempre queda pendiente de una resolución administrativa.
   * El CUIT/CUIL debe ser único entre las cuentas vigentes (RN-37), también
   * para inmobiliarias.
   */
  async crearPendiente(
    datos: Pick<
      Anunciante,
      'usuario' | 'cuit_cuil' | 'numero_contacto' | 'tipoAnunciante'
    >,
  ): Promise<Anunciante> {
    if (
      datos.cuit_cuil &&
      (await this.anunciantesRepo.existeCuitVigente(datos.cuit_cuil))
    ) {
      throw new ConflictException(MENSAJE_CUIT_EN_USO);
    }
    const anunciante = this.anunciantesRepo.crear({
      idUsuario: datos.usuario.id,
      usuario: datos.usuario,
      cuit_cuil: datos.cuit_cuil,
      numero_contacto: datos.numero_contacto,
      tipoAnunciante: datos.tipoAnunciante,
      verificado: false,
    });
    try {
      return await this.anunciantesRepo.guardar(anunciante);
    } catch (error) {
      if (error instanceof ValorDuplicadoError) {
        throw new ConflictException(MENSAJE_CUIT_EN_USO);
      }
      throw error;
    }
  }
}
