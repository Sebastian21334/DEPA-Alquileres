const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

const source = fs.readFileSync(
  path.join(__dirname, '../src/app/shared/utils/resenas.ts'),
  'utf8',
);
const context = { exports: {}, Number, Math };
vm.runInNewContext(
  ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
  }).outputText,
  context,
);
const { formatearPromedio, porcentajeEstrellas, porcentajeResenas, promedioMostrable } = context.exports;

test('el promedio solo se muestra cuando hay al menos una reseña', () => {
  assert.equal(promedioMostrable(0, null), null);
  assert.equal(promedioMostrable(0, 5), null);
  assert.equal(promedioMostrable(undefined, undefined), null);
  assert.equal(promedioMostrable(3, 4.67), 4.67);
  assert.equal(promedioMostrable(2, '4.5'), 4.5);
});

test('el promedio se limita al rango de cinco estrellas', () => {
  assert.equal(promedioMostrable(1, 7), 5);
  assert.equal(promedioMostrable(1, -2), null);
});

test('el promedio se formatea con una decimal en es-AR', () => {
  assert.equal(formatearPromedio(4.666), '4,7');
  assert.equal(formatearPromedio(5), '5,0');
});

test('las barras se calculan sobre cinco estrellas y sobre el total', () => {
  assert.equal(porcentajeEstrellas(4.5), 90);
  assert.equal(porcentajeEstrellas(0), 0);
  assert.equal(porcentajeEstrellas(8), 100);
  assert.equal(porcentajeResenas(3, 4), 75);
  assert.equal(porcentajeResenas(0, 0), 0);
});
