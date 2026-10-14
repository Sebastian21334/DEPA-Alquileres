export class RegistroEnUsoError extends Error {
  constructor(cause: unknown) {
    super('El registro tiene referencias dependientes', { cause });
  }
}

/** Traducción del error específico de PostgreSQL dentro de la capa de datos. */
export async function eliminarConIntegridad(
  accion: () => Promise<unknown>,
): Promise<void> {
  try {
    await accion();
  } catch (error: unknown) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === '23503'
    ) {
      throw new RegistroEnUsoError(error);
    }
    throw error;
  }
}
