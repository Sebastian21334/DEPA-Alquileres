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
const dependencias = {
  './rental-dates': { DIAS_MINIMOS_REPROGRAMACION: 2, diasDeAntelacion: () => 0, rentalDays: () => 1 },
  './formato-numero': { formatearImporteConMoneda: (valor, moneda) => `${moneda} ${valor.toFixed(2)}` },
};
vm.runInNewContext(outputText, { module: modulo, exports: modulo.exports, require: (id) => dependencias[id] ?? assert.fail(`Dependencia no prevista: ${id}`) });
const { puedeConsultarCodigo, puedeValidarCodigo, devolucionRegistrada } = modulo.exports;

const reserva = (datos) => ({
  estado_pago: 'APROBADO', cancelada: false, finalizada: false, estado_estadia: 'PENDIENTE_INGRESO',
  estado_liquidacion: 'RETENIDO', codigo_validado_en: null, intentos_codigo_restantes: 5, fecha_fin: '2099-01-20', ...datos,
});

test('durante la estadía el inquilino ve el código y el anunciante lo carga', () => {
  assert.equal(puedeConsultarCodigo(reserva({})), true);
  assert.equal(puedeValidarCodigo(reserva({})), true);
});

test('la devolución parcial se sigue viendo después de pagarle el resto al anunciante', () => {
  const devolucion_inquilino = { devuelto: 40, pagado: 100, moneda: 'ARS' };
  for (const estado_liquidacion of ['DEVUELTO_PARCIAL_INQUILINO', 'PAGADO_PROPIETARIO']) {
    const resultado = devolucionRegistrada(reserva({ estado_estadia: 'FINALIZADA', estado_liquidacion, devolucion_inquilino }));
    assert.equal(resultado.etiqueta, 'Reembolsada parcialmente');
    assert.equal(resultado.mensaje, 'Devolución parcial al inquilino: ARS 40.00 de ARS 100.00.');
  }
  // Sin devolución, una estadía pagada al anunciante no muestra nada.
  assert.equal(devolucionRegistrada(reserva({ estado_estadia: 'FINALIZADA', estado_liquidacion: 'PAGADO_PROPIETARIO', devolucion_inquilino: null })), null);
});

test('terminada la estadía sin validar, el código ya no se ve ni se carga aunque el pago siga retenido', () => {
  const terminada = reserva({ estado_estadia: 'INGRESO_NO_VERIFICADO' });
  assert.equal(puedeConsultarCodigo(terminada), false);
  assert.equal(puedeValidarCodigo(terminada), false);
});
