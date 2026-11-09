import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  TRANSACCION_CALENDARIO,
  type ITransaccionCalendario,
} from '../../disponibilidad/repository/transaccion-calendario.interface';
import { DisponibilidadService } from '../../disponibilidad/service/disponibilidad.service';
import { PagosService } from '../../pagos/service/pagos.service';
import {
  EstadoReembolso,
  OrigenReembolso,
  Reembolso,
  TipoReembolso,
} from '../../reembolsos/entity/reembolso.entity';
import { ReembolsosService } from '../../reembolsos/service/reembolsos.service';
import {
  EstadoLiquidacionReserva,
  EstadoPagoReserva,
  Reserva,
} from '../entity/reserva.entity';
import {
  RESERVA_REPOSITORY,
  type IReservaRepository,
} from '../repository/reserva.repository.interface';
import { ReservaBloqueoDevolucionService } from './reserva-bloqueo-devolucion.service';
import { ReservaReembolsoAplicacionService } from './reserva-reembolso-aplicacion.service';
import { MOTIVO_CANCELACION_BLOQUEO } from '../reserva.constants';
import { ReservaEstadoService } from './reserva-estado.service';
import { ReservaCicloVidaService } from './reserva-ciclo-vida.service';
import { ReservaVencimientoService } from './reserva-vencimiento.service';
import { TOLERANCIA_MONETARIA } from '../../common/utils/dinero';

export type ResultadoBloqueoAnunciante =
  | 'canceladasPendientes'
  | 'canceladasConDevolucion'
  | 'enRevision'
  | 'sinAccion';

export type ResumenBloqueoAnunciante = {
  canceladasPendientes: number;
  canceladasConDevolucion: number;
  enRevision: number;
  sinAccion: number;
  fallidas: number;
  detalles: string[];
};

/**
 * Caso de uso de bloqueo de Anunciante: decide qué reservas se cancelan,
 * devuelven o pasan a revisión. No conoce HTTP ni TypeORM.
 */
@Injectable()
export class ReservaBloqueoAnuncianteService {
  private readonly logger = new Logger(ReservaBloqueoAnuncianteService.name);

  constructor(
    @Inject(RESERVA_REPOSITORY)
    private readonly reservaRepository: IReservaRepository,
    @Inject(TRANSACCION_CALENDARIO)
    private readonly transaccion: ITransaccionCalendario,
    private readonly disponibilidadService: DisponibilidadService,
    private readonly reembolsosService: ReembolsosService,
    private readonly estado: ReservaEstadoService,
    private readonly ciclo: ReservaCicloVidaService,
    private readonly pagosService: PagosService,
    private readonly vencimiento: ReservaVencimientoService,
    private readonly aplicacion: ReservaReembolsoAplicacionService,
    private readonly devolucion: ReservaBloqueoDevolucionService,
  ) {}

  async cancelarReservasPorBloqueoAnunciante(
    idAnunciante: number,
    idAdmin: number,
    motivo?: string,
  ): Promise<ResumenBloqueoAnunciante> {
    const motivoTexto = this.motivoBloqueo(motivo);
    const reservas =
      await this.reservaRepository.buscarPorAnunciante(idAnunciante);
    const resumen: ResumenBloqueoAnunciante = {
      canceladasPendientes: 0,
      canceladasConDevolucion: 0,
      enRevision: 0,
      sinAccion: 0,
      fallidas: 0,
      detalles: [],
    };
    for (const reserva of reservas) {
      try {
        const resultado = await this.resolverReservaPorBloqueo(
          reserva,
          idAnunciante,
          idAdmin,
          motivoTexto,
        );
        resumen[resultado] += 1;
      } catch (error) {
        const mensaje =
          error instanceof Error ? error.message : String(error);
        this.logger.error(
          `No se pudo resolver la reserva ${reserva.id} por el bloqueo del anunciante ${idAnunciante}`,
          error as Error,
        );
        resumen.fallidas += 1;
        resumen.detalles.push(`Reserva ${reserva.id}: ${mensaje}`);
      }
    }
    return resumen;
  }

