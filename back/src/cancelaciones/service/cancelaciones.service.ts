import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnModuleDestroy,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CatalogosService } from '../../catalogos/service/catalogos.service';
import { fechaArgentina } from '../../common/utils/fechas';
import { decimalEntero, importeTexto } from '../../common/utils/importes';
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
import type { CondicionesCancelacionDto, DevolucionCancelacionDto, SaldoDevolucionCancelacionDto, SolicitudCancelacionAdministracionDto } from '../dto/condiciones-cancelacion.dto';
import { ResolverSolicitudCancelacionDto } from '../dto/resolver-solicitud-cancelacion.dto';
import { SolicitarCancelacionDto } from '../dto/solicitar-cancelacion.dto';
import { SolicitudCancelacion } from '../entity/solicitud-cancelacion.entity';
import type { PoliticaCancelacion } from '../entity/politica-cancelacion.entity';
import type { EntityManager } from 'typeorm';
import {
  CANCELACIONES_REPOSITORY,
  type ICancelacionesRepository,
} from '../repository/cancelaciones.repository.interface';

type ResultadoResolucion =
  | { vencida: true; reserva: Reserva; motivo: string; idSolicitante?: number }
  | { vencida: false; reserva: Reserva; solicitud: SolicitudCancelacion; reembolso: Reembolso | null };

/**
 * Dueño de la solicitud de cancelación de una reserva pagada y de su decisión.
 * Aplica la política de devolución y pide a Reservas y a Reembolsos los
 * efectos sobre la estadía y el dinero.
 */
