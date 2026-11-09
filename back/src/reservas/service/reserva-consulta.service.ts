import { Injectable } from '@nestjs/common';
import { ReembolsosService } from '../../reembolsos/service/reembolsos.service';
import { EstadoEstadia, Reserva } from '../entity/reserva.entity';
import { ReservaEstadoService } from './reserva-estado.service';

export type ReservaRespuesta = Reserva & { estado_estadia: EstadoEstadia };
export type ReservaRespuestaAdministracion = ReservaRespuesta & {
  tiene_reembolso_activo: boolean;
  fue_cancelada_por_bloqueo: boolean;
};

/**
 * Read model de respuesta: conserva el contrato JSON de la API, incluido
 * estado_estadia, sin devolver métodos ni lógica en la entidad.
 */
@Injectable()
export class ReservaConsultaService {
  constructor(
    private readonly estado: ReservaEstadoService,
    private readonly reembolsos: ReembolsosService,
  ) {}

  paraRespuesta(reserva: Reserva): ReservaRespuesta {
    return { ...reserva, estado_estadia: this.estado.calcular(reserva) };
  }

  paraRespuestas(reservas: Reserva[]): ReservaRespuesta[] {
    return reservas.map((reserva) => this.paraRespuesta(reserva));
  }

  async paraRespuestasAdministracion(
    reservas: Reserva[],
  ): Promise<ReservaRespuestaAdministracion[]> {
    const activos =
      reservas.length > 0
        ? new Set(
            (
              await this.reembolsos.listarActivosPorReservas(
                reservas.map((reserva) => reserva.id),
              )
            )
              .map((reembolso) => reembolso.reserva?.id)
              .filter((id): id is number => id != null),
          )
        : new Set<number>();
    return reservas.map((reserva) => ({
      ...this.paraRespuesta(reserva),
      tiene_reembolso_activo: activos.has(reserva.id),
      fue_cancelada_por_bloqueo:
        this.estado.fueCanceladaPorBloqueo(reserva),
    }));
  }
}
