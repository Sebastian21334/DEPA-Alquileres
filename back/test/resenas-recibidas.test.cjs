require('reflect-metadata');
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { GUARDS_METADATA } = require('@nestjs/common/constants');
const { JwtAuthGuard } = require('../dist/seguridad/guards/jwt-auth.guard');
const { ResenasController } = require('../dist/resenas/controller/resenas.controller');
const { ResenasService } = require('../dist/resenas/service/resenas.service');

test('las reseñas recibidas se cruzan por huésped y objetivo solo para reservas finalizadas', async () => {
  const reserva = (id, autor, publicacion, estado = 'FINALIZADA', cancelada = false) => ({ id, usuario: { id: autor }, publicacion: { id: publicacion }, estado_estadia: estado, cancelada });
  let anuncianteConsultado;
  const reservas = { listarRecibidasPorAnunciante: async (id) => { anuncianteConsultado = id; return [reserva(1, 10, 20), reserva(2, 11, 20), reserva(3, 10, 21), reserva(4, 10, 20, 'CONFIRMADA'), reserva(5, 10, 20, 'FINALIZADA', true)]; } };
  const repo = { buscarVisiblesRecibidas: async (id, autores, publicaciones) => {
    assert.equal(id, 8);
    assert.deepEqual(autores, [10, 11]);
    assert.deepEqual(publicaciones, [20, 21]);
    return [{ autor: 10, publicacion: 20, anunciante: null }, { autor: 11, publicacion: null, anunciante: 8 }];
  } };
  const service = new ResenasService(repo, {}, {}, reservas, {}, {});
  assert.deepEqual(await service.estadosRecibidosPorReserva(8), {
    1: { publicacion: true, anunciante: false },
    2: { publicacion: false, anunciante: true },
    3: { publicacion: false, anunciante: false },
  });
  assert.equal(anuncianteConsultado, 8);
});

test('el endpoint exige sesión y toma el anunciante de la sesión', async () => {
  assert.ok(Reflect.getMetadata(GUARDS_METADATA, ResenasController.prototype.estadosRecibidosPorReserva).includes(JwtAuthGuard));
  const controller = new ResenasController({ estadosRecibidosPorReserva: async (id) => ({ id }) }, {});
  assert.deepEqual(await controller.estadosRecibidosPorReserva({ user: { id: 8 } }), { id: 8 });
});
