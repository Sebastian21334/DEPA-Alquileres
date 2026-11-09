import { Injectable } from '@nestjs/common';
import type { Pago } from '../../pagos/entity/pago.entity';
import { PagosService } from '../../pagos/service/pagos.service';
import {
  EstadoReembolso,
  OrigenReembolso,
  Reembolso,
  TipoReembolso,
} from '../../reembolsos/entity/reembolso.entity';
import { ReembolsosService } from '../../reembolsos/service/reembolsos.service';
import { Reserva } from '../entity/reserva.entity';
import { MOTIVO_CANCELACION_BLOQUEO } from '../reserva.constants';
import { TOLERANCIA_MONETARIA } from '../../common/utils/dinero';

/** Calcula y asegura la devolución del bloqueo sin cancelar la reserva. */
@Injectable()
export class ReservaBloqueoDevolucionService {
  constructor(
    private readonly reembolsosService: ReembolsosService,
    private readonly pagosService: PagosService,
  ) {}

  async coberturaDevolucion(
    idReserva: number,
    pago: Pago,
  ): Promise<{
    pendientes: Reembolso[];
    aprobado: Reembolso | null;
    faltante: number;
    pago: Pago;
  }> {
    const pagoActual =
      (await this.pagosService.buscarPorReserva(idReserva)) ?? pago;
    const existentes = await this.reembolsosService.listarPorReserva(idReserva);
    const pendientes = existentes.filter(
      (reembolso) =>
        reembolso.estado === EstadoReembolso.PENDIENTE ||
        reembolso.estado === EstadoReembolso.EN_PROCESO,
    );
    const pendienteTotal = pendientes.reduce(
      (total, reembolso) => total + Number(reembolso.importe),
      0,
    );
    return {
      pendientes,
      aprobado:
        existentes.find(
          (reembolso) => reembolso.estado === EstadoReembolso.APROBADO,
        ) ?? null,
      faltante: this.pagosService.saldoReembolsable(pagoActual) - pendienteTotal,
      pago: pagoActual,
    };
  }

  async asegurarDevolucion(
    reserva: Reserva,
    pago: Pago,
    existentes: Reembolso[],
    idAnunciante: number,
    idAdmin: number,
    motivo: string,
  ): Promise<{
    reembolso: Reembolso | null;
    pendientes: Reembolso[];
    cubre: boolean;
    creado: boolean;
  }> {
    const saldo = this.pagosService.saldoReembolsable(pago);
    const pendientes = existentes.filter(
      (reembolso) =>
        reembolso.estado === EstadoReembolso.PENDIENTE ||
        reembolso.estado === EstadoReembolso.EN_PROCESO,
    );
    const pendienteTotal = pendientes.reduce(
      (total, reembolso) => total + Number(reembolso.importe),
      0,
    );
    const faltante = saldo - pendienteTotal;
    if (
      existentes.some(
        (reembolso) => reembolso.estado === EstadoReembolso.FALLIDO,
      )
    )
      return { reembolso: null, pendientes: [], cubre: false, creado: false };
    const aprobado =
      existentes.find(
        (reembolso) => reembolso.estado === EstadoReembolso.APROBADO,
      ) ?? null;

    if (faltante <= TOLERANCIA_MONETARIA) {
      if (!aprobado && pendientes.length === 0)
        return { reembolso: null, pendientes: [], cubre: false, creado: false };
      return {
        reembolso: aprobado,
        pendientes,
        cubre: true,
        creado: false,
      };
    }

    const base = `blq:${idAnunciante}:${reserva.id}`;
    const hayCoberturaParcial =
      aprobado != null || pendientes.length > 0;
    for (let intento = 0; intento < 2; intento += 1) {
      const clave =
        hayCoberturaParcial || intento > 0
          ? `${base}:c${intento + 1}`
          : base;

      const { reembolso, creado } =
        await this.reembolsosService.crearSolicitudConResultado({
          reserva,
          pago,
          tipo:
            faltante >= Number(pago.amount) - TOLERANCIA_MONETARIA
              ? TipoReembolso.TOTAL
              : TipoReembolso.PARCIAL,
          origen: OrigenReembolso.CANCELACION,
          importe: faltante,
          motivo: `${MOTIVO_CANCELACION_BLOQUEO}: ${motivo}`,
          idSolicitadoPor: idAdmin,
          idempotencyKey: clave,
        });

      if (
        reembolso.estado !== EstadoReembolso.PENDIENTE &&
        reembolso.estado !== EstadoReembolso.EN_PROCESO &&
        reembolso.estado !== EstadoReembolso.APROBADO
      )
        continue;

      // Un aprobado devuelto por la clave ya está incluido en el saldo:
      // no cubre el faltante, hay que crear el complemento.
      if (reembolso.estado === EstadoReembolso.APROBADO) continue;
      if (Number(reembolso.importe) < faltante - TOLERANCIA_MONETARIA) continue;

      return {
        reembolso,
        pendientes: [...pendientes, reembolso],
        cubre: true,
        creado,
      };
    }

    return { reembolso: null, pendientes: [], cubre: false, creado: false };
  }

}
