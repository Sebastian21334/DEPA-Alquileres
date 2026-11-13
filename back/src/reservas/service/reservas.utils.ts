import type { Reserva } from '../entity/reserva.entity';
import { randomBytes } from 'node:crypto';
import { BadRequestException } from '@nestjs/common';

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
