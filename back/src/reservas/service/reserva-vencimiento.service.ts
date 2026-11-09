import {
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  OnApplicationBootstrap,
  OnModuleDestroy,
} from '@nestjs/common';
import { DisponibilidadService } from '../../disponibilidad/service/disponibilidad.service';
import {
  TRANSACCION_CALENDARIO,
  type ITransaccionCalendario,
} from '../../disponibilidad/repository/transaccion-calendario.interface';
import {
  ActorCancelacion,
  EstadoPagoReserva,
  Reserva,
} from '../entity/reserva.entity';
import {
  RESERVA_REPOSITORY,
  type IReservaRepository,
} from '../repository/reserva.repository.interface';
import { ReservaCicloVidaService } from './reserva-ciclo-vida.service';
import { ReservaEstadoService } from './reserva-estado.service';

/**
 * Vencimiento de reservas pendientes de pago. Ejecuta al iniciar y cada
 * minuto; el estado vive en la base, así que un reinicio no pierde plazos.
 */
@Injectable()
export class ReservaVencimientoService
  implements OnApplicationBootstrap, OnModuleDestroy
{
  private readonly logger = new Logger(ReservaVencimientoService.name);
  private timer?: ReturnType<typeof setInterval>;
  private expiracion?: Promise<number>;

  constructor(
    @Inject(RESERVA_REPOSITORY)
    private readonly reservaRepository: IReservaRepository,
    @Inject(TRANSACCION_CALENDARIO)
    private readonly transaccion: ITransaccionCalendario,
    private readonly disponibilidadService: DisponibilidadService,
    private readonly estado: ReservaEstadoService,
    private readonly ciclo: ReservaCicloVidaService,
  ) {}

  onApplicationBootstrap(): void {
    void this.expirarPendientes().catch((error) =>
      this.logger.error(
        'No se pudieron liberar las reservas vencidas al iniciar',
        error as Error,
      ),
    );
    this.timer = setInterval(() => {
      void this.expirarPendientes().catch((error) =>
        this.logger.error(
          'No se pudieron liberar las reservas vencidas',
          error as Error,
        ),
      );
    }, 60_000);
    this.timer.unref();
  }

  onModuleDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }

  async expirarPendientes(): Promise<number> {
    if (this.expiracion) return this.expiracion;
    this.expiracion = this.ejecutarExpiracion();
    try {
      return await this.expiracion;
    } finally {
      this.expiracion = undefined;
    }
  }

  private async ejecutarExpiracion(): Promise<number> {
    let vencidas: Reserva[];
    try {
      vencidas = await this.reservaRepository.buscarPendientesVencidas(
        new Date(),
      );
    } catch (error) {
      this.logger.error(
        'No se pudieron consultar las reservas vencidas',
        error as Error,
      );
      return 0;
    }

    let cerradas = 0;
    for (const reserva of vencidas) {
      try {
        const cerrada = await this.rechazarPago(
          reserva.id,
          EstadoPagoReserva.CANCELADO,
        );
        if (cerrada.cancelada) cerradas += 1;
      } catch (error) {
        this.logger.error(
          `No se pudo liberar la reserva vencida ${reserva.id}`,
          error as Error,
        );
      }
    }
    if (cerradas > 0)
      this.logger.log(`Reservas vencidas liberadas: ${cerradas}`);
    return cerradas;
  }

  /** Cierra una reserva por pago rechazado, vencido o devuelto. */
  async rechazarPago(
    id: number,
    estado: EstadoPagoReserva = EstadoPagoReserva.RECHAZADO,
    actor?: ActorCancelacion,
    motivo?: string,
  ): Promise<Reserva> {
    return this.transaccion.ejecutar(
      async ({ reservas: reservaRepository, fechas: fechaRepository }) => {
        const reserva = await reservaRepository.buscarPorId(id);
        if (!reserva)
          throw new NotFoundException(`No se encontró la reserva ${id}`);
        if (this.estado.pagoAprobado(reserva)) return reserva;
        if (reserva.cancelada && reserva.estado_pago === estado)
          return reserva;

        this.ciclo.cerrarSinPago(reserva, estado, actor, motivo);
        const guardada = await reservaRepository.guardar(reserva);
        await this.disponibilidadService.liberarReserva(id, fechaRepository);
        return guardada;
      },
    );
  }
}
