import { Inject, Injectable } from '@nestjs/common';
import type { EntityManager } from 'typeorm';
import { EstadoLiquidacionReserva } from '../../catalogos/estados';
import { ValorDuplicadoError } from '../../common/persistence/valor-duplicado.error';
import { referenciaUsuario } from '../../usuarios/usuario-referencia';
import { Liquidacion } from '../entity/liquidacion.entity';
import { Reserva } from '../entity/reserva.entity';
import {
  type ILiquidacionRepository,
  LIQUIDACION_REPOSITORY,
} from '../repository/liquidacion.repository.interface';
import { esLiquidacionResuelta } from './reservas.utils';

export type ResolucionLiquidacionDatos = {
  importe?: number | null;
  moneda?: string | null;
  referencia?: string | null;
  observacion?: string | null;
};

export type DevolucionLiquidacionDatos = ResolucionLiquidacionDatos & {
  importe: number;
  parcial?: boolean;
};

/**
 * Mantiene el registro auditable de la liquidación y sincroniza la caché de
 * compatibilidad que la reserva expone a los flujos existentes.
 */
@Injectable()
export class LiquidacionesService {
  constructor(@Inject(LIQUIDACION_REPOSITORY) private readonly liquidaciones: ILiquidacionRepository) {}

  /** Crea la liquidación si falta, copiando la caché actual de la reserva. */
  async asegurarParaReserva(reserva: Reserva, transaccion?: EntityManager): Promise<Liquidacion> {
    const existente = transaccion
      ? await this.liquidaciones.buscarPorReservaConBloqueo(reserva.id, transaccion)
      : await this.liquidaciones.buscarPorReserva(reserva.id);
    if (existente) return existente;
    const liquidacion = this.liquidaciones.crear({
      reserva,
      estado: reserva.estado_liquidacion,
      importe: this.importeInicial(reserva),
      moneda: 'ARS',
      referencia: reserva.referencia_liquidacion,
      observacion: reserva.observacion_liquidacion,
      admin_resolucion: null,
      fecha_resolucion: reserva.fecha_resolucion_liquidacion,
      fecha_pago_propietario:
        reserva.estado_liquidacion === EstadoLiquidacionReserva.PAGADO_PROPIETARIO
          ? reserva.fecha_resolucion_liquidacion
          : null,
    });
    try {
      return await this.liquidaciones.guardar(liquidacion, transaccion);
    } catch (error) {
      // Fuera de una transacción se puede recuperar la fila creada en paralelo.
      if (transaccion || !(error instanceof ValorDuplicadoError)) throw error;
      const creada = await this.liquidaciones.buscarPorReserva(reserva.id);
      if (creada) return creada;
      throw error;
    }
  }

  /** Registra la decisión administrativa en la entidad y en la caché de la reserva. */
  async registrarResolucion(reserva: Reserva, estado: EstadoLiquidacionReserva, datos: ResolucionLiquidacionDatos, idAdmin: number, transaccion?: EntityManager): Promise<Liquidacion> {
    const liquidacion = await this.asegurarParaReserva(reserva, transaccion);
    const ahora = new Date();
    const resuelta = esLiquidacionResuelta(estado);
    liquidacion.estado = estado;
    liquidacion.importe = datos.importe ?? null;
    liquidacion.moneda = datos.moneda ?? 'ARS';
    liquidacion.referencia = datos.referencia?.trim() || null;
    liquidacion.observacion =
      datos.observacion?.trim() ||
      reserva.observacion_liquidacion ||
      liquidacion.observacion;
    liquidacion.admin_resolucion = referenciaUsuario(idAdmin);
    liquidacion.fecha_resolucion = resuelta ? ahora : null;
    liquidacion.fecha_pago_propietario =
      estado === EstadoLiquidacionReserva.PAGADO_PROPIETARIO ? ahora : null;
    this.sincronizarReserva(reserva, liquidacion);
    return this.liquidaciones.guardar(liquidacion, transaccion);
  }

  /** Deja la liquidación pendiente de revisión administrativa. */
  async registrarRevision(reserva: Reserva, motivo: string, transaccion?: EntityManager): Promise<Liquidacion> {
    const liquidacion = await this.asegurarParaReserva(reserva, transaccion);
    liquidacion.estado = EstadoLiquidacionReserva.EN_REVISION;
    liquidacion.observacion = motivo.trim() || liquidacion.observacion;
    liquidacion.fecha_resolucion = null;
    liquidacion.fecha_pago_propietario = null;
    this.sincronizarReserva(reserva, liquidacion, false);
    return this.liquidaciones.guardar(liquidacion, transaccion);
  }

  /** Mantiene retenido el dinero hasta que se valide el ingreso. */
  async registrarRetencion(reserva: Reserva, observacion?: string | null, transaccion?: EntityManager): Promise<Liquidacion> {
    const liquidacion = await this.asegurarParaReserva(reserva, transaccion);
    liquidacion.estado = EstadoLiquidacionReserva.RETENIDO;
    if (observacion?.trim()) liquidacion.observacion = observacion.trim();
    liquidacion.fecha_resolucion = null;
    liquidacion.fecha_pago_propietario = null;
    this.sincronizarReserva(reserva, liquidacion, false);
    return this.liquidaciones.guardar(liquidacion, transaccion);
  }

  /** El código válido habilita el pago al propietario. */
  async registrarValidacionCodigo(reserva: Reserva, transaccion?: EntityManager): Promise<Liquidacion> {
    const liquidacion = await this.asegurarParaReserva(reserva, transaccion);
    liquidacion.estado = EstadoLiquidacionReserva.PENDIENTE_PAGO_PROPIETARIO;
    liquidacion.observacion = 'Código de alojamiento validado por el anunciante';
    liquidacion.fecha_resolucion = null;
    this.sincronizarReserva(reserva, liquidacion, false);
    return this.liquidaciones.guardar(liquidacion, transaccion);
  }

  /** Registra una devolución total o parcial resuelta por administración. */
  async registrarDevolucion(reserva: Reserva, datos: DevolucionLiquidacionDatos, idAdmin: number, transaccion?: EntityManager): Promise<Liquidacion> {
    return this.registrarResolucion(
      reserva,
      datos.parcial
        ? EstadoLiquidacionReserva.DEVUELTO_PARCIAL_INQUILINO
        : EstadoLiquidacionReserva.DEVUELTO_INQUILINO,
      datos,
      idAdmin,
      transaccion,
    );
  }

  /** Liquidaciones pendientes con la reserva, el pago y las devoluciones asociadas. */
  listarAdministracion(): Promise<Liquidacion[]> {
    return this.liquidaciones.buscarAdministracion();
  }

  private importeInicial(reserva: Reserva): number | null {
    return esLiquidacionResuelta(reserva.estado_liquidacion)
      ? Number(reserva.monto_pago)
      : null;
  }

  private sincronizarReserva(reserva: Reserva, liquidacion: Liquidacion, incluirReferencia = true): void {
    reserva.estado_liquidacion = liquidacion.estado;
    reserva.observacion_liquidacion = liquidacion.observacion;
    reserva.fecha_resolucion_liquidacion = liquidacion.fecha_resolucion;
    if (incluirReferencia) reserva.referencia_liquidacion = liquidacion.referencia;
  }
}
