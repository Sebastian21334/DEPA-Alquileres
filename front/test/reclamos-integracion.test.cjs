const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

function cargar(archivo, dependencias = {}) {
  const contexto = { exports: {}, FormData, File, require(modulo) {
    if (modulo in dependencias) return dependencias[modulo];
    if (modulo.endsWith('/reclamo-rol') || modulo.endsWith('/reclamo-imagenes')) {
      return cargar(path.resolve(path.dirname(archivo), `${modulo}.ts`));
    }
    return new Proxy({}, { get: (_, nombre) => nombre });
  } };
  const codigo = ts.transpileModule(fs.readFileSync(archivo, 'utf8'), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, experimentalDecorators: true },
  }).outputText;
  vm.runInNewContext(codigo, contexto, { filename: archivo });
  return contexto.exports;
}

function signal(valor) {
  const leer = () => valor;
  leer.set = nuevo => { valor = nuevo; };
  return leer;
}

const { MisReservasComponent } = cargar(path.join(__dirname, '../src/app/features/mis-reservas/mis-reservas.component.ts'), {
  '@angular/core': { Component: () => clase => clase },
});

for (const caso of [
  { nombre: 'faltante del inquilino', categoria: 'OTRO', usuario: 1, esperado: 'inquilino', solicitud_cancelacion_id: 9 },
  { nombre: 'reinicio del código', categoria: 'CODIGO_BLOQUEADO', usuario: 2, esperado: 'anunciante' },
  { nombre: 'problema de la estadía', categoria: 'MANTENIMIENTO', usuario: 1, esperado: 'inquilino' },
]) {
  test(`el alta de ${caso.nombre} abre la pestaña del rol correspondiente`, () => {
    const componente = Object.create(MisReservasComponent.prototype);
    for (const propiedad of ['reclamoEnviando', 'reclamoAbierto', 'reclamoArchivos', 'mensaje', 'vista', 'vistaReclamos']) componente[propiedad] = signal(null);
    // Un formulario anterior no debe decidir la pestaña del reclamo nuevo.
    componente.reclamoCategoria = signal('CODIGO_BLOQUEADO');
    componente.idUsuario = () => caso.usuario;
    let recargas = 0;
    componente.cargarReservas = silenciosa => { assert.equal(silenciosa, true); recargas++; };
    componente.finalizarReclamo({ categoria: caso.categoria, inquilino: { id: 1 }, anunciante: { id: 2 }, solicitud_cancelacion_id: caso.solicitud_cancelacion_id });
    assert.equal(componente.vista(), 'reclamos');
    assert.equal(componente.vistaReclamos(), caso.esperado);
    assert.equal(componente.reclamoEnviando(), false);
    assert.equal(componente.reclamoAbierto(), null);
    assert.equal(componente.reclamoArchivos().length, 0);
    assert.equal(recargas, 1);
  });
}

function servicio() {
  const llamadas = [];
  const http = {
    get(url) { llamadas.push({ metodo: 'GET', url }); },
    post(url, body) { llamadas.push({ metodo: 'POST', url, body }); },
  };
  const { ReservationService } = cargar(path.join(__dirname, '../src/app/shared/services/reservation.service.ts'), {
    '@angular/core': { Injectable: () => clase => clase, inject: () => http },
    '../../../environments/environment': { environment: { apiUrl: 'http://api.example.test' } },
  });
  return { api: new ReservationService(), llamadas };
}

test('se conservan las rutas de faltantes y pedido de reinicio', () => {
  const { api, llamadas } = servicio();
  api.cancellationRefundBalance(42);
  api.claimMissingRefund(42, 'Falta recibir parte del reembolso.');
  api.createClaim({ id_reserva: 42, categoria: 'CODIGO_BLOQUEADO', descripcion: 'Descripción válida del inconveniente.' });
  assert.deepEqual(llamadas.map(llamada => llamada.url), [
    'http://api.example.test/reclamos/cancelacion/42',
    'http://api.example.test/reclamos/cancelacion/42',
    'http://api.example.test/reclamos',
  ]);
  assert.equal(llamadas[2].body.categoria, 'CODIGO_BLOQUEADO');
});

test('el chat conserva mensajes de texto y permite imágenes sin texto', () => {
  const { api, llamadas } = servicio();
  api.sendClaimMessage(42, 'Mensaje sin adjuntos');
  assert.equal(llamadas[0].body.texto, 'Mensaje sin adjuntos');
  assert.equal(Object.hasOwn(llamadas[0].body, 'visible_para'), false);
  const imagen = new File(['foto simulada'], 'foto.png', { type: 'image/png' });
  api.sendClaimMessage(42, '', [imagen]);
  const multipart = llamadas[1].body;
  assert.equal(multipart instanceof FormData, true);
  assert.equal(multipart.has('texto'), false);
  assert.equal(multipart.has('visible_para'), false);
  assert.equal(multipart.getAll('evidencias').length, 1);
  assert.equal(multipart.get('evidencias').name, 'foto.png');
});
