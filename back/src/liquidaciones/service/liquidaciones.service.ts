import { CatalogosService } from '../../catalogos/service/catalogos.service';
import { Inject, Injectable } from '@nestjs/common';
import type { EntityManager } from 'typeorm';
import { esFechaCalendarioValida, fechaArgentina, sumarDiasCalendario } from '../../common/utils/fechas';
import { ValorDuplicadoError } from '../../common/persistence/valor-duplicado.error';
import { referenciaUsuario } from '../../usuarios/usuario-referencia';
import { Liquidacion } from '../entity/liquidacion.entity';
import type { Reserva } from '../../reservas/entity/reserva.entity';
import type { ComprobanteSubido } from '../../almacenamiento/service/almacenamiento.service';
import {
  type ILiquidacionRepository,
  LIQUIDACION_REPOSITORY,
} from '../repository/liquidacion.repository.interface';

export type ResolucionLiquidacionDatos = {
  importe?: number | null;
  moneda?: string | null;
  referencia?: string | null;
  observacion?: string | null;
  /** Comprobante de la transferencia al anunciante. */
  comprobante?: ComprobanteSubido | null;
};

export type DevolucionLiquidacionDatos = ResolucionLiquidacionDatos & {
  importe: number;
  parcial?: boolean;
};

/** Días después del fin de la estadía hasta que se habilita el pago al anunciante. */
export const DIAS_ESPERA_PAGO_MANUAL = 5;

/**
 * Mantiene el registro auditable de la liquidación y sincroniza la caché de
 * compatibilidad que la reserva expone a los flujos existentes.
 */
@Injectable()
export class LiquidacionesService {
  constructor(@Inject(LIQUIDACION_REPOSITORY) private readonly liquidaciones: ILiquidacionRepository, private readonly catalogos: CatalogosService) {}

  async listarParaAdministracion(): Promise<Reserva[]> {
    const revision = this.catalogos.codigoEstado('LIQUIDACION_RESERVA', 'EN_REVISION');
    const filas = await this.liquidaciones.listarPorEstados([
      ...this.estadosPendientesParaAnunciante(), revision,
    ]);
    return filas.map(liquidacion => {
      this.sincronizarReserva(liquidacion.reserva, liquidacion);
      return liquidacion.reserva;
    });
  }

  fechaDisponiblePagoManual(reserva: Pick<Reserva, 'fecha_inicio' | 'fecha_fin'>): string | null {
    if (!esFechaCalendarioValida(reserva.fecha_inicio) || !esFechaCalendarioValida(reserva.fecha_fin) ||
        reserva.fecha_inicio > reserva.fecha_fin) return null;
    return this.desplazarFecha(reserva.fecha_fin, DIAS_ESPERA_PAGO_MANUAL);
  }

  listarReservasPendientesDeAviso(ahora: Date): Promise<number[]> {
    return this.liquidaciones.listarReservasPendientesDeAviso(
      this.estadosPendientesParaAnunciante(),
      this.catalogos.codigoEstado('PAGO_RESERVA', 'APROBADO'),
      this.desplazarFecha(fechaArgentina(ahora), -DIAS_ESPERA_PAGO_MANUAL),
    );
  }

  /**
   * Ingresos sin código cuyo plazo venció: retenidos y en revisión solo
   * porque el código se bloqueó (`maxIntentosCodigo` intentos incorrectos).
   */
  listarIngresosNoVerificadosVencidos(ahora: Date, maxIntentosCodigo: number): Promise<number[]> {
    return this.liquidaciones.listarIngresosNoVerificadosVencidos(
      {
        retenido: this.catalogos.codigoEstado('LIQUIDACION_RESERVA', 'RETENIDO'),
        revision: this.catalogos.codigoEstado('LIQUIDACION_RESERVA', 'EN_REVISION'),
        maxIntentosCodigo,
      },
      this.catalogos.codigoEstado('PAGO_RESERVA', 'APROBADO'),
      this.desplazarFecha(fechaArgentina(ahora), -DIAS_ESPERA_PAGO_MANUAL),
    );
  }

  async registrarVencimientoIngreso(reserva: Reserva, transaccion: EntityManager): Promise<void> {
    const liquidacion = await this.asegurarParaReserva(reserva, transaccion);
    liquidacion.estado = this.catalogos.codigoEstado('LIQUIDACION_RESERVA', 'PENDIENTE_PAGO_PROPIETARIO');
    liquidacion.observacion = 'Ingreso no verificado: venció el plazo de cinco días';
    liquidacion.fecha_resolucion = null;
    this.sincronizarReserva(reserva, liquidacion, false);
    await this.liquidaciones.guardar(liquidacion, transaccion);
  }

  async registrarAvisosPagoManual(liquidacion: Liquidacion, avisados: { admin: boolean; anunciante: boolean }, fecha: Date, transaccion: EntityManager): Promise<void> {
    if (!avisados.admin && !avisados.anunciante) return;
    if (avisados.admin) liquidacion.aviso_pago_admin_en = fecha;
    if (avisados.anunciante) liquidacion.aviso_pago_anunciante_en = fecha;
    await this.liquidaciones.guardar(liquidacion, transaccion);
  }

  private desplazarFecha(fecha: string, dias: number): string {
    return sumarDiasCalendario(fecha, dias);
  }

  async listarPagosRegistrados() {
    const pagos = await this.liquidaciones.listarPagosRegistrados(
      this.catalogos.codigoEstado('LIQUIDACION_RESERVA', 'PAGADO_PROPIETARIO'),
    );
    return this.formatearPagosRegistrados(pagos);
  }

