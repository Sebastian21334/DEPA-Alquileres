import { CatalogosService } from '../../catalogos/service/catalogos.service';
import {
  Injectable,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { Reserva } from '../../reservas/entity/reserva.entity';
import { ResolverLiquidacionDto } from '../dto/resolver-liquidacion.dto';
import { ReembolsosService } from '../../reembolsos/service/reembolsos.service';
import {
  OrigenReembolso,
  Reembolso,
  TipoReembolso,
} from '../../reembolsos/entity/reembolso.entity';
import { TOLERANCIA_MONETARIA } from '../../common/utils/dinero';
import { ReservasService } from '../../reservas/service/reservas.service';
import { LiquidacionesService } from '../../liquidaciones/service/liquidaciones.service';
import { AnunciantesService } from '../../anunciantes/service/anunciantes.service';

import type { EntityManager } from 'typeorm';

@Injectable()
export class OperacionesLiquidacionService {
  constructor(private readonly reembolsosService: ReembolsosService, private readonly reservasService: ReservasService, private readonly liquidaciones: LiquidacionesService, private readonly catalogos: CatalogosService, private readonly anunciantes: AnunciantesService) {}

  async listarLiquidacionesAdministracion(): Promise<Reserva[]> {
    const reservas = await this.liquidaciones.listarParaAdministracion();
    const reembolsos = await this.reembolsosService.listarActivosPorReservas(reservas.map(reserva => reserva.id));
    const transferidas = new Set(reembolsos.map(reembolso => reembolso.reserva.id));
    return reservas.filter(reserva => !transferidas.has(reserva.id))
      .map(reserva => this.reservasService.prepararRespuesta(reserva));
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

    return this.reservasService.conReservaBloqueada(id, async (actual, transaccion) => {
      this.validarResolucion(actual, dto);
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
      await this.liquidaciones.registrarResolucion(actual, dto.estado, {
        importe: registraPago ? (pago ? this.reembolsosService.saldoReembolsable(pago) : Number(actual.monto_pago)) : null,
        moneda: pago?.currency ?? actual.moneda_contratada ?? 'ARS',
        referencia: dto.referencia ?? null,
        observacion: dto.observacion ?? null,
      }, idAdmin, transaccion);
      if (dto.estado === this.catalogos.codigoEstado('LIQUIDACION_RESERVA', 'RETENIDO'))
        actual.intentos_codigo = 0;
    });
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
    const existentes = await this.reembolsosService.listarPorReserva(id, transaccion);
    const activa = existentes.find(
      (reembolso) =>
        reembolso.estado === this.catalogos.codigoEstado('REEMBOLSO', 'PENDIENTE') ||
        reembolso.estado === this.catalogos.codigoEstado('REEMBOLSO', 'EN_PROCESO') ||
        reembolso.estado === this.catalogos.codigoEstado('REEMBOLSO', 'FALLIDO') ||
        reembolso.estado === this.catalogos.codigoEstado('REEMBOLSO', 'APROBADO'),
    );
    if (activa)
      throw new ConflictException(
        'La reserva tiene una devolución registrada; no se puede pagar al propietario',
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
      !this.reservasService.codigoValidado(reserva)
    ) {
      throw new ConflictException(
        'No se puede registrar el pago al propietario sin validar el código',
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
  }

}
