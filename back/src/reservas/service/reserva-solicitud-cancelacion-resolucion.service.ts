import {
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { fechaArgentina } from '../../common/utils/fechas';
import { DisponibilidadService } from '../../disponibilidad/service/disponibilidad.service';
import {
  TRANSACCION_CALENDARIO,
  type ITransaccionCalendario,
} from '../../disponibilidad/repository/transaccion-calendario.interface';
import {
  EstadoReembolso,
  OrigenReembolso,
  Reembolso,
  TipoReembolso,
} from '../../reembolsos/entity/reembolso.entity';
import { ReembolsosService } from '../../reembolsos/service/reembolsos.service';
import {
  ActorCancelacion,
  EstadoLiquidacionReserva,
  Reserva,
} from '../entity/reserva.entity';
import {
  EstadoSolicitudCancelacion,
  SolicitudCancelacion,
} from '../entity/solicitud-cancelacion.entity';
import { ResolverSolicitudCancelacionDto } from '../dto/resolver-solicitud-cancelacion.dto';
import {
  RESERVA_REPOSITORY,
  type IReservaRepository,
} from '../repository/reserva.repository.interface';
import { ReservaCicloVidaService } from './reserva-ciclo-vida.service';
import { ReservaReembolsoAplicacionService } from './reserva-reembolso-aplicacion.service';
import { ReservaEstadoService } from './reserva-estado.service';
import { TOLERANCIA_MONETARIA } from '../../common/utils/dinero';

@Injectable()
export class ReservaSolicitudCancelacionResolucionService {
  private readonly logger = new Logger(
    ReservaSolicitudCancelacionResolucionService.name,
  );

  constructor(
    @Inject(RESERVA_REPOSITORY)
    private readonly reservaRepository: IReservaRepository,
    @Inject(TRANSACCION_CALENDARIO)
    private readonly transaccion: ITransaccionCalendario,
    private readonly disponibilidadService: DisponibilidadService,
    private readonly reembolsosService: ReembolsosService,
    private readonly estado: ReservaEstadoService,
    private readonly ciclo: ReservaCicloVidaService,
    private readonly aplicacion: ReservaReembolsoAplicacionService,
  ) {}

  async resolverSolicitudCancelacion(
    idReserva: number,
    idSolicitud: number,
    dto: ResolverSolicitudCancelacionDto,
    idAdmin: number,
  ): Promise<{
    solicitud: SolicitudCancelacion;
    reembolso: Reembolso | null;
  }> {
    const solicitud =
      await this.reservaRepository.buscarSolicitudCancelacion(
        idSolicitud,
        idReserva,
      );
    if (!solicitud)
      throw new NotFoundException('No se encontró la solicitud de cancelación');
    if (solicitud.estado !== EstadoSolicitudCancelacion.PENDIENTE)
      throw new ConflictException('La solicitud ya fue resuelta');

    const reserva = solicitud.reserva;
    const hoy = fechaArgentina();
    const noCancelable =
      !reserva.fecha_inicio ||
      reserva.fecha_inicio <= hoy ||
      reserva.cancelada ||
      reserva.finalizada ||
      this.estado.codigoValidado(reserva) ||
      this.estado.liquidacionResuelta(reserva) ||
      this.estado.liquidacionEnRevision(reserva);
    if (noCancelable) {
      await this.marcarSolicitudVencida(
        idSolicitud,
        idReserva,
        idAdmin,
        'La reserva ya no admite la cancelación solicitada',
      );
      throw new ConflictException(
        'La reserva ya no admite la cancelación solicitada',
      );
    }

    const actor = this.actorDeCancelacion(reserva, solicitud.solicitante?.id);
    const porcentaje = this.porcentajeCancelacion(reserva, actor, hoy);
    const importeBase = this.redondear(
      (Number(reserva.monto_pago) * porcentaje) / 100,
    );
    const existentes = await this.reembolsosService.listarPorReserva(idReserva);

    if (dto.decision === 'RECHAZADA') {
      await this.transaccion.ejecutar(
        async ({ reservas }) => {
          const actualSolicitud =
            await reservas.buscarSolicitudCancelacionConBloqueo(
              idSolicitud,
              idReserva,
            );
          if (
            !actualSolicitud ||
            actualSolicitud.estado !== EstadoSolicitudCancelacion.PENDIENTE
          )
            throw new ConflictException('La solicitud ya fue resuelta');
          actualSolicitud.estado = EstadoSolicitudCancelacion.RECHAZADA;
          actualSolicitud.decidida_por = { id: idAdmin } as never;
          actualSolicitud.decidida_en = new Date();
          actualSolicitud.observacion = dto.observacion?.trim() || null;
          return {
            solicitud: await reservas.guardarSolicitudCancelacion(
              actualSolicitud,
            ),
            reembolso: null,
          };
        },
      );

      const pendientes = await this.reembolsosService.listarPorReserva(
        idReserva,
      );
      const baseObligacion = `cancelacion:${idSolicitud}`;
      const previos = pendientes.filter(
        (reembolso) =>
          (reembolso.idempotency_key === baseObligacion ||
            (reembolso.idempotency_key ?? '').startsWith(
              `${baseObligacion}:`,
            )) &&
          (reembolso.estado === EstadoReembolso.PENDIENTE ||
            reembolso.estado === EstadoReembolso.FALLIDO),
      );
      for (const previo of previos) {
        const compensado = await this.reembolsosService.compensar(
          previo.id,
          idAdmin,
        );
        if (!compensado)
          throw new ConflictException(
            'La solicitud se rechazó, pero el reembolso pendiente no pudo compensarse',
          );
      }
      return {
        solicitud: await this.recargarSolicitud(idSolicitud, idReserva),
        reembolso: null,
      };
    }

    const pago = await this.reembolsosService.buscarPagoPorReserva(idReserva);
    const saldo = pago
      ? Number(pago.amount) - Number(pago.amount_refunded ?? 0)
      : 0;
    const claveObligacion = `cancelacion:${idSolicitud}`;
    const esDeLaObligacion = (reembolso: Reembolso) =>
      reembolso.idempotency_key === claveObligacion ||
      (reembolso.idempotency_key ?? '').startsWith(
        `${claveObligacion}:`,
      );
    const pendienteTotal = existentes
      .filter(
        (reembolso) =>
          reembolso.estado === EstadoReembolso.PENDIENTE ||
          reembolso.estado === EstadoReembolso.EN_PROCESO,
      )
      .reduce((total, reembolso) => total + Number(reembolso.importe), 0);
    const aprobadoObligacion = existentes
      .filter(
        (reembolso) =>
          reembolso.estado === EstadoReembolso.APROBADO &&
          esDeLaObligacion(reembolso),
      )
      .reduce((total, reembolso) => total + Number(reembolso.importe), 0);
    const importe = Math.max(
      0,
      Math.min(
        importeBase - aprobadoObligacion,
        saldo - pendienteTotal,
      ),
    );

    let reembolso: Reembolso | null = null;
    const pendientesMisma = existentes.filter(
      (reembolsoActual) =>
        (reembolsoActual.estado === EstadoReembolso.PENDIENTE ||
          reembolsoActual.estado === EstadoReembolso.EN_PROCESO ||
          reembolsoActual.estado === EstadoReembolso.FALLIDO) &&
        esDeLaObligacion(reembolsoActual),
    );
    if (pendientesMisma.length > 1)
      throw new ConflictException(
        'Hay más de una devolución pendiente para esta solicitud; revisar',
      );
    if (pendientesMisma.length === 1) {
      reembolso = pendientesMisma[0];
      if (
        Math.abs(
          Number(reembolso.importe) -
            (importeBase - aprobadoObligacion),
        ) > TOLERANCIA_MONETARIA
      )
        throw new ConflictException(
          'La devolución pendiente no coincide con el importe de la cancelación; revisar',
        );
    }

    if (!reembolso && importe > 0 && pago) {
      let clave = claveObligacion;
      let intento = 1;
      while (existentes.some((reembolso) => reembolso.idempotency_key === clave))
        clave = `${claveObligacion}:c${intento++}`;
      const resultadoCreacion =
        await this.reembolsosService.crearSolicitudConResultado({
          reserva,
          pago,
          tipo:
            importe >= Number(pago.amount) - TOLERANCIA_MONETARIA
              ? TipoReembolso.TOTAL
              : TipoReembolso.PARCIAL,
          origen: OrigenReembolso.CANCELACION,
          importe,
          motivo: `Cancelación de reserva: ${solicitud.motivo}`,
          idSolicitadoPor: idAdmin,
          idempotencyKey: clave,
        });
      reembolso = resultadoCreacion.reembolso;
    }

    if (reembolso) {
      if (
        reembolso.estado !== EstadoReembolso.PENDIENTE &&
        reembolso.estado !== EstadoReembolso.EN_PROCESO &&
        reembolso.estado !== EstadoReembolso.FALLIDO &&
        reembolso.estado !== EstadoReembolso.APROBADO
      )
        throw new ConflictException(
          'El reembolso existente no es válido; reintentá la resolución',
        );

      let resultado: {
        vencida: boolean;
        solicitud: SolicitudCancelacion;
      };
      // No se compensa el PENDIENTE ante un fallo: puede estar siendo usado
      // por otra resolución concurrente; queda disponible para reintentar.
      resultado = await this.transaccion.ejecutar(async ({ reservas }) => {
          const actualSolicitud =
            await reservas.buscarSolicitudCancelacionConBloqueo(
              idSolicitud,
              idReserva,
            );
          if (
            !actualSolicitud ||
            actualSolicitud.estado !== EstadoSolicitudCancelacion.PENDIENTE
          )
            throw new ConflictException('La solicitud ya fue resuelta');

          const actualReserva = await reservas.buscarPorId(idReserva);
          if (!actualReserva)
            throw new NotFoundException('No se encontró la reserva');

          const hoyActual = fechaArgentina();
          if (
            actualReserva.cancelada ||
            actualReserva.finalizada ||
            this.estado.codigoValidado(actualReserva) ||
            this.estado.liquidacionResuelta(actualReserva) ||
            this.estado.liquidacionEnRevision(actualReserva) ||
            !actualReserva.fecha_inicio ||
            actualReserva.fecha_inicio <= hoyActual
          ) {
            actualSolicitud.estado = EstadoSolicitudCancelacion.VENCIDA;
            actualSolicitud.decidida_por = { id: idAdmin } as never;
            actualSolicitud.decidida_en = new Date();
            actualSolicitud.observacion =
              'La reserva ya no admite la cancelación solicitada';
            return {
              vencida: true,
              solicitud: await reservas.guardarSolicitudCancelacion(
                actualSolicitud,
              ),
            };
          }

          actualSolicitud.estado = EstadoSolicitudCancelacion.APROBADA;
          actualSolicitud.decidida_por = { id: idAdmin } as never;
          actualSolicitud.decidida_en = new Date();
          actualSolicitud.observacion = dto.observacion?.trim() || null;
          return {
            vencida: false,
            solicitud: await reservas.guardarSolicitudCancelacion(
              actualSolicitud,
            ),
          };
        });

      if (resultado.vencida) {
        const compensado = await this.reembolsosService.compensar(
          reembolso.id,
          idAdmin,
        );
        if (!compensado)
          throw new Error(
            'La solicitud venció, pero el reembolso no pudo compensarse',
          );
        throw new ConflictException(
          'La reserva ya no admite la cancelación solicitada',
        );
      }

      let reembolsoFinal = reembolso;
      if (this.reembolsosService.ejecucionAutomaticaHabilitada) {
        try {
          reembolsoFinal = await this.reembolsosService.registrarOejecutar(
            reembolso.id,
            null,
            idAdmin,
          );
          if (reembolsoFinal.estado === EstadoReembolso.APROBADO)
            await this.aplicacion.aplicarReembolsoConfirmado(
              reembolsoFinal.id,
            );
          else
            throw new ConflictException(
              'La solicitud se aprobó, pero la devolución no quedó confirmada; revisar',
            );
        } catch (error) {
          this.logger.error(
            `La solicitud ${idSolicitud} se aprobó, pero la devolución ${reembolso.id} no se ejecutó`,
            error as Error,
          );
          throw new ConflictException(
            'La solicitud se aprobó, pero la devolución no se pudo ejecutar; revisar',
          );
        }
      }
      return {
        solicitud: await this.recargarSolicitud(idSolicitud, idReserva),
        reembolso: reembolsoFinal,
      };
    }

    let resultado: {
      vencida: boolean;
      solicitud: SolicitudCancelacion;
    };
    resultado = await this.transaccion.ejecutar(
      async ({ reservas, fechas }) => {
        const actualSolicitud =
          await reservas.buscarSolicitudCancelacionConBloqueo(
            idSolicitud,
            idReserva,
          );
        if (
          !actualSolicitud ||
          actualSolicitud.estado !== EstadoSolicitudCancelacion.PENDIENTE
        )
          throw new ConflictException('La solicitud ya fue resuelta');

        const actualReserva = await reservas.buscarPorId(idReserva);
        if (!actualReserva)
          throw new NotFoundException('No se encontró la reserva');

        const hoyActual = fechaArgentina();
        if (
          actualReserva.cancelada ||
          actualReserva.finalizada ||
          this.estado.codigoValidado(actualReserva) ||
          !actualReserva.fecha_inicio ||
          actualReserva.fecha_inicio <= hoyActual
        ) {
          actualSolicitud.estado = EstadoSolicitudCancelacion.VENCIDA;
          actualSolicitud.decidida_por = { id: idAdmin } as never;
          actualSolicitud.decidida_en = new Date();
          actualSolicitud.observacion =
            'La reserva ya no admite la cancelación solicitada';
          return {
            vencida: true,
            solicitud: await reservas.guardarSolicitudCancelacion(
              actualSolicitud,
            ),
          };
        }

        actualSolicitud.estado = EstadoSolicitudCancelacion.APROBADA;
        actualSolicitud.decidida_por = { id: idAdmin } as never;
        actualSolicitud.decidida_en = new Date();
        actualSolicitud.observacion = dto.observacion?.trim() || null;
        const solicitudGuardada =
          await reservas.guardarSolicitudCancelacion(actualSolicitud);

        this.ciclo.cancelar(actualReserva, actor, actualSolicitud.motivo);
        actualReserva.estado_liquidacion = EstadoLiquidacionReserva.EN_REVISION;
        actualReserva.observacion_liquidacion =
          'Cancelación con retención total; liquidación pendiente de revisión';
        await reservas.guardar(actualReserva);
        await this.disponibilidadService.liberarReserva(
          idReserva,
          fechas,
        );
        return { vencida: false, solicitud: solicitudGuardada };
      },
    );

    if (resultado.vencida)
      throw new ConflictException(
        'La reserva ya no admite la cancelación solicitada',
      );
    return {
      solicitud: await this.recargarSolicitud(idSolicitud, idReserva),
      reembolso: null,
    };
  }

  private async recargarSolicitud(
    idSolicitud: number,
    idReserva: number,
  ): Promise<SolicitudCancelacion> {
    const solicitud = await this.reservaRepository.buscarSolicitudCancelacion(
      idSolicitud,
      idReserva,
    );
    if (!solicitud)
      throw new NotFoundException('No se encontró la solicitud de cancelación');
    return solicitud;
  }

  private async marcarSolicitudVencida(
    idSolicitud: number,
    idReserva: number,
    idAdmin: number,
    observacion: string,
  ): Promise<void> {
    await this.transaccion.ejecutar(async ({ reservas }) => {
      const actual =
        await reservas.buscarSolicitudCancelacionConBloqueo(
          idSolicitud,
          idReserva,
        );
      if (
        !actual ||
        actual.estado !== EstadoSolicitudCancelacion.PENDIENTE
      )
        return;
      actual.estado = EstadoSolicitudCancelacion.VENCIDA;
      actual.decidida_por = { id: idAdmin } as never;
      actual.decidida_en = new Date();
      actual.observacion = observacion;
      await reservas.guardarSolicitudCancelacion(actual);
    });
  }


  private actorDeCancelacion(
    reserva: Reserva,
    idSolicitante?: number,
  ): ActorCancelacion {
    if (idSolicitante && this.estado.esDelInquilino(reserva, idSolicitante))
      return 'INQUILINO';
    if (idSolicitante && this.estado.esDelAnunciante(reserva, idSolicitante))
      return 'ANUNCIANTE';
    return 'ADMINISTRADOR';
  }

  private porcentajeCancelacion(
    reserva: Reserva,
    actor: ActorCancelacion,
    hoy: string,
  ): number {
    if (actor !== 'INQUILINO') return 100;
    if (!reserva.fecha_inicio) return 0;
    const inicio = new Date(`${reserva.fecha_inicio}T12:00:00-03:00`).getTime();
    const ahora = new Date(`${hoy}T12:00:00-03:00`).getTime();
    const horas = (inicio - ahora) / 3_600_000;
    if (horas >= 7 * 24) return 100;
    if (horas >= 48) return 50;
    return 0;
  }

  private redondear(valor: number): number {
    return Math.round((valor + Number.EPSILON) * 100) / 100;
  }
}
