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
import { delay, mergeMap, of, throwError } from 'rxjs';
import { App } from '../src/app/app';
import { cargaInterceptor } from '../src/app/core/interceptors/carga.interceptor';
import { routes } from '../src/app/app.routes';
import { AuthService } from '../src/app/core/services/auth.service';
import { AsistenteDepaService } from '../src/app/core/services/asistente-depa.service';
import { proveerReutilizacionRutas } from '../src/app/core/routing/reutilizacion-rutas';
import { rentalDays } from '../src/app/shared/utils/rental-dates';
import { ApiError } from '../src/app/core/interceptors/api-error';
const params = new URLSearchParams(location.search);
const rol = params.get('rol') || 'Administrador';
const publico = params.get('sesion') === 'no';
// `?sesion=vencida` simula un token que venció con la aplicación abierta: los guards piden ingresar.
const vencida = params.get('sesion') === 'vencida';
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
const usuariosAdmin = [
  { ...user, es_anunciante: true },
  { ...user, id: 8, nombre: 'Juan', apellido: 'Pérez', bloqueado: true, rol: { id: 2, nombre: 'Inquilino' } },
  { ...user, id: 9, nombre: 'Lucía', apellido: 'González', email: 'lucia@example.test', rol: { id: 2, nombre: 'Inquilino' }, es_anunciante: true },
];
const auth = {
  currentUser: signal(publico ? null : { sub: 7, email: user.email, rol, exp: vencida ? 1 : 9999999999 }),
  get isAuthenticated() {
    return this.currentUser() !== null;
  },
  sesionActiva() {
    const usuario = this.currentUser();
    if (usuario && usuario.exp * 1000 <= Date.now()) this.logout();
    return this.isAuthenticated;
  },
  get isAdmin() {
    return rol === 'Administrador';
  },
  token: null,
  consultarSesion() { return of({ activa: true, bloqueado: false, accesoLimitado: false }); },
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
const tarjetasConImportesGrandes = params.get('tarjetas') === 'importes';
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
  precio: params.get('pago') === 'usd' ? 125.5 : tarjetasConImportesGrandes ? [400000, 9999999, 1234567890123, 500][i] : 35000 + i * 1200,
  activa: location.pathname !== '/mis-publicaciones' || i === 0,
  eliminada: location.pathname === '/mis-publicaciones' && i === 2,
  motivo_baja_admin: location.pathname === '/mis-publicaciones' && i === 3 ? 'La publicación requiere revisión del administrador.' : null,
  visualizaciones: 125 + i * 20,
  direccion: 'Avenida Universidad Nacional 1234, departamento 8 B',
  latitud: -32.41,
  longitud: -63.24,
  cantidad_ambientes: tarjetasConImportesGrandes && i === 1 ? 10000000 : 3,
  superficie: tarjetasConImportesGrandes && i === 1 ? 9999 : 75,
  tipoMoneda: params.get('pago') === 'usd' ? catalogos['tipos-moneda'][1] : tarjetasConImportesGrandes ? { id: i === 1 ? 2 : 1, nombre: i === 1 ? 'Dólar (USD)' : 'Peso (ARS)' } : catalogos['tipos-moneda'][0],
  modalidad: catalogos.modalidades[params.has('vista') ? i % 2 :
    (location.pathname === '/mis-publicaciones' || tarjetasConImportesGrandes) && i === 1 ? 1 : 0],
  tipoPropiedad: catalogos['tipos-propiedad'][0],
  provincia: { id: 1, nombre: 'Córdoba' },
  ciudad: { id: 1, nombre: 'Villa María' },
  anunciante: params.has('pago') ? { ...anunciante, idUsuario: 8, usuario: { ...user, id: 8, nombre: 'Juan', apellido: 'Pérez' } } : anunciante,
  imagenes: params.get('galeria') === 'animacion' ? Array.from({ length: 5 }, (_, foto) => ({
    id: foto + 1, url: `${foto % 2 ? '/images/hero-mydepa.png' : '/images/login-bg.webp'}?foto=${foto + 1}`, orden: foto,
  })) : [
    { id: 1, url: '/images/login-bg.webp', orden: 0 },
    { id: 2, url: '/images/hero-mydepa.png', orden: 1 },
  ],
}));
const fecha = (dias: number) => {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + dias);
  const partes = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Argentina/Buenos_Aires', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(d);
  const parte = (tipo: Intl.DateTimeFormatPartTypes) => partes.find(p => p.type === tipo)!.value;
  return `${parte('year')}-${parte('month')}-${parte('day')}`;
};
const fechas = Array.from({ length: 70 }, (_, i) => ({
  id: i + 1,
  fecha: fecha(i),
  disponible: true,
  reserva: null,
}));
const casoCancelacion = params.get('cancelacion');
const casoFaltante = params.get('faltante');
const cancelacionAnunciante = casoCancelacion?.startsWith('anunciante-') ?? false;
const diasCancelacion = ['sin-devolucion', 'anunciante-antes'].includes(casoCancelacion ?? '') ? 1
  : casoCancelacion === 'anunciante-posterior' ? -1
  : ['iniciada', 'anunciante-ingreso', 'anunciante-validada'].includes(casoCancelacion ?? '') ? 0 : null;
