import { Inject, Injectable } from '@nestjs/common';
import type { EntityManager } from 'typeorm';
import { RESERVA_REPOSITORY, type IReservaRepository, type ConsultaReservasAcceso } from '../repository/reserva.repository.interface';
import type { EstadosOperacionesReserva, OperacionesReservaPendientes } from '../dto/operaciones-pendientes-cuenta.dto';
import type { ParticipacionEnReserva } from '../../common/persistence/participacion-en-reserva';

@Injectable()
export class ReservasLecturaService {
  constructor(@Inject(RESERVA_REPOSITORY) private readonly repositorio: IReservaRepository) {}

  /** Cuenta reservas sin pago, estadías vigentes o futuras y liquidaciones pendientes para el rol indicado. */
  contarPendientesDeCuenta(idUsuario: number, participacion: ParticipacionEnReserva, hoy: string, transaccion: EntityManager, estados: EstadosOperacionesReserva): Promise<OperacionesReservaPendientes> {
    return this.repositorio.contarPendientesDeCuenta(idUsuario, participacion, hoy, transaccion, estados);
  }

  /** Comprueba si el inquilino tiene una reserva que justifique mantener el acceso a una publicación eliminada. */
  existeReserva(consulta: ConsultaReservasAcceso): Promise<boolean> {
    return this.repositorio.existeReserva(consulta);
  }
}
