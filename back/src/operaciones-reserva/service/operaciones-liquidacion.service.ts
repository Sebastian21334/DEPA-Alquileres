import { CatalogosService } from '../../catalogos/service/catalogos.service';
import {
  Injectable,
  ConflictException,
  BadRequestException,
  Logger,
  OnApplicationBootstrap,
  OnModuleDestroy,
} from '@nestjs/common';
import { Reserva } from '../../reservas/entity/reserva.entity';
import { ResolverLiquidacionDto } from '../dto/resolver-liquidacion.dto';
import { ReembolsosService } from '../../reembolsos/service/reembolsos.service';
import {
  OrigenReembolso,
  TipoReembolso,
} from '../../reembolsos/entity/reembolso.entity';
import { TOLERANCIA_MONETARIA } from '../../common/utils/dinero';
import { decimalEntero } from '../../common/utils/importes';
import { fechaArgentina } from '../../common/utils/fechas';
import { MAX_INTENTOS_CODIGO } from '../../reservas-consulta/service/reserva-estado.service';
import { ReservasService } from '../../reservas/service/reservas.service';
import { ReservaNotificacionesService } from '../../reservas/service/reserva-notificaciones.service';
import { LiquidacionesService } from '../../liquidaciones/service/liquidaciones.service';
import { AnunciantesService } from '../../anunciantes/service/anunciantes.service';
import { ReclamosService } from '../../reclamos/service/reclamos.service';

import type { EntityManager } from 'typeorm';

@Injectable()
export class OperacionesLiquidacionService implements OnApplicationBootstrap, OnModuleDestroy {
  private readonly logger = new Logger(OperacionesLiquidacionService.name);
  private temporizador?: ReturnType<typeof setInterval>;
  private avisosEnCurso?: Promise<void>;

  constructor(private readonly reembolsosService: ReembolsosService, private readonly reservasService: ReservasService, private readonly liquidaciones: LiquidacionesService, private readonly catalogos: CatalogosService, private readonly anunciantes: AnunciantesService, private readonly reclamos: ReclamosService, private readonly notificaciones?: ReservaNotificacionesService) {}

  onApplicationBootstrap(): void {
    void this.avisarLiquidacionesDisponibles();
    this.temporizador = setInterval(() => void this.avisarLiquidacionesDisponibles(), 60_000);
    this.temporizador.unref();
  }

  async onModuleDestroy(): Promise<void> {
    if (this.temporizador) clearInterval(this.temporizador);
    await this.avisosEnCurso;
  }

  avisarLiquidacionesDisponibles(ahora = new Date()): Promise<void> {
    this.avisosEnCurso ??= this.procesarAvisos(ahora).finally(() => { this.avisosEnCurso = undefined; });
    return this.avisosEnCurso;
  }

  private async procesarAvisos(ahora: Date): Promise<void> {
    try {
      const vencidas = await this.liquidaciones.listarIngresosNoVerificadosVencidos(ahora, MAX_INTENTOS_CODIGO);
      for (const id of vencidas) {
        try {
          await this.reservasService.conReservaBloqueada(id, async (reserva, transaccion) => {
            const fecha = this.liquidaciones.fechaDisponiblePagoManual(reserva);
            if (!fecha || fecha > fechaArgentina(ahora) || reserva.cancelada ||
                !this.reservasService.pagoAprobado(reserva) || this.reservasService.codigoValidado(reserva) ||
                !this.vencePorIngresoNoVerificado(reserva) ||
                await this.tieneDevolucionActiva(id, transaccion) ||
                await this.reclamos.tieneReclamoAbierto(id, transaccion)) return;
            await this.liquidaciones.registrarVencimientoIngreso(reserva, transaccion);
          });
        } catch {
          this.logger.warn(`No se pudo procesar el ingreso no verificado de la reserva ${id}.`);
        }
      }
      if (!this.notificaciones) return;
      const pendientes = await this.liquidaciones.listarReservasPendientesDeAviso(ahora);
      const hoy = fechaArgentina(ahora);
      for (const id of pendientes) {
        try {
          await this.reservasService.conReservaBloqueada(id, async (reserva, transaccion) => {
            await this.avisarSiDisponible(reserva, hoy, ahora, transaccion);
          });
        } catch {
          this.logger.warn(`Quedaron pendientes los avisos de liquidación de la reserva ${id}.`);
        }
      }
    } catch {
      this.logger.warn('No se pudieron consultar los avisos pendientes de liquidación.');
    }
  }

