// Error que reciben los componentes cuando falla una petición al backend. El
// errorInterceptor ya interpretó la respuesta: `message` es el texto que se le
// muestra al usuario y `status` el código HTTP (0 si no hubo respuesta).
export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
