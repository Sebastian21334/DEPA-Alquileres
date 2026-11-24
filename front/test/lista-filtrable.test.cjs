const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

const RAIZ = path.join(__dirname, '../src/app');

/** Compila un archivo TypeScript a CommonJS y lo ejecuta con las dependencias indicadas. */
function cargar(archivo, dependencias = {}) {
  const fuente = fs.readFileSync(path.join(RAIZ, archivo), 'utf8');
  const { outputText } = ts.transpileModule(fuente, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } });
  const modulo = { exports: {} };
  vm.runInNewContext(outputText, { module: modulo, exports: modulo.exports, require: (id) => dependencias[id] ?? assert.fail(`Dependencia no prevista: ${id}`) });
  return modulo.exports;
}

async function lista(items, opciones) {
  const core = await import('@angular/core');
  const { ListaFiltrable } = cargar('shared/utils/lista-filtrable.ts', { '@angular/core': core, './texto': cargar('shared/utils/texto.ts') });
  const fuente = core.signal(items);
  return { fuente, lista: new ListaFiltrable(fuente, opciones) };
}

const personas = Array.from({ length: 23 }, (_, i) => ({ id: i + 1, nombre: i === 4 ? 'José Pérez' : `Persona ${i + 1}`, abierto: i % 2 === 0 }));
const opciones = {
  porPagina: 10,
  textos: (item) => [item.id, item.nombre],
  filtros: [{ nombre: 'estado', etiqueta: 'Estado', opciones: [
    { valor: 'todos', etiqueta: 'Todos' },
    { valor: 'abiertos', etiqueta: 'Abiertos', aplica: (item) => item.abierto },
  ] }],
};

test('busca por varias palabras sin importar acentos ni mayúsculas', async () => {
  const { lista: reclamos } = await lista(personas, opciones);
  reclamos.buscar('  jose   PEREZ ');
  assert.deepEqual(reclamos.filtrados().map(({ id }) => id), [5]);
  reclamos.buscar('jose garcia');
  assert.equal(reclamos.filtrados().length, 0);
  reclamos.buscar('23');
  assert.deepEqual(reclamos.filtrados().map(({ id }) => id), [23]);
});

test('pagina, vuelve a la primera al buscar o filtrar y ajusta la página si la lista se achica', async () => {
  const { fuente, lista: reclamos } = await lista(personas, opciones);
  assert.equal(reclamos.paginas(), 3);
  reclamos.irAPagina(3);
  assert.deepEqual(reclamos.visibles().map(({ id }) => id), [21, 22, 23]);
  reclamos.filtrar('estado', 'abiertos');
  assert.equal(reclamos.pagina(), 1);
  assert.equal(reclamos.filtrados().length, 12);
  assert.equal(reclamos.valor('estado'), 'abiertos');
  assert.equal(reclamos.filtrando(), true);
  reclamos.irAPagina(2);
  fuente.set(personas.slice(0, 6));
  assert.equal(reclamos.pagina(), 1);
  assert.deepEqual(reclamos.visibles().map(({ id }) => id), [1, 3, 5]);
  reclamos.limpiar();
  assert.equal(reclamos.valor('estado'), 'todos');
  assert.equal(reclamos.filtrando(), false);
});

test('mostrar lleva a la página del caso y limpia los filtros solo si lo ocultan', async () => {
  const { lista: reclamos } = await lista(personas, opciones);
  reclamos.filtrar('estado', 'abiertos');
  assert.equal(reclamos.mostrar((item) => item.id === 23), true);
  assert.equal(reclamos.valor('estado'), 'abiertos');
  assert.equal(reclamos.pagina(), 2);
  assert.equal(reclamos.mostrar((item) => item.id === 22), true);
  assert.equal(reclamos.valor('estado'), 'todos');
  assert.equal(reclamos.pagina(), 3);
  assert.equal(reclamos.mostrar((item) => item.id === 99), false);
});

test('las apelaciones esperan respuesta cuando el último mensaje es del usuario', () => {
  const categorias = cargar('shared/utils/reclamo-categorias.ts');
  const fechas = cargar('shared/utils/rental-dates.ts');
  const { apelacionSinResponder, tieneApelacion, FILTROS_RECLAMO } = cargar('features/admin/admin-listas.ts', {
    '../../shared/utils/reclamo-categorias': categorias,
    '../../shared/utils/rental-dates': fechas,
  });
  const usuario = { id: '1', autor: 'usuario', texto: 'Apelo', fecha: '2026-11-20T10:00:00Z' };
  const admin = { id: '2', autor: 'administracion', texto: 'Recibido', fecha: '2026-11-20T11:00:00Z' };
  assert.equal(apelacionSinResponder({ id: 'a', mensajes: [usuario] }), true);
  assert.equal(apelacionSinResponder({ id: 'a', mensajes: [usuario, admin] }), false);
  assert.equal(apelacionSinResponder({ id: 'a', mensajes: [usuario, admin, { ...usuario, id: '3' }] }), true);
  assert.equal(apelacionSinResponder({ id: 'a', apelacion: { texto: 'Apelo', fecha: usuario.fecha } }), true);
  assert.equal(apelacionSinResponder({ id: 'a', apelacion: { texto: 'Apelo', fecha: usuario.fecha }, respuesta: { texto: 'Ok', fecha: admin.fecha } }), false);
  assert.equal(tieneApelacion({ id: 'a' }), false);

  const categoria = FILTROS_RECLAMO.find(({ nombre }) => nombre === 'categoria');
  const faltante = categoria.opciones.find(({ valor }) => valor === 'Reembolso faltante de cancelación');
  assert.equal(faltante.aplica({ categoria: 'OTRO', solicitud_cancelacion_id: 4 }), true);
  assert.equal(faltante.aplica({ categoria: 'DEMORA_ADMINISTRATIVA', solicitud_cancelacion_id: 4 }), false);
});
