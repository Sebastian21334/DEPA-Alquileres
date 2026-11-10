require('reflect-metadata');
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { ReclamosService } = require('../dist/reclamos/service/reclamos.service');
const {
  ReservaEstadoService,
} = require('../dist/reservas/service/reserva-estado.service');
const {
  ReservaCicloVidaService,
} = require('../dist/reservas/service/reserva-ciclo-vida.service');
const { Reserva } = require('../dist/reservas/entity/reserva.entity');

function fechaRelativa(dias) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Argentina/Buenos_Aires',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(Date.now() + dias * 86_400_000));
}

function reclamoConMensajes() {
  return {
    id: 1,
    estado: 'ABIERTO',
    inquilino: { id: 7 },
    anunciante: { id: 8 },
    reserva: { id: 3 },
    mensajes: [
      { id: 1, texto: 'visible', visible_para: 'TODOS' },
      { id: 2, texto: 'interna', visible_para: 'ADMIN' },
    ],
  };
}

function servicio(reclamo) {
  const copia = () => ({
    ...reclamo,
    mensajes: reclamo.mensajes.map((mensaje) => ({ ...mensaje })),
  });
  const repo = {
    buscarPorUsuario: async () => [copia()],
    buscarPorId: async () => copia(),
  };
  return new ReclamosService(repo, {}, {}, {}, {}, {});
}

test('listarMios oculta las notas internas del Administrador', async () => {
  const service = servicio(reclamoConMensajes());
  const [reclamo] = await service.listarMios(7);
  assert.deepEqual(
    reclamo.mensajes.map((mensaje) => mensaje.texto),
    ['visible'],
  );
});

test('obtener oculta notas internas para el inquilino y las conserva para el Administrador', async () => {
  const service = servicio(reclamoConMensajes());
  const delInquilino = await service.obtener(1, 7, false);
  assert.deepEqual(
    delInquilino.mensajes.map((mensaje) => mensaje.texto),
    ['visible'],
  );

  const delAdmin = await service.obtener(1, 99, true);
  assert.deepEqual(
    delAdmin.mensajes.map((mensaje) => mensaje.texto),
    ['visible', 'interna'],
  );
});

test('crear permite reclamar una reserva ya pagada al propietario sin reabrir la liquidación', async () => {
  const reserva = Object.assign(new Reserva(), {
    id: 3,
    estado_pago: 'APROBADO',
    estado_liquidacion: 'PAGADO_PROPIETARIO',
    cancelada: false,
    fecha_inicio: fechaRelativa(-1),
    fecha_fin: fechaRelativa(0),
    usuario: { id: 7, email: 'inquilino@example.com' },
    publicacion: {
      anunciante: { usuario: { id: 8, email: 'anunciante@example.com' } },
    },
  });
  let guardadasReserva = 0;
  const repoReclamo = {
    buscarAbiertoPorReserva: async () => null,
    crear: (datos) => ({ id: 1, ...datos }),
    guardar: async (reclamo) => reclamo,
    buscarPorId: async (id) => ({
      id,
      estado: 'ABIERTO',
      reserva,
      inquilino: reserva.usuario,
      anunciante: reserva.publicacion.anunciante.usuario,
    }),
  };
  const repoReserva = {
    buscarPorId: async () => reserva,
    guardar: async () => {
      guardadasReserva += 1;
      return reserva;
    },
  };
  const uow = {
    ejecutar: async (operacion) =>
      operacion({ reclamos: repoReclamo, reservas: repoReserva }),
  };
  const estado = new ReservaEstadoService();
  const service = new ReclamosService(
    repoReclamo,
    {},
    {},
    {},
    new ReservaCicloVidaService(estado),
    estado,
    {},
    uow,
  );

  const reclamo = await service.crear(
    {
      id_reserva: 3,
      categoria: 'OTRO',
      descripcion: 'La propiedad no coincidía con la publicación',
    },
    7,
  );

  assert.equal(reclamo.estado, 'ABIERTO');
  assert.equal(guardadasReserva, 0);
});

test('cerrar pasa un reclamo resuelto a CERRADO', async () => {  const reclamo = {
    id: 1,
    estado: 'RESUELTO_INQUILINO',
    administrador_resolucion: null,
    reserva: { id: 3 },
    inquilino: { id: 7 },
    anunciante: { id: 8 },
  };
  const repo = {
    buscarPorIdConBloqueo: async () => reclamo,
    buscarPorId: async () => reclamo,
    guardar: async (actual) => actual,
  };
  const uow = {
    ejecutar: async (operacion) => operacion({ reclamos: repo, reservas: {} }),
  };
  const service = new ReclamosService(
    repo,
    {},
    {},
    {},
    {},
    {},
    {},
    uow,
  );

  const cerrado = await service.cerrar(1, 99);

  assert.equal(cerrado.estado, 'CERRADO');
});
