export class ValorDuplicadoError extends Error {
  constructor(readonly restriccion: string, cause: unknown) {
    super(`El valor ya existe (${restriccion})`, { cause });
  }
}

/**
 * Traduce la violación de una restricción única de PostgreSQL (23505) dentro de
 * la capa de datos. Solo se traducen las restricciones indicadas; el resto se
 * propaga sin cambios.
 */
export async function guardarSinDuplicados<T>(accion: () => Promise<T>, restricciones: string[] ): Promise<T> {
  try {
    return await accion();
  } catch (error: unknown) {
    if (
      typeof error === 'object' && error !== null && 'code' in error && error.code === '23505' && 'constraint' in error && typeof error.constraint === 'string' && restricciones.includes(error.constraint)
    ) {
      throw new ValorDuplicadoError(error.constraint, error);
    }
    throw error;
  }
}
