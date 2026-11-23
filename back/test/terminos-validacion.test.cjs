require('reflect-metadata');
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { ValidationPipe } = require('@nestjs/common');
const { RegisterDto } = require('../dist/auth/dto/register.dto');
const { SolicitarAnuncianteDto } = require('../dist/verificacion-anunciante/dto/solicitar-anunciante.dto');
const { CancelacionesService } = require('../dist/cancelaciones/service/cancelaciones.service');
const { fechaArgentina } = require('../dist/common/utils/fechas');

test('la validación de ambos formularios exige aceptación booleana expresa', async () => {
  const pipe = new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true });
  const casos = [
    [RegisterDto, { nombre: 'Juan', apellido: 'Perez', email: 'juan@example.com', telefono: '3511234567', contrasenia: 'ClaveSegura123!' }],
    [SolicitarAnuncianteDto, { cuit: '20123456789', numero_contacto: '3511234567', cbu: '1234567890123456789012', titularidad_declarada: true, idTipoAnunciante: 1 }],
  ];
  for (const [metatype, datos] of casos) {
    for (const aceptaTerminos of [undefined, false, 'true', 1]) {
      await assert.rejects(pipe.transform({ ...datos, aceptaTerminos }, { type: 'body', metatype }), (error) => {
        assert.equal(error.getStatus(), 400);
        assert.ok(error.getResponse().message.some((mensaje) => mensaje.includes('términos')));
        return true;
      });
    }
    const resultado = await pipe.transform({ ...datos, aceptaTerminos: true }, { type: 'body', metatype });
    assert.equal(resultado.aceptaTerminos, true);
  }
});

test('la política pública consulta la versión vigente y no inventa valores si falta', async () => {
  let politica = { vigenteDesde: '2020-01-01', diasDevolucionTotal: 7, porcentajeTotal: 100 };
  let fechaConsultada;
  const servicio = new CancelacionesService({ buscarPolitica: async (fecha) => { fechaConsultada = fecha; return politica; } }, {}, {}, {});
  assert.deepEqual(await servicio.obtenerPoliticaVigente(), politica);
  assert.equal(fechaConsultada, fechaArgentina());
  politica = { ...politica, porcentajeTotal: 80 };
  assert.equal((await servicio.obtenerPoliticaVigente()).porcentajeTotal, 80);
  politica = null;
  await assert.rejects(servicio.obtenerPoliticaVigente(), (error) => error.getStatus() === 500);
});
