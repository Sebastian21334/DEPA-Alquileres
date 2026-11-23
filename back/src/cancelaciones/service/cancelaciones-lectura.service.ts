import { Inject, Injectable } from '@nestjs/common';
import type { EntityManager } from 'typeorm';
import { CANCELACIONES_REPOSITORY, type ICancelacionesRepository } from '../repository/cancelaciones.repository.interface';

@Injectable()
export class CancelacionesLecturaService {
  constructor(@Inject(CANCELACIONES_REPOSITORY) private readonly repositorio: ICancelacionesRepository) {}

  /** Consulta si hay una solicitud de la cuenta en el estado indicado, usando la transacción de Usuarios. */
  tienePendientesDeCuenta(idUsuario: number, anuncianteVerificado: boolean, transaccion: EntityManager, estado: string): Promise<boolean> {
    return this.repositorio.tienePendientesDeCuenta(idUsuario, anuncianteVerificado, transaccion, estado);
  }
}
