import {
  type IReservaRepository,
  RESERVA_REPOSITORY,
} from '../repository/reserva.repository.interface';
import {
  type ITransaccionCalendario,
  TRANSACCION_CALENDARIO,
} from '../../disponibilidad/repository/transaccion-calendario.interface';
import {
  Inject,
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import {
  EstadoLiquidacionReserva,
  Reserva,
} from '../entity/reserva.entity';
import { MOTIVO_CANCELACION_BLOQUEO } from '../reserva.constants';
import { DisponibilidadService } from '../../disponibilidad/service/disponibilidad.service';
import { ResolverLiquidacionDto } from '../dto/resolver-liquidacion.dto';
import { generarCodigoAlojamiento } from './reservas.utils';
import { ReembolsosService } from '../../reembolsos/service/reembolsos.service';
import { PagosService } from '../../pagos/service/pagos.service';
import {
  EstadoReembolso,
  OrigenReembolso,
  Reembolso,
  TipoReembolso,
} from '../../reembolsos/entity/reembolso.entity';
import { fechaArgentina } from '../../common/utils/fechas';
import { ReservaEstadoService } from './reserva-estado.service';
import { ReservaCicloVidaService } from './reserva-ciclo-vida.service';
import { TOLERANCIA_MONETARIA } from '../../common/utils/dinero';

@Injectable()
export class ReservaLiquidacionesService {
  constructor(
    @Inject(TRANSACCION_CALENDARIO)
    private readonly transaccion: ITransaccionCalendario,
    @Inject(RESERVA_REPOSITORY)
    private readonly reservaRepository: IReservaRepository,
    private readonly disponibilidadService: DisponibilidadService,
    private readonly reembolsosService: ReembolsosService,
    private readonly estado: ReservaEstadoService,
    private readonly ciclo: ReservaCicloVidaService,
    private readonly pagosService: PagosService,
  ) {}

  /** Devuelve el código únicamente al inquilino que realizó la reserva. */
  async consultarCodigoAlojamiento(id: number, idUsuario: number) {
    return this.transaccion.ejecutar(
      async ({ reservas: reservaRepository }) => {
        const reserva = await reservaRepository.buscarPorIdConCodigo(id);
        if (!reserva)
          throw new NotFoundException(`No se encontró la reserva ${id}`);
        if (!this.estado.esDelInquilino(reserva, idUsuario)) {
          throw new ForbiddenException(
            'Solo el inquilino puede consultar el código de alojamiento',
          );
        }
        if (!this.estado.estaConfirmada(reserva)) {
          throw new ConflictException(
            'El código estará disponible cuando el pago se encuentre aprobado',
          );
        }
        if (
          !['CONFIRMADA', 'PENDIENTE_INGRESO', 'EN_CURSO'].includes(
            this.estado.calcular(reserva),
          )
        ) {
          throw new ConflictException(
            'El código no está disponible para una estadía cerrada o sin fechas verificables',
          );
        }
        // Compatibilidad con reservas aprobadas antes de incorporar RF21.
        if (this.ciclo.asegurarCodigoAlojamiento(reserva, generarCodigoAlojamiento()))
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
  async validarCodigoAlojamiento(
    id: number,
    codigo: string,
    idUsuarioAnunciante: number,
  ): Promise<Reserva> {
    const resultado = await this.transaccion.ejecutar(
      async ({ reservas: reservaRepository }) => {
        const reserva = await reservaRepository.buscarPorIdConCodigo(id);
        if (!reserva)
          throw new NotFoundException(`No se encontró la reserva ${id}`);
        if (!this.estado.esDelAnunciante(reserva, idUsuarioAnunciante)) {
          throw new ForbiddenException(
            'Solo el anunciante de la publicación puede validar el código',
          );
        }
        if (!this.estado.estaConfirmada(reserva)) {
          throw new ConflictException('La reserva no se encuentra confirmada');
        }
        if (this.estado.codigoValidado(reserva)) {
          throw new ConflictException(
            'El código de esta reserva ya fue utilizado',
          );
        }
        if (this.estado.calcular(reserva) !== 'PENDIENTE_INGRESO') {
          throw new ConflictException(
            'El código solo puede validarse durante las fechas de la estadía',
          );
        }
        if (this.estado.liquidacionEnRevision(reserva)) {
          throw new ConflictException(
            'La reserva tiene un reclamo abierto y debe revisarla un administrador',
          );
        }
        if (this.estado.codigoBloqueado(reserva)) {
          throw new ConflictException(
            'Se alcanzó el límite de intentos. Contactá a un administrador',
          );
        }

        const coincide = this.ciclo.registrarIntentoCodigo(reserva, codigo);
        await reservaRepository.guardar(reserva);
        if (!coincide) {
          return new BadRequestException(
            `Código incorrecto. Quedan ${this.estado.intentosCodigoRestantes(reserva)} intentos`,
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
    return resultado;
  }

  /** El reclamo del inquilino congela cualquier liquidación manual pendiente. */
  async reportarProblema(
    id: number,
    motivo: string,
    idUsuario: number,
  ): Promise<Reserva> {
    return this.transaccion.ejecutar(
      async ({ reservas: reservaRepository }) => {
        const reserva = await reservaRepository.buscarPorId(id);
        if (!reserva)
          throw new NotFoundException(`No se encontró la reserva ${id}`);
        if (!this.estado.esDelInquilino(reserva, idUsuario)) {
          throw new ForbiddenException(
            'Solo el inquilino de la reserva puede reportar un problema',
          );
        }
        if (!this.estado.estaConfirmada(reserva)) {
          throw new ConflictException(
            'Solo se pueden reportar problemas sobre reservas confirmadas',
          );
        }
        if (this.estado.liquidacionResuelta(reserva)) {
          throw new ConflictException(
            'La liquidación de esta reserva ya fue resuelta',
          );
        }
        this.ciclo.reportarProblema(reserva, motivo);
        return reservaRepository.guardar(reserva);
      },
    );
  }

  listarLiquidacionesAdministracion(): Promise<Reserva[]> {
    return this.reservaRepository.buscarLiquidacionesAdministracion({
      estados: [
        EstadoLiquidacionReserva.PENDIENTE_PAGO_PROPIETARIO,
        EstadoLiquidacionReserva.EN_REVISION,
      ],
      incluirCanceladasPorBloqueo: true,
      actorCancelacion: 'ADMINISTRADOR',
      motivoBloqueo: MOTIVO_CANCELACION_BLOQUEO,
    });
  }

  /** Registra una decisión administrativa; no ejecuta movimientos de dinero reales. */
  async resolverLiquidacion(
    id: number,
    dto: ResolverLiquidacionDto,
    idAdmin: number,
  ): Promise<Reserva> {
    const permitidos = [
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
    let reembolso: Reembolso | null = null;

    if (esDevolucion) {
      const pago = await this.reembolsosService.buscarPagoPorReserva(id);
      if (!pago)
        throw new ConflictException(
          'La reserva no tiene un pago registrado para devolver',
        );
      const saldo = this.pagosService.saldoReembolsable(pago);
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
          [
            EstadoReembolso.PENDIENTE,
            EstadoReembolso.EN_PROCESO,
            EstadoReembolso.FALLIDO,
            EstadoReembolso.APROBADO,
          ].includes(actual.estado),
      );
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
        const resultado = await this.reembolsosService.crearSolicitudConResultado(
          {
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
          },
        );
        reembolso = resultado.reembolso;
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
        dto.referencia?.trim() || `liquidacion-${id}-${reembolso.id}`,
        idAdmin,
      );
      if (ejecutado.estado !== EstadoReembolso.APROBADO)
        throw new ConflictException(
          'La devolución no quedó aprobada; la reserva no se modificó',
        );
    }

    return this.transaccion.ejecutar(
      async ({ reservas: reservaRepository, fechas: fechaRepository }) => {
        const actual = await reservaRepository.buscarPorId(id);
        if (!actual)
          throw new NotFoundException(`No se encontró la reserva ${id}`);
        this.validarResolucion(actual, dto);
        if (dto.estado === EstadoLiquidacionReserva.PAGADO_PROPIETARIO)
          await this.asegurarSinDevoluciones(id);

        this.ciclo.resolverLiquidacion(
          actual,
          dto.estado,
          dto.referencia,
          dto.observacion,
        );
        const hoy = fechaArgentina();
        if (
          dto.estado === EstadoLiquidacionReserva.DEVUELTO_INQUILINO &&
          actual.fecha_inicio &&
          actual.fecha_inicio > hoy &&
          !this.estado.codigoValidado(actual)
        ) {
          await this.disponibilidadService.liberarReserva(
            actual.id,
            fechaRepository,
          );
        }
        return reservaRepository.guardar(actual);
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
    await this.transaccion.ejecutar(
      async ({ reservas: reservaRepository }) => {
        const actual = await reservaRepository.buscarPorId(id);
        if (!actual)
          throw new NotFoundException(`No se encontró la reserva ${id}`);
        if (this.estado.liquidacionResuelta(actual))
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

  private validarResolucion(
    reserva: Reserva,
    dto: ResolverLiquidacionDto,
  ): void {
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
    if (!this.estado.pagoAprobado(reserva)) {
      throw new ConflictException(
        'La reserva no posee un pago aprobado para liquidar',
      );
    }
    if (this.estado.liquidacionResuelta(reserva)) {
      throw new ConflictException(
        'La liquidación de la reserva ya fue resuelta',
      );
    }
    if (
      dto.estado === EstadoLiquidacionReserva.PAGADO_PROPIETARIO &&
      !this.estado.codigoValidado(reserva)
    ) {
      throw new ConflictException(
        'No se puede registrar el pago al propietario sin validar el código',
      );
    }
    if (
      dto.estado === EstadoLiquidacionReserva.PAGADO_PROPIETARIO &&
      this.estado.liquidacionEnRevision(reserva)
    ) {
      throw new ConflictException(
        'No se puede pagar al propietario con una liquidación en revisión',
      );
    }
  }

}
