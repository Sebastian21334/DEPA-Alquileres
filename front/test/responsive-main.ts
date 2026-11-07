// Solo vista de prueba: datos en memoria, sin credenciales ni escrituras en la API.

import { signal } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import {
  provideHttpClient,
  withInterceptors,
  HttpResponse,
  HttpErrorResponse,
  type HttpInterceptorFn,
} from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { App } from '../src/app/app';
import { routes } from '../src/app/app.routes';
import { AuthService } from '../src/app/core/services/auth.service';
const params = new URLSearchParams(location.search);
const rol = params.get('rol') || 'Administrador';
const publico = params.get('sesion') === 'no';
const user = {
  id: 7,
  nombre: 'María Alejandra',
  apellido: 'Fernández de la Universidad',
  email: 'maria.alejandra.fernandez@example.test',
  telefono: '+54 353 400 1234',
  rol: { id: 1, nombre: rol },
  activa: true,
  bloqueado: false,
  email_verificado: true,
  foto_url: null,
};
const auth = {
  currentUser: signal(publico ? null : { sub: 7, email: user.email, rol, exp: 9999999999 }),
  get isAuthenticated() {
    return this.currentUser() !== null;
  },
  get isAdmin() {
    return rol === 'Administrador';
  },
  token: null,
  logout() {
    this.currentUser.set(null);
  },
};
const tipo = { id: 1, nombre: 'Propietario' };
const anunciante = {
  idUsuario: 7,
  verificado: true,
  numero_contacto: user.telefono,
  cuit_cuil: '20-12345678-9',
  usuario: user,
  tipoAnunciante: tipo,
};
const catalogos = {
  roles: [
    { id: 1, nombre: 'Administrador' },
    { id: 2, nombre: 'Usuario' },
  ],
  modalidades: [
    { id: 1, nombre: 'Temporario', permite_reservas_por_fecha: true, admite_reservas_por_fecha: true },
    { id: 2, nombre: 'Largo plazo', permite_reservas_por_fecha: false, admite_reservas_por_fecha: false },
  ],
  'tipos-anunciante': [tipo, { id: 2, nombre: 'Inmobiliaria' }],
  'tipos-propiedad': [
    { id: 1, nombre: 'Departamento' },
    { id: 2, nombre: 'Casa' },
  ],
  'tipos-moneda': [
    { id: 1, nombre: 'ARS' },
    { id: 2, nombre: 'USD' },
  ],
};
const publicaciones = Array.from({ length: 4 }, (_, i) => ({
  id: i + 1,
  titulo: [
    'Departamento luminoso con balcón cerca de la universidad',
    'Casa familiar con patio y espacio de trabajo',
    'Monoambiente equipado para estadías temporales',
    'Departamento céntrico para compartir',
  ][i],
  descripcion:
    'Propiedad amplia y luminosa, con todos los servicios y excelente ubicación. Consultá la disponibilidad y las condiciones de la estadía.',
  fecha_publicacion: new Date().toISOString(),
  precio: 35000 + i * 1200,
  activa: true,
  visualizaciones: 125 + i * 20,
  direccion: 'Avenida Universidad Nacional 1234, departamento 8 B',
  latitud: -32.41,
  longitud: -63.24,
  cantidad_ambientes: 3,
  superficie: 75,
  tipoMoneda: catalogos['tipos-moneda'][0],
  modalidad: catalogos.modalidades[0],
  tipoPropiedad: catalogos['tipos-propiedad'][0],
  provincia: { id: 1, nombre: 'Córdoba' },
  ciudad: { id: 1, nombre: 'Villa María' },
  anunciante,
  imagenes: [
    { id: 1, url: '/images/login-bg.webp', orden: 0 },
    { id: 2, url: '/images/hero-mydepa.png', orden: 1 },
  ],
}));
const fecha = (dias: number) => {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + dias);
  return d.toISOString().slice(0, 10);
};
const fechas = Array.from({ length: 70 }, (_, i) => ({
  id: i + 1,
  fecha: fecha(i),
  disponible: true,
  reserva: null,
}));
const reservas = publicaciones.map((p, i) => ({
  id: i + 1,
  publicacion: p,
  usuario: user,
  usuario_nombre: user.nombre,
  usuario_apellido: user.apellido,
  usuario_email: user.email,
  usuario_telefono: user.telefono,
  estado_estadia: i === 1 ? 'EN_CURSO' : 'CONFIRMADA',
  finalizada: false,
  cancelada: false,
  fecha_inicio: fecha(10 + i),
  fecha_fin: fecha(14 + i),
  fecha_pago: new Date().toISOString(),
  estado_pago: 'APROBADO',
  estado_liquidacion: i === 0 ? 'EN_REVISION' : 'RETENIDO',
  codigo_validado_en: i === 1 ? new Date().toISOString() : null,
  codigo_generado_en: new Date().toISOString(),
  monto_pago: 175000,
  moneda_contratada: 'ARS',
  importe_contratado: 175000,
  precio_unitario_contratado: 35000,
  observacion_liquidacion: 'El inquilino solicitó una revisión de las condiciones de ingreso.',
}));
const pendiente = location.pathname === '/mi-perfil/anunciante';
const solicitud = {
  id: 1,
  estado: pendiente ? 'borrador' : 'aprobada',
  anunciante,
  numero_revision: 1,
  dni_frente_url: pendiente ? null : '/images/Logo.png',
  dni_dorso_url: pendiente ? null : '/images/Logo.png',
  rostro_url: pendiente ? null : '/images/Logo.png',
  creada_en: new Date().toISOString(),
  actualizada_en: new Date().toISOString(),
  revisiones: [],
};
const cotizacion = {
  id: 1,
  compra: '1400',
  venta: '1450',
  tipo: 'blue',
  proveedor: 'Proveedor de cotizaciones de prueba',
  actualizada_fuente_en: new Date().toISOString(),
  consultada_en: new Date().toISOString(),
};
const page = <T>(datos: T[]) => ({
  datos,
  pagina: 1,
  limite: 10,
  total: datos.length,
  totalPaginas: 1,
  totalRegistros: datos.length,
});
const interceptor: HttpInterceptorFn = (req) => {
  const url = new URL(req.url, location.origin);
  const p = url.pathname.replace(/^\/api/, '');
  let body;
  if (req.method !== 'GET') {
    if (p.endsWith('/visualizacion')) body = { visualizaciones: 126 };
    else
      return throwError(
        () =>
          new HttpErrorResponse({
            status: 409,
            error: { message: 'Vista de prueba: las modificaciones están deshabilitadas.' },
          }),
      );
  } else if (p === '/usuarios/me') body = user;
  else if (p === '/anunciantes/mi-solicitud')
    body = params.get('anunciante') === 'no'
      ? null
      : { ...solicitud, estado: params.get('anunciante') === 'pendiente' ? 'pendiente' : solicitud.estado };
  else if (p === '/anunciantes/pendientes')
    body = [
      {
        ...solicitud,
        estado: 'pendiente',
        prueba_vida_validada_en: new Date().toISOString(),
        prueba_vida_validada: true,
      },
    ];
  else if (p.startsWith('/catalogos/')) body = catalogos[p.split('/').pop() as keyof typeof catalogos] || [];
  else if (p.startsWith('/ubicacion/provincias'))
    body = [
      { id: 1, nombre: 'Córdoba' },
      { id: 2, nombre: 'Buenos Aires' },
    ];
  else if (p.startsWith('/ubicacion/ciudades')) body = [{ id: 1, nombre: 'Villa María' }];
  else if (p === '/usuarios/administracion')
    body = page([user, { ...user, id: 8, nombre: 'Juan', apellido: 'Pérez', bloqueado: true }]);
  else if (p === '/publicaciones/administracion') body = page(publicaciones);
  else if (p.startsWith('/publicaciones/anunciante/')) {
    const requestedCount = Number(params.get('publicacionesPerfil') ?? publicaciones.length);
    const count = Number.isSafeInteger(requestedCount) && requestedCount >= 0
      ? Math.min(requestedCount, 60) : publicaciones.length;
    body = Array.from({ length: count }, (_, i) => ({
      ...publicaciones[i % publicaciones.length], id: i + 1,
    }));
  }
  else if (p === '/publicaciones') body = page(publicaciones);
  else if (/^\/publicaciones\/\d+$/.test(p)) body = publicaciones[0];
  else if (p.startsWith('/disponibilidad/')) body = fechas;
  else if (p === '/favoritos') body = publicaciones;
  else if (p.startsWith('/cotizaciones/'))
    body = {
      cotizacion,
      consulta: null,
      items: [cotizacion],
      consultas: [],
      total: 1,
      pagina: 1,
      por_pagina: 10,
      vigente: true,
      proxima_revision_en: new Date().toISOString(),
      max_antiguedad_fuente_horas: 24,
    };
  else if (p.endsWith('/resumen'))
    body = {
      reserva: reservas[0],
      pago: {
        status: 'approved',
        amount: 175000,
        currency: 'ARS',
        created_at: new Date().toISOString(),
        approved_at: new Date().toISOString(),
        payment_id: '12345678901234567890',
        payment_method_id: 'credit_card',
      },
    };
  else if (p.endsWith('/codigo-alojamiento'))
    body = {
      reserva_id: 1,
      codigo: '481526',
      generado_en: new Date().toISOString(),
      validado_en: null,
      estado_liquidacion: 'RETENIDO',
    };
  else if (p.startsWith('/reservas/')) body = reservas;
  else if (p === '/mensajes')
    body = [
      {
        idPublicacion: 1,
        idOtroUsuario: 8,
        tituloPublicacion: publicaciones[0].titulo,
        nombreOtroUsuario: 'Pedro de la Fuente',
        cantidadNoLeidos: 0,
        ultimoMensaje: {
          id: 1,
          texto: 'Hola, quisiera consultar por la disponibilidad de la propiedad.',
          fecha: new Date().toISOString(),
          leido: true,
          fecha_lectura: null,
          origenUsuario: { ...user, id: 8, nombre: 'Pedro', apellido: 'de la Fuente' },
          destinoUsuario: user,
          publicacion: publicaciones[0],
        },
      },
    ];
  else if (p.startsWith('/mensajes/')) body = [];
  else {
    console.warn('Fixture sin respuesta específica:', p);
    body = [];
  }
  if (params.get('estado') === 'error')
    return throwError(
      () => new HttpErrorResponse({ status: 503, statusText: 'Respuesta simulada de prueba' }),
    );
  return of(new HttpResponse({ status: 200, body }));
};
bootstrapApplication(App, {
  providers: [
    provideRouter(routes, withInMemoryScrolling({ scrollPositionRestoration: 'enabled' })),
    provideHttpClient(withInterceptors([interceptor])),
    { provide: AuthService, useValue: auth },
  ],
}).catch(console.error);