  /** Sin `idPublicacion` devuelve los pagos de todas las publicaciones del anunciante. */
  async listarPagosDelAnunciante(idUsuario: number, idPublicacion?: number) {
    const pagos = await this.liquidaciones.listarPagosRegistrados(
      this.catalogos.codigoEstado('LIQUIDACION_RESERVA', 'PAGADO_PROPIETARIO'),
      { idUsuario, idPublicacion },
    );
    // El anunciante no recibe datos del administrador que registró el pago.
    return this.formatearPagosRegistrados(pagos).map(({ id, reservaId, indice, publicacion, fecha, importe, moneda, referencia, observacion, comprobante }) => ({
      id, reservaId, indice, publicacion, fecha, importe, moneda, referencia, observacion, comprobante,
    }));
  }

  /** Comprobante de un pago registrado, con el anunciante para que el llamador verifique el acceso. */
  async buscarComprobantePago(idReserva: number, indice: number): Promise<{ url: string; idAnunciante: number | null } | null> {
    const registro = await this.liquidaciones.buscarPagosConAnunciante(idReserva);
    const url = registro?.pagos[indice]?.comprobanteUrl;
    return registro && url ? { url, idAnunciante: registro.idAnunciante } : null;
  }

  private formatearPagosRegistrados(pagos: Liquidacion[]) {
    return pagos.flatMap(pago => {
      const publicacion = pago.reserva.publicacion;
      const anunciante = publicacion?.anunciante?.usuario;
      const administrador = pago.admin_resolucion;
      const registros = pago.pagos_anunciante ?? [{
        fecha: (pago.fecha_pago_propietario ?? pago.fecha_resolucion)?.toISOString() ?? null,
        importe: pago.importe,
        moneda: pago.moneda,
        referencia: pago.referencia,
        observacion: pago.observacion,
        administradorId: administrador?.id ?? null,
      }];
      return registros.map((registro, indice) => ({
        id: `${pago.id}-${indice}`,
        reservaId: pago.reserva.id,
        indice,
        publicacion: publicacion?.titulo ?? null,
        anunciante: anunciante ? [anunciante.nombre, anunciante.apellido].filter(Boolean).join(' ') : null,
        administrador: administrador && administrador.id === registro.administradorId
          ? [administrador.nombre, administrador.apellido].filter(Boolean).join(' ')
          : registro.administradorId == null ? null : `Usuario #${registro.administradorId}`,
        fecha: registro.fecha,
        importe: registro.importe == null ? null : Number(registro.importe),
        moneda: registro.moneda,
        referencia: registro.referencia,
        observacion: registro.observacion,
        // Solo el nombre: el enlace se pide aparte y vence.
        comprobante: registro.comprobanteNombre ?? null,
      }));
    }).sort((a, b) => (b.fecha ?? '').localeCompare(a.fecha ?? ''));
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
    const estadoPagado = this.catalogos.codigoEstado('LIQUIDACION_RESERVA', 'PAGADO_PROPIETARIO');
    const yaRegistrado = liquidacion.estado === estadoPagado && !!liquidacion.pagos_anunciante?.length;
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
      estado === estadoPagado ? ahora : null;
    if (liquidacion.fecha_pago_propietario && !yaRegistrado) {
      liquidacion.pagos_anunciante = [...(liquidacion.pagos_anunciante ?? []), {
        fecha: ahora.toISOString(),
        importe: liquidacion.importe,
        moneda: liquidacion.moneda,
        referencia: liquidacion.referencia,
        observacion: datos.observacion?.trim() || null,
        administradorId: idAdmin,
        comprobanteUrl: datos.comprobante?.url ?? null,
        comprobanteNombre: datos.comprobante?.nombre ?? null,
      }];
    }
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

  /** El código válido deja el pago agendado conforme a la fecha de disponibilidad. */
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

  /**
   * Resuelta para los flujos del inquilino (reprogramar, cancelar, reclamar…): la devolución
   * parcial también lo es, aunque al anunciante todavía le quede cobrar el resto.
   */
  esLiquidacionResuelta(estado: string): boolean {
    return [
      ...this.estadosCerradosParaAnunciante(),
      this.catalogos.codigoEstado('LIQUIDACION_RESERVA', 'DEVUELTO_PARCIAL_INQUILINO'),
    ].some((codigo) => codigo === estado);
  }

  /** Lo que no se le devuelve al inquilino es del anunciante: después de una devolución parcial le queda cobrar el resto. */
  estadosPendientesParaAnunciante(): string[] {
    return [
      this.catalogos.codigoEstado('LIQUIDACION_RESERVA', 'PENDIENTE_PAGO_PROPIETARIO'),
      this.catalogos.codigoEstado('LIQUIDACION_RESERVA', 'DEVUELTO_PARCIAL_INQUILINO'),
    ];
  }

  /** Sin importe pendiente para el anunciante: se le pagó o se le devolvió todo al inquilino. */
  estadosCerradosParaAnunciante(): string[] {
    return [
      this.catalogos.codigoEstado('LIQUIDACION_RESERVA', 'PAGADO_PROPIETARIO'),
      this.catalogos.codigoEstado('LIQUIDACION_RESERVA', 'DEVUELTO_INQUILINO'),
    ];
  }

  admitePagoAlAnunciante(estado: string): boolean {
    return this.estadosPendientesParaAnunciante().includes(estado);
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
