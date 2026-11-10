import { Injectable } from '@nestjs/common';
import {
  esFechaCalendarioValida,
  fechaArgentina,
} from '../../common/utils/fechas';
import { MOTIVO_CANCELACION_BLOQUEO } from '../reserva.constants';
import {
  EstadoEstadia,
  EstadoLiquidacionReserva,
  EstadoPagoReserva,
  Reserva,
} from '../entity/reserva.entity';

/**
 * Estado derivado y consultas de una reserva. La entidad solo conserva
 * columnas y relaciones; toda lectura con reglas vive acá.
 */
@Injectable()
export class ReservaEstadoService {
  calcular(reserva: Reserva, ahora = new Date()): EstadoEstadia {
    if (reserva.estado_pago === EstadoPagoReserva.CONTRACARGO)
      return 'EN_DISPUTA';
    if (reserva.estado_pago === EstadoPagoReserva.REEMBOLSADO)
      return 'REEMBOLSADA';
    if (reserva.estado_pago === EstadoPagoReserva.RECHAZADO)
      return 'PAGO_RECHAZADO';
    if (reserva.cancelada || reserva.estado_pago === EstadoPagoReserva.CANCELADO)
      return 'CANCELADA';
    if (reserva.estado_pago === EstadoPagoReserva.PENDIENTE)
      return 'PENDIENTE_PAGO';
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
      return reserva.codigo_validado_en
        ? 'FINALIZADA'
        : 'INGRESO_NO_VERIFICADO';
    }
    return reserva.codigo_validado_en ? 'EN_CURSO' : 'PENDIENTE_INGRESO';
  }

  pagoAprobado(reserva: Reserva): boolean {
    return reserva.estado_pago === EstadoPagoReserva.APROBADO;
  }

  /**
   * Una estadía está en curso solo cuando el pago fue aprobado, la fecha
   * actual está dentro del rango reservado y el Anunciante validó el código.
   * Las tres condiciones son necesarias para preservarla ante un bloqueo.
   */
  esEstadiaEnCurso(reserva: Reserva, ahora = new Date()): boolean {
    if (reserva.cancelada || reserva.finalizada) return false;
    if (!this.pagoAprobado(reserva) || !this.codigoValidado(reserva))
      return false;
    if (
      !esFechaCalendarioValida(reserva.fecha_inicio) ||
      !esFechaCalendarioValida(reserva.fecha_fin) ||
      reserva.fecha_inicio > reserva.fecha_fin
    )
      return false;
    const hoy = fechaArgentina(ahora);
    return hoy >= reserva.fecha_inicio && hoy <= reserva.fecha_fin;
  }

  /**
   * Una estadía se considera finalizada por su bandera explícita o porque
   * ya pasó la fecha de fin. En ambos casos no se cancela ni devuelve
   * automáticamente por un bloqueo.
   */
  esEstadiaFinalizada(reserva: Reserva, ahora = new Date()): boolean {
    if (reserva.finalizada) return true;
    if (!esFechaCalendarioValida(reserva.fecha_fin)) return false;
    return fechaArgentina(ahora) > reserva.fecha_fin;
  }

  estaConfirmada(reserva: Reserva): boolean {
    return this.pagoAprobado(reserva) && !reserva.cancelada;
  }

  estaCerrada(reserva: Reserva): boolean {
    return reserva.cancelada || reserva.finalizada;
  }

  pagoDentroDelPlazo(reserva: Reserva, fechaPago: Date): boolean {
    if (!reserva.pago_vencimiento) return false;
    return (
      new Date(fechaPago).getTime() <=
      new Date(reserva.pago_vencimiento).getTime()
    );
  }

  codigoValidado(reserva: Reserva): boolean {
    return !!reserva.codigo_validado_en;
  }

  codigoBloqueado(reserva: Reserva): boolean {
    return reserva.intentos_codigo >= Reserva.MAX_INTENTOS_CODIGO;
  }

  intentosCodigoRestantes(reserva: Reserva): number {
    return Math.max(0, Reserva.MAX_INTENTOS_CODIGO - reserva.intentos_codigo);
  }

  liquidacionEnRevision(reserva: Reserva): boolean {
    return (
      reserva.estado_liquidacion === EstadoLiquidacionReserva.EN_REVISION
    );
  }

  liquidacionResuelta(reserva: Reserva): boolean {
    return [
      EstadoLiquidacionReserva.PAGADO_PROPIETARIO,
      EstadoLiquidacionReserva.DEVUELTO_INQUILINO,
      EstadoLiquidacionReserva.DEVUELTO_PARCIAL_INQUILINO,
    ].includes(reserva.estado_liquidacion);
  }

  /** Cancelación administrativa originada por el bloqueo del Anunciante. */
  fueCanceladaPorBloqueo(reserva: Reserva): boolean {
    return (
      reserva.cancelada &&
      reserva.cancelada_por === 'ADMINISTRADOR' &&
      !!reserva.motivo_cancelacion?.startsWith(
        MOTIVO_CANCELACION_BLOQUEO,
      )
    );
  }

  esDelInquilino(reserva: Reserva, idUsuario: number): boolean {
    return reserva.usuario?.id === idUsuario;
  }

  esDelAnunciante(reserva: Reserva, idUsuario: number): boolean {
    return reserva.publicacion?.anunciante?.idUsuario === idUsuario;
  }

  participa(reserva: Reserva, idUsuario: number): boolean {
    return (
      this.esDelInquilino(reserva, idUsuario) ||
      this.esDelAnunciante(reserva, idUsuario)
    );
  }

  nombreInquilino(reserva: Reserva): string {
    return [reserva.usuario_nombre, reserva.usuario_apellido]
      .filter(Boolean)
      .join(' ');
  }

  emailDelAnunciante(reserva: Reserva): string | undefined {
    return reserva.publicacion?.anunciante?.usuario?.email ?? undefined;
  }

  nombreDelAnunciante(reserva: Reserva): string {
    const usuario = reserva.publicacion?.anunciante?.usuario;
    return [usuario?.nombre, usuario?.apellido].filter(Boolean).join(' ');
  }
}
