const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

// Carga reservation-state.ts con dobles de las fechas: estas reglas no dependen de ellas.
const fuente = fs.readFileSync(path.join(__dirname, '../src/app/shared/utils/reservation-state.ts'), 'utf8');
const { outputText } = ts.transpileModule(fuente, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } });
const modulo = { exports: {} };
const dependencias = { './rental-dates': { DIAS_MINIMOS_REPROGRAMACION: 2, diasDeAntelacion: () => 0, rentalDays: () => 1 } };
vm.runInNewContext(outputText, { module: modulo, exports: modulo.exports, require: (id) => dependencias[id] ?? assert.fail(`Dependencia no prevista: ${id}`) });
const { puedeConsultarCodigo, puedeValidarCodigo } = modulo.exports;

const reserva = (datos) => ({
  estado_pago: 'APROBADO', cancelada: false, finalizada: false, estado_estadia: 'PENDIENTE_INGRESO',
  estado_liquidacion: 'RETENIDO', codigo_validado_en: null, intentos_codigo_restantes: 5, fecha_fin: '2099-01-20', ...datos,
});

test('durante la estadía el inquilino ve el código y el anunciante lo carga', () => {
  assert.equal(puedeConsultarCodigo(reserva({})), true);
  assert.equal(puedeValidarCodigo(reserva({})), true);
});

test('terminada la estadía sin validar, el código ya no se ve ni se carga aunque el pago siga retenido', () => {
  const terminada = reserva({ estado_estadia: 'INGRESO_NO_VERIFICADO' });
  assert.equal(puedeConsultarCodigo(terminada), false);
  assert.equal(puedeValidarCodigo(terminada), false);
});