  private async resolverReservaPorBloqueo(
    reserva: Reserva,
    idAnunciante: number,
    idAdmin: number,
    motivo: string,
  ): Promise<ResultadoBloqueoAnunciante> {
    if (!reserva.fecha_inicio || !reserva.fecha_fin || !reserva.publicacion) {
      await this.congelarLiquidacion(reserva, motivo);
      return 'enRevision';
    }

    const codigoValidado = this.estado.codigoValidado(reserva);
    const liquidacionResuelta = this.estado.liquidacionResuelta(reserva);
    const enRevision =
      this.estado.liquidacionEnRevision(reserva) ||
      reserva.estado_pago === EstadoPagoReserva.CONTRACARGO;

    // Reclamo, contracargo o liquidación ya en revisión: decide el Administrador.
    if (enRevision) {
      await this.congelarLiquidacion(reserva, motivo);
      return 'enRevision';
    }

    // Código validado: el Inquilino ingresó. No corresponde devolución automática.
    if (codigoValidado) {
      if (liquidacionResuelta) return 'sinAccion';
      await this.congelarLiquidacion(reserva, motivo);
      return 'enRevision';
    }

    // Sin código: no hubo ingreso.
    if (
      reserva.estado_pago === EstadoPagoReserva.PENDIENTE ||
      reserva.estado_pago === EstadoPagoReserva.RECHAZADO ||
      reserva.estado_pago === EstadoPagoReserva.CANCELADO
    ) {
      if (reserva.cancelada) return 'sinAccion';
      const estadoCierre =
        reserva.estado_pago === EstadoPagoReserva.PENDIENTE
          ? EstadoPagoReserva.CANCELADO
          : reserva.estado_pago;
      const cerrada = await this.vencimiento.rechazarPago(
        reserva.id,
        estadoCierre,
        'ADMINISTRADOR',
        this.mensajeLiquidacion(motivo),
      );
      if (this.estado.pagoAprobado(cerrada)) {
        return this.cancelarYDevolverPorBloqueo(
          cerrada,
          idAnunciante,
          idAdmin,
          motivo,
        );
      }
      if (!cerrada.cancelada) {
        await this.congelarLiquidacion(cerrada, motivo);
        return 'enRevision';
      }
      return 'canceladasPendientes';
    }

    if (
      reserva.estado_pago === EstadoPagoReserva.REEMBOLSADO ||
      liquidacionResuelta
    )
      return 'sinAccion';

    if (reserva.estado_pago !== EstadoPagoReserva.APROBADO)
      return 'sinAccion';

    return this.cancelarYDevolverPorBloqueo(
      reserva,
      idAnunciante,
      idAdmin,
      motivo,
    );
  }

