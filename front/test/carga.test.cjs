const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const { Subject, defer, of, retry, throwError } = require('rxjs');

// Usa las señales, DI y contextos HTTP reales de Angular, sin navegador ni API.
const entorno = (async () => {
  await import('@angular/compiler');
  const core = await import('@angular/core');
  const http = await import('@angular/common/http');
  function cargar(archivo, dependencias) {
    const source = fs.readFileSync(path.join(__dirname, '../src/app', archivo), 'utf8');
    const contexto = {
      exports: {},
      require: nombre => dependencias[nombre] ?? require(nombre),
    };
    vm.runInNewContext(ts.transpileModule(source, {
      compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, experimentalDecorators: true },
    }).outputText, contexto);
    return contexto.exports;
  }
  const servicio = cargar('core/services/carga.service.ts', { '@angular/core': core });
  const interceptor = cargar('core/interceptors/carga.interceptor.ts', {
    '@angular/core': core, '@angular/common/http': http, '../services/carga.service': servicio,
  });
  return { ...core, ...http, ...servicio, ...interceptor };
})();

async function preparar(t) {
  const api = await entorno;
  const carga = new api.CargaService();
  const injector = api.createEnvironmentInjector([{ provide: api.CargaService, useValue: carga }]);
  t.after(() => injector.destroy());
  const peticion = new api.HttpRequest('GET', '/prueba');
  const interceptar = (next, req = peticion) => api.runInInjectionContext(injector, () => api.cargaInterceptor(req, next));
  return { ...api, carga, peticion, interceptar };
}

test('mantiene la carga hasta que terminan todas las consultas concurrentes', async t => {
  const { carga, interceptar } = await preparar(t);
  const primera = new Subject();
  const segunda = new Subject();
  const observable = interceptar(() => primera);
  assert.equal(carga.activa(), false, 'no cuenta observables sin suscripción');
  observable.subscribe();
  interceptar(() => segunda).subscribe();
  assert.equal(carga.activa(), true);
  primera.complete();
  assert.equal(carga.activa(), true);
  segunda.complete();
  assert.equal(carga.activa(), false);
});

test('libera la carga al cancelar y al fallar, sin afectar otra consulta', async t => {
  const { carga, interceptar } = await preparar(t);
  const pendiente = interceptar(() => new Subject()).subscribe();
  interceptar(() => throwError(() => new Error('sin conexión'))).subscribe({ error() {} });
  assert.equal(carga.activa(), true);
  pendiente.unsubscribe();
  pendiente.unsubscribe();
  assert.equal(carga.activa(), false);
  const finalizar = carga.iniciar();
  finalizar();
  finalizar();
  assert.equal(carga.activa(), false, 'los finalizadores son idempotentes');
});

test('libera la carga ante errores sincrónicos y permite reintentar', async t => {
  const { carga, interceptar } = await preparar(t);
  interceptar(() => { throw new Error('fallo inmediato'); }).subscribe({ error() {} });
  assert.equal(carga.activa(), false);
  let intentos = 0;
  interceptar(() => defer(() => ++intentos === 1 ? throwError(() => new Error('reintentar')) : of('ok')))
    .pipe(retry(1)).subscribe();
  assert.equal(intentos, 2);
  assert.equal(carga.activa(), false);
});

test('el sondeo silencioso conserva la petición y no activa ni apaga otras cargas', async t => {
  const { carga, interceptar, HttpRequest, contextoCarga } = await preparar(t);
  const terminar = carga.iniciar();
  const req = new HttpRequest('POST', '/sesion', { dato: 'prueba' }, {
    context: contextoCarga(true), headers: undefined,
  });
  let recibida;
  interceptar(peticion => { recibida = peticion; return of('ok'); }, req).subscribe();
  assert.equal(recibida, req, 'no cambia cuerpo, URL, cabeceras ni contexto');
  assert.equal(carga.activa(), true);
  terminar();
  interceptar(() => of('ok'), req).subscribe();
  assert.equal(carga.activa(), false);
});

test('coordina indicadores locales visibles sin duplicar registros al observar o destruir', async t => {
  const { carga } = await preparar(t);
  const primero = carga.registrarIndicadorLocal();
  const segundo = carga.registrarIndicadorLocal();
  primero(true);
  primero(true);
  segundo(true);
  assert.equal(carga.indicadorLocalVisible(), true);
  primero(false);
  primero(false);
  assert.equal(carga.indicadorLocalVisible(), true);
  segundo(false);
  assert.equal(carga.indicadorLocalVisible(), false);
});
