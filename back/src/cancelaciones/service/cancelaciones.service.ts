import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CatalogosService } from '../../catalogos/service/catalogos.service';
import { diasDeAntelacion, fechaArgentina } from '../../common/utils/fechas';
import { ejecutarEnSegundoPlano } from '../../common/utils/segundo-plano';
import { decimalEntero, importeTexto } from '../../common/utils/importes';
import type { Pago } from '../../pagos/entity/pago.entity';
import {
  OrigenReembolso,
  Reembolso,
  TipoReembolso,
} from '../../reembolsos/entity/reembolso.entity';
import { ReembolsosService } from '../../reembolsos/service/reembolsos.service';
import type { ActorCancelacion, Reserva } from '../../reservas/entity/reserva.entity';
import { ReservasService } from '../../reservas/service/reservas.service';
import { ReservaNotificacionesService } from '../../reservas/service/reserva-notificaciones.service';
import { referenciaUsuario } from '../../usuarios/usuario-referencia';
import type { CondicionesCancelacionDto, DevolucionCancelacionDto, SaldoDevolucionCancelacionDto } from '../dto/condiciones-cancelacion.dto';
import { SolicitarCancelacionDto } from '../dto/solicitar-cancelacion.dto';
import { SolicitudCancelacion } from '../entity/solicitud-cancelacion.entity';
import type { PoliticaCancelacion } from '../entity/politica-cancelacion.entity';
import type { EntityManager } from 'typeorm';
import {
  CANCELACIONES_REPOSITORY,
  type ICancelacionesRepository,
} from '../repository/cancelaciones.repository.interface';

/**
 * Cancelación automática de una reserva pagada: un participante acepta el
 * importe que le corresponde según la política y la solicitud queda aprobada
 * en el momento. Reservas y Reembolsos aplican los efectos sobre la estadía y el dinero.
 */
@Injectable()
export class CancelacionesService {
  constructor(@Inject(CANCELACIONES_REPOSITORY) private readonly cancelaciones: ICancelacionesRepository, private readonly reservas: ReservasService, private readonly reembolsos: ReembolsosService, private readonly catalogos: CatalogosService, private readonly notificaciones?: ReservaNotificacionesService) {}

  listarPorReservas(ids: number[]): Promise<SolicitudCancelacion[]> {
    return this.cancelaciones.listarPorReservas(ids);
  }

  /**
   * Confirma la cancelación con el importe aceptado por un participante.
   * Si hay devolución, se registra en la misma transacción para procesarla después.
   */
  async solicitar(idReserva: number, dto: SolicitarCancelacionDto, idUsuario: number): Promise<SolicitudCancelacion> {
    const resultado = await this.cancelaciones.conTransaccion(async (cancelaciones, transaccion) => {
      const reserva = await this.reservas.buscarPorId(idReserva, idUsuario, transaccion);
      const activa = await this.buscarEnCurso(cancelaciones, reserva, transaccion);
      if (activa) return { solicitud: { ...activa, reserva }, creada: false };
      if (reserva.cancelada) {
        const aprobada = await cancelaciones.buscarActiva(reserva.id, this.catalogos.codigoEstado('SOLICITUD_CANCELACION', 'APROBADA'));
        if (aprobada?.solicitante?.id === idUsuario) return { solicitud: { ...aprobada, reserva }, creada: false };
      }

      const creadaEn = new Date();
      const hoy = fechaArgentina(creadaEn);
      const actor = this.actorDeCancelacion(reserva, idUsuario);
      if (actor === 'ADMINISTRADOR') throw new BadRequestException('Solo los participantes pueden cancelar automáticamente');
      const impedimento = this.impedimentoReserva(reserva, hoy);
      if (impedimento) throw impedimento;
      const politica = await this.politicaAplicable(cancelaciones, reserva);
      const motivoBloqueo = this.bloqueoPorPlazo(reserva, hoy, politica, actor);
      if (motivoBloqueo) throw new BadRequestException(motivoBloqueo);
      await this.asegurarSinDevolucionActiva(reserva.id, transaccion);
      const pago = await this.reembolsos.buscarPagoParaReembolsoReserva(reserva.id, transaccion);
      if (!pago) throw new ConflictException('La reserva no tiene un pago registrado');
      const devolucion = this.calcularDevolucion(reserva, actor, hoy, politica, pago.amount);
      if (dto.importeAceptado !== devolucion.importe || dto.monedaAceptada !== pago.currency)
        throw new ConflictException('El importe de devolución cambió. Consultá las condiciones y aceptalas nuevamente.');
      const solicitud = await cancelaciones.guardar(cancelaciones.crear({
        reserva,
        solicitante: referenciaUsuario(idUsuario),
        motivo: dto.motivo.trim(),
        estado: this.catalogos.codigoEstado('SOLICITUD_CANCELACION', 'APROBADA'),
        decidida_por: null,
        decidida_en: creadaEn,
        observacion: null,
        creada_en: creadaEn,
      }));
      const reembolso = await this.aplicarCancelacion(reserva, solicitud, actor, devolucion, pago, transaccion);
      return { solicitud, creada: true, reembolso };
    });
    if (resultado.creada)
      ejecutarEnSegundoPlano(
        () => this.notificaciones?.avisarCambio(resultado.solicitud.reserva, ['inquilino', 'anunciante'],
          resultado.reembolso ? 'Cancelación aceptada' : 'Reserva cancelada',
          resultado.reembolso ? 'La devolución está en gestión.' : 'La reserva quedó cancelada sin devolución según las condiciones aceptadas.', 'reserva'),
        `No se pudo avisar la cancelación de la reserva ${resultado.solicitud.reserva.id}`,
      );
    return this.prepararRespuesta(resultado.solicitud);
  }

