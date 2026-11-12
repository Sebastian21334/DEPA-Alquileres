import {
  EstadoLiquidacionReserva,
  EstadoPagoReserva,
  EstadoReembolso,
} from '../../catalogos/estados';
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
import { ActorCancelacion } from '../actor-cancelacion';
import { DisponibilidadService } from '../../disponibilidad/service/disponibilidad.service';
import { ResolverLiquidacionDto } from '../dto/resolver-liquidacion.dto';
import { generarCodigoAlojamiento } from './reservas.utils';
import { ReembolsosService } from '../../reembolsos/service/reembolsos.service';
import {
  OrigenReembolso,
  Reembolso,
  TipoReembolso,
} from '../../reembolsos/entity/reembolso.entity';
import { fechaArgentina } from '../../common/utils/fechas';
import { TOLERANCIA_MONETARIA } from '../../common/utils/dinero';
import { timingSafeEqual } from 'node:crypto';
import { ReservasService } from './reservas.service';

const MAX_INTENTOS_CODIGO = 5;

@Injectable()
export class ReservaLiquidacionesService {
  constructor(@Inject(RESERVA_REPOSITORY) private readonly reservaRepository: IReservaRepository, private readonly disponibilidadService: DisponibilidadService, private readonly reembolsosService: ReembolsosService, private readonly reservasService: ReservasService) {}

