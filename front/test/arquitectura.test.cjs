const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { test } = require('node:test');
const vm = require('node:vm');
const ts = require('typescript');
const rx = require('rxjs');

function signal(inicial) {
  let valor = inicial;
  return Object.assign(() => valor, {
    set: siguiente => { valor = siguiente; },
    update: fn => { valor = fn(valor); },
  });
}

function cargar(archivo, proveedores = {}, modulos = {}, registrarEfecto = () => {}) {
  const fuente = readFileSync(join(__dirname, '../src/app', archivo), 'utf8');
  const { outputText } = ts.transpileModule(fuente, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, experimentalDecorators: true },
  });
  const exports = {};
  const angular = {
    Component: () => clase => clase,
    Injectable: () => clase => clase,
    computed: fn => fn,
    effect: registrarEfecto,
    inject: token => proveedores[token],
    signal,
    viewChild: () => () => undefined,
    DestroyRef: 'DestroyRef',
    ElementRef: 'ElementRef',
    HttpContextToken: class { constructor(inicial) { this.inicial = inicial; } },
  };
  vm.runInNewContext(outputText, {
    exports, Reflect, URL, setTimeout, console: { error: () => {} },
    require: nombre => ({
      '@angular/core': angular,
      '@angular/core/rxjs-interop': { takeUntilDestroyed: () => origen => origen },
      rxjs: rx,
      ...modulos,
    }[nombre] ?? (nombre.endsWith('/environment')
      ? { environment: { apiUrl: 'https://api.prueba.invalid' } }
      : new Proxy(angular, { get: (objeto, clave) => objeto[clave] ?? clave }))),
  });
  return exports;
}

test('cambiar el ID del perfil cancela la consulta anterior y presenta el nuevo perfil', () => {
  const params = id => ({ get: clave => clave === 'id' ? String(id) : null });
  const paramMap = new rx.BehaviorSubject(params(1));
  const consultas = [];
  const { AdvertiserProfileComponent } = cargar('features/advertiser-profile/advertiser-profile.component.ts', {
    ActivatedRoute: { paramMap, queryParamMap: rx.of(params(null)), snapshot: { fragment: null } },
    AnunciantePublicoService: { getPublicProfile: id => {
      const respuesta = new rx.Subject();
      consultas.push({ id, respuesta });
      return respuesta;
    } },
    ListingService: { getByAdvertiser: id => rx.of([{ id }]) },
  });
  const perfil = new AdvertiserProfileComponent();
  paramMap.next(params(2));
  assert.equal(consultas[0].respuesta.observed, false);
  consultas[1].respuesta.next({ idUsuario: 2 });
  consultas[1].respuesta.complete();
  consultas[0].respuesta.next({ idUsuario: 1 });
  assert.equal(perfil.perfil().idUsuario, 2);
  assert.equal(perfil.publications()[0].id, 2);
  assert.equal(perfil.loading(), false);
});

test('favoritos descarta lecturas y escrituras de una sesión anterior', () => {
  const cuenta = { currentUser: () => ({ sub: 1 }), token: 'cuenta-a' };
  const lecturas = [];
  const escritura = new rx.Subject();
  let efecto;
  const { FavoritesService } = cargar('shared/services/favorites.service.ts', {
    AuthService: cuenta,
    HttpClient: {
      get: () => {
        const respuesta = new rx.Subject();
        lecturas.push(respuesta);
        return respuesta;
      },
      post: () => escritura,
    },
  }, {}, fn => { efecto = fn; });
  const servicio = new FavoritesService();
  let limpiar;
  efecto(fn => { limpiar = fn; });
  servicio.list().subscribe(() => assert.fail('Lectura entregada a otra sesión'));
  servicio.toggle(7).subscribe(() => assert.fail('Escritura entregada a otra sesión'));
  cuenta.token = 'cuenta-b';
  limpiar();
  efecto(fn => { limpiar = fn; });
  assert.equal(lecturas[0].observed, false);
  lecturas[2].next([{ id: 9 }]);
  lecturas[1].next([{ id: 4 }]);
  escritura.next({ idPublicacion: 7, favorito: true });
  assert.equal(servicio.isFavorite(9), true);
  assert.equal(servicio.isFavorite(7), false);
  assert.equal(servicio.isFavorite(4), false);
  limpiar();
});

