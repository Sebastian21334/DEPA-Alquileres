import { CatalogosService } from '../../catalogos/service/catalogos.service';
import { Inject, Injectable } from '@nestjs/common';
import type { EntityManager } from 'typeorm';
import { ValorDuplicadoError } from '../../common/persistence/valor-duplicado.error';
import { referenciaUsuario } from '../../usuarios/usuario-referencia';
import { Liquidacion } from '../entity/liquidacion.entity';
import type { Reserva } from '../../reservas/entity/reserva.entity';
import {
  type ILiquidacionRepository,
  LIQUIDACION_REPOSITORY,
} from '../repository/liquidacion.repository.interface';

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
  constructor(@Inject(LIQUIDACION_REPOSITORY) private readonly liquidaciones: ILiquidacionRepository, private readonly catalogos: CatalogosService) {}

  async listarParaAdministracion(): Promise<Reserva[]> {
    const filas = await this.liquidaciones.listarPorEstados([
      this.catalogos.codigoEstado('LIQUIDACION_RESERVA', 'PENDIENTE_PAGO_PROPIETARIO'),
      this.catalogos.codigoEstado('LIQUIDACION_RESERVA', 'EN_REVISION'),
    ]);
    return filas.map(liquidacion => {
      this.sincronizarReserva(liquidacion.reserva, liquidacion);
      return liquidacion.reserva;
    });
  }

  async proyectarListado(reservas: Reserva[]): Promise<Reserva[]> {
    if (!reservas.length) return reservas;
    const filas = await this.liquidaciones.buscarPorReservas(reservas.map(reserva => reserva.id));
    const porReserva = new Map(filas.map(fila => [fila.reserva.id, fila]));
    for (const reserva of reservas) {
      const fila = porReserva.get(reserva.id);
      this.proyectar(reserva, fila);
    }
    return reservas;
  }

  async proyectarEnReserva(reserva: Reserva, transaccion?: EntityManager): Promise<Reserva> {
    const liquidacion = await this.liquidaciones.buscarPorReserva(reserva.id, transaccion);
    this.proyectar(reserva, liquidacion);
    return reserva;
  }

  private proyectar(reserva: Reserva, liquidacion?: Liquidacion | null): void {
    if (liquidacion) {
      this.sincronizarReserva(reserva, liquidacion);
      return;
    }
    reserva.estado_liquidacion = this.catalogos.codigoEstado('LIQUIDACION_RESERVA', 'NO_APLICA');
    reserva.referencia_liquidacion = null;
    reserva.observacion_liquidacion = null;
    reserva.fecha_resolucion_liquidacion = null;
  }

  /** Crea la liquidación si falta, copiando la caché actual de la reserva. */
  async asegurarParaReserva(reserva: Reserva, transaccion?: EntityManager): Promise<Liquidacion> {
    const existente = transaccion
      ? await this.liquidaciones.buscarPorReservaConBloqueo(reserva.id, transaccion)
      : await this.liquidaciones.buscarPorReserva(reserva.id);
    if (existente) return existente;
    const liquidacion = this.liquidaciones.crear({
      reserva,
      estado: reserva.estado_liquidacion ?? this.catalogos.codigoEstado('LIQUIDACION_RESERVA', 'NO_APLICA'),
      importe: this.importeInicial(reserva),
      moneda: 'ARS',
      referencia: reserva.referencia_liquidacion,
      observacion: reserva.observacion_liquidacion,
      admin_resolucion: null,
      fecha_resolucion: reserva.fecha_resolucion_liquidacion,
      fecha_pago_propietario:
        reserva.estado_liquidacion === this.catalogos.codigoEstado('LIQUIDACION_RESERVA', 'PAGADO_PROPIETARIO')
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

  /**
   * Copia a la liquidación los cambios que la reserva mantiene en su caché de
   * compatibilidad y toma el importe confirmado cuando el flujo lo proporciona.
   */
  async sincronizarDesdeReserva(reserva: Reserva, transaccion?: EntityManager, datos?: ResolucionLiquidacionDatos): Promise<Liquidacion> {
    const liquidacion = await this.asegurarParaReserva(reserva, transaccion);
    let cambios = false;

    if (reserva.estado_liquidacion !== undefined && liquidacion.estado !== reserva.estado_liquidacion) {
      liquidacion.estado = reserva.estado_liquidacion;
      cambios = true;
    }
    if (reserva.observacion_liquidacion !== undefined && liquidacion.observacion !== reserva.observacion_liquidacion) {
      liquidacion.observacion = reserva.observacion_liquidacion;
      cambios = true;
    }
    if (
      reserva.referencia_liquidacion &&
      liquidacion.referencia !== reserva.referencia_liquidacion
    ) {
      liquidacion.referencia = reserva.referencia_liquidacion;
      cambios = true;
    }
    const fechaReserva = reserva.fecha_resolucion_liquidacion ?? null;
    if (
      liquidacion.fecha_resolucion?.getTime() !== fechaReserva?.getTime()
    ) {
      liquidacion.fecha_resolucion = fechaReserva;
      cambios = true;
    }
    const importe = datos?.importe ?? liquidacion.importe ?? this.importeInicial(reserva);
    if (liquidacion.importe !== importe) {
      liquidacion.importe = importe;
      cambios = true;
    }
    if (datos?.moneda && liquidacion.moneda !== datos.moneda) {
      liquidacion.moneda = datos.moneda;
      cambios = true;
    }

    return cambios
      ? this.liquidaciones.guardar(liquidacion, transaccion)
      : liquidacion;
  }

  /** Registra la decisión administrativa en la entidad y en la caché de la reserva. */
  async registrarResolucion(reserva: Reserva, estado: string, datos: ResolucionLiquidacionDatos, idAdmin: number, transaccion?: EntityManager): Promise<Liquidacion> {
    const liquidacion = await this.asegurarParaReserva(reserva, transaccion);
    const ahora = new Date();
    const resuelta = this.esLiquidacionResuelta(estado);
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
      estado === this.catalogos.codigoEstado('LIQUIDACION_RESERVA', 'PAGADO_PROPIETARIO') ? ahora : null;
    this.sincronizarReserva(reserva, liquidacion);
    return this.liquidaciones.guardar(liquidacion, transaccion);
  }

  /** Deja la liquidación pendiente de revisión administrativa. */
  async registrarRevision(reserva: Reserva, motivo: string, transaccion?: EntityManager): Promise<Liquidacion> {
    const liquidacion = await this.asegurarParaReserva(reserva, transaccion);
    liquidacion.estado = this.catalogos.codigoEstado('LIQUIDACION_RESERVA', 'EN_REVISION');
    liquidacion.observacion = motivo.trim() || liquidacion.observacion;
    liquidacion.fecha_resolucion = null;
    liquidacion.fecha_pago_propietario = null;
    this.sincronizarReserva(reserva, liquidacion, false);
    return this.liquidaciones.guardar(liquidacion, transaccion);
  }

  /** El código válido habilita el pago al propietario. */
  async registrarValidacionCodigo(reserva: Reserva, transaccion?: EntityManager): Promise<Liquidacion> {
    const liquidacion = await this.asegurarParaReserva(reserva, transaccion);
    liquidacion.estado = this.catalogos.codigoEstado('LIQUIDACION_RESERVA', 'PENDIENTE_PAGO_PROPIETARIO');
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
        ? this.catalogos.codigoEstado('LIQUIDACION_RESERVA', 'DEVUELTO_PARCIAL_INQUILINO')
        : this.catalogos.codigoEstado('LIQUIDACION_RESERVA', 'DEVUELTO_INQUILINO'),
      datos,
      idAdmin,
      transaccion,
    );
  }

  esLiquidacionResuelta(estado: string): boolean {
    return [
      this.catalogos.codigoEstado('LIQUIDACION_RESERVA', 'PAGADO_PROPIETARIO'),
      this.catalogos.codigoEstado('LIQUIDACION_RESERVA', 'DEVUELTO_INQUILINO'),
      this.catalogos.codigoEstado('LIQUIDACION_RESERVA', 'DEVUELTO_PARCIAL_INQUILINO'),
    ].some((codigo) => codigo === estado);
  }

  private importeInicial(reserva: Reserva): number | null {
    return this.esLiquidacionResuelta(reserva.estado_liquidacion) &&
      reserva.estado_liquidacion !== this.catalogos.codigoEstado('LIQUIDACION_RESERVA', 'DEVUELTO_PARCIAL_INQUILINO')
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
