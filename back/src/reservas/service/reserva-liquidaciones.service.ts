import { CatalogosService } from '../../catalogos/service/catalogos.service';
import type { EntityManager } from 'typeorm';
import {
  type IReservaRepository,
  RESERVA_REPOSITORY,
} from '../repository/reserva.repository.interface';
import {
  Inject,
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { Reserva } from '../entity/reserva.entity';
import { ResolverLiquidacionDto } from '../dto/resolver-liquidacion.dto';
import { generarCodigoAlojamiento } from './reservas.utils';
import { ReembolsosService } from '../../reembolsos/service/reembolsos.service';
import {
  OrigenReembolso,
  Reembolso,
  TipoReembolso,
} from '../../reembolsos/entity/reembolso.entity';
import { TOLERANCIA_MONETARIA } from '../../common/utils/dinero';
import { ReservaCicloVidaService } from './reserva-ciclo-vida.service';
import { ReservaDecisionService } from './reserva-decision.service';
import { ReservasService } from './reservas.service';
import { LiquidacionesService } from '../../liquidaciones/service/liquidaciones.service';

@Injectable()
export class ReservaLiquidacionesService {
  constructor(@Inject(RESERVA_REPOSITORY) private readonly reservaRepository: IReservaRepository, private readonly reembolsosService: ReembolsosService, private readonly reservasService: ReservasService, private readonly liquidaciones: LiquidacionesService, private readonly ciclo: ReservaCicloVidaService, private readonly decision: ReservaDecisionService, private readonly catalogos: CatalogosService) {}

  /** Devuelve el código únicamente al inquilino que realizó la reserva. */
  async consultarCodigoAlojamiento(id: number, idUsuario: number) {
    return this.reservaRepository.conTransaccion(
      async (reservaRepository, transaccion) => {
        const reserva = await reservaRepository.buscarPorIdConCodigo(id);
        if (!reserva)
          throw new NotFoundException(`No se encontró la reserva ${id}`);
        if (!this.reservasService.esDelInquilino(reserva, idUsuario)) {
          throw new ForbiddenException(
            'Solo el inquilino puede consultar el código de alojamiento',
          );
        }
        if (!this.reservasService.estaConfirmada(reserva)) {
          throw new ConflictException(
            'El código estará disponible cuando el pago se encuentre aprobado',
          );
        }
        if (
          !['CONFIRMADA', 'PENDIENTE_INGRESO', 'EN_CURSO'].includes(
            this.reservasService.calcularEstadoEstadia(reserva),
          )
        ) {
          throw new ConflictException(
            'El código no está disponible para una estadía cerrada o sin fechas verificables',
          );
        }
        // Compatibilidad con reservas aprobadas antes de incorporar RF21.
        const emitido = this.ciclo.asegurarCodigoAlojamiento(
          reserva,
          generarCodigoAlojamiento(),
        );
        if (emitido) {
          await reservaRepository.guardar(reserva);
        }
        await this.liquidaciones.sincronizarDesdeReserva(reserva, transaccion);
        return {
          reserva_id: reserva.id,
          codigo: reserva.codigo_alojamiento,
          generado_en: reserva.codigo_generado_en,
          validado_en: reserva.codigo_validado_en,
          estado_liquidacion: reserva.estado_liquidacion,
        };
      },
    );
  }

  /** El anunciante presenta el código entregado físicamente por el huésped. */
  async validarCodigoAlojamiento(id: number, codigo: string, idUsuarioAnunciante: number): Promise<Reserva> {
    const resultado = await this.reservaRepository.conTransaccion(
      async (reservaRepository, transaccion) => {
        const reserva = await reservaRepository.buscarPorIdConCodigo(id);
        if (!reserva)
          throw new NotFoundException(`No se encontró la reserva ${id}`);
        if (!this.reservasService.esDelAnunciante(reserva, idUsuarioAnunciante)) {
          throw new ForbiddenException(
            'Solo el anunciante de la publicación puede validar el código',
          );
        }
        if (!this.reservasService.estaConfirmada(reserva)) {
          throw new ConflictException('La reserva no se encuentra confirmada');
        }
        if (this.reservasService.codigoValidado(reserva)) {
          throw new ConflictException(
            'El código de esta reserva ya fue utilizado',
          );
        }
        if (this.reservasService.calcularEstadoEstadia(reserva) !== 'PENDIENTE_INGRESO') {
          throw new ConflictException(
            'El código solo puede validarse durante las fechas de la estadía',
          );
        }
        if (this.reservasService.liquidacionEnRevision(reserva)) {
          throw new ConflictException(
            'La reserva tiene un reclamo abierto y debe revisarla un administrador',
          );
        }
        if (this.decision.codigoBloqueado(reserva)) {
          throw new ConflictException(
            'Se alcanzó el límite de intentos. Contactá a un administrador',
          );
        }

        const coincide = this.ciclo.registrarIntentoCodigo(reserva, codigo);
        if (!coincide && this.decision.codigoBloqueado(reserva))
          await this.liquidaciones.registrarRevision(
            reserva,
            reserva.observacion_liquidacion ??
              'Código bloqueado después de cinco intentos incorrectos',
            transaccion,
          );
        if (coincide)
          await this.liquidaciones.registrarValidacionCodigo(reserva, transaccion);
        await reservaRepository.guardar(reserva);
        if (!coincide) {
          return new BadRequestException(
            `Código incorrecto. Quedan ${this.decision.intentosCodigoRestantes(reserva)} intentos`,
          );
        }
        const actualizada = await reservaRepository.buscarPorId(id);
        if (!actualizada)
          throw new NotFoundException(`No se encontró la reserva ${id}`);
        return actualizada;
      },
    );
    // El intento incorrecto debe persistir aunque la respuesta sea un error.
    if (resultado instanceof BadRequestException) throw resultado;
    return this.reservasService.prepararRespuesta(resultado);
  }

  /** El reclamo del inquilino congela cualquier liquidación manual pendiente. */
  async reportarProblema(id: number, motivo: string, idUsuario: number): Promise<Reserva> {
    return this.reservaRepository.conTransaccion(
      async (reservaRepository, transaccion) => {
        const reserva = await reservaRepository.buscarPorId(id);
        if (!reserva)
          throw new NotFoundException(`No se encontró la reserva ${id}`);
        if (!this.reservasService.esDelInquilino(reserva, idUsuario)) {
          throw new ForbiddenException(
            'Solo el inquilino de la reserva puede reportar un problema',
          );
        }
        if (!this.reservasService.estaConfirmada(reserva)) {
          throw new ConflictException(
            'Solo se pueden reportar problemas sobre reservas confirmadas',
          );
        }
        if (this.reservasService.liquidacionResuelta(reserva)) {
          throw new ConflictException(
            'La liquidación de esta reserva ya fue resuelta',
          );
        }
        this.registrarProblema(reserva, motivo);
        await this.liquidaciones.registrarRevision(
          reserva,
          reserva.observacion_liquidacion ??
            `Reclamo del inquilino: ${motivo.trim()}`,
          transaccion,
        );
        return this.reservasService.prepararRespuesta(await reservaRepository.guardar(reserva));
      },
    );
  }

  async listarLiquidacionesAdministracion(): Promise<Reserva[]> {
    const reservas = await this.reservaRepository.buscarLiquidacionesAdministracion([this.catalogos.codigoEstado('LIQUIDACION_RESERVA', 'PENDIENTE_PAGO_PROPIETARIO'), this.catalogos.codigoEstado('LIQUIDACION_RESERVA', 'EN_REVISION')]);
    return reservas.map((reserva) => this.reservasService.prepararRespuesta(reserva));
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

    const reserva = await this.reservaRepository.buscarPorId(id);
    if (!reserva)
      throw new NotFoundException(`No se encontró la reserva ${id}`);
    this.validarResolucion(reserva, dto);
    if (dto.estado === this.catalogos.codigoEstado('LIQUIDACION_RESERVA', 'PAGADO_PROPIETARIO'))
      await this.asegurarSinDevoluciones(id);

    const esDevolucion =
      dto.estado === this.catalogos.codigoEstado('LIQUIDACION_RESERVA', 'DEVUELTO_INQUILINO') ||
      dto.estado === this.catalogos.codigoEstado('LIQUIDACION_RESERVA', 'DEVUELTO_PARCIAL_INQUILINO');
    let importeResolucion: number | null = null;
    let monedaResolucion = 'ARS';

    if (esDevolucion) {
      const devolucion = await this.ejecutarDevolucion(reserva, dto, idAdmin);
      const aplicada = await this.reembolsosService.aplicarConfirmado(devolucion.id, (confirmado, transaccion) =>
        this.reservasService.aplicarEfectoReembolso(confirmado, transaccion, dto.observacion),
      );
      return aplicada ?? this.reservasService.prepararRespuesta(await this.reservasService.obtenerReserva(id));
    }

    if (dto.estado === this.catalogos.codigoEstado('LIQUIDACION_RESERVA', 'PAGADO_PROPIETARIO')) {
      const pago = await this.reembolsosService.buscarPagoPorReserva(id);
      importeResolucion = pago
        ? this.reembolsosService.saldoReembolsable(pago)
        : Number(reserva.monto_pago);
      monedaResolucion = pago?.currency || 'ARS';
    }

    return this.reservaRepository.conTransaccion((_reservas, transaccion) =>
      this.registrarResolucion(id, dto, idAdmin, importeResolucion, monedaResolucion, transaccion),
    );
  }

  private async registrarResolucion(id: number, dto: ResolverLiquidacionDto, idAdmin: number, importeResolucion: number | null, monedaResolucion: string, transaccion: EntityManager): Promise<Reserva> {
    const reservaRepository = this.reservaRepository.enTransaccion(transaccion);
    const actual = await this.reservasService.obtenerReserva(id, transaccion);
    this.validarResolucion(actual, dto);
    if (dto.estado === this.catalogos.codigoEstado('LIQUIDACION_RESERVA', 'PAGADO_PROPIETARIO'))
      await this.asegurarSinDevoluciones(id);
    this.ciclo.resolverLiquidacion(actual, dto.estado, dto.referencia, dto.observacion);
    await this.liquidaciones.registrarResolucion(actual, dto.estado, {
      importe: importeResolucion,
      moneda: monedaResolucion,
      referencia: dto.referencia ?? null,
      observacion: dto.observacion ?? null,
    }, idAdmin, transaccion);
    return this.reservasService.prepararRespuesta(await reservaRepository.guardar(actual));
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
    await this.prepararLiquidacion(id);
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

  private async asegurarSinDevoluciones(id: number): Promise<void> {
    const existentes = await this.reembolsosService.listarPorReserva(id);
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

  private async prepararLiquidacion(id: number): Promise<void> {
    await this.reservaRepository.conTransaccion(
      async (reservaRepository, transaccion) => {
        const actual = await reservaRepository.buscarPorId(id);
        if (!actual)
          throw new NotFoundException(`No se encontró la reserva ${id}`);
        if (this.reservasService.liquidacionResuelta(actual))
          throw new ConflictException(
            'La liquidación de la reserva ya fue resuelta',
          );
        actual.estado_liquidacion = this.catalogos.codigoEstado('LIQUIDACION_RESERVA', 'EN_REVISION');
        actual.observacion_liquidacion =
          'Devolución de liquidación en ejecución';
        actual.fecha_resolucion_liquidacion = null;
        await this.liquidaciones.registrarRevision(
          actual,
          actual.observacion_liquidacion,
          transaccion,
        );
        await reservaRepository.guardar(actual);
      },
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

  /** El reclamo del inquilino congela cualquier liquidación pendiente. */
  private registrarProblema(reserva: Reserva, motivo: string): void {
    reserva.estado_liquidacion = this.catalogos.codigoEstado('LIQUIDACION_RESERVA', 'EN_REVISION');
    reserva.observacion_liquidacion = Array.from(`Reclamo del inquilino: ${motivo.trim()}`)
      .slice(0, 500)
      .join('');
    reserva.fecha_resolucion_liquidacion = null;
  }
}