  private async cancelarYDevolverPorBloqueo(
    reserva: Reserva,
    idAnunciante: number,
    idAdmin: number,
    motivo: string,
  ): Promise<ResultadoBloqueoAnunciante> {
    const fresca = await this.reservaRepository.buscarPorId(reserva.id);
    if (!fresca) return 'sinAccion';
    if (this.estado.liquidacionResuelta(fresca)) return 'sinAccion';

    const bloqueoPrevio = this.esCancelacionPorBloqueo(fresca);
    if (fresca.cancelada && !bloqueoPrevio) {
      await this.congelarLiquidacion(fresca, motivo);
      return 'enRevision';
    }
    if (this.estado.codigoValidado(fresca) || fresca.finalizada) {
      await this.congelarLiquidacion(fresca, motivo);
      return 'enRevision';
    }
    if (
      (this.estado.liquidacionEnRevision(fresca) && !bloqueoPrevio) ||
      fresca.estado_pago === EstadoPagoReserva.CONTRACARGO ||
      fresca.estado_pago !== EstadoPagoReserva.APROBADO
    ) {
      await this.congelarLiquidacion(fresca, motivo);
      return 'enRevision';
    }

    const pago = await this.pagosService.buscarPorReserva(reserva.id);
    if (!pago) {
      await this.congelarLiquidacion(fresca, motivo);
      return 'enRevision';
    }

    const existentes = await this.reembolsosService.listarPorReserva(
      reserva.id,
    );

    let devolucion: {
      reembolso: Reembolso | null;
      pendientes: Reembolso[];
      cubre: boolean;
      creado: boolean;
    };
    try {
      devolucion = await this.devolucion.asegurarDevolucion(
        reserva,
        pago,
        existentes,
        idAnunciante,
        idAdmin,
        motivo,
      );
    } catch (error) {
      await this.congelarLiquidacion(fresca, motivo);
      const mensaje =
        error instanceof Error ? error.message : String(error);
      throw new Error(
        `No se pudo crear la devolución de la reserva ${reserva.id}: ${mensaje}`,
      );
    }

    if (!devolucion.cubre) {
      await this.congelarLiquidacion(fresca, motivo);
      return 'enRevision';
    }

    let resultado: 'cancelada' | 'yaCancelada' | 'enRevision' | 'sinAccion';
    try {
      resultado = await this.cancelarYLiberarPorBloqueo(
        reserva.id,
        motivo,
      );
    } catch (error) {
      if (devolucion.creado && devolucion.reembolso) {
        const yaCancelada = await this.estaCanceladaPorBloqueo(
          reserva.id,
        );
        if (!yaCancelada)
          await this.reembolsosService.compensar(
            devolucion.reembolso.id,
            idAdmin,
          );
      }
      throw error;
    }

    if (resultado !== 'cancelada' && resultado !== 'yaCancelada') {
      if (devolucion.creado && devolucion.reembolso) {
        const compensado = await this.reembolsosService.compensar(
          devolucion.reembolso.id,
          idAdmin,
        );
        if (!compensado) {
          throw new Error(
            `La reserva ${reserva.id} no se canceló y el reembolso ${devolucion.reembolso.id} no pudo compensarse`,
          );
        }
      }
      return resultado;
    }

    const cobertura = await this.devolucion.coberturaDevolucion(reserva.id, pago);
    if (cobertura.faltante > TOLERANCIA_MONETARIA) {
      const sello = Math.abs(
        Math.round(cobertura.faltante * 100),
      )
        .toString(36)
        .slice(-6);
      const { reembolso: reintento } =
        await this.reembolsosService.crearSolicitudConResultado({
          reserva,
          pago: cobertura.pago,
          tipo:
            cobertura.faltante >=
            Number(cobertura.pago.amount) - TOLERANCIA_MONETARIA
              ? TipoReembolso.TOTAL
              : TipoReembolso.PARCIAL,
          origen: OrigenReembolso.CANCELACION,
          importe: cobertura.faltante,
          motivo: `${MOTIVO_CANCELACION_BLOQUEO}: ${motivo}`,
          idSolicitadoPor: idAdmin,
          idempotencyKey: `blq:${idAnunciante}:${reserva.id}:r1:${sello}`,
        });

      const cubreReintento =
        reintento.estado === EstadoReembolso.APROBADO
          ? this.pagosService.saldoReembolsable(cobertura.pago) <= TOLERANCIA_MONETARIA
          : Number(reintento.importe) >= cobertura.faltante - TOLERANCIA_MONETARIA;
      if (
        (reintento.estado !== EstadoReembolso.PENDIENTE &&
          reintento.estado !== EstadoReembolso.EN_PROCESO &&
          reintento.estado !== EstadoReembolso.APROBADO) ||
        !cubreReintento
      ) {
        throw new Error(
          `La reserva ${reserva.id} se canceló, pero no se pudo restablecer una devolución válida`,
        );
      }
      devolucion.pendientes = [...cobertura.pendientes, reintento];
      devolucion.reembolso = reintento;
    } else {
      if (
        !cobertura.aprobado &&
        cobertura.pendientes.length === 0
      ) {
        throw new Error(
          `La reserva ${reserva.id} se canceló, pero no existe un reembolso válido`,
        );
      }
      devolucion.pendientes = cobertura.pendientes;
      devolucion.reembolso = cobertura.aprobado ?? devolucion.reembolso;
    }

    if (devolucion.reembolso?.estado === EstadoReembolso.APROBADO) {
      await this.aplicacion.aplicarReembolsoConfirmado(devolucion.reembolso.id);
    }

    if (this.reembolsosService.ejecucionAutomaticaHabilitada) {
      const errores: string[] = [];
      for (const pendiente of devolucion.pendientes) {
        if (pendiente.estado !== EstadoReembolso.PENDIENTE) continue;
        try {
          const ejecutado = await this.reembolsosService.registrarOejecutar(
            pendiente.id,
            null,
            idAdmin,
          );
          if (ejecutado.estado === EstadoReembolso.APROBADO)
            await this.aplicacion.aplicarReembolsoConfirmado(ejecutado.id);
        } catch (error) {
          const mensaje =
            error instanceof Error ? error.message : String(error);
          errores.push(`Reembolso ${pendiente.id}: ${mensaje}`);
        }
      }
      if (errores.length > 0)
        throw new Error(
          `La reserva ${reserva.id} se canceló, pero quedaron devoluciones sin ejecutar: ${errores.join('; ')}`,
        );
    }
    return 'canceladasConDevolucion';
  }

