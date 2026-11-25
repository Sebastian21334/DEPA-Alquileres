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

test('el desglose va del ingreso bruto al neto transferido, que ya se muestra como importe', () => {
  assert.deepEqual(filas({ pagoInquilino: 1500, devueltoInquilino: 400.5, comisionDepa: 0, porcentajeComision: null, pagadoAnunciante: 1099.5 }, 'ARS'), [
    'Ingreso bruto (pagó el inquilino): ARS 1.500,00',
    'Devuelto al inquilino: − ARS 400,50',
    'Comisión DEPA: No se aplica (hubo devolución)',
  ]);
  assert.deepEqual(filas({ pagoInquilino: 100, devueltoInquilino: 0, comisionDepa: 12.5, porcentajeComision: 12.5, pagadoAnunciante: 87.5 }, null), [
    'Ingreso bruto (pagó el inquilino): 100,00',
    'Comisión DEPA (12,5 %): − 12,50',
  ]);
  // Una comisión sin porcentaje conocido se muestra igual, sin inventarlo.
  assert.deepEqual(filas({ pagoInquilino: 100, devueltoInquilino: 0, comisionDepa: 10, porcentajeComision: null, pagadoAnunciante: 90 }, 'ARS'), [
    'Ingreso bruto (pagó el inquilino): ARS 100,00',
    'Comisión DEPA: − ARS 10,00',
  ]);
});

test('sin devolución ni comisión el bruto es el neto y no hay nada que desglosar', () => {
  assert.deepEqual(filas({ pagoInquilino: 4, devueltoInquilino: 0, comisionDepa: 0, porcentajeComision: null, pagadoAnunciante: 4 }, 'ARS'), []);
});