const reservas = publicaciones.map((p, i) => ({
  id: i + 1,
  publicacion: p,
  usuario: user,
  usuario_nombre: user.nombre,
  usuario_apellido: user.apellido,
  usuario_email: user.email,
  usuario_telefono: user.telefono,
  estado_estadia: i === 2 && casoFaltante ? 'CANCELADA' : i === 1 || (i === 2 && casoCancelacion === 'anunciante-validada') ? 'EN_CURSO'
    : i === 2 && diasCancelacion !== null && diasCancelacion <= 0 ? 'PENDIENTE_INGRESO' : 'CONFIRMADA',
  finalizada: false,
  cancelada: i === 2 && !!casoFaltante,
  fecha_inicio: fecha(i === 2 && diasCancelacion !== null ? diasCancelacion : 10 + i),
  fecha_fin: fecha(14 + i),
  fecha_pago: new Date().toISOString(),
  estado_pago: 'APROBADO',
  estado_liquidacion: i === 2 && casoFaltante ? 'DEVUELTO_PARCIAL_INQUILINO' : i === 0 ? 'EN_REVISION' : 'RETENIDO',
  codigo_validado_en: i === 1 || (i === 2 && casoCancelacion === 'anunciante-validada') ? new Date().toISOString() : null,
  codigo_generado_en: new Date().toISOString(),
  monto_pago: i === 2 && casoFaltante ? 100000 : 175000,
  moneda_contratada: 'ARS',
  importe_contratado: i === 2 && casoFaltante ? 100000 : 175000,
  precio_unitario_contratado: 35000,
  observacion_liquidacion: 'El inquilino solicitó una revisión de las condiciones de ingreso.',
}));
const saldoDevolucionFaltante = {
  solicitudId: 12, porcentaje: casoFaltante === 'cero' ? 0 : 50, moneda: 'ARS',
  esperado: casoFaltante === 'cero' ? 0 : 50000,
  devuelto: casoFaltante === 'completo' ? 50000 : casoFaltante === 'cero' ? 0 : 30000,
  enGestion: casoFaltante === 'pendiente' ? 20000 : 0,
  faltante: ['completo', 'cero'].includes(casoFaltante ?? '') ? 0 : 20000,
  importeReclamable: ['completo', 'pendiente', 'cero'].includes(casoFaltante ?? '') ? 0 : 20000,
};
const reclamosFaltante: Record<string, unknown>[] = [];
if (casoFaltante && location.pathname === '/admin') reclamosFaltante.push({
  id: 43, reserva: reservas[2], inquilino: user, anunciante: user,
  categoria: 'OTRO', descripcion: 'Recibí treinta mil de los cincuenta mil que correspondían.', estado: 'ABIERTO',
  solicitud_cancelacion_id: 12, devolucion_cancelacion: saldoDevolucionFaltante,
  resolucion: null, importe_reembolso: null, creado_en: new Date().toISOString(), evidencias: [], mensajes: [],
});
// Aviso de un reclamo por correo: `/mis-reservas?vista=reclamos&reserva=1` lleva al más reciente de esa reserva,
// el #51, en la subpestaña «Como anunciante», y `/admin?reserva=1#reclamos` lo abre en la segunda página del admin.
// Queda último para que la vista tenga que desplazarse hasta él.
if ((location.pathname === '/mis-reservas' || location.pathname === '/admin') && params.has('reserva')) {
  const huesped = { ...user, id: 8, nombre: 'Juan', apellido: 'Pérez', rol: { id: 2, nombre: 'Inquilino' } };
  const creado = new Date().toISOString();
  const reclamo = (id: number, reserva: number, estado: string, inquilino: object, anunciante: object, mensajes: object[] = []) => ({
    id, reserva: reservas[(reserva - 1) % reservas.length], inquilino, anunciante, categoria: 'OTRO',
    descripcion: 'Al ingresar, el alojamiento no tenía la limpieza necesaria.', estado, solicitud_cancelacion_id: null,
    resolucion: null, importe_reembolso: null, creado_en: creado, evidencias: [], mensajes,
  });
  reclamosFaltante.push(
    reclamo(52, 2, 'ABIERTO', user, huesped),
    ...[53, 54, 55].map((id, i) => reclamo(id, i + 2, 'CERRADO', huesped, user)),
    reclamo(50, 1, 'CERRADO', huesped, user),
    reclamo(51, 1, 'EN_REVISION', huesped, user, [
      { id: 1, texto: 'Adjunto fotos del baño y la cocina.', como_administracion: false, creado_en: creado, autor: huesped, evidencias: [] },
      { id: 2, texto: 'Revisamos el caso con las dos partes.', como_administracion: true, creado_en: creado, autor: user, evidencias: [] },
    ]),
  );
}
const pendiente = location.pathname === '/mi-perfil/anunciante';
const solicitud = {
  id: 1,
  estado: pendiente ? 'borrador' : 'aprobada',
  cbu_ultimos_digitos: pendiente || params.has('cbu') ? null : '0017',
  cbu_en_revision: params.get('cbu') === 'en-revision',
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
// Cancelaciones de prueba: el envío solo modifica este mapa en memoria.
const cancelaciones = new Map<number, { id: number; estado: string; motivo: string; creada_en: string; reserva?: (typeof reservas)[number] }>();
let presupuestosPreview = 0;
let ordenesPreview = 0;
const interceptor: HttpInterceptorFn = (req) => {
  const url = new URL(req.url, location.origin);
  const p = url.pathname.replace(/^\/api/, '');
  let body;
  if (req.method !== 'GET') {
    if (/^\/catalogos\/(tipos-anunciante|tipos-propiedad|modalidades|tipos-moneda)(\/\d+)?$/.test(p)) {
      const [, , clave, idTexto] = p.split('/');
      const items: { id: number; nombre: string; descripcion?: string | null; permite_reservas_por_fecha?: boolean; admite_reservas_por_fecha?: boolean }[] = catalogos[clave as keyof typeof catalogos];
      const id = Number(idTexto);
      if (req.method === 'DELETE') {
        items.splice(items.findIndex(item => item.id === id), 1);
        body = null;
      } else {
        const datos = req.body as { nombre: string; descripcion?: string | null; permite_reservas_por_fecha?: boolean };
        const item = { id: id || Math.max(0, ...items.map(item => item.id)) + 1, ...datos, ...(clave === 'modalidades' ? { admite_reservas_por_fecha: datos.permite_reservas_por_fecha } : {}) };
        if (id) Object.assign(items.find(item => item.id === id)!, item);
        else items.push(item);
        body = item;
      }
    } else if (/^\/usuarios\/administracion\/\d+\/administrador$/.test(p) && req.method === 'PATCH') {
      const usuario = usuariosAdmin.find(usuario => usuario.id === Number(p.split('/')[3]))!;
      usuario.rol = { id: 1, nombre: 'Administrador' };
      body = { ...usuario };
    } else if (/^\/imagenes\/publicacion\/\d+\/orden$/.test(p) && req.method === 'PATCH' && params.get('galeria') === 'animacion') {
      const publicacion = publicaciones.find(item => item.id === Number(p.split('/')[3]));
      const ids = (req.body as { ids: number[] }).ids;
      if (!publicacion || ids.length !== publicacion.imagenes.length || new Set(ids).size !== ids.length || ids.some(id => !publicacion.imagenes.some(foto => foto.id === id))) {
        return throwError(() => new ApiError(400, 'El orden debe incluir todas las fotos una sola vez.'));
      }
      ordenesPreview++;
      if (params.get('guardado') === 'error' && ordenesPreview === 2) {
        return of(null).pipe(delay(2000), mergeMap(() => throwError(() => new ApiError(503, 'Error simulado de guardado.'))));
      }
      publicacion.imagenes = ids.map((id, orden) => ({ ...publicacion.imagenes.find(foto => foto.id === id)!, orden }));
      body = publicacion.imagenes.map(foto => ({ ...foto }));
      return of(new HttpResponse({ status: 200, body })).pipe(delay(params.has('guardado') ? 2000 : 0));
    }
    else if (p === '/pagos/presupuesto' && req.method === 'POST' && params.has('pago')) {
      presupuestosPreview++;
      if (params.get('pago') === 'error' && presupuestosPreview === 1) {
        return throwError(() => new ApiError(503, 'No pudimos obtener el presupuesto. Intentá volver a cotizar.'));
      }
      const datos = req.body as { fecha_inicio: string; fecha_fin: string };
      const dias = rentalDays(datos.fecha_inicio, datos.fecha_fin);
      const usd = params.get('pago') === 'usd';
      const unidad = Number(publicaciones[0].precio);
      const total = unidad * dias;
      body = { token: 'presupuesto-simulado-sin-cobro', precio_unitario_origen: unidad.toFixed(2), moneda_origen: usd ? 'USD' : 'ARS',
        total_origen: total.toFixed(2), total_cobro: (total * (usd ? Number(cotizacion.venta) : 1)).toFixed(2), moneda_cobro: 'ARS', cantidad_dias: dias,
        emitida_en: new Date().toISOString(), vence_en: new Date(Date.now() + (params.get('pago') === 'vencido' && presupuestosPreview === 1 ? -60000 : 1200000)).toISOString(),
        cotizacion: usd ? cotizacion : null };
    }
    else if (p.endsWith('/visualizacion')) body = { visualizaciones: 126 };
    else if (/^\/reclamos\/cancelacion\/\d+$/.test(p) && req.method === 'POST') {
      const reclamo = { id: 43, reserva: reservas[2], inquilino: user, anunciante: user,
        categoria: 'OTRO', descripcion: (req.body as { descripcion: string }).descripcion,
        estado: 'ABIERTO', solicitud_cancelacion_id: 12, devolucion_cancelacion: saldoDevolucionFaltante,
        resolucion: null, importe_reembolso: null, creado_en: new Date().toISOString(), evidencias: [], mensajes: [] };
      reclamosFaltante.push(reclamo);
      body = reclamo;
    }
    else if (/^\/reclamos\/\d+\/resolver$/.test(p) && req.method === 'PATCH') {
      const reclamo = reclamosFaltante[0];
      const datos = req.body as { resolucion: string; importe?: number };
      const importe = datos.resolucion === 'DEVOLUCION_TOTAL' ? saldoDevolucionFaltante.importeReclamable : datos.resolucion === 'DEVOLUCION_PARCIAL' ? datos.importe ?? 0 : null;
      Object.assign(reclamo, { estado: importe ? 'RESUELTO_INQUILINO' : 'RESUELTO_ANUNCIANTE', resolucion: datos.resolucion, importe_reembolso: importe, resuelto_en: new Date().toISOString() });
      if (importe) { saldoDevolucionFaltante.enGestion += importe; saldoDevolucionFaltante.importeReclamable -= importe; }
      body = { ...reclamo };
    }
    else if (location.pathname === '/mis-reservas' && /^\/reservas\/\d+\/cancelacion$/.test(p) && req.method === 'POST') {
      const id = Number(p.split('/')[2]);
      const datos = req.body as { motivo: string };
      // La cancelación se aprueba en el momento, como en el back.
      body = cancelaciones.get(id) ?? { id, estado: 'APROBADA', motivo: datos.motivo, creada_en: new Date().toISOString(), reserva: reservas.find(reserva => reserva.id === id) };
      cancelaciones.set(id, body);
    }
    else if (location.pathname === '/mis-publicaciones' && /^\/publicaciones\/\d+\/restaurar$/.test(p) && req.method === 'PATCH') {
      const pub = publicaciones.find(pub => pub.id === Number(p.split('/')[2]))!;
      Object.assign(pub, { eliminada: false, activa: false });
      body = { ...pub };
    }
    else if (location.pathname === '/mis-publicaciones' && /^\/publicaciones\/\d+$/.test(p) && ['PATCH', 'DELETE'].includes(req.method)) {
      const pub = publicaciones.find(pub => pub.id === Number(p.split('/')[2]))!;
      Object.assign(pub, req.method === 'DELETE' ? { eliminada: true, activa: false } : req.body);
      body = { ...pub };
    }
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
  else if (p.startsWith('/catalogos/')) body = (catalogos[p.split('/').pop() as keyof typeof catalogos] || []).map(item => ({ ...item }));
  else if (/^\/ubicacion\/provincias\/\d+\/ciudades$/.test(p))
    body = [{ id: 1, nombre: 'Villa María' }];
  else if (p === '/ubicacion/provincias')
    body = [
      { id: 1, nombre: 'Córdoba' },
      { id: 2, nombre: 'Buenos Aires' },
    ];
  else if (p.startsWith('/ubicacion/ciudades')) body = [{ id: 1, nombre: 'Villa María' }];
  else if (p === '/usuarios/administracion')
    body = { ...page(usuariosAdmin), totalRegistros: usuariosAdmin.length };
  else if (/^\/usuarios\/administracion\/\d+$/.test(p))
    body = usuariosAdmin.find(usuario => usuario.id === Number(p.split('/').at(-1)));
  else if (/^\/anunciantes\/administracion\/usuarios\/\d+\/solicitud$/.test(p)) {
    const esAnunciante = Number(p.split('/').at(-2)) === user.id;
    body = { esAnunciante, solicitud: esAnunciante ? {
      id: solicitud.id,
      estado: 'aprobada',
      numero_revision: solicitud.numero_revision,
      creada_en: solicitud.creada_en,
      actualizada_en: solicitud.actualizada_en,
      revisiones: [{
        id: 1, estado: 'aprobada', numero_revision: 1, creada_en: solicitud.actualizada_en,
        identidad_aprobada: true, cbu_aprobado: true, motivo: null,
      }],
    } : null };
  }
  else if (p === '/publicaciones/administracion') body = page(publicaciones);
  else if (/^\/reclamos\/cancelacion\/\d+$/.test(p)) body = { devolucion: saldoDevolucionFaltante, reclamoAbierto: !!reclamosFaltante.length };
  else if (p === '/reclamos/mios' || p === '/reclamos/administracion') body = [...reclamosFaltante];
  else if (p === '/publicaciones/mias') body = publicaciones.map(pub => ({ ...pub }));
  else if (p.startsWith('/publicaciones/anunciante/')) {
    const requestedCount = Number(params.get('publicacionesPerfil') ?? publicaciones.length);
    const count = Number.isSafeInteger(requestedCount) && requestedCount >= 0
      ? Math.min(requestedCount, 60) : publicaciones.length;
    body = Array.from({ length: count }, (_, i) => ({
      ...publicaciones[i % publicaciones.length], id: i + 1,
    }));
  }
  else if (p === '/publicaciones/mapa') {
    const categoria = req.params.get('categoria');
    const mismaDireccion = params.get('pines') === 'misma-direccion';
    const puntos = publicaciones.map((pub, indice) => ({
      id: pub.id,
      titulo: pub.titulo,
      ciudad: pub.ciudad.nombre,
      portada: pub.imagenes[0]?.url,
      precio: pub.precio,
      moneda: pub.tipoMoneda.nombre,
      latitud: pub.latitud + (mismaDireccion && indice < 2 ? 0 : indice % 2) * .025,
      longitud: pub.longitud + Math.floor(indice / 2) * .025,
      temporal: pub.modalidad.admite_reservas_por_fecha,
    })).filter((punto) => categoria === 'temporales' ? punto.temporal :
      categoria === 'largo-plazo' ? !punto.temporal : true);
    body = { puntos, recortado: false, siguienteId: null };
  }
  else if (p === '/publicaciones') body = page(publicaciones);
  else if (/^\/publicaciones\/\d+$/.test(p)) {
    const id = Number(p.split('/').at(-1));
    body = publicaciones.find((pub) => pub.id === id) ?? publicaciones[0];
  }
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
  else if (/^\/reservas\/\d+\/cancelacion\/condiciones$/.test(p)) {
    const id = Number(p.split('/')[2]);
    const dias = id === 3 && diasCancelacion !== null ? diasCancelacion : 10 + id - 1;
    const bloqueo = (dias <= 0) || (id === 3 && casoCancelacion === 'anunciante-validada');
    const sinDevolucion = dias === 1 && !cancelacionAnunciante;
    body = {
      solicitud: cancelaciones.get(id) ?? null,
      motivoBloqueo: bloqueo ? 'Desde la fecha de ingreso no se puede solicitar la cancelación.' : null,
      advertencia: sinDevolucion ? 'Faltan menos de 2 días para el ingreso. Si se aprueba la cancelación, no recibirás devolución del importe pagado (0 %).' : null,
      admiteReembolso: true, devolucionPorTransferencia: false,
      politica: { diasDevolucionTotal: 7, diasDevolucionParcial: 2, porcentajeTotal: 100, porcentajeParcial: 50, porcentajeFueraDePlazo: 0, porcentajeOtrosActores: 100 },
      devolucion: bloqueo ? null : { fechaSolicitud: fecha(0), diasAnticipacion: dias, porcentaje: sinDevolucion ? 0 : 100, importe: sinDevolucion ? 0 : 175000, moneda: 'ARS' },
    };
  }
  else if (p.endsWith('/reembolsos')) body = [];
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
  else if (p === '/reembolsos/actividad' || p.startsWith('/mensajes/')) body = [];
  else {
    console.warn('Fixture sin respuesta específica:', p);
    body = [];
  }
  if (params.get('estado') === 'error')
    return throwError(
      () => new HttpErrorResponse({ status: 503, statusText: 'Respuesta simulada de prueba' }),
    );
  return of(new HttpResponse({ status: 200, body })).pipe(delay(Math.min(10000, Math.max(0, Number(params.get('demora')) || 0))));
};
// El asistente usa su propio HttpClient, sin el interceptor: responde con las publicaciones de prueba.
const asistente = {
  consultar: () => of({
    respuesta: 'Estas publicaciones coinciden con tu búsqueda.',
    publicaciones: publicaciones.map(({ id, titulo, precio }) =>
      ({ id, titulo, ciudad: 'Villa María', modalidad: 'Temporal', precio, moneda: 'Peso (ARS)', ambientes: 3 })),
  }).pipe(delay(300)),
};

bootstrapApplication(App, {
  providers: [
    provideRouter(routes, withInMemoryScrolling({ scrollPositionRestoration: 'enabled' })),
    proveerReutilizacionRutas,
    provideHttpClient(withInterceptors([cargaInterceptor, interceptor])),
    { provide: AuthService, useValue: auth },
    { provide: AsistenteDepaService, useValue: asistente },
  ],
}).catch(console.error);
