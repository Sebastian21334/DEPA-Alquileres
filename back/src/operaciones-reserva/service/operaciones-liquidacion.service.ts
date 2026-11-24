import { ROL } from '../../catalogos/codigos-catalogo';
import { CatalogosService } from '../../catalogos/service/catalogos.service';
import {
  Injectable,
  ConflictException,
  BadRequestException,
  NotFoundException,
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
import { AlmacenamientoService, type ComprobanteSubido } from '../../almacenamiento/service/almacenamiento.service';
import { RegistrarTransferenciaDto } from '../dto/registrar-transferencia.dto';
import type { LiquidacionPendienteDto } from '../dto/liquidacion-pendiente.dto';
import type { ConDesglose, DesglosePagoRegistradoDto } from '../dto/pago-registrado.dto';
import type { Pago } from '../../pagos/entity/pago.entity';

import type { EntityManager } from 'typeorm';

const centavos = (importe: number): number => Math.round(importe * 100);

@Injectable()
export class OperacionesLiquidacionService implements OnApplicationBootstrap, OnModuleDestroy {
  private readonly logger = new Logger(OperacionesLiquidacionService.name);
  private temporizador?: ReturnType<typeof setInterval>;
  private avisosEnCurso?: Promise<void>;

  constructor(private readonly reembolsosService: ReembolsosService, private readonly reservasService: ReservasService, private readonly liquidaciones: LiquidacionesService, private readonly catalogos: CatalogosService, private readonly anunciantes: AnunciantesService, private readonly reclamos: ReclamosService, private readonly notificaciones?: ReservaNotificacionesService, private readonly almacenamiento?: AlmacenamientoService) {}

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
                await this.reembolsosService.tieneDevolucionEnCurso(id, transaccion) ||
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

  /** Al vencer el plazo sin ingreso validado, vence la retenida y la que está en revisión solo por el código bloqueado. */
  private vencePorIngresoNoVerificado(reserva: Reserva): boolean {
    const estado = reserva.estado_liquidacion;
    return estado === this.catalogos.codigoEstado('LIQUIDACION_RESERVA', 'RETENIDO') ||
      (estado === this.catalogos.codigoEstado('LIQUIDACION_RESERVA', 'EN_REVISION') && this.reservasService.codigoBloqueado(reserva));
  }

  private async avisarSiDisponible(reserva: Reserva, hoy: string, ahora: Date, transaccion: EntityManager): Promise<void> {
    if (!this.notificaciones) return;
    const fecha = this.liquidaciones.fechaDisponiblePagoManual(reserva);
    // Avisa cuando hay algo para pagarle: también el resto de una devolución parcial o lo retenido de una cancelación.
    if (!fecha || fecha > hoy || !this.reservasService.pagoAprobado(reserva) ||
        !this.liquidaciones.admitePagoAlAnunciante(reserva.estado_liquidacion)) return;

    const liquidacion = await this.liquidaciones.asegurarParaReserva(reserva, transaccion);
    if (liquidacion.aviso_pago_admin_en && liquidacion.aviso_pago_anunciante_en) return;
    const idAnunciante = reserva.publicacion?.anunciante?.idUsuario;
    if (!idAnunciante || !await this.anunciantes.buscarCbuValidado(idAnunciante, transaccion) ||
        await this.reembolsosService.tieneDevolucionEnCurso(reserva.id, transaccion)) return;

    const asunto = 'Liquidación disponible para pago manual';
    const [admin, anunciante] = await Promise.all([
      !liquidacion.aviso_pago_admin_en && this.notificaciones.avisarCambio(reserva, ['admin'], asunto,
        'Ya podés gestionar el pago manual de esta reserva y registrar la transferencia en el panel de Administración.'),
      !liquidacion.aviso_pago_anunciante_en && this.notificaciones.avisarCambio(reserva, ['anunciante'], asunto,
        'Tu liquidación está disponible para pago manual. Administración ya puede gestionar el pago y podés seguir su estado en DEPA.'),
    ]);
    await this.liquidaciones.registrarAvisosPagoManual(liquidacion, { admin, anunciante }, ahora, transaccion);
  }

  async listarLiquidacionesAdministracion(): Promise<LiquidacionPendienteDto[]> {
    const reservas = await this.liquidaciones.listarParaAdministracion();
    const ids = reservas.map(reserva => reserva.id);
    // Primero se le paga al inquilino en Reembolsos; recién después aparece el resto para el anunciante.
    const [enCurso, pagos] = await Promise.all([
      this.reembolsosService.listarEnCursoPorReservas(ids),
      this.reembolsosService.listarPagosPorReservas(ids),
    ]);
    const conDevolucionEnCurso = new Set(enCurso.map(reembolso => reembolso.reserva.id));
    const pagoPorReserva = new Map(pagos.map(pago => [pago.reserva.id, pago]));
    return reservas.filter(reserva => !conDevolucionEnCurso.has(reserva.id))
      .map(reserva => this.conDatosDeLiquidacion(reserva, pagoPorReserva.get(reserva.id) ?? null));
  }

  private conDatosDeLiquidacion(reserva: Reserva, pago: Pago | null): LiquidacionPendienteDto {
    const importe = this.importeParaAnunciante(reserva, pago);
    const fecha = this.liquidaciones.fechaDisponiblePagoManual(reserva);
    return {
      ...this.reservasService.prepararRespuesta(reserva),
      fecha_disponible_pago: fecha,
      importe_a_liquidar: importe,
      moneda_liquidacion: pago?.currency ?? reserva.moneda_contratada ?? 'ARS',
      ...this.calcularComision(reserva, importe, Number(pago?.amount_refunded ?? 0) > 0),
      habilitada_para_pago: this.reservasService.pagoAprobado(reserva) && importe > TOLERANCIA_MONETARIA &&
        this.liquidaciones.admitePagoAlAnunciante(reserva.estado_liquidacion) && !!fecha && fecha <= fechaArgentina(),
    };
  }

  /** Lo que pagó el inquilino menos lo que ya se le devolvió le corresponde al anunciante. */
  private importeParaAnunciante(reserva: Reserva, pago: Pago | null): number {
    return pago ? this.reembolsosService.saldoReembolsable(pago) : Number(reserva.monto_pago);
  }

  private calcularComision(reserva: Reserva, importe: number, huboDevolucion: boolean): { importe_comision_depa: number; importe_neto_anunciante: number } {
    const porcentaje = huboDevolucion || reserva.porcentaje_comision_depa == null ? 0 : reserva.porcentaje_comision_depa;
    const centavos = decimalEntero(importe, 2);
    const centesimasPorcentaje = decimalEntero(porcentaje, 2);
    const comision = (centavos * centesimasPorcentaje + 5000n) / 10000n;
    return { importe_comision_depa: Number(comision) / 100, importe_neto_anunciante: Number(centavos - comision) / 100 };
  }

  async listarPagosRegistrados() {
    return this.conDesglose(await this.liquidaciones.listarPagosRegistrados());
  }

  async listarPagosDelAnunciante(idUsuario: number, idPublicacion?: number) {
    return this.conDesglose(await this.liquidaciones.listarPagosDelAnunciante(idUsuario, idPublicacion));
  }

  /** Suma a cada pago registrado cómo se repartió el cobro de su reserva, con los pagos de Mercado Pago en una sola consulta. */
  private async conDesglose<T extends { reservaId: number; importe: number | null }>(registros: T[]): Promise<ConDesglose<T>[]> {
    const cobros = await this.reembolsosService.listarPagosPorReservas([...new Set(registros.map(registro => registro.reservaId))]);
    const cobroPorReserva = new Map(cobros.map(cobro => [cobro.reserva.id, cobro]));
    const pagadoPorReserva = new Map<number, number>();
    for (const { reservaId, importe } of registros)
      pagadoPorReserva.set(reservaId, (pagadoPorReserva.get(reservaId) ?? 0) + centavos(importe ?? 0));
    return registros.map(registro => ({
      ...registro,
      desglose: this.desglosar(cobroPorReserva.get(registro.reservaId), pagadoPorReserva.get(registro.reservaId) ?? 0),
    }));
  }

  /** La comisión es lo que quedó entre lo cobrado y lo transferido, no un recálculo del porcentaje. */
  private desglosar(cobro: Pago | undefined, pagadoEnCentavos: number): DesglosePagoRegistradoDto | null {
    if (!cobro) return null;
    const pagado = centavos(Number(cobro.amount));
    const devuelto = centavos(Number(cobro.amount_refunded ?? 0));
    const comision = (pagado - devuelto - pagadoEnCentavos) / 100;
    return {
      pagoInquilino: pagado / 100,
      devueltoInquilino: devuelto / 100,
      comisionDepa: comision > TOLERANCIA_MONETARIA ? comision : 0,
      pagadoAnunciante: pagadoEnCentavos / 100,
    };
  }

  /** Datos para transferir: el CBU validado y el CUIT/CUIL para confirmar el destinatario. */
  async consultarCbuParaPago(idReserva: number): Promise<{ cbu: string | null; cuit_cuil: string | null }> {
    const reserva = await this.reservasService.obtenerReserva(idReserva);
    this.validarFechaPagoManual(reserva);
    const idAnunciante = reserva.publicacion?.anunciante?.idUsuario;
    if (!idAnunciante) return { cbu: null, cuit_cuil: null };
    const [cbu, anunciante] = await Promise.all([this.anunciantes.buscarCbuValidado(idAnunciante), this.anunciantes.buscarPorUsuario(idAnunciante)]);
    return { cbu, cuit_cuil: anunciante?.cuit_cuil ?? null };
  }

  /**
   * El admin registra la transferencia al anunciante con el comprobante obligatorio.
   * El archivo se sube después de las validaciones previas y se borra si el pago no queda registrado.
   */
  async registrarPagoAnunciante(id: number, dto: RegistrarTransferenciaDto, archivo: Express.Multer.File | undefined, idAdmin: number): Promise<Reserva> {
    const estado = this.catalogos.codigoEstado('LIQUIDACION_RESERVA', 'PAGADO_PROPIETARIO');
    this.validarResolucion(await this.reservasService.obtenerReserva(id), { estado });
    if (!this.almacenamiento) throw new Error('Falta el almacenamiento de comprobantes');
    const comprobante = await this.almacenamiento.subirComprobante(`liquidaciones/${id}`, archivo);
    let guardado = false;
    try {
      return await this.resolver(id, { ...dto, estado }, idAdmin, { comprobante, alGuardar: () => { guardado = true; } });
    } finally {
      if (!guardado)
        await this.almacenamiento.eliminarComprobante(comprobante.url).catch(() =>
          this.logger.warn(`No se pudo borrar el comprobante sin usar del pago de la reserva ${id}`));
    }
  }

  /** Enlace firmado del comprobante del pago, solo para el admin y el anunciante de la reserva. */
  async urlComprobantePago(idReserva: number, indice: number, actor: { id: number; rol?: string }): Promise<{ url: string }> {
    const comprobante = await this.liquidaciones.buscarComprobantePago(idReserva, indice);
    const autorizado = actor.rol === ROL.ADMINISTRADOR || (comprobante?.idAnunciante != null && comprobante.idAnunciante === actor.id);
    if (!comprobante || !autorizado) throw new NotFoundException('Comprobante no encontrado');
    if (!this.almacenamiento) throw new Error('Falta el almacenamiento de comprobantes');
    return { url: await this.almacenamiento.firmarComprobante(comprobante.url) };
  }

  /** El pago al anunciante se registra con su comprobante en `registrarPagoAnunciante`. */
  async resolverLiquidacion(id: number, dto: ResolverLiquidacionDto, idAdmin: number): Promise<Reserva> {
    if (dto.estado === this.catalogos.codigoEstado('LIQUIDACION_RESERVA', 'PAGADO_PROPIETARIO'))
      throw new BadRequestException('Registrá el pago al anunciante con el comprobante de la transferencia');
    return this.resolver(id, dto, idAdmin);
  }

  private async resolver(id: number, dto: ResolverLiquidacionDto, idAdmin: number, pago?: { comprobante: ComprobanteSubido; alGuardar: () => void }): Promise<Reserva> {
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
    if (this.esDevolucion(dto.estado) && !dto.observacion?.trim())
      throw new BadRequestException('Indicá el motivo de la devolución al inquilino');

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
      if (this.esDevolucion(dto.estado)) {
        await this.derivarReembolso(actual, dto, idAdmin, transaccion);
        return;
      }
      // Una cancelada no vuelve a esperar el ingreso: lo retenido solo se revisa o se le paga al anunciante.
      if (actual.cancelada && dto.estado === this.catalogos.codigoEstado('LIQUIDACION_RESERVA', 'RETENIDO'))
        throw new ConflictException('Una reserva cancelada no puede volver al circuito de ingreso');
      await this.asegurarSinDevoluciones(id, transaccion);
      const cobro = registraPago ? await this.reembolsosService.buscarPagoPorReserva(id, transaccion) : null;
      const bruto = this.importeParaAnunciante(actual, cobro);
      if (registraPago && bruto <= TOLERANCIA_MONETARIA)
        throw new ConflictException('No queda importe para liquidar al anunciante');
      await this.liquidaciones.registrarResolucion(actual, dto.estado, {
        importe: registraPago ? this.calcularComision(actual, bruto, Number(cobro?.amount_refunded ?? 0) > 0).importe_neto_anunciante : null,
        moneda: cobro?.currency ?? actual.moneda_contratada ?? 'ARS',
        referencia: dto.referencia ?? null,
        observacion: dto.observacion ?? null,
        comprobante: registraPago ? pago?.comprobante ?? null : null,
      }, idAdmin, transaccion);
      if (dto.estado === this.catalogos.codigoEstado('LIQUIDACION_RESERVA', 'RETENIDO'))
        actual.intentos_codigo = 0;
    });
    // Recién con la transacción confirmada el comprobante queda en uso; si algo falló, quien lo subió lo borra.
    pago?.alGuardar();
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
    // Un reintento coincide con la devolución en curso; una ya aprobada está descontada del saldo y no impide devolver el resto.
    const previo = existentes.find(item => item.referencia_interna === referencia &&
      item.estado !== this.catalogos.codigoEstado('REEMBOLSO', 'RECHAZADO') &&
      item.estado !== this.catalogos.codigoEstado('REEMBOLSO', 'CANCELADO') &&
      item.estado !== this.catalogos.codigoEstado('REEMBOLSO', 'APROBADO'));
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

  /** Una devolución aprobada ya está descontada del saldo; solo frena la que todavía puede mover dinero. */
  private async asegurarSinDevoluciones(id: number, transaccion?: EntityManager): Promise<void> {
    if (await this.reembolsosService.tieneDevolucionEnCurso(id, transaccion))
      throw new ConflictException(
        'La reserva tiene una devolución en curso; resolvela en Reembolsos antes de liquidar',
      );
  }

  private esDevolucion(estado: string): boolean {
    return estado === this.catalogos.codigoEstado('LIQUIDACION_RESERVA', 'DEVUELTO_INQUILINO') ||
      estado === this.catalogos.codigoEstado('LIQUIDACION_RESERVA', 'DEVUELTO_PARCIAL_INQUILINO');
  }

  private validarResolucion(reserva: Reserva, dto: ResolverLiquidacionDto): void {
    const pendienteParaAnunciante = this.liquidaciones.admitePagoAlAnunciante(reserva.estado_liquidacion);
    if (reserva.cancelada && !this.reservasService.liquidacionEnRevision(reserva) && !pendienteParaAnunciante) {
      throw new ConflictException('La reserva está cancelada');
    }
    const observacion = reserva.observacion_liquidacion ?? '';
    const devolucionEnEjecucion =
      observacion.includes('Devolución de') &&
      observacion.includes('en ejecución');
    const esDevolucion = this.esDevolucion(dto.estado);
    const registraPago = dto.estado === this.catalogos.codigoEstado('LIQUIDACION_RESERVA', 'PAGADO_PROPIETARIO');
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
    // Después de una devolución parcial solo queda pagarle el resto al anunciante o devolvérselo al inquilino.
    if (this.reservasService.liquidacionResuelta(reserva) && !(pendienteParaAnunciante && (registraPago || esDevolucion))) {
      throw new ConflictException(
        'La liquidación de la reserva ya fue resuelta',
      );
    }
    if (registraPago && !pendienteParaAnunciante) {
      throw new ConflictException(
        'La liquidación todavía no está pendiente de pago al propietario',
      );
    }
    if (registraPago && this.reservasService.liquidacionEnRevision(reserva)) {
      throw new ConflictException(
        'No se puede pagar al propietario con una liquidación en revisión',
      );
    }
    if (registraPago) {
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
