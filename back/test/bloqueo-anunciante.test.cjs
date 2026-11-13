const { catalogosDePrueba, decisionDePrueba } = require('./soporte/catalogos-pruebas.cjs');
require('reflect-metadata');
const { test } = require('node:test');
const assert = require('node:assert/strict');

const { Pago } = require('../dist/pagos/entity/pago.entity');
const {
  OrigenReembolso,
  Reembolso,
  TipoReembolso,
} = require('../dist/reembolsos/entity/reembolso.entity');
const { Reserva } = require('../dist/reservas/entity/reserva.entity');
const MOTIVO_CANCELACION_BLOQUEO = 'Bloqueo de cuenta del anunciante';
const {
  ReservaCicloVidaService,
} = require('../dist/reservas/service/reserva-ciclo-vida.service');
const { ReembolsosService } = require('../dist/reembolsos/service/reembolsos.service');
const {
  ReservaBloqueoAnuncianteService,
} = require('../dist/reservas/service/reserva-bloqueo-anunciante.service');
const {
  BloqueoAnuncianteService,
} = require('../dist/bloqueo-anunciante/service/bloqueo-anunciante.service');
const { Usuario } = require('../dist/usuarios/entity/usuario.entity');

const ANUNCIANTE = 99;
const ADMIN = 1;
const MOTIVO = 'Incumplimiento de las condiciones';
const IMPORTE = 10000;
const INICIO = '2030-02-10';
const FIN = '2030-02-12';

function crearReserva(datos = {}) {
  return Object.assign(new Reserva(), {
    id: 1,
    cancelada: false,
    finalizada: false,
    fecha_cancelacion: null,
    motivo_cancelacion: null,
    cancelada_por: null,
    estado_pago: 'APROBADO',
    estado_liquidacion: 'RETENIDO',
    codigo_validado_en: null,
    intentos_codigo: 0,
    observacion_liquidacion: null,
    fecha_resolucion_liquidacion: null,
    fecha_inicio: INICIO,
    fecha_fin: FIN,
    publicacion: { id: 10, anunciante: { idUsuario: ANUNCIANTE } },
    ...datos,
  });
}

function resumenEsperado(cambios = {}) {
  return {
    canceladasPendientes: 0,
    canceladasConDevolucion: 0,
    enRevision: 0,
    sinAccion: 0,
    fallidas: 0,
    detalles: [],
    ...cambios,
  };
}

/**
 * Escenario con dobles en memoria. No hay TypeORM ni base de datos:
 * el repositorio simula transacciones ejecutando la operación sobre sí mismo.
 */