@Injectable()
export class CancelacionesService implements OnApplicationBootstrap, OnModuleDestroy {
  private readonly logger = new Logger(CancelacionesService.name);
  private temporizador?: ReturnType<typeof setInterval>;
  private venciendo = false;
  private readonly motivoDemora = 'Solicitud rechazada por falta de resolución administrativa antes de la fecha de ingreso';
  constructor(@Inject(CANCELACIONES_REPOSITORY) private readonly cancelaciones: ICancelacionesRepository, private readonly reservas: ReservasService, private readonly reembolsos: ReembolsosService, private readonly catalogos: CatalogosService, private readonly notificaciones?: ReservaNotificacionesService) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.rechazarSolicitudesVencidas();
    this.temporizador = setInterval(() => void this.rechazarSolicitudesVencidas(), 60_000);
    this.temporizador.unref?.();
  }

  onModuleDestroy(): void {
    if (this.temporizador) clearInterval(this.temporizador);
  }

  async rechazarSolicitudesVencidas(): Promise<void> {
    if (this.venciendo) return;
    this.venciendo = true;
    try {
      let despuesDe = 0;
      for (;;) {
        const filas = await this.cancelaciones.listarVencibles(fechaArgentina(), despuesDe);
        if (!filas.length) break;
        for (const fila of filas) {
          despuesDe = fila.id;
          await this.cancelaciones.conTransaccion(async (repo, tx) => {
            const reserva = await this.reservas.obtenerReserva(fila.reserva.id, tx);
            const solicitud = await repo.buscarParaResolver(fila.id, reserva.id);
            if (solicitud?.estado === 'PENDIENTE' && reserva.fecha_inicio && reserva.fecha_inicio <= fechaArgentina())
              await this.rechazarPorDemora(solicitud, repo);
          });
        }
      }
    } catch (error) {
      this.logger.error('No se pudieron rechazar las cancelaciones fuera de plazo; se reintentará', error);
    } finally { this.venciendo = false; }
  }

  private async rechazarPorDemora(solicitud: SolicitudCancelacion, repo: ICancelacionesRepository): Promise<SolicitudCancelacion> {
    solicitud.estado = this.catalogos.codigoEstado('SOLICITUD_CANCELACION', 'RECHAZADA');
    solicitud.decidida_por = null;
    solicitud.decidida_en = new Date();
    solicitud.observacion = this.motivoDemora;
    return repo.guardar(solicitud);
  }

  private esDemoraAdministrativa(solicitud: SolicitudCancelacion, reserva: Reserva): boolean {
    if (!reserva.fecha_inicio || reserva.fecha_inicio > fechaArgentina() || fechaArgentina(solicitud.creada_en) >= reserva.fecha_inicio) return false;
    return solicitud.estado === 'PENDIENTE' || (solicitud.estado === 'VENCIDA' && (!solicitud.decidida_en || fechaArgentina(solicitud.decidida_en) >= reserva.fecha_inicio)) ||
      (solicitud.estado === 'RECHAZADA' && !solicitud.decidida_por && solicitud.observacion === this.motivoDemora);
  }

  async buscarSolicitudParaReclamoDemora(reserva: Reserva, idUsuario: number, transaccion: EntityManager): Promise<SolicitudCancelacion> {
    await this.reservas.buscarPorId(reserva.id, idUsuario, transaccion);
    const repo = this.cancelaciones.enTransaccion(transaccion);
    const candidata = await repo.buscarDemorada(reserva.id, idUsuario);
    const solicitud = candidata ? await repo.buscarParaResolver(candidata.id, reserva.id) : null;
    if (!solicitud || !this.esDemoraAdministrativa(solicitud, reserva))
      throw new ConflictException('No tenés una solicitud de cancelación sin resolver antes del ingreso para reclamar por demora administrativa');
    if (solicitud.estado === 'PENDIENTE') await this.rechazarPorDemora(solicitud, repo);
    return solicitud;
  }

  async listarDemorasParaReclamo(idUsuario: number): Promise<SolicitudCancelacion[]> {
    await this.rechazarSolicitudesVencidas();
    const solicitudes = await this.cancelaciones.listarDemoradasDelSolicitante(idUsuario, fechaArgentina());
    return solicitudes.filter(solicitud => this.esDemoraAdministrativa(solicitud, solicitud.reserva)).filter((solicitud, indice, filas) => filas.findIndex(fila => fila.reserva.id === solicitud.reserva.id) === indice);
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
      const solicitud = cancelaciones.crear({
        reserva,
        solicitante: referenciaUsuario(idUsuario),
        motivo: dto.motivo.trim(),
        estado: this.catalogos.codigoEstado('SOLICITUD_CANCELACION', 'PENDIENTE'),
        decidida_por: null,
        decidida_en: null,
        observacion: null,
        creada_en: creadaEn,
      });
      const guardada = await cancelaciones.guardar(solicitud);
      guardada.decidida_en = new Date();
      const aprobada = await this.aprobarSolicitud(reserva, guardada, hoy, null, cancelaciones, transaccion);
      if (aprobada.vencida) throw new ConflictException(aprobada.motivo);
      return { solicitud: aprobada.solicitud, creada: true, reembolso: aprobada.reembolso };
    });
    if (resultado.creada)
      await this.notificaciones?.avisarCambio(resultado.solicitud.reserva, ['inquilino', 'anunciante'],
        resultado.reembolso ? 'Cancelación aceptada' : 'Reserva cancelada',
        resultado.reembolso ? 'La devolución está en gestión.' : 'La reserva quedó cancelada sin devolución según las condiciones aceptadas.');
    return this.prepararRespuesta(resultado.solicitud);
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
        ? `Faltan menos de ${politica.diasDevolucionParcial} días para el ingreso. Si se aprueba la cancelación, no recibirás devolución del importe pagado (0 %).`
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

  private async buscarEnCurso(cancelaciones: ICancelacionesRepository, reserva: Reserva, transaccion?: EntityManager): Promise<SolicitudCancelacion | null> {
    const pendiente = await cancelaciones.buscarActiva(reserva.id, this.catalogos.codigoEstado('SOLICITUD_CANCELACION', 'PENDIENTE'));
    if (pendiente || reserva.cancelada) return pendiente;
    const aprobada = await cancelaciones.buscarActiva(reserva.id, this.catalogos.codigoEstado('SOLICITUD_CANCELACION', 'APROBADA'));
    if (!aprobada || !(await this.reembolsos.tieneDevolucionDeCancelacionActiva(reserva.id, transaccion)))
      return null;
    return aprobada;
  }

  private async asegurarSinDevolucionActiva(idReserva: number, transaccion: EntityManager): Promise<void> {
    if (await this.reembolsos.tieneDevolucionDeCancelacionActiva(idReserva, transaccion))
      throw new ConflictException('La reserva ya tiene una devolución por cancelación en curso');
  }

  async listarPendientes(): Promise<SolicitudCancelacionAdministracionDto[]> {
    const solicitudes = await this.cancelaciones.listarPorEstado(this.catalogos.codigoEstado('SOLICITUD_CANCELACION', 'PENDIENTE'));
    return Promise.all(solicitudes.map(async (solicitud) => {
      const reserva = solicitud.reserva;
      const pago = await this.reembolsos.buscarPagoPorReserva(reserva.id);
      let devolucion: DevolucionCancelacionDto | null = null;
      if (pago) {
        const politica = await this.politicaAplicable(this.cancelaciones, reserva);
        const actor = this.actorDeCancelacion(reserva, solicitud.solicitante?.id);
        devolucion = {
          ...this.calcularDevolucion(reserva, actor, fechaArgentina(solicitud.creada_en), politica, pago.amount),
          moneda: pago.currency,
        };
      }
      return { ...this.prepararRespuesta(solicitud), devolucion };
    }));
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

  /**
   * Resuelve el pedido. Si se aprueba, calcula la devolución a la fecha de
   * solicitud con la política contratada y crea el reembolso.
   * Las fechas se liberan cuando el
   * reembolso queda aprobado (o de inmediato si el porcentaje es 0).
   *
   * La decisión y sus efectos locales comparten una transacción con la
   * solicitud bloqueada: dos resoluciones simultáneas dejan una sola devolución
   * y un fallo al cancelar o liberar fechas revierte la aprobación.
   */
  async resolver(idReserva: number, idSolicitud: number, dto: ResolverSolicitudCancelacionDto, idAdmin: number): Promise<{ solicitud: SolicitudCancelacion; reembolso: Reembolso | null }> {
    const resultado = await this.cancelaciones.conTransaccion((cancelaciones, transaccion) =>
      this.resolverEnTransaccion(idReserva, idSolicitud, dto, idAdmin, cancelaciones, transaccion),
    );

    await this.notificarResolucion(resultado);
    if (resultado.vencida)
      throw new ConflictException(resultado.motivo === this.motivoDemora ? `${resultado.motivo}; la reserva sigue en curso y podés reclamar por demora administrativa` : `${resultado.motivo}; la solicitud quedó vencida`);

    return {
      solicitud: this.prepararRespuesta(resultado.solicitud),
      reembolso: resultado.reembolso,
    };
  }

  private async resolverEnTransaccion(idReserva: number, idSolicitud: number, dto: ResolverSolicitudCancelacionDto, idAdmin: number, cancelaciones: ICancelacionesRepository, transaccion: EntityManager): Promise<ResultadoResolucion> {
    // El alta y la resolución bloquean primero la reserva y después consultan sus solicitudes.
    const reserva = await this.reservas.obtenerReserva(idReserva, transaccion);
    const solicitud = await cancelaciones.buscarParaResolver(idSolicitud, idReserva);
    if (!solicitud)
      throw new NotFoundException('No se encontró la solicitud de cancelación');
    if (solicitud.estado !== this.catalogos.codigoEstado('SOLICITUD_CANCELACION', 'PENDIENTE'))
      throw new ConflictException('La solicitud ya fue resuelta');

    const hoy = fechaArgentina();
    solicitud.decidida_por = referenciaUsuario(idAdmin);
    solicitud.decidida_en = new Date();

    if (reserva.fecha_inicio && reserva.fecha_inicio <= hoy) {
      await this.rechazarPorDemora(solicitud, cancelaciones);
      return { vencida: true, reserva, motivo: this.motivoDemora, idSolicitante: solicitud.solicitante?.id };
    }

    const motivoVencimiento = this.reservas.codigoValidado(reserva)
      ? 'El código de ingreso fue validado antes de resolver la solicitud'
      : !reserva.fecha_inicio || reserva.fecha_inicio <= hoy
        ? 'La estadía comenzó antes de resolver la solicitud' : null;
    if (motivoVencimiento) {
      solicitud.estado = this.catalogos.codigoEstado('SOLICITUD_CANCELACION', 'VENCIDA');
      solicitud.observacion = motivoVencimiento;
      await cancelaciones.guardar(solicitud);
      return { vencida: true, reserva, motivo: motivoVencimiento, idSolicitante: solicitud.solicitante?.id };
    }

    solicitud.observacion = dto.observacion?.trim() || null;

    const rechazada = this.catalogos.codigoEstado('SOLICITUD_CANCELACION', 'RECHAZADA');
    if (dto.decision === rechazada) {
      solicitud.estado = rechazada;
      return { vencida: false, reserva, solicitud: await cancelaciones.guardar(solicitud), reembolso: null };
    }

    return this.aprobarSolicitud(reserva, solicitud, hoy, idAdmin, cancelaciones, transaccion);
  }

  private async aprobarSolicitud(reserva: Reserva, solicitud: SolicitudCancelacion, hoy: string, idAdmin: number | null, cancelaciones: ICancelacionesRepository, transaccion: EntityManager): Promise<ResultadoResolucion> {
    const actor = this.actorDeCancelacion(reserva, solicitud.solicitante?.id);
    const impedimento = this.impedimentoReserva(reserva, hoy);
    if (impedimento) throw impedimento;
    await this.asegurarSinDevolucionActiva(reserva.id, transaccion);
    const politica = await this.politicaAplicable(cancelaciones, reserva);

    const pago = await this.reembolsos.buscarPagoPorReserva(reserva.id, transaccion);
    const { porcentaje, importe } = this.calcularDevolucion(reserva, actor, fechaArgentina(solicitud.creada_en), politica, pago?.amount ?? null);
    solicitud.estado = this.catalogos.codigoEstado('SOLICITUD_CANCELACION', 'APROBADA');

    if (importe > 0 && pago) {
      // El reembolso y la aprobación se confirman juntos: no queda una
      // solicitud aprobada sin registro económico ni un registro sin decisión.
      const referencia = idAdmin === null ? `auto-can:${solicitud.id}` : this.claveReembolso(solicitud.id);
      const reembolso = await this.reembolsos.crearSolicitud(
        {
          reserva,
          pago,
          tipo:
            porcentaje >= 100 ? TipoReembolso.TOTAL : TipoReembolso.PARCIAL,
          origen: OrigenReembolso.CANCELACION,
          importe,
          motivo: `Cancelación de reserva: ${solicitud.motivo}`,
          idSolicitadoPor: idAdmin ?? solicitud.solicitante?.id ?? null,
          idempotencyKey: referencia,
          referenciaInterna: referencia,
        },
        transaccion,
      );
      return { vencida: false, reserva, solicitud: await cancelaciones.guardar(solicitud), reembolso };
    }

    // Sin devolución: la reserva se cancela y las fechas se liberan.
    const guardada = await cancelaciones.guardar(solicitud);
    guardada.reserva = await this.reservas.cancelarConRetencionTotal(reserva.id, actor, solicitud.motivo, transaccion);
    return { vencida: false, reserva, solicitud: guardada, reembolso: null };
  }

  private async notificarResolucion(resultado: ResultadoResolucion): Promise<void> {
    const idSolicitante = resultado.vencida ? resultado.idSolicitante : resultado.solicitud.solicitante?.id;
    const destinatario = this.actorDeCancelacion(resultado.reserva, idSolicitante);
    const solicitante = destinatario === 'ANUNCIANTE' ? ['anunciante'] as const
      : destinatario === 'INQUILINO' ? ['inquilino'] as const : [] as const;
    if (resultado.vencida) {
      await this.notificaciones?.avisarCambio(resultado.reserva, solicitante, resultado.motivo === this.motivoDemora ? 'Solicitud de cancelación rechazada por demora' : 'Solicitud de cancelación vencida', `${resultado.motivo}. La reserva sigue en curso. Consultá en Mis reservas la opción de reclamo por demora administrativa.`);
      return;
    }
    if (resultado.solicitud.estado === this.catalogos.codigoEstado('SOLICITUD_CANCELACION', 'RECHAZADA'))
      await this.notificaciones?.avisarCambio(resultado.reserva, solicitante, 'Solicitud de cancelación rechazada', 'La administración rechazó la solicitud. Consultá el detalle en DEPA.');
    else if (resultado.reembolso)
      await this.notificaciones?.avisarCambio(resultado.reserva, ['inquilino', 'anunciante'], 'Solicitud de cancelación aprobada', 'La devolución está en gestión. La cancelación se hará efectiva cuando se confirme.');
    else
      await this.notificaciones?.avisarCambio(resultado.reserva, ['inquilino', 'anunciante'], 'Reserva cancelada', 'La administración aprobó la cancelación y la reserva quedó cancelada.');
  }

  /** Identidad estable de la devolución de una solicitud: repetir la resolución no crea otra. */
  private claveReembolso(idSolicitud: number): string {
    return `can:${idSolicitud}`;
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

  private calcularDevolucion(reserva: Reserva, actor: ActorCancelacion, fechaSolicitud: string, politica: PoliticaCancelacion, importePagado: number | string | null): Omit<DevolucionCancelacionDto, 'moneda'> {
    const porcentaje = this.porcentajeDevolucion(reserva, actor, fechaSolicitud, politica);
    if (importePagado == null && porcentaje > 0)
      throw new ConflictException('La reserva no tiene un pago registrado');
    const centavosPagados = decimalEntero(importePagado ?? 0, 2);
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
    if (!reserva.fecha_inicio) return 0;
    const inicio = new Date(`${reserva.fecha_inicio}T12:00:00Z`).getTime();
    const ahora = new Date(`${hoy}T12:00:00Z`).getTime();
    return (inicio - ahora) / 86_400_000;
  }

  private prepararRespuesta(solicitud: SolicitudCancelacion): SolicitudCancelacion {
    return {
      ...solicitud,
      solicitante: solicitud.solicitante ? this.identidadSolicitud(solicitud.solicitante) : solicitud.solicitante,
      decidida_por: solicitud.decidida_por ? this.identidadSolicitud(solicitud.decidida_por) : null,
      reserva: solicitud.reserva?.estado_pago ? this.reservas.prepararRespuesta(solicitud.reserva) : solicitud.reserva,
    };
  }

  private identidadSolicitud(usuario: NonNullable<SolicitudCancelacion['solicitante']>): NonNullable<SolicitudCancelacion['solicitante']> {
    return { ...referenciaUsuario(usuario.id), nombre: usuario.nombre, apellido: usuario.apellido };
  }
}
