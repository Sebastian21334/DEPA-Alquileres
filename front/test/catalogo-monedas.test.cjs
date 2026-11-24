const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

const fuente = fs.readFileSync(path.join(__dirname, '../src/app/shared/models/catalogo.model.ts'), 'utf8');
const { outputText } = ts.transpileModule(fuente, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } });
const modulo = { exports: {} };
vm.runInNewContext(outputText, { module: modulo, exports: modulo.exports });
const { codigoMoneda } = modulo.exports;

test('reconoce el código de la moneda en el nombre del catálogo', () => {
  assert.equal(codigoMoneda({ id: 10, nombre: 'Peso (ARS)' }), 'ARS');
  assert.equal(codigoMoneda({ id: 11, nombre: 'Dólar (usd)' }), 'USD');
  assert.equal(codigoMoneda({ id: 12, nombre: 'Euro (EUR)' }), null);
});