  /** T36, extendido por T34: vence la retenida y la que está en revisión solo por el código bloqueado. */
  private vencePorIngresoNoVerificado(reserva: Reserva): boolean {
    const estado = reserva.estado_liquidacion;
    return estado === this.catalogos.codigoEstado('LIQUIDACION_RESERVA', 'RETENIDO') ||
      (estado === this.catalogos.codigoEstado('LIQUIDACION_RESERVA', 'EN_REVISION') && this.reservasService.codigoBloqueado(reserva));
  }

  private async avisarSiDisponible(reserva: Reserva, hoy: string, ahora: Date, transaccion: EntityManager): Promise<void> {
    if (!this.notificaciones) return;
    const fecha = this.liquidaciones.fechaDisponiblePagoManual(reserva);
    if (!fecha || fecha > hoy || reserva.cancelada || !this.reservasService.pagoAprobado(reserva) ||
        reserva.estado_liquidacion !== this.catalogos.codigoEstado('LIQUIDACION_RESERVA', 'PENDIENTE_PAGO_PROPIETARIO')) return;

    const liquidacion = await this.liquidaciones.asegurarParaReserva(reserva, transaccion);
    if (liquidacion.aviso_pago_admin_en && liquidacion.aviso_pago_anunciante_en) return;
    const idAnunciante = reserva.publicacion?.anunciante?.idUsuario;
    if (!idAnunciante || !await this.anunciantes.buscarCbuValidado(idAnunciante, transaccion) ||
        await this.tieneDevolucionActiva(reserva.id, transaccion)) return;

    const asunto = 'Liquidación disponible para pago manual';
    const [admin, anunciante] = await Promise.all([
      !liquidacion.aviso_pago_admin_en && this.notificaciones.avisarCambio(reserva, ['admin'], asunto,
        'Ya podés gestionar el pago manual de esta reserva y registrar la transferencia en el panel de Administración.'),
      !liquidacion.aviso_pago_anunciante_en && this.notificaciones.avisarCambio(reserva, ['anunciante'], asunto,
        'Tu liquidación está disponible para pago manual. Administración ya puede gestionar el pago y podés seguir su estado en DEPA.'),
    ]);
    await this.liquidaciones.registrarAvisosPagoManual(liquidacion, { admin, anunciante }, ahora, transaccion);
  }

  async listarLiquidacionesAdministracion(): Promise<(Reserva & { fecha_disponible_pago: string | null })[]> {
    const reservas = await this.liquidaciones.listarParaAdministracion();
    const reembolsos = await this.reembolsosService.listarActivosPorReservas(reservas.map(reserva => reserva.id));
    const transferidas = new Set(reembolsos.map(reembolso => reembolso.reserva.id));
    return reservas.filter(reserva => !transferidas.has(reserva.id))
      .map(reserva => ({
        ...this.reservasService.prepararRespuesta(reserva),
        fecha_disponible_pago: this.liquidaciones.fechaDisponiblePagoManual(reserva),
        ...this.calcularComision(reserva, Number(reserva.monto_pago), false),
      }));
  }

  private calcularComision(reserva: Reserva, importe: number, huboDevolucion: boolean): { importe_comision_depa: number; importe_neto_anunciante: number } {
    const porcentaje = huboDevolucion || reserva.porcentaje_comision_depa == null ? 0 : reserva.porcentaje_comision_depa;
    const centavos = decimalEntero(importe, 2);
    const centesimasPorcentaje = decimalEntero(porcentaje, 2);
    const comision = (centavos * centesimasPorcentaje + 5000n) / 10000n;
    return { importe_comision_depa: Number(comision) / 100, importe_neto_anunciante: Number(centavos - comision) / 100 };
  }

  listarPagosRegistrados() {
    return this.liquidaciones.listarPagosRegistrados();
  }

  listarPagosDelAnunciante(idUsuario: number, idPublicacion?: number) {
    return this.liquidaciones.listarPagosDelAnunciante(idUsuario, idPublicacion);
  }

  async consultarCbuParaPago(idReserva: number): Promise<{ cbu: string | null }> {
    const reserva = await this.reservasService.obtenerReserva(idReserva);
    this.validarFechaPagoManual(reserva);
    const idAnunciante = reserva.publicacion?.anunciante?.idUsuario;
    return { cbu: idAnunciante ? await this.anunciantes.buscarCbuValidado(idAnunciante) : null };
  }

