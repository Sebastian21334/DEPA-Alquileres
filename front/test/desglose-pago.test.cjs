const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

// Carga un archivo de utilidades de TypeScript con sus dependencias ya cargadas.
function cargar(archivo, dependencias = {}) {
  const fuente = fs.readFileSync(path.join(__dirname, '../src/app/shared/utils', archivo), 'utf8');
  const { outputText } = ts.transpileModule(fuente, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } });
  const modulo = { exports: {} };
  vm.runInNewContext(outputText, { module: modulo, exports: modulo.exports, Intl, require: (id) => dependencias[id] ?? assert.fail(`Dependencia no prevista: ${id}`) });
  return modulo.exports;
}

const { filasDesglose } = cargar('desglose-pago.ts', { './formato-numero': cargar('formato-numero.ts') });
// Los objetos vienen de otro contexto de vm: se comparan como texto.
const filas = (...args) => Array.from(filasDesglose(...args), ({ etiqueta, importe }) => `${etiqueta}: ${importe}`);

test('el desglose explica la diferencia con lo pagado al anunciante, que ya se muestra como importe', () => {
  assert.deepEqual(filas({ pagoInquilino: 1500, devueltoInquilino: 400.5, comisionDepa: 0, pagadoAnunciante: 1099.5 }, 'ARS'), [
    'Pagó el inquilino: ARS 1.500,00',
    'Devuelto al inquilino: ARS 400,50',
  ]);
  assert.deepEqual(filas({ pagoInquilino: 100, devueltoInquilino: 0, comisionDepa: 10, pagadoAnunciante: 90 }, null), [
    'Pagó el inquilino: 100,00',
    'Comisión DEPA: 10,00',
  ]);
});

test('sin devolución ni comisión no hay nada que desglosar', () => {
  assert.deepEqual(filas({ pagoInquilino: 4, devueltoInquilino: 0, comisionDepa: 0, pagadoAnunciante: 4 }, 'ARS'), []);
});
