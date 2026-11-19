import { CatalogosService } from '../../catalogos/service/catalogos.service';
import {
  Injectable,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { Reserva } from '../../reservas/entity/reserva.entity';
import { ResolverLiquidacionDto } from '../dto/resolver-liquidacion.dto';
import { LiquidacionPendienteDto } from '../dto/liquidacion-pendiente.dto';
import type { ReservaRespuestaDto } from '../../reservas-consulta/dto/reserva-respuesta.dto';
import type { Pago } from '../../pagos/entity/pago.entity';
import { PagosService } from '../../pagos/service/pagos.service';
import { ReembolsosService } from '../../reembolsos/service/reembolsos.service';
import {
  OrigenReembolso,
  TipoReembolso,
} from '../../reembolsos/entity/reembolso.entity';
import { TOLERANCIA_MONETARIA } from '../../common/utils/dinero';
import { ReservasService } from '../../reservas/service/reservas.service';
import { LiquidacionesService } from '../../liquidaciones/service/liquidaciones.service';
import { AnunciantesService } from '../../anunciantes/service/anunciantes.service';

import type { EntityManager } from 'typeorm';

@Injectable()
export class OperacionesLiquidacionService {
  constructor(private readonly reembolsosService: ReembolsosService, private readonly reservasService: ReservasService, private readonly liquidaciones: LiquidacionesService, private readonly catalogos: CatalogosService, private readonly anunciantes: AnunciantesService, private readonly pagos: PagosService) {}

  async listarLiquidacionesAdministracion(): Promise<LiquidacionPendienteDto[]> {
    const reservas = await this.liquidaciones.listarParaAdministracion();
    const ids = reservas.map(reserva => reserva.id);
    // Primero se le paga al inquilino en Reembolsos; recién después aparece el resto para el anunciante.
    const enCurso = new Set((await this.reembolsosService.listarEnCursoPorReservas(ids)).map(reembolso => reembolso.reserva.id));
    const pagos = new Map((await this.pagos.listarPorReservas(ids)).map(pago => [pago.reserva.id, pago]));
    return reservas.filter(reserva => !enCurso.has(reserva.id))
      .map(reserva => this.conDatosDeLiquidacion(this.reservasService.prepararRespuesta(reserva), pagos.get(reserva.id) ?? null));
  }

  listarPagosRegistrados() {
    return this.liquidaciones.listarPagosRegistrados();
  }

  listarPagosDelAnunciante(idUsuario: number, idPublicacion: number) {
    return this.liquidaciones.listarPagosDelAnunciante(idUsuario, idPublicacion);
  }

  async consultarCbuParaPago(idReserva: number): Promise<{ cbu: string | null }> {
    const reserva = await this.reservasService.obtenerReserva(idReserva);
    const idAnunciante = reserva.publicacion?.anunciante?.idUsuario;
    return { cbu: idAnunciante ? await this.anunciantes.buscarCbuValidado(idAnunciante) : null };
  }

  async resolverLiquidacion(id: number, dto: ResolverLiquidacionDto, idAdmin: number): Promise<LiquidacionPendienteDto> {
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

    const registraPago = dto.estado === this.catalogos.codigoEstado('LIQUIDACION_RESERVA', 'PAGADO_PROPIETARIO');
    const esDevolucion = this.esDevolucion(dto.estado);
    if (esDevolucion && !dto.observacion?.trim())
      throw new BadRequestException('Indicá el motivo de la devolución al inquilino');

    const reserva = await this.reservasService.conReservaBloqueada(id, async (actual, transaccion) => {
      this.validarResolucion(actual, dto);
      const idAnunciante = actual.publicacion?.anunciante?.idUsuario;
      if (registraPago && (!idAnunciante || !await this.anunciantes.buscarCbuValidado(idAnunciante, transaccion))) {
        throw new ConflictException('El anunciante necesita un CBU validado para registrar el pago');
      }
      if (esDevolucion) {
        await this.derivarReembolso(actual, dto, idAdmin, transaccion);
        return;
      }
      // Una cancelada no vuelve a esperar el ingreso: solo se le paga al anunciante lo retenido.
      const cierraRevisionDeCancelada = actual.cancelada &&
        dto.estado === this.catalogos.codigoEstado('LIQUIDACION_RESERVA', 'PENDIENTE_PAGO_PROPIETARIO');
      if (actual.cancelada && !registraPago && !cierraRevisionDeCancelada)
        throw new ConflictException('Una reserva cancelada no puede volver al circuito de ingreso');
      await this.asegurarSinDevoluciones(id, transaccion);
      const pago = await this.reembolsosService.buscarPagoPorReserva(id, transaccion);
      const importe = this.importeParaAnunciante(actual, pago);
      if ((registraPago || cierraRevisionDeCancelada) && importe <= TOLERANCIA_MONETARIA)
        throw new ConflictException('No queda importe para liquidar al anunciante');
      await this.liquidaciones.registrarResolucion(actual, dto.estado, {
        importe: registraPago ? importe : null,
        moneda: this.monedaLiquidacion(actual, pago),
        referencia: dto.referencia ?? null,
        observacion: dto.observacion ?? null,
      }, idAdmin, transaccion);
      if (dto.estado === this.catalogos.codigoEstado('LIQUIDACION_RESERVA', 'RETENIDO'))
        actual.intentos_codigo = 0;
    });
    return this.conDatosDeLiquidacion(reserva, await this.reembolsosService.buscarPagoPorReserva(id));
  }

  /** Lo que pagó el inquilino menos lo que ya se le devolvió le corresponde al anunciante. */
  private importeParaAnunciante(reserva: Reserva, pago: Pago | null): number {
    return pago ? this.pagos.saldoReembolsable(pago) : Number(reserva.monto_pago);
  }

  private monedaLiquidacion(reserva: Reserva, pago: Pago | null): string {
    return pago?.currency ?? reserva.moneda_contratada ?? 'ARS';
  }

  private conDatosDeLiquidacion(reserva: ReservaRespuestaDto, pago: Pago | null): LiquidacionPendienteDto {
    const importe = this.importeParaAnunciante(reserva, pago);
    return Object.assign(reserva, {
      importe_a_liquidar: importe,
      moneda_liquidacion: this.monedaLiquidacion(reserva, pago),
      habilitada_para_pago: importe > TOLERANCIA_MONETARIA && this.reservasService.anuncianteHabilitadoParaCobrar(reserva),
    });
  }

  private esDevolucion(estado: string): boolean {
    return estado === this.catalogos.codigoEstado('LIQUIDACION_RESERVA', 'DEVUELTO_INQUILINO') ||
      estado === this.catalogos.codigoEstado('LIQUIDACION_RESERVA', 'DEVUELTO_PARCIAL_INQUILINO');
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
    // Un reintento coincide con la devolución en curso; una ya aprobada está
    // descontada del saldo y no impide devolver el resto.
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

  private validarResolucion(reserva: Reserva, dto: ResolverLiquidacionDto): void {
    const pendienteParaAnunciante = this.liquidaciones.admitePagoAlAnunciante(reserva.estado_liquidacion);
    if (reserva.cancelada && !this.reservasService.liquidacionEnRevision(reserva) && !pendienteParaAnunciante) {
      throw new ConflictException('La reserva está cancelada');
    }
    const registraPago = dto.estado === this.catalogos.codigoEstado('LIQUIDACION_RESERVA', 'PAGADO_PROPIETARIO');
    const observacion = reserva.observacion_liquidacion ?? '';
    const devolucionEnEjecucion =
      observacion.includes('Devolución de') &&
      observacion.includes('en ejecución');
    const esDevolucion = this.esDevolucion(dto.estado);
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
    if (
      this.reservasService.liquidacionResuelta(reserva) &&
      !(pendienteParaAnunciante && (registraPago || esDevolucion))
    ) {
      throw new ConflictException(
        'La liquidación de la reserva ya fue resuelta',
      );
    }
    if (registraPago && !this.reservasService.codigoValidado(reserva) && !reserva.cancelada) {
      throw new ConflictException(
        'No se puede registrar el pago al propietario sin validar el código',
      );
    }
    if (registraPago && this.reservasService.liquidacionEnRevision(reserva)) {
      throw new ConflictException(
        'No se puede pagar al propietario con una liquidación en revisión',
      );
    }
    if (registraPago && !this.reservasService.anuncianteHabilitadoParaCobrar(reserva)) {
      throw new ConflictException(
        'La liquidación no está pendiente de pago al anunciante',
      );
    }
  }

}