  async resolverLiquidacion(id: number, dto: ResolverLiquidacionDto, idAdmin: number): Promise<Reserva> {
    const permitidos: string[] = [
      this.catalogos.codigoEstado('LIQUIDACION_RESERVA', 'PAGADO_PROPIETARIO'),
      this.catalogos.codigoEstado('LIQUIDACION_RESERVA', 'DEVUELTO_INQUILINO'),
      this.catalogos.codigoEstado('LIQUIDACION_RESERVA', 'DEVUELTO_PARCIAL_INQUILINO'),
      this.catalogos.codigoEstado('LIQUIDACION_RESERVA', 'EN_REVISION'),
      this.catalogos.codigoEstado('LIQUIDACION_RESERVA', 'PENDIENTE_PAGO_PROPIETARIO'),
      this.catalogos.codigoEstado('LIQUIDACION_RESERVA', 'RETENIDO'),
    ];
    if (!permitidos.includes(dto.estado)) {
      throw new BadRequestException(
        'El estado solicitado no es una resolución administrativa válida',
      );
    }

    const reserva = await this.reservasService.conReservaBloqueada(id, async (actual, transaccion) => {
      this.validarResolucion(actual, dto);
      if (dto.estado !== this.catalogos.codigoEstado('LIQUIDACION_RESERVA', 'EN_REVISION') &&
          await this.reclamos.tieneReclamoAbierto(id, transaccion))
        throw new ConflictException('La reserva tiene un reclamo abierto; resolvelo antes de modificar la liquidación');
      const registraPago = dto.estado === this.catalogos.codigoEstado('LIQUIDACION_RESERVA', 'PAGADO_PROPIETARIO');
      const idAnunciante = actual.publicacion?.anunciante?.idUsuario;
      if (registraPago && (!idAnunciante || !await this.anunciantes.buscarCbuValidado(idAnunciante, transaccion))) {
        throw new ConflictException('El anunciante necesita un CBU validado para registrar el pago');
      }
      const esDevolucion =
        dto.estado === this.catalogos.codigoEstado('LIQUIDACION_RESERVA', 'DEVUELTO_INQUILINO') ||
        dto.estado === this.catalogos.codigoEstado('LIQUIDACION_RESERVA', 'DEVUELTO_PARCIAL_INQUILINO');
      if (esDevolucion) {
        await this.derivarReembolso(actual, dto, idAdmin, transaccion);
        return;
      }
      if (actual.cancelada && !registraPago)
        throw new ConflictException('Una reserva cancelada no puede volver al circuito de ingreso');
      await this.asegurarSinDevoluciones(id, transaccion);
      const pago = registraPago ? await this.reembolsosService.buscarPagoPorReserva(id, transaccion) : null;
      const bruto = pago ? this.reembolsosService.saldoReembolsable(pago) : Number(actual.monto_pago);
      await this.liquidaciones.registrarResolucion(actual, dto.estado, {
        importe: registraPago ? this.calcularComision(actual, bruto, Number(pago?.amount_refunded ?? 0) > 0).importe_neto_anunciante : null,
        moneda: pago?.currency ?? actual.moneda_contratada ?? 'ARS',
        referencia: dto.referencia ?? null,
        observacion: dto.observacion ?? null,
      }, idAdmin, transaccion);
      if (dto.estado === this.catalogos.codigoEstado('LIQUIDACION_RESERVA', 'RETENIDO'))
        actual.intentos_codigo = 0;
    });
    if (dto.estado === this.catalogos.codigoEstado('LIQUIDACION_RESERVA', 'PAGADO_PROPIETARIO'))
      await this.notificaciones?.avisarCambio(reserva, ['anunciante'], 'Pago al anunciante registrado', 'La administración registró el pago de tu liquidación. Podés consultar el detalle en DEPA.');
    return reserva;
  }

  private async derivarReembolso(reserva: Reserva, dto: ResolverLiquidacionDto, idAdmin: number, transaccion: EntityManager): Promise<void> {
    const pago = await this.reembolsosService.buscarPagoPorReserva(reserva.id, transaccion);
    if (!pago) throw new ConflictException('La reserva no tiene un pago registrado para devolver');
    const saldo = this.reembolsosService.saldoReembolsable(pago);
    const importe = dto.estado === this.catalogos.codigoEstado('LIQUIDACION_RESERVA', 'DEVUELTO_INQUILINO')
      ? saldo : Number(dto.importe ?? 0);
    if (!Number.isFinite(importe) || importe <= 0)
      throw new BadRequestException('Indicá un importe válido para la devolución');
    const referencia = `liq:${reserva.id}`;
    const existentes = await this.reembolsosService.listarPorReserva(reserva.id, transaccion);
    const previo = existentes.find(item => item.referencia_interna === referencia &&
      item.estado !== this.catalogos.codigoEstado('REEMBOLSO', 'RECHAZADO') &&
      item.estado !== this.catalogos.codigoEstado('REEMBOLSO', 'CANCELADO'));
    if (previo) {
      if (Math.abs(Number(previo.importe) - importe) > TOLERANCIA_MONETARIA)
        throw new ConflictException('Ya existe una devolución por otro importe');
      return;
    }
    await this.asegurarSinDevoluciones(reserva.id, transaccion);
    const intento = existentes.filter(item => item.referencia_interna === referencia).length;
    await this.reembolsosService.crearSolicitud({
      reserva, pago, importe,
      tipo: importe >= Number(pago.amount) - TOLERANCIA_MONETARIA ? TipoReembolso.TOTAL : TipoReembolso.PARCIAL,
      origen: OrigenReembolso.AJUSTE_ADMIN,
      motivo: dto.observacion?.trim() || 'Resolución administrativa de la liquidación',
      idSolicitadoPor: idAdmin,
      idempotencyKey: `${referencia}:${intento}`,
      referenciaInterna: referencia,
    }, transaccion);
    await this.liquidaciones.registrarRevision(reserva, 'Devolución derivada a Reembolsos', transaccion);
  }

