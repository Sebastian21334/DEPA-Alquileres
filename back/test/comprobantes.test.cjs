require('reflect-metadata');
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { AlmacenamientoService, MAX_BYTES_COMPROBANTE } = require('../dist/almacenamiento/service/almacenamiento.service');

// T04: comprobantes privados (PDF, JPG o PNG de hasta 5 MB).
function servicio() {
  const subidos = [];
  const repo = {
    subir: async (contenedor, nombre, contenido, tipo) => {
      subidos.push({ contenedor, nombre, contenido, tipo });
      return `https://almacenamiento.example/${contenedor}/${nombre}`;
    },
    firmarArchivo: async (contenedor, url) => `${url}?firma&contenedor=${contenedor}`,
    eliminarArchivo: async () => {},
  };
  return { almacenamiento: new AlmacenamientoService(repo), subidos };
}

const archivo = (bytes, extra = {}) => {
  const buffer = Buffer.concat([Buffer.from(bytes), Buffer.alloc(32)]);
  return { buffer, size: buffer.length, originalname: 'comprobante.pdf', mimetype: 'application/pdf', ...extra };
};
const PDF = [...Buffer.from('%PDF-1.7')];
const JPG = [0xff, 0xd8, 0xff, 0xe0];
const PNG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

const rechaza = (promesa, mensaje) => assert.rejects(promesa, (error) => {
  assert.equal(error.getStatus(), 400);
  assert.match(error.message, mensaje);
  return true;
});

test('T04: acepta PDF, JPG y PNG por su contenido y los guarda en la carpeta privada', async () => {
  const { almacenamiento, subidos } = servicio();
  const pdf = await almacenamiento.subirComprobante('reembolsos/12', archivo(PDF, { originalname: 'transferencia.pdf' }));
  assert.equal(pdf.tipo, 'application/pdf');
  assert.equal(pdf.nombre, 'transferencia.pdf');
  assert.match(subidos[0].nombre, /^comprobantes\/reembolsos\/12\/[0-9a-f-]{36}\.pdf$/);
  assert.equal(subidos[0].contenedor, 'reclamos');

  // El tipo sale del contenido, aunque el navegador declare otro.
  assert.equal((await almacenamiento.subirComprobante('pagos/3', archivo(JPG, { mimetype: 'application/octet-stream' }))).tipo, 'image/jpeg');
  assert.equal((await almacenamiento.subirComprobante('pagos/3', archivo(PNG, { originalname: '' }))).nombre, 'comprobante.png');
  assert.match(subidos[2].nombre, /\.png$/);
});

test('T04: rechaza archivos que no son comprobantes válidos o superan los 5 MB', async () => {
  const { almacenamiento, subidos } = servicio();
  await rechaza(almacenamiento.subirComprobante('reembolsos/1', undefined), /Adjuntá el comprobante/);
  await rechaza(almacenamiento.subirComprobante('reembolsos/1', archivo([...Buffer.from('no soy un PDF')])), /PDF, JPG o PNG válido/);
  await rechaza(almacenamiento.subirComprobante('reembolsos/1', archivo([...Buffer.from('GIF89a')], { mimetype: 'image/gif' })), /PDF, JPG o PNG válido/);
  const grande = Buffer.concat([Buffer.from(PDF), Buffer.alloc(MAX_BYTES_COMPROBANTE)]);
  await rechaza(almacenamiento.subirComprobante('reembolsos/1', { buffer: grande, size: grande.length, originalname: 'g.pdf' }), /hasta 5 MB/);
  assert.equal(subidos.length, 0);
});

test('T04: la carpeta la define el código y el nombre visible se limpia', async () => {
  const { almacenamiento } = servicio();
  await assert.rejects(almacenamiento.subirComprobante('../otro', archivo(PDF)), /Carpeta de comprobantes inválida/);
  const subido = await almacenamiento.subirComprobante('pagos/7', archivo(PDF, { originalname: '..\\banco:/comprobante?.pdf' }));
  assert.equal(subido.nombre, '..bancocomprobante.pdf');
  assert.match(await almacenamiento.firmarComprobante(subido.url), /contenedor=reclamos$/);
});

test('T44/T56: la migración del comprobante del reembolso conserva los datos y se puede repetir', async () => {
  const { PGlite } = require('@electric-sql/pglite');
  const { readFileSync } = require('node:fs');
  const migracion = readFileSync('migrations/20261123-comprobante-reembolso.sql', 'utf8');
  const db = new PGlite();
  try {
    // Base con la versión anterior: un reembolso existente y las columnas de T44 ya agregadas.
    await db.exec(`CREATE TABLE reembolso (id integer primary key, motivo varchar(500) NOT NULL);
      INSERT INTO reembolso VALUES (1, 'Cancelación');
      ALTER TABLE reembolso ADD COLUMN comprobante_url varchar(1000), ADD COLUMN comprobante_nombre varchar(255);
      UPDATE reembolso SET comprobante_url = 'https://privado.example/a.pdf', comprobante_nombre = 'a.pdf';`);
    await db.exec(migracion);
    await db.exec(migracion);
    const { rows } = await db.query('SELECT motivo, comprobante_url, comprobante_nombre, observacion_transferencia FROM reembolso');
    assert.deepEqual(rows, [{
      motivo: 'Cancelación', comprobante_url: 'https://privado.example/a.pdf', comprobante_nombre: 'a.pdf', observacion_transferencia: null,
    }]);
    // Sin la versión de T44 aplicada, agrega las tres columnas de una vez.
    await db.exec('DROP TABLE reembolso; CREATE TABLE reembolso (id integer primary key); INSERT INTO reembolso VALUES (2);');
    await db.exec(migracion);
    const { rows: nueva } = await db.query('SELECT id, comprobante_url, comprobante_nombre, observacion_transferencia FROM reembolso');
    assert.deepEqual(nueva, [{ id: 2, comprobante_url: null, comprobante_nombre: null, observacion_transferencia: null }]);
  } finally {
    await db.close();
  }
});