  /**
   * Con devolución, registra el reembolso; la reserva se cancela y las fechas se
   * liberan cuando el reembolso queda aprobado. Sin devolución, cancela en el momento.
   */
  private async aplicarCancelacion(reserva: Reserva, solicitud: SolicitudCancelacion, actor: ActorCancelacion, devolucion: Omit<DevolucionCancelacionDto, 'moneda'>, pago: Pago, transaccion: EntityManager): Promise<Reembolso | null> {
    if (devolucion.importe > 0) {
      const referencia = `auto-can:${solicitud.id}`;
      return this.reembolsos.crearSolicitud(
        {
          reserva,
          pago,
          tipo: devolucion.porcentaje >= 100 ? TipoReembolso.TOTAL : TipoReembolso.PARCIAL,
          origen: OrigenReembolso.CANCELACION,
          importe: devolucion.importe,
          motivo: `Cancelación de reserva: ${solicitud.motivo}`,
          idSolicitadoPor: solicitud.solicitante?.id ?? null,
          idempotencyKey: referencia,
          referenciaInterna: referencia,
        },
        transaccion,
      );
    }
    solicitud.reserva = await this.reservas.cancelarConRetencionTotal(reserva.id, actor, solicitud.motivo, transaccion);
    return null;
  }

  private impedimentoReserva(reserva: Reserva, hoy: string): BadRequestException | ConflictException | null {
    if (!this.reservas.pagoAprobado(reserva))
      return new BadRequestException(
        'La reserva no está pagada. Usá la cancelación inmediata de la reserva pendiente.',
      );
    if (reserva.cancelada)
      return new ConflictException('La reserva ya está cancelada');
    if (reserva.finalizada)
      return new BadRequestException(
        'La reserva ya finalizó. Solo podés abrir un reclamo.',
      );
    if (!reserva.fecha_inicio || reserva.fecha_inicio <= hoy)
      return new BadRequestException(
        'La estadía ya comenzó. Para una devolución después del inicio, abrí un reclamo.',
      );
    if (this.reservas.codigoValidado(reserva))
      return new BadRequestException(
        'No se puede cancelar una reserva con ingreso ya validado',
      );
    if (this.reservas.liquidacionResuelta(reserva))
      return new ConflictException('La liquidación de la reserva ya está resuelta');
    return null;
  }

  async consultarActiva(idReserva: number, idUsuario: number): Promise<SolicitudCancelacion | null> {
    const reserva = await this.reservas.buscarPorId(idReserva, idUsuario);
    const solicitud = await this.buscarEnCurso(this.cancelaciones, reserva);
    return solicitud ? this.prepararRespuesta(solicitud) : null;
  }

