const { AlmacenamientoService } = require('../../dist/almacenamiento/service/almacenamiento.service');

/** T44/T56: PDF mínimo que pasa la validación por firma de bytes. */
function comprobantePdf(nombre = 'transferencia.pdf') {
  const buffer = Buffer.from('%PDF-1.7 comprobante de prueba');
  return { buffer, size: buffer.length, originalname: nombre, mimetype: 'application/pdf' };
}

/** Almacenamiento privado en memoria: registra qué se subió y qué se borró. */
function almacenamientoDePrueba() {
  const archivos = { subidos: [], borrados: [] };
  const almacenamiento = new AlmacenamientoService({
    subir: async (_contenedor, nombre) => { archivos.subidos.push(nombre); return `https://privado.example/${nombre}`; },
    firmarArchivo: async (_contenedor, url) => `${url}?firmado`,
    eliminarArchivo: async (_contenedor, url) => { archivos.borrados.push(url); },
  });
  return { almacenamiento, archivos };
}

/** T49: imagen PNG mínima, real, para las imágenes de los reclamos (pasa por sharp). */
async function imagenPng(nombre = 'foto.png') {
  const sharp = require('sharp');
  const buffer = await sharp({ create: { width: 4, height: 4, channels: 3, background: '#ffffff' } }).png().toBuffer();
  return { buffer, size: buffer.length, originalname: nombre, mimetype: 'image/png' };
}

module.exports = { comprobantePdf, almacenamientoDePrueba, imagenPng };