  private async estaCanceladaPorBloqueo(idReserva: number): Promise<boolean> {
    return this.transaccion.ejecutar(
      async ({ reservas: reservaRepository }) => {
        const actual = await reservaRepository.buscarPorId(idReserva);
        return actual ? this.esCancelacionPorBloqueo(actual) : false;
      },
    );
  }


  private esCancelacionPorBloqueo(reserva: Reserva): boolean {
    return (
      reserva.cancelada &&
      reserva.cancelada_por === 'ADMINISTRADOR' &&
      !!reserva.motivo_cancelacion?.startsWith(
        MOTIVO_CANCELACION_BLOQUEO,
      ) &&
      reserva.estado_liquidacion === EstadoLiquidacionReserva.EN_REVISION
    );
  }

  private async cancelarYLiberarPorBloqueo(
    idReserva: number,
    motivo: string,
  ): Promise<'cancelada' | 'yaCancelada' | 'enRevision' | 'sinAccion'> {
    return this.transaccion.ejecutar(
      async ({ reservas: reservaRepository, fechas: fechaRepository }) => {
        const actual = await reservaRepository.buscarPorId(idReserva);
        if (!actual) return 'sinAccion';
        if (this.estado.liquidacionResuelta(actual)) return 'sinAccion';
        if (actual.cancelada && !this.esCancelacionPorBloqueo(actual))
          return 'enRevision';
        if (
          this.esCancelacionPorBloqueo(actual) &&
          actual.estado_pago === EstadoPagoReserva.APROBADO &&
          !this.estado.codigoValidado(actual) &&
          !actual.finalizada
        )
          return 'yaCancelada';

        const debeIrARevision =
          this.estado.codigoValidado(actual) ||
          actual.finalizada ||
          this.estado.liquidacionEnRevision(actual) ||
          actual.estado_pago === EstadoPagoReserva.CONTRACARGO ||
          actual.estado_pago !== EstadoPagoReserva.APROBADO;

        if (debeIrARevision) {
          actual.estado_liquidacion = EstadoLiquidacionReserva.EN_REVISION;
          actual.observacion_liquidacion = this.observacionConMotivo(
            actual.observacion_liquidacion,
            motivo,
          );
          actual.fecha_resolucion_liquidacion = null;
          await reservaRepository.guardar(actual);
          return 'enRevision';
        }

        if (!actual.cancelada)
          this.ciclo.cancelar(
            actual,
            'ADMINISTRADOR',
            this.mensajeLiquidacion(motivo),
          );
        actual.estado_liquidacion = EstadoLiquidacionReserva.EN_REVISION;
        actual.observacion_liquidacion = this.observacionConMotivo(
          actual.observacion_liquidacion,
          motivo,
        );
        actual.fecha_resolucion_liquidacion = null;
        await reservaRepository.guardar(actual);
        await this.disponibilidadService.liberarReserva(
          actual.id,
          fechaRepository,
        );
        return 'cancelada';
      },
    );
  }

  private async congelarLiquidacion(
    reserva: Reserva,
    motivo: string,
  ): Promise<void> {
    await this.transaccion.ejecutar(
      async ({ reservas: reservaRepository }) => {
        const actual = await reservaRepository.buscarPorId(reserva.id);
        if (!actual || this.estado.liquidacionResuelta(actual)) return;
        actual.estado_liquidacion = EstadoLiquidacionReserva.EN_REVISION;
        actual.observacion_liquidacion = this.observacionConMotivo(
          actual.observacion_liquidacion,
          motivo,
        );
        actual.fecha_resolucion_liquidacion = null;
        await reservaRepository.guardar(actual);
      },
    );
  }

  private motivoBloqueo(motivo?: string): string {
    return (motivo?.trim() || MOTIVO_CANCELACION_BLOQUEO).slice(0, 200);
  }

  private mensajeLiquidacion(motivo: string): string {
    return `${MOTIVO_CANCELACION_BLOQUEO}: ${motivo}`.slice(0, 500);
  }

  private observacionConMotivo(
    actual: string | null,
    motivo: string,
  ): string {
    if (actual?.includes(MOTIVO_CANCELACION_BLOQUEO)) return actual;
    const bloqueo = this.mensajeLiquidacion(motivo);
    return actual
      ? `${actual} | ${bloqueo}`.slice(0, 500)
      : bloqueo;
  }

}
