import { Injectable } from '@nestjs/common';
import type { EntityManager } from 'typeorm';
import type { ParticipacionEnReserva } from '../../common/persistence/participacion-en-reserva';
import { PagosService } from '../../pagos/service/pagos.service';
import { ReservasLecturaService } from '../../reservas/service/reservas-lectura.service';
import type { EstadosOperacionesReserva } from '../../reservas/dto/operaciones-pendientes-cuenta.dto';
import { ReclamosLecturaService } from '../../reclamos/service/reclamos-lectura.service';
import { ReembolsosLecturaService } from '../../reembolsos/service/reembolsos-lectura.service';

export interface OperacionesPendientesCuenta {
  reservasPendientes: number;
  estadiasVigentes: number;
  liquidacionesPendientes: number;
  pagosSinConciliar: number;
}

export interface EstadosTramitesPendientes {
  reclamos: string[];
  reembolsos: string[];
  reembolsoAprobado: string;
}

// Coordina consultas de otros dominios: cada módulo conserva sus consultas y recibe la transacción de Usuarios.
@Injectable()
export class OperacionesCuentaService {
  constructor(private readonly reservas: ReservasLecturaService, private readonly pagos: PagosService, private readonly reclamos: ReclamosLecturaService, private readonly reembolsos: ReembolsosLecturaService) {}

  /** Combina los pendientes de reservas, estadías y liquidaciones con los pagos sin conciliar del mismo rol. */
  async contarOperacionesPendientes(idUsuario: number, participacion: ParticipacionEnReserva, hoy: string, limiteCheckout: Date, transaccion: EntityManager, estados: EstadosOperacionesReserva): Promise<OperacionesPendientesCuenta> {
    const reservas = await this.reservas.contarPendientesDeCuenta(idUsuario, participacion, hoy, transaccion, estados);
    const pagosSinConciliar = await this.pagos.contarSinConciliar(idUsuario, participacion, limiteCheckout, transaccion);
    return { ...reservas, pagosSinConciliar };
  }

  /** Comprueba si queda algún reclamo o reembolso por resolver. */
  async tieneTramitesPendientes(idUsuario: number, anuncianteVerificado: boolean, transaccion: EntityManager, estados: EstadosTramitesPendientes): Promise<boolean> {
    // Un solo trámite pendiente alcanza para mantener el acceso limitado; se omiten las consultas siguientes.
    return await this.reclamos.tienePendientesDeCuenta(idUsuario, anuncianteVerificado, transaccion, estados.reclamos)
      || await this.reembolsos.tienePendientesDeCuenta(idUsuario, anuncianteVerificado, transaccion, estados.reembolsos, estados.reembolsoAprobado);
  }
}