  async consultarCondiciones(idReserva: number, idUsuario: number): Promise<CondicionesCancelacionDto> {
    const reserva = await this.reservas.buscarPorId(idReserva, idUsuario);
    const solicitud = await this.buscarEnCurso(this.cancelaciones, reserva);
    const politica = await this.politicaAplicable(this.cancelaciones, reserva);
    const pago = await this.reembolsos.buscarPagoPorReserva(reserva.id);
    const hoy = fechaArgentina();
    const fechaSolicitud = solicitud ? fechaArgentina(solicitud.creada_en) : hoy;
    const actor = this.actorDeCancelacion(reserva, solicitud ? solicitud.solicitante?.id : idUsuario);
    const motivoBloqueo = this.bloqueoPorPlazo(reserva, hoy, politica, actor) ??
      this.impedimentoReserva(reserva, hoy)?.message ?? (pago ? null : 'La reserva no tiene un pago registrado');
    const devolucion = pago && (!motivoBloqueo || solicitud)
      ? { ...this.calcularDevolucion(reserva, actor, fechaSolicitud, politica, pago.amount), moneda: pago.currency }
      : null;
    return {
      solicitud: solicitud ? this.prepararRespuesta(solicitud) : null,
      politica,
      motivoBloqueo,
      advertencia: !motivoBloqueo && actor === 'INQUILINO' && devolucion?.porcentaje === 0
        ? `Faltan menos de ${politica.diasDevolucionParcial} días para el ingreso. Si cancelás, no recibirás devolución del importe pagado (0 %).`
        : null,
      admiteReembolso: pago != null,
      devolucionPorTransferencia: pago != null && this.reembolsos.requiereTransferencia(pago),
      simulacionTarjetaHabilitada: this.reembolsos.simulacionTarjetaHabilitada(),
      devolucion,
    };
  }

  private bloqueoPorPlazo(reserva: Reserva, hoy: string, politica: PoliticaCancelacion, actor: ActorCancelacion): string | null {
    if (!reserva.fecha_inicio || reserva.fecha_inicio <= hoy)
      return actor === 'ANUNCIANTE'
        ? 'Desde la fecha de ingreso el anunciante ya no puede solicitar la cancelación.'
        : 'Desde la fecha de ingreso no se puede solicitar la cancelación. Para una devolución, abrí un reclamo.';
    if (actor === 'ANUNCIANTE') return null;
    if (actor === 'INQUILINO') return null;
    const diasMinimos = politica.diasDevolucionParcial;
    return this.diasHastaIngreso(reserva, hoy) < diasMinimos
      ? `El plazo venció. Tenés que solicitar la cancelación al menos ${diasMinimos} días antes del ingreso.`
      : null;
  }

  async obtenerPoliticaVigente(): Promise<PoliticaCancelacion> {
    const politica = await this.cancelaciones.buscarPolitica(fechaArgentina());
    if (!politica) throw new InternalServerErrorException('No hay una política de cancelación vigente');
    return politica;
  }

  private async politicaAplicable(cancelaciones: ICancelacionesRepository, reserva: Reserva): Promise<PoliticaCancelacion> {
    const politica = await cancelaciones.buscarPolitica(reserva.fecha_pago ? fechaArgentina(reserva.fecha_pago) : null);
    if (!politica) throw new InternalServerErrorException('Falta la política de cancelación aplicable a la reserva');
    return politica;
  }

  /** Una cancelación sigue en curso mientras su devolución no se confirmó: la reserva todavía no está cancelada. */
  private async buscarEnCurso(cancelaciones: ICancelacionesRepository, reserva: Reserva, transaccion?: EntityManager): Promise<SolicitudCancelacion | null> {
    if (reserva.cancelada) return null;
    const aprobada = await cancelaciones.buscarActiva(reserva.id, this.catalogos.codigoEstado('SOLICITUD_CANCELACION', 'APROBADA'));
    if (!aprobada || !(await this.reembolsos.tieneDevolucionDeCancelacionActiva(reserva.id, transaccion)))
      return null;
    return aprobada;
  }

  private async asegurarSinDevolucionActiva(idReserva: number, transaccion: EntityManager): Promise<void> {
    if (await this.reembolsos.tieneDevolucionDeCancelacionActiva(idReserva, transaccion))
      throw new ConflictException('La reserva ya tiene una devolución por cancelación en curso');
  }

