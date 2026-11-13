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

import type { EntityManager } from 'typeorm';

@Injectable()
export class OperacionesLiquidacionService {
  constructor(private readonly reembolsosService: ReembolsosService, private readonly reservasService: ReservasService, private readonly liquidaciones: LiquidacionesService, private readonly catalogos: CatalogosService) {}

  async listarLiquidacionesAdministracion(): Promise<Reserva[]> {
    const reservas = await this.liquidaciones.listarParaAdministracion();
    return reservas.map(reserva => this.reservasService.prepararRespuesta(reserva));
  }

  /** Registra una decisión administrativa; la devolución se ejecuta antes de modificar la reserva. */
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

    const reserva = await this.liquidaciones.proyectarEnReserva(await this.reservasService.obtenerReserva(id));
    this.validarResolucion(reserva, dto);
    if (dto.estado === this.catalogos.codigoEstado('LIQUIDACION_RESERVA', 'PAGADO_PROPIETARIO'))
      await this.asegurarSinDevoluciones(id);

    const esDevolucion =
      dto.estado === this.catalogos.codigoEstado('LIQUIDACION_RESERVA', 'DEVUELTO_INQUILINO') ||
      dto.estado === this.catalogos.codigoEstado('LIQUIDACION_RESERVA', 'DEVUELTO_PARCIAL_INQUILINO');

    if (esDevolucion) {
      const devolucion = await this.ejecutarDevolucion(reserva, dto, idAdmin);
      const aplicada = await this.reembolsosService.aplicarConfirmado(devolucion.id, (confirmado, transaccion) =>
        this.reservasService.aplicarEfectoReembolso(confirmado, transaccion, dto.observacion),
      );
      return aplicada ?? this.reservasService.prepararRespuesta(await this.reservasService.obtenerReserva(id));
    }

    return this.reservasService.conReservaBloqueada(id, async (actual, transaccion) => {
      this.validarResolucion(actual, dto);
      const registraPago = dto.estado === this.catalogos.codigoEstado('LIQUIDACION_RESERVA', 'PAGADO_PROPIETARIO');
      if (registraPago) await this.asegurarSinDevoluciones(id, transaccion);
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

  private async ejecutarDevolucion(reserva: Reserva, dto: ResolverLiquidacionDto, idAdmin: number): Promise<Reembolso> {
    const id = reserva.id;
    if (
      !this.reembolsosService.ejecucionAutomaticaHabilitada &&
      !dto.referencia?.trim()
    )
      throw new BadRequestException(
        'La referencia del comprobante de devolución es obligatoria',
      );
    const pago = await this.reembolsosService.buscarPagoPorReserva(id);
    if (!pago)
      throw new ConflictException(
        'La reserva no tiene un pago registrado para devolver',
      );
    const saldo = this.reembolsosService.saldoReembolsable(pago);
    const existentes = await this.reembolsosService.listarPorReserva(id);
    const previa = existentes.find(actual => actual.referencia_interna === `liq:${id}` &&
      actual.estado === this.catalogos.codigoEstado('REEMBOLSO', 'APROBADO') && !actual.aplicado_en);
    const importe =
      dto.estado === this.catalogos.codigoEstado('LIQUIDACION_RESERVA', 'DEVUELTO_INQUILINO')
        ? previa ? Number(previa.importe) : saldo
        : Number(dto.importe ?? 0);
    if (!Number.isFinite(importe) || importe <= 0)
      throw new BadRequestException(
        'Indicá el importe de la devolución parcial',
      );
    if (!previa && importe > saldo + TOLERANCIA_MONETARIA)
      throw new ConflictException(
        `La devolución supera el saldo reembolsable de ${pago.currency} ${saldo.toFixed(2)}`,
      );
    await this.prepararLiquidacion(id, dto);
    const enCurso = existentes.find(
      (actual) =>
        actual.origen === OrigenReembolso.AJUSTE_ADMIN &&
        (actual.referencia_interna === `liq:${id}` || actual.idempotency_key.startsWith(`liq:${id}:`)) &&
        (
          [
            this.catalogos.codigoEstado('REEMBOLSO', 'PENDIENTE'),
            this.catalogos.codigoEstado('REEMBOLSO', 'EN_PROCESO'),
            this.catalogos.codigoEstado('REEMBOLSO', 'FALLIDO'),
            this.catalogos.codigoEstado('REEMBOLSO', 'APROBADO'),
          ] as string[]
        ).includes(actual.estado),
    );
    let reembolso: Reembolso;
    if (enCurso) {
      if (Math.abs(Number(enCurso.importe) - importe) > TOLERANCIA_MONETARIA)
        throw new ConflictException(
          'Hay una devolución en curso por otro importe; revisar la liquidación',
        );
      reembolso = enCurso;
    } else {
      const sufijo =
        importe >= Number(pago.amount) - TOLERANCIA_MONETARIA ? 't' : 'p';
      const base = `liq:${id}:${sufijo}:${Math.round(importe * 100)}`;
      let clave = base;
      let intento = 1;
      while (
        existentes.some(
          (actual) =>
            actual.idempotency_key === clave &&
            (actual.estado === this.catalogos.codigoEstado('REEMBOLSO', 'RECHAZADO') ||
              actual.estado === this.catalogos.codigoEstado('REEMBOLSO', 'CANCELADO')),
        )
      )
        clave = `${base}:r${intento++}`;
      reembolso = await this.reembolsosService.crearSolicitud({
        reserva,
        pago,
        tipo:
          importe >= Number(pago.amount) - TOLERANCIA_MONETARIA
            ? TipoReembolso.TOTAL
            : TipoReembolso.PARCIAL,
        origen: OrigenReembolso.AJUSTE_ADMIN,
        importe,
        motivo:
          dto.observacion?.trim() ||
          'Resolución administrativa de la liquidación',
        idSolicitadoPor: idAdmin,
        idempotencyKey: clave,
        referenciaInterna: `liq:${id}`,
      });
    }

    if (
      reembolso.estado !== this.catalogos.codigoEstado('REEMBOLSO', 'PENDIENTE') &&
      reembolso.estado !== this.catalogos.codigoEstado('REEMBOLSO', 'EN_PROCESO') &&
      reembolso.estado !== this.catalogos.codigoEstado('REEMBOLSO', 'FALLIDO') &&
      reembolso.estado !== this.catalogos.codigoEstado('REEMBOLSO', 'APROBADO')
    )
      throw new ConflictException(
        'El reembolso existente no es válido; reintentá la resolución',
      );

    // La pasarela se ejecuta antes de modificar la reserva. Si falla,
    // la reserva queda intacta y el reembolso puede reintentarse.
    const ejecutado = await this.reembolsosService.registrarOejecutar(
      reembolso.id,
      dto.referencia,
      idAdmin,
    );
    if (ejecutado.estado !== this.catalogos.codigoEstado('REEMBOLSO', 'APROBADO'))
      throw new ConflictException(
        'La devolución no quedó aprobada; la reserva no se modificó',
      );
    return ejecutado;
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

  private async prepararLiquidacion(id: number, dto: ResolverLiquidacionDto): Promise<void> {
    await this.reservasService.conReservaBloqueada(id, async (actual, transaccion) => {
      this.validarResolucion(actual, dto);
      await this.liquidaciones.registrarRevision(actual, 'Devolución de liquidación en ejecución', transaccion);
    });
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
