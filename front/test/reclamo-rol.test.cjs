const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

// reclamo-rol.ts solo importa tipos: se transpila y se ejecuta sin dependencias.
const fuente = fs.readFileSync(path.join(__dirname, '../src/app/shared/utils/reclamo-rol.ts'), 'utf8');
const { outputText } = ts.transpileModule(fuente, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } });
const modulo = { exports: {} };
vm.runInNewContext(outputText, { module: modulo, exports: modulo.exports });
const { etiquetaAutorReclamo } = modulo.exports;

const reclamo = { inquilino: { id: 1 }, anunciante: { id: 2 } };
const administrador = (id) => ({ id, rol: { nombre: 'Administrador' } });

test('el autor aparece con su rol en la reserva aunque su cuenta sea de administrador', () => {
  assert.equal(etiquetaAutorReclamo(reclamo, administrador(1)), 'Inquilino');
  assert.equal(etiquetaAutorReclamo(reclamo, administrador(2)), 'Anunciante');
  assert.equal(etiquetaAutorReclamo(reclamo, { id: 1, rol: { nombre: 'Inquilino' } }), 'Inquilino');
});

test('«Admin» solo desde el panel de Administración o para un administrador que no es parte', () => {
  assert.equal(etiquetaAutorReclamo(reclamo, administrador(1), true), 'Admin');
  assert.equal(etiquetaAutorReclamo(reclamo, administrador(3)), 'Admin');
  assert.equal(etiquetaAutorReclamo(reclamo, { id: 9, rol: { nombre: 'Inquilino' } }), '');
  assert.equal(etiquetaAutorReclamo(reclamo, null), '');
});