  async saldoDevolucion(reserva: Reserva, transaccion?: EntityManager): Promise<SaldoDevolucionCancelacionDto | null> {
    const repo = transaccion ? this.cancelaciones.enTransaccion(transaccion) : this.cancelaciones;
    const solicitud = await repo.buscarActiva(reserva.id, this.catalogos.codigoEstado('SOLICITUD_CANCELACION', 'APROBADA'));
    if (!solicitud) return null;
    const pago = transaccion
      ? await this.reembolsos.buscarPagoParaReembolsoReserva(reserva.id, transaccion)
      : await this.reembolsos.buscarPagoPorReserva(reserva.id);
    if (!pago) throw new ConflictException('La reserva no tiene un pago registrado');
    const politica = await this.politicaAplicable(repo, reserva);
    const actor = this.actorDeCancelacion(reserva, solicitud.solicitante?.id);
    const devolucion = this.calcularDevolucion(reserva, actor, fechaArgentina(solicitud.creada_en), politica, pago.amount);
    const reembolsos = await this.reembolsos.listarPorReserva(reserva.id, transaccion);
    const estadosReservados: string[] = (['PENDIENTE', 'EN_PROCESO', 'FALLIDO'] as const).map(estado => this.catalogos.codigoEstado('REEMBOLSO', estado));
    const enGestion = reembolsos.filter(actual => estadosReservados.includes(actual.estado))
      .reduce((total, actual) => total + decimalEntero(actual.importe, 2), 0n);
    const esperado = decimalEntero(devolucion.importe, 2);
    const devuelto = decimalEntero(pago.amount_refunded ?? 0, 2);
    const faltante = esperado > devuelto ? esperado - devuelto : 0n;
    return {
      solicitudId: solicitud.id, porcentaje: devolucion.porcentaje, moneda: pago.currency,
      esperado: devolucion.importe, devuelto: Number(importeTexto(devuelto)),
      enGestion: Number(importeTexto(enGestion)), faltante: Number(importeTexto(faltante)),
      importeReclamable: Number(importeTexto(faltante > enGestion ? faltante - enGestion : 0n)),
    };
  }

  /** El actor se obtiene de los participantes de la reserva, nunca del cliente. */
  private actorDeCancelacion(reserva: Reserva, idSolicitante?: number): ActorCancelacion {
    if (idSolicitante && this.reservas.esDelInquilino(reserva, idSolicitante))
      return 'INQUILINO';
    if (idSolicitante && this.reservas.esDelAnunciante(reserva, idSolicitante))
      return 'ANUNCIANTE';
    return 'ADMINISTRADOR';
  }

  private porcentajeDevolucion(reserva: Reserva, actor: ActorCancelacion, hoy: string, politica: PoliticaCancelacion): number {
    if (actor === 'ANUNCIANTE') return 100;
    if (actor !== 'INQUILINO') return politica.porcentajeOtrosActores;
    const dias = this.diasHastaIngreso(reserva, hoy);
    if (dias >= politica.diasDevolucionTotal) return politica.porcentajeTotal;
    if (dias >= politica.diasDevolucionParcial) return politica.porcentajeParcial;
    return politica.porcentajeFueraDePlazo;
  }

  private calcularDevolucion(reserva: Reserva, actor: ActorCancelacion, fechaSolicitud: string, politica: PoliticaCancelacion, importePagado: number | string): Omit<DevolucionCancelacionDto, 'moneda'> {
    const porcentaje = this.porcentajeDevolucion(reserva, actor, fechaSolicitud, politica);
    const centavosPagados = decimalEntero(importePagado, 2);
    // Redondea una sola vez, al centavo más cercano; medio centavo se redondea hacia arriba.
    const centavosDevolucion = (centavosPagados * BigInt(porcentaje) + 50n) / 100n;
    return {
      fechaSolicitud,
      diasAnticipacion: this.diasHastaIngreso(reserva, fechaSolicitud),
      porcentaje,
      importe: Number(importeTexto(centavosDevolucion)),
    };
  }

  private diasHastaIngreso(reserva: Reserva, hoy: string): number {
    return reserva.fecha_inicio ? diasDeAntelacion(reserva.fecha_inicio, hoy) : 0;
  }

  /** De quien pidió o decidió la solicitud solo viaja su identidad; las relaciones que no se cargaron no se agregan. */
  private prepararRespuesta(solicitud: SolicitudCancelacion): SolicitudCancelacion {
    const { solicitante, decidida_por, reserva } = solicitud;
    return {
      ...solicitud,
      ...(solicitante ? { solicitante: this.identidadSolicitud(solicitante) } : {}),
      ...(decidida_por !== undefined ? { decidida_por: decidida_por ? this.identidadSolicitud(decidida_por) : null } : {}),
      ...(reserva?.estado_pago ? { reserva: this.reservas.prepararRespuesta(reserva) } : {}),
    };
  }

  private identidadSolicitud(usuario: NonNullable<SolicitudCancelacion['solicitante']>): NonNullable<SolicitudCancelacion['solicitante']> {
    return { ...referenciaUsuario(usuario.id), nombre: usuario.nombre, apellido: usuario.apellido };
  }
}
