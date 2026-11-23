import { Inject, Injectable } from '@nestjs/common';
import type { EntityManager } from 'typeorm';
import { RECLAMOS_REPOSITORY, type IReclamosRepository } from '../repository/reclamos.repository.interface';

@Injectable()
export class ReclamosLecturaService {
  constructor(@Inject(RECLAMOS_REPOSITORY) private readonly repositorio: IReclamosRepository) {}

  // Usuarios pasa los estados del catálogo que cuentan como pendientes y conserva su transacción.
  /** Indica si existe un reclamo de la cuenta en alguno de los estados indicados. */
  tienePendientesDeCuenta(idUsuario: number, anuncianteVerificado: boolean, transaccion: EntityManager, estados: string[]): Promise<boolean> {
    return this.repositorio.tienePendientesDeCuenta(idUsuario, anuncianteVerificado, transaccion, estados);
  }
}
