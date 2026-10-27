import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { vi } from 'vitest';
import { errorInterceptor } from './error.interceptor';
import { ApiError } from './api-error';

describe('errorInterceptor', () => {
  let http: HttpTestingController;
  let client: HttpClient;

  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors([errorInterceptor])), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
    client = TestBed.inject(HttpClient);
  });

  afterEach(() => {
    http.verify();
    vi.restoreAllMocks();
  });

  function fallar(cuerpo: object, status: number, statusText = 'Error'): ApiError {
    let recibido: unknown;
    client.get('/reservas').subscribe({ error: (err) => (recibido = err) });
    http.expectOne('/reservas').flush(cuerpo, { status, statusText });
    return recibido as ApiError;
  }

  it('conserva el mensaje del backend y el código HTTP para que el componente decida', () => {
    const error = fallar({ message: 'El nuevo rango de fechas no está disponible', statusCode: 409 }, 409);
    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(409);
    expect(error.message).toBe('El nuevo rango de fechas no está disponible');
  });

  it('une los mensajes de validación que NestJS devuelve como lista', () => {
    const error = fallar({ message: ['titulo es obligatorio', 'precio debe ser positivo'] }, 400);
    expect(error.message).toBe('titulo es obligatorio, precio debe ser positivo');
  });

  it('traduce la falta de respuesta del servidor a un mensaje legible', () => {
    let recibido: ApiError | undefined;
    client.get('/reservas').subscribe({ error: (err) => (recibido = err) });
    http.expectOne('/reservas').error(new ProgressEvent('error'), { status: 0 });
    expect(recibido?.status).toBe(0);
    expect(recibido?.message).toContain('No pudimos comunicarnos con el servidor');
  });
});
