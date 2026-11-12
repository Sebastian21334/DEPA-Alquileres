import type { Reserva } from '../entity/reserva.entity';
import { randomBytes } from 'node:crypto';
import { BadRequestException } from '@nestjs/common';
import { EstadoLiquidacionReserva } from '../../catalogos/estados';

/** Estados en los que el dinero ya se pagó al propietario o se devolvió. */
export const ESTADOS_LIQUIDACION_RESUELTOS: EstadoLiquidacionReserva[] = [
  EstadoLiquidacionReserva.PAGADO_PROPIETARIO,
  EstadoLiquidacionReserva.DEVUELTO_INQUILINO,
  EstadoLiquidacionReserva.DEVUELTO_PARCIAL_INQUILINO,
];

export function esLiquidacionResuelta(estado: EstadoLiquidacionReserva): boolean {
  return ESTADOS_LIQUIDACION_RESUELTOS.includes(estado);
}

/** Normaliza las columnas `date` que PostgreSQL/TypeORM devuelve como texto. */
export function normalizarFechaReserva(valor: Date | string | null): Date {
  const fecha = valor instanceof Date ? valor : new Date(valor ?? Date.now());
  if (Number.isNaN(fecha.getTime())) {
    throw new BadRequestException('La reserva contiene una fecha inválida');
  }
  return fecha;
}

export function generarCodigoAlojamiento(): string {
  const alfabeto = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from(
    randomBytes(8),
    (byte) => alfabeto[byte % alfabeto.length],
  ).join('');
}

/** Nombre histórico guardado al momento de reservar. */
export function nombreInquilinoReserva(reserva: Reserva): string {
  return [reserva.usuario_nombre, reserva.usuario_apellido].filter(Boolean).join(' ');
}