  /** Devuelve el código únicamente al inquilino que realizó la reserva. */
  async consultarCodigoAlojamiento(id: number, idUsuario: number) {
    return this.reservaRepository.conTransaccion(
      async (reservaRepository) => {
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
        if (this.asegurarCodigoAlojamiento(reserva, generarCodigoAlojamiento()))
          await reservaRepository.guardar(reserva);
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
      async (reservaRepository) => {
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
        if (this.codigoBloqueado(reserva)) {
          throw new ConflictException(
            'Se alcanzó el límite de intentos. Contactá a un administrador',
          );
        }

        const coincide = this.registrarIntentoCodigo(reserva, codigo);
        await reservaRepository.guardar(reserva);
        if (!coincide) {
          return new BadRequestException(
            `Código incorrecto. Quedan ${this.intentosCodigoRestantes(reserva)} intentos`,
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
      async (reservaRepository) => {
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
        return this.reservasService.prepararRespuesta(await reservaRepository.guardar(reserva));
      },
    );
  }

  async listarLiquidacionesAdministracion(): Promise<Reserva[]> {
    const reservas = await this.reservaRepository.buscarLiquidacionesAdministracion();
    return reservas.map((reserva) => this.reservasService.prepararRespuesta(reserva));
  }

  /** Registra una decisión administrativa; la devolución se ejecuta antes de modificar la reserva. */
  async resolverLiquidacion(id: number, dto: ResolverLiquidacionDto, idAdmin: number): Promise<Reserva> {
    const permitidos: EstadoLiquidacionReserva[] = [
      EstadoLiquidacionReserva.PAGADO_PROPIETARIO,
      EstadoLiquidacionReserva.DEVUELTO_INQUILINO,
      EstadoLiquidacionReserva.DEVUELTO_PARCIAL_INQUILINO,
      EstadoLiquidacionReserva.EN_REVISION,
      EstadoLiquidacionReserva.PENDIENTE_PAGO_PROPIETARIO,
      EstadoLiquidacionReserva.RETENIDO,
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
    if (dto.estado === EstadoLiquidacionReserva.PAGADO_PROPIETARIO)
      await this.asegurarSinDevoluciones(id);

    const esDevolucion =
      dto.estado === EstadoLiquidacionReserva.DEVUELTO_INQUILINO ||
      dto.estado === EstadoLiquidacionReserva.DEVUELTO_PARCIAL_INQUILINO;

    if (esDevolucion) {
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
      const importe =
        dto.estado === EstadoLiquidacionReserva.DEVUELTO_INQUILINO
          ? saldo
          : Number(dto.importe ?? 0);
      if (!Number.isFinite(importe) || importe <= 0)
        throw new BadRequestException(
          'Indicá el importe de la devolución parcial',
        );
      if (importe > saldo + TOLERANCIA_MONETARIA)
        throw new ConflictException(
          `La devolución supera el saldo reembolsable de ${pago.currency} ${saldo.toFixed(2)}`,
        );

      await this.prepararLiquidacion(id);
      const existentes = await this.reembolsosService.listarPorReserva(id);
      const enCurso = existentes.find(
        (actual) =>
          actual.origen === OrigenReembolso.AJUSTE_ADMIN &&
          (
            [
              EstadoReembolso.PENDIENTE,
              EstadoReembolso.EN_PROCESO,
              EstadoReembolso.FALLIDO,
              EstadoReembolso.APROBADO,
            ] as EstadoReembolso[]
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
              (actual.estado === EstadoReembolso.RECHAZADO ||
                actual.estado === EstadoReembolso.CANCELADO),
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
        });
      }

      if (
        reembolso.estado !== EstadoReembolso.PENDIENTE &&
        reembolso.estado !== EstadoReembolso.EN_PROCESO &&
        reembolso.estado !== EstadoReembolso.FALLIDO &&
        reembolso.estado !== EstadoReembolso.APROBADO
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
      if (ejecutado.estado !== EstadoReembolso.APROBADO)
        throw new ConflictException(
          'La devolución no quedó aprobada; la reserva no se modificó',
        );
    }

    return this.reservaRepository.conTransaccion(
      async (reservaRepository, transaccion) => {
        const actual = await reservaRepository.buscarPorId(id);
        if (!actual)
          throw new NotFoundException(`No se encontró la reserva ${id}`);
        this.validarResolucion(actual, dto);
        if (dto.estado === EstadoLiquidacionReserva.PAGADO_PROPIETARIO)
          await this.asegurarSinDevoluciones(id);

        this.aplicarResolucion(
          actual,
          dto.estado,
          dto.referencia,
          dto.observacion,
        );
        // Solo se liberan fechas futuras de una reserva que todavía no comenzó.
        const hoy = fechaArgentina();
        if (
          dto.estado === EstadoLiquidacionReserva.DEVUELTO_INQUILINO &&
          actual.fecha_inicio &&
          actual.fecha_inicio > hoy &&
          !this.reservasService.codigoValidado(actual)
        ) {
          await this.disponibilidadService.liberarReserva(
            actual.id,
            transaccion,
          );
        }
        return this.reservasService.prepararRespuesta(
          await reservaRepository.guardar(actual),
        );
      },
    );
  }

  private async asegurarSinDevoluciones(id: number): Promise<void> {
    const existentes = await this.reembolsosService.listarPorReserva(id);
    const activa = existentes.find(
      (reembolso) =>
        reembolso.estado === EstadoReembolso.PENDIENTE ||
        reembolso.estado === EstadoReembolso.EN_PROCESO ||
        reembolso.estado === EstadoReembolso.FALLIDO ||
        reembolso.estado === EstadoReembolso.APROBADO,
    );
    if (activa)
      throw new ConflictException(
        'La reserva tiene una devolución registrada; no se puede pagar al propietario',
      );
  }

  private async prepararLiquidacion(id: number): Promise<void> {
    await this.reservaRepository.conTransaccion(
      async (reservaRepository) => {
        const actual = await reservaRepository.buscarPorId(id);
        if (!actual)
          throw new NotFoundException(`No se encontró la reserva ${id}`);
        if (this.reservasService.liquidacionResuelta(actual))
          throw new ConflictException(
            'La liquidación de la reserva ya fue resuelta',
          );
        actual.estado_liquidacion = EstadoLiquidacionReserva.EN_REVISION;
        actual.observacion_liquidacion =
          'Devolución de liquidación en ejecución';
        actual.fecha_resolucion_liquidacion = null;
        await reservaRepository.guardar(actual);
      },
    );
  }

  private validarResolucion(reserva: Reserva, dto: ResolverLiquidacionDto): void {
    if (
      reserva.cancelada &&
      reserva.estado_liquidacion !== EstadoLiquidacionReserva.EN_REVISION
    ) {
      throw new ConflictException('La reserva está cancelada');
    }
    const observacion = reserva.observacion_liquidacion ?? '';
    const devolucionEnEjecucion =
      observacion.includes('Devolución de') &&
      observacion.includes('en ejecución');
    const esDevolucion =
      dto.estado === EstadoLiquidacionReserva.DEVUELTO_INQUILINO ||
      dto.estado === EstadoLiquidacionReserva.DEVUELTO_PARCIAL_INQUILINO;
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
      dto.estado === EstadoLiquidacionReserva.PAGADO_PROPIETARIO &&
      !this.reservasService.codigoValidado(reserva)
    ) {
      throw new ConflictException(
        'No se puede registrar el pago al propietario sin validar el código',
      );
    }
    if (
      dto.estado === EstadoLiquidacionReserva.PAGADO_PROPIETARIO &&
      this.reservasService.liquidacionEnRevision(reserva)
    ) {
      throw new ConflictException(
        'No se puede pagar al propietario con una liquidación en revisión',
      );
    }
  }

  /** Emite el código si falta (reservas aprobadas antes de existir el código). */
  private asegurarCodigoAlojamiento(reserva: Reserva, codigo: string): boolean {
    if (reserva.codigo_alojamiento) return false;
    reserva.codigo_alojamiento = codigo;
    reserva.codigo_generado_en = new Date();
    reserva.estado_liquidacion = EstadoLiquidacionReserva.RETENIDO;
    return true;
  }

  private codigoBloqueado(reserva: Reserva): boolean {
    return reserva.intentos_codigo >= MAX_INTENTOS_CODIGO;
  }

  private intentosCodigoRestantes(reserva: Reserva): number {
    return Math.max(0, MAX_INTENTOS_CODIGO - reserva.intentos_codigo);
  }

  /**
   * Compara el código presentado por el anunciante. Si coincide, libera la
   * liquidación al propietario; si no, suma un intento y al llegar al límite
   * deja la reserva en revisión administrativa.
   */
  private registrarIntentoCodigo(reserva: Reserva, codigo: string): boolean {
    const recibido = Buffer.from(codigo.trim().toUpperCase());
    const esperado = Buffer.from(reserva.codigo_alojamiento ?? '');
    const coincide =
      recibido.length === esperado.length &&
      timingSafeEqual(recibido, esperado);
    if (!coincide) {
      reserva.intentos_codigo += 1;
      if (this.codigoBloqueado(reserva)) {
        reserva.estado_liquidacion = EstadoLiquidacionReserva.EN_REVISION;
        reserva.observacion_liquidacion =
          'Código bloqueado después de cinco intentos incorrectos';
      }
      return false;
    }
    reserva.codigo_validado_en = new Date();
    reserva.estado_liquidacion =
      EstadoLiquidacionReserva.PENDIENTE_PAGO_PROPIETARIO;
    reserva.observacion_liquidacion =
      'Código de alojamiento validado por el anunciante';
    return true;
  }

  /** El reclamo del inquilino congela cualquier liquidación pendiente. */
  private registrarProblema(reserva: Reserva, motivo: string): void {
    reserva.estado_liquidacion = EstadoLiquidacionReserva.EN_REVISION;
    reserva.observacion_liquidacion = `Reclamo del inquilino: ${motivo.trim()}`;
    reserva.fecha_resolucion_liquidacion = null;
  }

  /** Registra la decisión administrativa; devolver al inquilino también cancela la reserva. */
  private aplicarResolucion(reserva: Reserva, estado: EstadoLiquidacionReserva, referencia?: string, observacion?: string): void {
    reserva.estado_liquidacion = estado;
    reserva.referencia_liquidacion = referencia?.trim() || null;
    reserva.observacion_liquidacion =
      observacion?.trim() || reserva.observacion_liquidacion;
    reserva.fecha_resolucion_liquidacion = this.reservasService.liquidacionResuelta(reserva)
      ? new Date()
      : null;
    if (estado === EstadoLiquidacionReserva.RETENIDO) reserva.intentos_codigo = 0;
    if (estado === EstadoLiquidacionReserva.DEVUELTO_INQUILINO) {
      reserva.estado_pago = EstadoPagoReserva.REEMBOLSADO;
      this.reservasService.marcarCancelada(reserva, ActorCancelacion.ADMINISTRADOR);
    }
    if (estado === EstadoLiquidacionReserva.DEVUELTO_PARCIAL_INQUILINO) {
      // El pago conserva su estado; el reembolso parcial vive en la entidad Reembolso.
      reserva.fecha_resolucion_liquidacion = new Date();
    }
  }
}
