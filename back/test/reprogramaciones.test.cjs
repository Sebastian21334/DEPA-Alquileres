require('reflect-metadata');
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { ReservaReprogramacionService } = require('../dist/reservas/service/reserva-reprogramacion.service');
const { diasDeAntelacion, fechaArgentina } = require('../dist/common/utils/fechas');

const HOY = fechaArgentina();
const sumarDias = (fecha, dias) =>
  new Date(Date.parse(`${fecha}T00:00:00Z`) + dias * 86_400_000)
    .toISOString()
    .slice(0, 10);
const rango = (inicio) => ({
  fecha_inicio: inicio,
  fecha_fin: sumarDias(inicio, 2),
});

function crearEscenario(opciones = {}) {
  const {
    delInquilino = true,
    codigoValidado = false,
    disponible = true,
  } = opciones;
  const estado = { guardadas: 0, reprogramaciones: 0, notificaciones: 0 };
  const reserva = {
    id: 1,
    estado_pago: 'APROBADO',
    cancelada: false,
    finalizada: false,
    codigo_validado_en: null,
    estado_liquidacion: 'RETENIDO',
    fecha_inicio: sumarDias(HOY, 10),
    fecha_fin: sumarDias(HOY, 12),
    precio_unitario_contratado: 100,
    importe_contratado: 300,
    monto_pago: 300,
    moneda_contratada: 'ARS',
    publicacion: {
      id: 2,
      titulo: 'Departamento de prueba',
      anunciante: { usuario: { email: 'anunciante@example.invalid' } },
    },
    reprogramaciones: [],
  };
  const repositorio = {
    conTransaccion: async (operacion) => operacion(repositorio, {}),
    buscarPorId: async () => reserva,
    guardar: async (actual) => {
      estado.guardadas++;
      return actual;
    },
    guardarReprogramacion: async () => {
      estado.reprogramaciones++;
      return { id: 99 };
    },
  };
  const reservas = {
    esDelInquilino: () => delInquilino,
    calcularEstadoEstadia: () => 'CONFIRMADA',
    pagoAprobado: () => true,
    codigoValidado: () => codigoValidado,
    liquidacionEnRevision: () => false,
    liquidacionResuelta: () => false,
    prepararRespuesta: (actual) => actual,
  };
  const disponibilidad = {
    reprogramarReserva: async () => disponible,
  };
  const notificaciones = {
    enviarReprogramacion: async () => {
      estado.notificaciones++;
    },
  };
  const anunciantes = {
    datosContacto: () => ({ email: 'anunciante@example.invalid', nombre: 'Anunciante' }),
  };
  const servicio = new ReservaReprogramacionService(
    repositorio,
    disponibilidad,
    notificaciones,
    reservas,
    anunciantes,
  );
  return { servicio, estado, reserva };
}

async function rechazaConEstado(promesa, estado) {
  await assert.rejects(promesa, (error) => error?.getStatus?.() === estado);
}

test('diasDeAntelacion cuenta días corridos entre fechas de calendario', () => {
  assert.equal(diasDeAntelacion(sumarDias(HOY, 6), HOY), 6);
  assert.equal(diasDeAntelacion(sumarDias(HOY, 5), HOY), 5);
});

test('rechaza reprogramar con 5 días de antelación', async () => {
  const { servicio } = crearEscenario();
  await rechazaConEstado(
    servicio.actualizarFechas(1, rango(sumarDias(HOY, 5)), 7),
    400,
  );
});

test('permite reprogramar con 6 días de antelación', async () => {
  const { servicio, estado } = crearEscenario();
  const resultado = await servicio.actualizarFechas(1, rango(sumarDias(HOY, 6)), 7);
  assert.equal(resultado.id, 1);
  assert.equal(estado.guardadas, 1);
  assert.equal(estado.reprogramaciones, 1);
  assert.equal(estado.notificaciones, 1);
});

test('permite reprogramar con 7 días de antelación', async () => {
  const { servicio, estado } = crearEscenario();
  const resultado = await servicio.actualizarFechas(1, rango(sumarDias(HOY, 7)), 7);
  assert.equal(resultado.id, 1);
  assert.equal(estado.guardadas, 1);
});

test('rechaza el cambio si el usuario no es el inquilino', async () => {
  const { servicio } = crearEscenario({ delInquilino: false });
  await rechazaConEstado(
    servicio.actualizarFechas(1, rango(sumarDias(HOY, 7)), 8),
    403,
  );
});

test('rechaza el cambio si el código ya fue validado', async () => {
  const { servicio } = crearEscenario({ codigoValidado: true });
  await rechazaConEstado(
    servicio.actualizarFechas(1, rango(sumarDias(HOY, 7)), 7),
    400,
  );
});

test('rechaza un rango con formato inválido', async () => {
  const { servicio } = crearEscenario();
  await rechazaConEstado(
    servicio.actualizarFechas(
      1,
      { fecha_inicio: '2026-13-99', fecha_fin: '2026-12-31' },
      7,
    ),
    400,
  );
});
