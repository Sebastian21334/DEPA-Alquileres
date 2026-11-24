/** Estados con los que Usuarios consulta las operaciones de reserva que mantienen abierta una cuenta. */
export interface EstadosOperacionesReserva {
  pagoPendiente: string;
  pagoAprobado: string;
  liquidacionesResueltas: string[];
  enRevision: string;
}

export interface OperacionesReservaPendientes {
  reservasPendientes: number;
  estadiasVigentes: number;
  liquidacionesPendientes: number;
}
