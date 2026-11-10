import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { fechaArgentina } from '../../common/utils/fechas';
import { DisponibilidadService } from '../../disponibilidad/service/disponibilidad.service';
import {
  TRANSACCION_CALENDARIO,
  type ITransaccionCalendario,
} from '../../disponibilidad/repository/transaccion-calendario.interface';
import { PagosService } from '../../pagos/service/pagos.service';
import {
  EstadoReembolso,
  OrigenReembolso,
  Reembolso,
} from '../../reembolsos/entity/reembolso.entity';
import { ReembolsosService } from '../../reembolsos/service/reembolsos.service';
import {
  EstadoLiquidacionReserva,
  Reserva,
} from '../entity/reserva.entity';
import {
  RESERVA_REPOSITORY,
  type IReservaRepository,
} from '../repository/reserva.repository.interface';
import { ReservaCicloVidaService } from './reserva-ciclo-vida.service';
import { ReservaEstadoService } from './reserva-estado.service';
import { TOLERANCIA_MONETARIA } from '../../common/utils/dinero';

/**
 * Aplica a la reserva un reembolso ya aprobado. Es un caso de uso compartido
 * por cancelaciones y por el bloqueo de anunciante.
 */
@Injectable()
export class ReservaReembolsoAplicacionService {
  constructor(
    @Inject(RESERVA_REPOSITORY)
    private readonly reservaRepository: IReservaRepository,
    @Inject(TRANSACCION_CALENDARIO)
    private readonly transaccion: ITransaccionCalendario,
    private readonly disponibilidadService: DisponibilidadService,
    private readonly reembolsosService: ReembolsosService,
    private readonly estado: ReservaEstadoService,
    private readonly ciclo: ReservaCicloVidaService,
    private readonly pagosService: PagosService,
  ) {}

  async aplicarReembolsoConfirmado(
    idReembolso: number,
  ): Promise<{ reembolso: Reembolso; reserva: Reserva }> {
    const reembolso = await this.reembolsosService.buscar(idReembolso);
    if (reembolso.estado !== EstadoReembolso.APROBADO)
      throw new ConflictException(
        'Solo se puede aplicar un reembolso aprobado',
      );

    return this.transaccion.ejecutar(
      async ({ reservas: reservaRepository, fechas: fechaRepository }) => {
        const reserva = await reservaRepository.buscarPorId(
          reembolso.reserva.id,
        );
        if (!reserva)
          throw new NotFoundException(
            'No se encontró la reserva del reembolso',
          );

        const hoy = fechaArgentina();
        const puedeLiberarFechas =
          !!reserva.fecha_inicio &&
          reserva.fecha_inicio > hoy &&
          !this.estado.codigoValidado(reserva);

        const esTotal =
          this.reembolsosService.esTotal(reembolso) ||
          this.pagosService.saldoReembolsable(reembolso.pago) <= TOLERANCIA_MONETARIA;
        if (
          reserva.estado_liquidacion ===
            EstadoLiquidacionReserva.PAGADO_PROPIETARIO &&
          reembolso.origen !== OrigenReembolso.RECLAMO &&
          reembolso.origen !== OrigenReembolso.CONTRACARGO
        )
          throw new ConflictException(
            'La reserva ya fue pagada al propietario; no admite otra devolución',
          );
        if (
          reserva.estado_liquidacion ===
          EstadoLiquidacionReserva.DEVUELTO_INQUILINO
        )
          return { reembolso, reserva };
        if (
          reserva.estado_liquidacion ===
            EstadoLiquidacionReserva.DEVUELTO_PARCIAL_INQUILINO &&
          !esTotal
        )
          return { reembolso, reserva };
        const cancelaReserva =
          reembolso.origen === OrigenReembolso.CANCELACION ||
          ((reembolso.origen === OrigenReembolso.CONTRACARGO ||
            reembolso.origen === OrigenReembolso.AJUSTE_ADMIN) &&
            esTotal &&
            puedeLiberarFechas);

        if (esTotal) {
          this.ciclo.aplicarReembolsoTotal(reserva);
          if (cancelaReserva)
            this.ciclo.cancelar(reserva, 'ADMINISTRADOR', reembolso.motivo);
        } else {
          if (reembolso.origen === OrigenReembolso.CONTRACARGO)
            this.ciclo.restaurarPagoAprobado(reserva);
          this.ciclo.aplicarReembolsoParcial(reserva);
          if (cancelaReserva)
            this.ciclo.cancelar(reserva, 'ADMINISTRADOR', reembolso.motivo);
        }

        const guardada = await reservaRepository.guardar(reserva);
        if (cancelaReserva && puedeLiberarFechas) {
          await this.disponibilidadService.liberarReserva(
            reserva.id,
            fechaRepository,
          );
        }
        return { reembolso, reserva: guardada };
      },
    );
  }
}
