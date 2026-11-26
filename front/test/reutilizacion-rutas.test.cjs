const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

// La estrategia base de Angular reutiliza cuando la configuración de la ruta es la misma.
class BaseRouteReuseStrategy {
  shouldReuseRoute(futura, actual) { return futura.routeConfig === actual.routeConfig; }
}
const fuente = fs.readFileSync(path.join(__dirname, '../src/app/core/routing/reutilizacion-rutas.ts'), 'utf8');
const { outputText } = ts.transpileModule(fuente, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } });
const modulo = { exports: {} };
vm.runInNewContext(outputText, {
  module: modulo, exports: modulo.exports,
  require: (id) => id === '@angular/router' ? { BaseRouteReuseStrategy, RouteReuseStrategy: 'RouteReuseStrategy' } : assert.fail(`Dependencia no prevista: ${id}`),
});
const estrategia = new modulo.exports.ReutilizacionRutas();

const detalle = { path: 'publicaciones/:id' };
const perfil = { path: 'perfil/:id' };
const ruta = (routeConfig, params, data = {}) => ({
  routeConfig, data, paramMap: { keys: Object.keys(params), get: (clave) => params[clave] ?? null },
});

test('ir a otra publicación desde una publicación crea la pantalla de nuevo', () => {
  const marcada = { recrearConOtrosParametros: true };
  assert.equal(estrategia.shouldReuseRoute(ruta(detalle, { id: '3' }, marcada), ruta(detalle, { id: '1' }, marcada)), false);
  // La misma publicación (por ejemplo, solo cambia `?chat=`) conserva la pantalla.
  assert.equal(estrategia.shouldReuseRoute(ruta(detalle, { id: '1' }, marcada), ruta(detalle, { id: '1' }, marcada)), true);
});

test('las rutas sin marcar se reutilizan como siempre y las distintas nunca', () => {
  assert.equal(estrategia.shouldReuseRoute(ruta(perfil, { id: '3' }), ruta(perfil, { id: '1' })), true);
  assert.equal(estrategia.shouldReuseRoute(ruta(detalle, { id: '1' }, { recrearConOtrosParametros: true }), ruta(perfil, { id: '1' })), false);
});
