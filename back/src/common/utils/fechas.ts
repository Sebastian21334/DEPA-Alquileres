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

/** Milisegundos de un día corrido; evita repetir el literal en cada cálculo. */
export const MS_POR_DIA = 86_400_000;

/** Días corridos entre dos fechas de calendario, sin depender de la zona del servidor. */
export function diasDeAntelacion(fecha: string, hoy = fechaArgentina()): number {
  return Math.round(
    (Date.parse(`${fecha}T00:00:00Z`) - Date.parse(`${hoy}T00:00:00Z`)) /
      MS_POR_DIA,
  );
}

/** Suma días corridos a una fecha `AAAA-MM-DD`, sin depender del huso horario. */
export function sumarDiasCalendario(fecha: string, dias: number): string {
  const valor = new Date(`${fecha}T00:00:00Z`);
  valor.setUTCDate(valor.getUTCDate() + dias);
  return valor.toISOString().slice(0, 10);
}

/** `AAAA-MM-DD` → `DD/MM/AAAA` para los mensajes al usuario. */
export function fechaParaMostrar(fecha: string): string {
  const [anio, mes, dia] = fecha.split('-');
  return `${dia}/${mes}/${anio}`;
}

export function esFechaCalendarioValida(fecha: string | null): fecha is string {
  if (!fecha || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return false;
  const valor = new Date(`${fecha}T00:00:00Z`);
  return (
    Number.isFinite(valor.getTime()) &&
    valor.toISOString().slice(0, 10) === fecha
  );
}
