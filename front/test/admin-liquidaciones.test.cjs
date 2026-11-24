const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

// Carga admin-listas.ts con dobles mínimos: estas funciones no usan fechas ni catálogos de reclamos.
const fuente = fs.readFileSync(path.join(__dirname, '../src/app/features/admin/admin-listas.ts'), 'utf8');
const { outputText } = ts.transpileModule(fuente, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } });
const modulo = { exports: {} };
const dependencias = {
  '../../shared/utils/reclamo-categorias': { ETIQUETAS_CATEGORIA_RECLAMO: [], etiquetaCategoriaReclamo: () => '' },
  '../../shared/utils/rental-dates': { fechaHoyArgentina: () => '2099-01-26' },
};
vm.runInNewContext(outputText, { module: modulo, exports: modulo.exports, require: (id) => dependencias[id] ?? assert.fail(`Dependencia no prevista: ${id}`) });
const { etiquetaLiquidacion, tieneDevolucion, pagoHabilitado, pendienteParaAnunciante } = modulo.exports;

const liquidacion = (datos) => ({
  estado_liquidacion: 'PENDIENTE_PAGO_PROPIETARIO', cancelada: false, codigo_validado_en: '2099-01-10',
  monto_pago: 100, importe_a_liquidar: 100, habilitada_para_pago: true, ...datos,
});

test('la etiqueta dice por qué el pago queda para el anunciante', () => {
  assert.equal(etiquetaLiquidacion(liquidacion({ estado_liquidacion: 'EN_REVISION' })), 'En revisión');
  assert.equal(etiquetaLiquidacion(liquidacion({ estado_liquidacion: 'DEVUELTO_PARCIAL_INQUILINO' })), 'Devolución parcial · resto al anunciante');
  assert.equal(etiquetaLiquidacion(liquidacion({ cancelada: true, codigo_validado_en: null })), 'Cancelada · retención para el anunciante');
  assert.equal(etiquetaLiquidacion(liquidacion({})), 'Código validado');
  assert.equal(etiquetaLiquidacion(liquidacion({ codigo_validado_en: null })), 'Ingreso no verificado: plazo vencido');
});

test('el pago habilitado y la devolución salen de los datos que calcula el back', () => {
  assert.equal(tieneDevolucion(liquidacion({ importe_a_liquidar: 60 })), true);
  assert.equal(tieneDevolucion(liquidacion({ importe_a_liquidar: 100 })), false);
  assert.equal(pagoHabilitado(liquidacion({ habilitada_para_pago: false })), false);
  assert.equal(pendienteParaAnunciante(liquidacion({ estado_liquidacion: 'DEVUELTO_PARCIAL_INQUILINO' })), true);
  assert.equal(pendienteParaAnunciante(liquidacion({ estado_liquidacion: 'EN_REVISION' })), false);
});
