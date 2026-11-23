import { Inject, Injectable } from '@nestjs/common';
import type { EntityManager } from 'typeorm';
import { REEMBOLSOS_REPOSITORY, type IReembolsosRepository } from '../repository/reembolsos.repository.interface';

@Injectable()
export class ReembolsosLecturaService {
  constructor(@Inject(REEMBOLSOS_REPOSITORY) private readonly repositorio: IReembolsosRepository) {}

  // La consulta usa la misma transacción en la que Usuarios evalúa el acceso limitado.
  /** Indica si queda un reembolso pendiente, fallido o aprobado que todavía no se aplicó. */
  tienePendientesDeCuenta(idUsuario: number, anuncianteVerificado: boolean, transaccion: EntityManager, estados: string[], estadoAprobado: string): Promise<boolean> {
    return this.repositorio.tienePendientesDeCuenta(idUsuario, anuncianteVerificado, transaccion, estados, estadoAprobado);
  }
}