function crearEscenario(reserva, reservas = [reserva]) {
  const estado = {
    guardadas: [],
    liberadas: [],
    aplicados: [],
    rechazadas: [],
    compensados: [],
    reembolsos: [],
    siguienteReembolso: 1,
  };
  const pago = Object.assign(new Pago(), {
    id: 555,
    reserva,
    payment_id: 'mp-123',
    amount: IMPORTE,
    currency: 'ARS',
  });

  const reservaRepository = {
    conTransaccion: async (operacion) => operacion(reservaRepository, {}),
    buscarPorAnunciante: async (idAnunciante) =>
      reservas.filter(
        (actual) =>
          actual.publicacion?.anunciante?.idUsuario === idAnunciante,
      ),
    buscarPorId: async (id) =>
      reservas.find((actual) => actual.id === id) ?? null,
    guardar: async (actual) => {
      estado.guardadas.push(actual.id);
      return actual;
    },
  };

  const reembolsosService = {
    get ejecucionAutomaticaHabilitada() {
      return true;
    },
    async listarPorReserva(idReserva) {
      return estado.reembolsos.filter(
        (reembolso) => reembolso.reserva.id === idReserva,
      );
    },
    async buscarPagoPorReserva(idReserva) {
      return pago.reserva.id === idReserva ? pago : null;
    },
    saldoReembolsable(pagoConsultado) {
      const aprobado = estado.reembolsos
        .filter(
          (reembolso) =>
            reembolso.pago === pagoConsultado &&
            reembolso.estado === 'APROBADO',
        )
        .reduce((total, reembolso) => total + Number(reembolso.importe), 0);
      return Number(pagoConsultado.amount) - aprobado;
    },
    async crearSolicitudConResultado(datos) {
      const reembolso = Object.assign(new Reembolso(), {
        id: estado.siguienteReembolso++,
        reserva: datos.reserva,
        pago: datos.pago,
        tipo: datos.tipo,
        origen: datos.origen,
        importe: datos.importe,
        moneda: datos.pago.currency,
        estado: 'PENDIENTE',
        motivo: datos.motivo,
        referencia_interna: null,
        referencia_externa: null,
        id_externo: null,
        idempotency_key: datos.idempotencyKey ?? 'clave-de-prueba',
        resuelto_en: null,
        error_detalle: null,
      });
      estado.reembolsos.push(reembolso);
      return { reembolso, creado: true };
    },
    async registrarOejecutar(id) {
      const reembolso = estado.reembolsos.find(
        (actual) => actual.id === id,
      );
      reembolso.estado = 'APROBADO';
      reembolso.resuelto_en = new Date();
      return reembolso;
    },
    async compensar(id) {
      const reembolso = estado.reembolsos.find(
        (actual) => actual.id === id,
      );
      if (!reembolso) return false;
      if (
        reembolso.estado === 'RECHAZADO' ||
        reembolso.estado === 'CANCELADO'
      )
        return true;
      if (
        reembolso.estado !== 'PENDIENTE' &&
        reembolso.estado !== 'FALLIDO'
      )
        return false;
      reembolso.estado = 'CANCELADO';
      estado.compensados.push(id);
      return true;
    },
    esTotal(reembolso) {
      return (
        reembolso.tipo === TipoReembolso.TOTAL ||
        reembolso.tipo === TipoReembolso.CONTRACARGO
      );
    },
  };

  const disponibilidadService = {
    liberarReserva: async (id) => {
      estado.liberadas.push(id);
    },
  };

  const reservasService = {
    rechazarPago: async (id, estadoPago, actor, motivo, causa) => {
      const actual = reservas.find((reservaActual) => reservaActual.id === id);
      actual.estado_pago = estadoPago;
      actual.estado_liquidacion = 'NO_APLICA';
      actual.cancelada = true;
      actual.fecha_cancelacion = new Date();
      actual.cancelada_por = actor;
      actual.motivo_cancelacion = motivo;
      actual.causa_cancelacion = causa;
      estado.rechazadas.push({ id, estadoPago, actor, motivo });
      return actual;
    },
  };

  const aplicacion = {
    aplicarReembolsoConfirmado: async (id) => {
      estado.aplicados.push(id);
    },
  };

  const decision = decisionDePrueba();
  const ciclo = new ReservaCicloVidaService(decision, catalogosDePrueba());
  const devolucion = new ReembolsosService(undefined, undefined, undefined, undefined, undefined, catalogosDePrueba());
  for (const metodo of ['coberturaDevolucion', 'asegurarDevolucion', 'calcularCobertura']) reembolsosService[metodo] = devolucion[metodo];
  reembolsosService.catalogos = catalogosDePrueba();
  reembolsosService.aplicarConfirmado = aplicacion.aplicarReembolsoConfirmado;
  const servicio = new ReservaBloqueoAnuncianteService(
    reservaRepository,
    disponibilidadService,
    reembolsosService,
    decision,
    ciclo,
    reservasService,
    { sincronizarDesdeReserva: async () => ({}) }, catalogosDePrueba(),
  );

  return { estado, pago, servicio };
}

test('reserva PENDIENTE sin código: se cancela y suma canceladasPendientes', async () => {
  const reserva = crearReserva({
    estado_pago: 'PENDIENTE',
    estado_liquidacion: 'NO_APLICA',
  });
  const { estado, servicio } = crearEscenario(reserva);

  const resumen = await servicio.cancelarReservasPorBloqueoAnunciante(
    ANUNCIANTE,
    ADMIN,
    MOTIVO,
  );

  assert.deepEqual(resumen, resumenEsperado({ canceladasPendientes: 1 }));
  assert.equal(reserva.cancelada, true);
  assert.equal(reserva.estado_pago, 'CANCELADO');
  assert.equal(reserva.cancelada_por, 'ADMINISTRADOR');
  assert.equal(reserva.causa_cancelacion, 'BLOQUEO_ANUNCIANTE');
  assert.ok(
    reserva.motivo_cancelacion.startsWith(MOTIVO_CANCELACION_BLOQUEO),
  );
  assert.equal(estado.rechazadas.length, 1);
  assert.equal(estado.rechazadas[0].estadoPago, 'CANCELADO');
  assert.equal(estado.rechazadas[0].actor, 'ADMINISTRADOR');
  assert.equal(estado.reembolsos.length, 0);
  assert.deepEqual(estado.liberadas, []);
});

