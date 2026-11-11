import { ConflictException, Inject, Injectable } from '@nestjs/common';
import type { EntityManager } from 'typeorm';
import {
  ANUNCIANTES_REPOSITORY,
  type IAnunciantesRepository,
} from '../repository/anunciantes.repository.interface';
import type { Anunciante } from '../entity/anunciante.entity';
import { ValorDuplicadoError } from '../../common/persistence/valor-duplicado.error';
import { formatearNombreCompleto } from '../../common/utils/nombres';
import type { Usuario } from '../../usuarios/entity/usuario.entity';
import type { TipoAnunciante } from '../../catalogos/entity/tipo-anunciante.entity';

/** Mensaje común para la validación previa y para la carrera resuelta por el índice. */
export const MENSAJE_CUIT_EN_USO =
  'El CUIT/CUIL ingresado ya está registrado en otra cuenta. Si es tuyo y no tenés acceso a esa cuenta, contactá a un administrador.';

@Injectable()
export class AnunciantesService {
  constructor(@Inject(ANUNCIANTES_REPOSITORY) private readonly anunciantesRepo: IAnunciantesRepository) {}

  buscarPorUsuario(idUsuario: number, transaccion?: EntityManager): Promise<Anunciante | null> {
    return this.anunciantesRepo.buscarPorUsuario(idUsuario, transaccion);
  }

  archivarCuitPorBajaDeCuenta(idUsuario: number, transaccion: EntityManager): Promise<void> {
    return this.anunciantesRepo.archivarCuit(idUsuario, transaccion);
  }

  /** Habilita al anunciante dentro de la misma transacción que aprueba su solicitud. */
  async verificar(anunciante: Anunciante, transaccion: EntityManager): Promise<void> {
    await this.anunciantesRepo.actualizarVerificacion(anunciante.idUsuario, true, transaccion);
    anunciante.verificado = true;
  }

  datosContacto(anunciante?: Anunciante | null) {
    const usuario = anunciante?.usuario;
    return {
      nombre: formatearNombreCompleto(usuario?.nombre, usuario?.apellido),
      email: usuario?.email ?? undefined,
      telefono: anunciante?.numero_contacto ?? usuario?.telefono,
    };
  }

  /**
   * El alta siempre queda pendiente de una resolución administrativa.
   * El CUIT/CUIL debe ser único entre las cuentas vigentes (RN-37), también
   * para inmobiliarias.
   */
  async crearPendiente(datos: { usuario: Usuario; cuit_cuil: string | null; numero_contacto: string; tipoAnunciante: TipoAnunciante }, transaccion?: EntityManager): Promise<Anunciante> {
    if (datos.cuit_cuil && (await this.anunciantesRepo.existeCuitVigente(datos.cuit_cuil, transaccion))) {
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
      return await this.anunciantesRepo.guardar(anunciante, transaccion);
    } catch (error) {
      if (error instanceof ValorDuplicadoError) {
        throw new ConflictException(MENSAJE_CUIT_EN_USO);
      }
      throw error;
    }
  }
}
