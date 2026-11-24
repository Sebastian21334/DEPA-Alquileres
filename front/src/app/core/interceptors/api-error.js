// Error que reciben los componentes cuando falla una petición al backend. El
// errorInterceptor ya interpretó la respuesta: `message` es el texto que se le
// muestra al usuario y `status` el código HTTP (0 si no hubo respuesta).
export class ApiError extends Error {
    status;
    codigo;
    tokenBloqueo;
    constanciaReactivacion;
    constructor(status, message, codigo, tokenBloqueo, constanciaReactivacion) {
        super(message);
        this.status = status;
        this.codigo = codigo;
        this.tokenBloqueo = tokenBloqueo;
        this.constanciaReactivacion = constanciaReactivacion;
        this.name = 'ApiError';
    }
}