test('reserva APROBADA sin código y fechas futuras: devuelve, cancela, libera y aplica', async () => {
  const reserva = crearReserva();
  const { estado, servicio } = crearEscenario(reserva);

  const resumen = await servicio.cancelarReservasPorBloqueoAnunciante(
    ANUNCIANTE,
    ADMIN,
    MOTIVO,
  );

  assert.deepEqual(
    resumen,
    resumenEsperado({ canceladasConDevolucion: 1 }),
  );
  assert.equal(reserva.cancelada, true);
  assert.equal(reserva.cancelada_por, 'ADMINISTRADOR');
  assert.equal(reserva.causa_cancelacion, 'BLOQUEO_ANUNCIANTE');
  assert.ok(
    reserva.motivo_cancelacion.startsWith(MOTIVO_CANCELACION_BLOQUEO),
  );
  assert.deepEqual(estado.liberadas, [reserva.id]);
  assert.equal(estado.reembolsos.length, 1);

  const devolucion = estado.reembolsos[0];
  assert.equal(devolucion.estado, 'APROBADO');
  assert.equal(devolucion.origen, OrigenReembolso.CANCELACION);
  assert.equal(devolucion.tipo, TipoReembolso.TOTAL);
  assert.equal(Number(devolucion.importe), IMPORTE);
  assert.ok(devolucion.motivo.startsWith(MOTIVO_CANCELACION_BLOQUEO));
  assert.deepEqual(estado.aplicados, [devolucion.id]);
  assert.deepEqual(estado.compensados, []);
});

test('reserva APROBADA con código validado: pasa a EN_REVISION sin cancelar ni devolver', async () => {
  const reserva = crearReserva({
    codigo_validado_en: new Date('2030-02-11T15:00:00Z'),
  });
  const { estado, servicio } = crearEscenario(reserva);

  const resumen = await servicio.cancelarReservasPorBloqueoAnunciante(
    ANUNCIANTE,
    ADMIN,
    MOTIVO,
  );

  assert.deepEqual(resumen, resumenEsperado({ enRevision: 1 }));
  assert.equal(reserva.cancelada, false);
  assert.equal(reserva.estado_liquidacion, 'EN_REVISION');
  assert.ok(
    reserva.observacion_liquidacion.startsWith(
      MOTIVO_CANCELACION_BLOQUEO,
    ),
  );
  assert.equal(estado.rechazadas.length, 0);
  assert.equal(estado.reembolsos.length, 0);
  assert.deepEqual(estado.liberadas, []);
  assert.deepEqual(estado.compensados, []);
});

test('reserva con liquidación EN_REVISION: pasa a EN_REVISION y no se cancela', async () => {
  const reserva = crearReserva({
    estado_liquidacion: 'EN_REVISION',
  });
  const { estado, servicio } = crearEscenario(reserva);

  const resumen = await servicio.cancelarReservasPorBloqueoAnunciante(
    ANUNCIANTE,
    ADMIN,
    MOTIVO,
  );

  assert.deepEqual(resumen, resumenEsperado({ enRevision: 1 }));
  assert.equal(reserva.cancelada, false);
  assert.equal(reserva.estado_liquidacion, 'EN_REVISION');
  assert.ok(
    reserva.observacion_liquidacion.startsWith(
      MOTIVO_CANCELACION_BLOQUEO,
    ),
  );
  assert.equal(estado.rechazadas.length, 0);
  assert.equal(estado.reembolsos.length, 0);
  assert.deepEqual(estado.liberadas, []);
});

test('reserva con pago en CONTRACARGO: pasa a EN_REVISION y conserva el estado de pago', async () => {
  const reserva = crearReserva({
    estado_pago: 'CONTRACARGO',
  });
  const { estado, servicio } = crearEscenario(reserva);

  const resumen = await servicio.cancelarReservasPorBloqueoAnunciante(
    ANUNCIANTE,
    ADMIN,
    MOTIVO,
  );

  assert.deepEqual(resumen, resumenEsperado({ enRevision: 1 }));
  assert.equal(reserva.cancelada, false);
  assert.equal(reserva.estado_pago, 'CONTRACARGO');
  assert.equal(reserva.estado_liquidacion, 'EN_REVISION');
  assert.equal(estado.rechazadas.length, 0);
  assert.equal(estado.reembolsos.length, 0);
});