  private async asegurarSinDevoluciones(id: number, transaccion?: EntityManager): Promise<void> {
    if (await this.tieneDevolucionActiva(id, transaccion))
      throw new ConflictException(
        'La reserva tiene una devolución registrada; no se puede pagar al propietario',
      );
  }

  private async tieneDevolucionActiva(id: number, transaccion?: EntityManager): Promise<boolean> {
    const existentes = await this.reembolsosService.listarPorReserva(id, transaccion);
    return existentes.some(
      (reembolso) =>
        reembolso.estado === this.catalogos.codigoEstado('REEMBOLSO', 'PENDIENTE') ||
        reembolso.estado === this.catalogos.codigoEstado('REEMBOLSO', 'EN_PROCESO') ||
        reembolso.estado === this.catalogos.codigoEstado('REEMBOLSO', 'FALLIDO') ||
        reembolso.estado === this.catalogos.codigoEstado('REEMBOLSO', 'APROBADO'),
    );
  }

  private validarResolucion(reserva: Reserva, dto: ResolverLiquidacionDto): void {
    if (
      reserva.cancelada &&
      reserva.estado_liquidacion !== this.catalogos.codigoEstado('LIQUIDACION_RESERVA', 'EN_REVISION')
    ) {
      throw new ConflictException('La reserva está cancelada');
    }
    const observacion = reserva.observacion_liquidacion ?? '';
    const devolucionEnEjecucion =
      observacion.includes('Devolución de') &&
      observacion.includes('en ejecución');
    const esDevolucion =
      dto.estado === this.catalogos.codigoEstado('LIQUIDACION_RESERVA', 'DEVUELTO_INQUILINO') ||
      dto.estado === this.catalogos.codigoEstado('LIQUIDACION_RESERVA', 'DEVUELTO_PARCIAL_INQUILINO');
    if (
      devolucionEnEjecucion &&
      (observacion.includes('reclamo') || !esDevolucion)
    ) {
      throw new ConflictException(
        'Hay una devolución en ejecución; esperá su resultado',
      );
    }
    if (!this.reservasService.pagoAprobado(reserva)) {
      throw new ConflictException(
        'La reserva no posee un pago aprobado para liquidar',
      );
    }
    if (this.reservasService.liquidacionResuelta(reserva)) {
      throw new ConflictException(
        'La liquidación de la reserva ya fue resuelta',
      );
    }
    if (
      dto.estado === this.catalogos.codigoEstado('LIQUIDACION_RESERVA', 'PAGADO_PROPIETARIO') &&
      reserva.estado_liquidacion !== this.catalogos.codigoEstado('LIQUIDACION_RESERVA', 'PENDIENTE_PAGO_PROPIETARIO')
    ) {
      throw new ConflictException(
        'La liquidación todavía no está pendiente de pago al propietario',
      );
    }
    if (
      dto.estado === this.catalogos.codigoEstado('LIQUIDACION_RESERVA', 'PAGADO_PROPIETARIO') &&
      this.reservasService.liquidacionEnRevision(reserva)
    ) {
      throw new ConflictException(
        'No se puede pagar al propietario con una liquidación en revisión',
      );
    }
    if (dto.estado === this.catalogos.codigoEstado('LIQUIDACION_RESERVA', 'PAGADO_PROPIETARIO')) {
      this.validarFechaPagoManual(reserva);
    }
  }

  private validarFechaPagoManual(reserva: Reserva): void {
    const fecha = this.liquidaciones.fechaDisponiblePagoManual(reserva);
    if (!fecha) throw new ConflictException('La reserva necesita fechas válidas para registrar el pago al propietario');
    if (fecha > fechaArgentina()) {
      throw new ConflictException(`El pago al propietario se habilita el ${fecha.split('-').reverse().join('/')}, cinco días después del fin de la estadía.`);
    }
  }
}