test('el interceptor envía el token a DEPA y lo omite en peticiones anónimas o de otro origen', () => {
  const { authInterceptor, SOLICITUD_ANONIMA } = cargar('core/interceptors/auth.interceptor.ts', {
    AuthService: { token: 'sesion-ficticia' },
    DOCUMENT: { baseURI: 'https://depa.prueba.invalid/' },
  });
  const resultado = (url, anonima = false) => {
    const req = {
      url,
      context: { get: token => token === SOLICITUD_ANONIMA && anonima },
      clone: ({ setHeaders }) => ({ ...req, headers: setHeaders }),
    };
    return authInterceptor(req, enviado => enviado).headers?.Authorization;
  };
  assert.equal(resultado('https://api.prueba.invalid/favoritos'), 'Bearer sesion-ficticia');
  assert.equal(resultado('https://api.prueba.invalid/chatbot', true), undefined);
  assert.equal(resultado('https://externo.prueba.invalid/archivo'), undefined);
  assert.equal(resultado('https://api.prueba.invalid.externo.invalid/archivo'), undefined);
});

test('Actualizar en Administración consulta solo la sección activa', () => {
  const { AdminComponent } = cargar('features/admin/admin.component.ts', {}, {
    './admin-secciones': { ADMIN_NAVIGATION: [], seccionAdmin: () => null },
  });
  const admin = Object.create(AdminComponent.prototype);
  admin.activeSection = signal('resumen');
  const consultas = [];
  admin.api = new Proxy({}, { get: (_, metodo) => () => { consultas.push(metodo); return rx.of([]); } });
  for (const propiedad of ['otherLoading', 'summaryError', 'requests', 'settlements', 'claims', 'refunds', 'resumenReembolsos']) {
    admin[propiedad] = signal(null);
  }
  admin.cargarBloqueados = () => consultas.push('bloqueos');
  admin.usersPage = () => 1;
  admin.loadUsers = () => consultas.push('usuarios');
  for (const seccion of ['reclamos', 'reembolsos', 'verificaciones']) {
    admin[seccion + 'Admin'] = () => ({ cargar: () => consultas.push(seccion) });
  }
  admin.reload();
  assert.deepEqual(consultas.splice(0), ['bloqueos', 'listarPendientes', 'listarLiquidaciones', 'listarReclamos', 'listarReembolsos', 'resumenReembolsos']);
  for (const seccion of ['reclamos', 'reembolsos', 'verificaciones', 'usuarios']) {
    admin.activeSection.set(seccion);
    admin.reload();
    assert.deepEqual(consultas.splice(0), [seccion]);
  }
});

test('repetir una consulta de sección cancela la anterior y conserva los datos si falla', () => {
  const { ConsultaSeccionAdmin } = cargar('features/admin/consulta-seccion-admin.ts');
  const vista = new ConsultaSeccionAdmin(['último resultado']);
  const anterior = new rx.Subject();
  const nueva = new rx.Subject();
  vista.cargar(anterior);
  vista.cargar(nueva);
  assert.equal(anterior.observed, false);
  assert.equal(vista.cargando(), true);
  nueva.error(new Error('Fallo de la consulta'));
  assert.equal(vista.cargando(), false);
  assert.equal(vista.error(), 'Fallo de la consulta');
  assert.deepEqual(vista.datos(), ['último resultado']);
  vista.cargar(rx.of(['actualizado']));
  assert.equal(vista.error(), '');
  assert.deepEqual(vista.datos(), ['actualizado']);
});

test('estado de reseñas se reutiliza por objetivo y se actualiza al crear o borrar', () => {
  const cuenta = { currentUser: () => ({ sub: 1 }), token: 'sesion-a' };
  let lecturas = 0;
  const { ResenasService } = cargar('features/resenas/resenas.service.ts', {
    AuthService: cuenta,
    HttpClient: {
      get: () => { lecturas++; return rx.of({ miResena: null }); },
      post: () => rx.of({ id: 3 }),
      delete: () => rx.of({ id: 3 }),
    },
  }, {
    '@angular/common/http': { HttpClient: 'HttpClient', HttpParams: class { set() { return this; } } },
    '../../core/interceptors/carga.interceptor': { contextoCarga: () => ({}) },
  });
  const api = new ResenasService();
  api.consultarEstadoPublicacion(8).subscribe();
  api.consultarEstadoPublicacion(8).subscribe();
  assert.equal(lecturas, 1);
  assert.equal(api.estadoPublicaciones()[8], false);
  api.crear('PUBLICACION', 8, { puntaje: 5, comentario: 'Excelente' }).subscribe();
  assert.equal(api.estadoPublicaciones()[8], true);
  api.eliminar(3, 'PUBLICACION', 8).subscribe();
  assert.equal(api.estadoPublicaciones()[8], false);
  cuenta.token = 'sesion-b';
  assert.equal(api.estadoPublicaciones()[8], undefined);
  api.consultarEstadoPublicacion(8).subscribe();
  assert.equal(lecturas, 2);
});
