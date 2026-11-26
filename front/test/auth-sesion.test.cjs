const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

// Carga AuthService sin Angular: solo se usan los métodos del prototipo, sin construir el servicio.
const fuente = fs.readFileSync(path.join(__dirname, '../src/app/core/services/auth.service.ts'), 'utf8');
const { outputText } = ts.transpileModule(fuente, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, experimentalDecorators: true },
});
const modulo = { exports: {} };
vm.runInNewContext(outputText, {
  module: modulo, exports: modulo.exports, Date,
  require: (id) => id === '@angular/core' ? { Injectable: () => (clase) => clase } : new Proxy({}, { get: (_, nombre) => nombre }),
});
const { AuthService } = modulo.exports;

function servicio(exp) {
  let usuario = { sub: 7, exp };
  const auth = Object.create(AuthService.prototype);
  auth.currentUser = Object.assign(() => usuario, { set: (valor) => { usuario = valor; } });
  auth.logout = () => auth.currentUser.set(null);
  return auth;
}

test('una sesión vigente sigue activa', () => {
  const auth = servicio(Math.floor(Date.now() / 1000) + 3600);
  assert.equal(auth.sesionActiva(), true);
  assert.notEqual(auth.currentUser(), null);
});

test('un token vencido con la aplicación abierta cierra la sesión para que el guard pida ingresar', () => {
  const auth = servicio(Math.floor(Date.now() / 1000) - 1);
  assert.equal(auth.sesionActiva(), false);
  assert.equal(auth.currentUser(), null);
});
