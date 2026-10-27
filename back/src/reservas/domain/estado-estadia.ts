export type EstadoEstadia =
  | 'PENDIENTE_PAGO'
  | 'CONFIRMADA'
  | 'PENDIENTE_INGRESO'
  | 'EN_CURSO'
  | 'FINALIZADA'
  | 'INGRESO_NO_VERIFICADO'
  | 'CANCELADA'
  | 'REEMBOLSADA'
  | 'PAGO_RECHAZADO'
  | 'FECHAS_A_REVISAR';

interface DatosEstadia {
  estado_pago: string;
  cancelada: boolean;
  finalizada: boolean;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  codigo_validado_en: Date | string | null;
}

const calendarioArgentina = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'America/Argentina/Buenos_Aires',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

export function fechaArgentina(ahora = new Date()): string {
  const partes = calendarioArgentina.formatToParts(ahora);
  const parte = (tipo: Intl.DateTimeFormatPartTypes) =>
    partes.find((p) => p.type === tipo)!.value;
  return `${parte('year')}-${parte('month')}-${parte('day')}`;
}

function fechaValida(fecha: string | null): fecha is string {
  if (!fecha || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return false;
  const valor = new Date(`${fecha}T00:00:00Z`);
  return (
    Number.isFinite(valor.getTime()) &&
    valor.toISOString().slice(0, 10) === fecha
  );
}

/** Estado derivado: no modifica el pago, la liquidación ni el calendario. */
export function calcularEstadoEstadia(
  reserva: DatosEstadia,
  ahora = new Date(),
): EstadoEstadia {
  if (reserva.estado_pago === 'REEMBOLSADO') return 'REEMBOLSADA';
  if (reserva.estado_pago === 'RECHAZADO') return 'PAGO_RECHAZADO';
  if (reserva.cancelada || reserva.estado_pago === 'CANCELADO')
    return 'CANCELADA';
  if (reserva.estado_pago === 'PENDIENTE') return 'PENDIENTE_PAGO';
  // Conserva los cierres manuales existentes.
  if (reserva.finalizada) return 'FINALIZADA';
  if (
    !fechaValida(reserva.fecha_inicio) ||
    !fechaValida(reserva.fecha_fin) ||
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
