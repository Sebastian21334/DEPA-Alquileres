import { CatalogosService } from '../../catalogos/service/catalogos.service';
import { Injectable } from '@nestjs/common';
import type { Reserva } from '../../reservas/entity/reserva.entity';
import type { EstadoEstadia, ReservaRespuestaDto } from '../dto/reserva-respuesta.dto';
import { esFechaCalendarioValida, fechaArgentina } from '../../common/utils/fechas';
import { PublicacionesService } from '../../publicaciones/service/publicaciones.service';

/** Proyección compartida con los módulos que devuelven reservas en sus respuestas. */
@Injectable()
export class ReservaEstadoService {
  constructor(private readonly publicaciones: PublicacionesService, private readonly catalogos: CatalogosService) {}

  prepararRespuesta(reserva: Reserva): ReservaRespuestaDto {
    if (reserva.publicacion) {
      reserva.publicacion = this.publicaciones.prepararRespuesta(reserva.publicacion);
    }
    const { liquidacion } = reserva;
    if (reserva.estado_liquidacion == null) {
      reserva.estado_liquidacion = liquidacion?.estado ?? this.catalogos.codigoEstado('LIQUIDACION_RESERVA', 'NO_APLICA');
      reserva.referencia_liquidacion = liquidacion?.referencia ?? null;
      reserva.observacion_liquidacion = liquidacion?.observacion ?? null;
      reserva.fecha_resolucion_liquidacion = liquidacion?.fecha_resolucion ?? null;
    }
    delete reserva.liquidacion;
    return Object.assign(reserva, { estado_estadia: this.calcularEstadoEstadia(reserva) });
  }

  calcularEstadoEstadia(reserva: Reserva, ahora = new Date()): EstadoEstadia {
    if (reserva.estado_pago === this.catalogos.codigoEstado('PAGO_RESERVA', 'CONTRACARGO'))
      return 'EN_DISPUTA';
    if (reserva.estado_pago === this.catalogos.codigoEstado('PAGO_RESERVA', 'REEMBOLSADO'))
      return 'REEMBOLSADA';
    if (reserva.estado_pago === this.catalogos.codigoEstado('PAGO_RESERVA', 'RECHAZADO'))
      return 'PAGO_RECHAZADO';
    if (reserva.cancelada || reserva.estado_pago === this.catalogos.codigoEstado('PAGO_RESERVA', 'CANCELADO'))
      return 'CANCELADA';
    if (reserva.estado_pago === this.catalogos.codigoEstado('PAGO_RESERVA', 'PENDIENTE'))
      return 'PENDIENTE_PAGO';
    // Conserva los cierres manuales existentes.
    if (reserva.finalizada) return 'FINALIZADA';
    if (
      !esFechaCalendarioValida(reserva.fecha_inicio) ||
      !esFechaCalendarioValida(reserva.fecha_fin) ||
      reserva.fecha_inicio > reserva.fecha_fin
    )
      return 'FECHAS_A_REVISAR';

    const hoy = fechaArgentina(ahora);
    if (hoy < reserva.fecha_inicio) return 'CONFIRMADA';
    if (hoy > reserva.fecha_fin) {
      return reserva.codigo_validado_en ? 'FINALIZADA' : 'INGRESO_NO_VERIFICADO';
    }
    return reserva.codigo_validado_en ? 'EN_CURSO' : 'PENDIENTE_INGRESO';
  }
}