test('reserva finalizada con liquidación pendiente: pasa a EN_REVISION y no devuelve', async () => {
  const reserva = crearReserva({ finalizada: true });
  const { estado, servicio } = crearEscenario(reserva);

  const resumen = await servicio.cancelarReservasPorBloqueoAnunciante(
    ANUNCIANTE,
    ADMIN,
    MOTIVO,
  );

  assert.deepEqual(resumen, resumenEsperado({ enRevision: 1 }));
  assert.equal(reserva.cancelada, false);
  assert.equal(reserva.estado_liquidacion, 'EN_REVISION');
  assert.equal(estado.rechazadas.length, 0);
  assert.equal(estado.reembolsos.length, 0);
  assert.deepEqual(estado.liberadas, []);
});

test('reserva finalizada con liquidación resuelta: no se toca y suma sinAccion', async () => {
  const reserva = crearReserva({
    finalizada: true,
    estado_liquidacion: 'PAGADO_PROPIETARIO',
  });
  const { estado, servicio } = crearEscenario(reserva);

  const resumen = await servicio.cancelarReservasPorBloqueoAnunciante(
    ANUNCIANTE,
    ADMIN,
    MOTIVO,
  );

  assert.deepEqual(resumen, resumenEsperado({ sinAccion: 1 }));
  assert.equal(reserva.cancelada, false);
  assert.equal(
    reserva.estado_liquidacion,
    'PAGADO_PROPIETARIO',
  );
  assert.deepEqual(estado.guardadas, []);
  assert.equal(estado.reembolsos.length, 0);
  assert.deepEqual(estado.liberadas, []);
});

function crearEscenarioBloqueo({ bloqueado, rol = 'Anunciante' }) {
  const usuario = Object.assign(new Usuario(), {
    id: 3,
    activa: true,
    bloqueado: !bloqueado,
    rol: { nombre: rol },
  });
  const llamadas = { cambiarBloqueo: [], cancelarReservas: [] };
  const repo = {
    conTransaccion: (operacion) => operacion({}),
    buscarBloqueado: async (id) => (id === usuario.id ? usuario : null),
    guardar: async (actual) => llamadas.cambiarBloqueo.push([
      actual.id, actual.bloqueado, actual.bloqueoDetalle?.administradorId, actual.bloqueoDetalle?.motivo,
    ]),
  };
  const bloqueo = {
    cancelarReservasPorBloqueoAnunciante: async (...argumentos) => {
      llamadas.cancelarReservas.push(argumentos);
      return resumenEsperado({ canceladasPendientes: 1 });
    },
  };

  return {
    llamadas,
    servicio: new BloqueoAnuncianteService(repo, bloqueo, { bloquearPublicacionesParaCambioDeCuenta: async () => {} }, {}),
  };
}

test('bloqueo de un Anunciante: cambia el bloqueo y resuelve sus reservas', async () => {
  const { llamadas, servicio } = crearEscenarioBloqueo({ bloqueado: true });

  const resultado = await servicio.cambiarBloqueo(3, true, ADMIN, MOTIVO);

  assert.deepEqual(llamadas.cambiarBloqueo, [[3, true, ADMIN, MOTIVO]]);
  assert.deepEqual(llamadas.cancelarReservas, [[3, ADMIN, MOTIVO]]);
  assert.equal(resultado.mensaje, 'Usuario bloqueado correctamente');
  assert.deepEqual(
    resultado.reservas,
    resumenEsperado({ canceladasPendientes: 1 }),
  );
});

test('desbloqueo de un Anunciante: cambia el bloqueo y no toca reservas', async () => {
  const { llamadas, servicio } = crearEscenarioBloqueo({ bloqueado: false });

  const resultado = await servicio.cambiarBloqueo(3, false, ADMIN, MOTIVO);

  assert.deepEqual(llamadas.cambiarBloqueo, [[3, false, undefined, undefined]]);
  assert.deepEqual(llamadas.cancelarReservas, []);
  assert.deepEqual(resultado, {
    mensaje: 'Usuario habilitado correctamente',
  });
});

test('bloqueo de una cuenta que no es Anunciante: no resuelve reservas', async () => {
  const { llamadas, servicio } = crearEscenarioBloqueo({
    bloqueado: true,
    rol: 'Inquilino',
  });

  const resultado = await servicio.cambiarBloqueo(3, true, ADMIN, MOTIVO);

  assert.deepEqual(llamadas.cambiarBloqueo, [[3, true, ADMIN, MOTIVO]]);
  assert.deepEqual(llamadas.cancelarReservas, []);
  assert.deepEqual(resultado, {
    mensaje: 'Usuario bloqueado correctamente',
  });
});
