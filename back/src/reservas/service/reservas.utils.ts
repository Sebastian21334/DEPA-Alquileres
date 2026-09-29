import { BadRequestException } from '@nestjs/common';

/** Normaliza las columnas `date` que PostgreSQL/TypeORM devuelve como texto. */
export function normalizarFechaReserva(valor: Date | string | null): Date {
  const fecha = valor instanceof Date ? valor : new Date(valor ?? Date.now());
  if (Number.isNaN(fecha.getTime())) {
    throw new BadRequestException('La reserva contiene una fecha inválida');
  }
  return fecha;
}
