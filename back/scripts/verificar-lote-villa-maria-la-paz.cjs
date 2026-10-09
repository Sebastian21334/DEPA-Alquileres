// Comprobación de la carga autorizada por API pública y de sus imágenes almacenadas.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '../..');
const base = path.join(root, 'datos/publicaciones-ejemplo');
const salida = path.join(base, 'villa-maria-la-paz');
const leer = archivo => JSON.parse(fs.readFileSync(archivo, 'utf8'));
const config = leer(path.join(base, 'lote-villa-maria-la-paz.json'));

async function get(ruta) {
  const respuesta = await fetch(`http://localhost:3000${ruta}`, { signal: AbortSignal.timeout(30000) });
  assert.equal(respuesta.status, 200, `API: ${ruta}`);
  return respuesta.json();
}

function resumen(p) {
  return {
    id: p.id, titulo: p.titulo, descripcion: p.descripcion, precio: Number(p.precio),
    activa: p.activa, direccion: p.direccion, latitud: p.latitud, longitud: p.longitud,
    ambientes: p.cantidad_ambientes, superficie: Number(p.superficie),
    modalidad: p.modalidad.nombre, tipo: p.tipoPropiedad.nombre,
    ciudad: p.ciudad.nombre, provincia: p.provincia.nombre,
    idCiudad: p.ciudad.id, idProvincia: p.provincia.id,
    imagenes: p.imagenes.map(i => ({ id: i.id, url: i.url })),
  };
}

async function main() {
  const listado = await get('/publicaciones?limite=50');
  const anterior = leer(path.join(base, 'carga-2026-10-09.json'));
  const previas = await Promise.all(anterior.publicaciones.map(async entrada => ({
    ...resumen(await get(`/publicaciones/${entrada.id}`)),
    fechas: await get(`/disponibilidad/publicacion/${entrada.id}`),
  })));
  const antesPath = path.join(salida, 'estado-anterior.json');
  if (process.argv.includes('--antes')) {
    assert.equal(listado.total, 6);
    fs.mkdirSync(salida, { recursive: true });
    if (!fs.existsSync(antesPath)) fs.writeFileSync(antesPath, JSON.stringify({ total: listado.total, publicaciones: previas }, null, 2));
    console.log(JSON.stringify({ fase: 'estado-anterior', anuncios: previas.length, imagenes: previas.reduce((n, p) => n + p.imagenes.length, 0) }));
    return;
  }
  const antes = leer(antesPath);
  assert.deepEqual(previas, antes.publicaciones, 'Las publicaciones anteriores deben conservar sus datos y galerías');
  const manifest = leer(path.join(salida, 'carga-2026-10-09.json'));
  const cobertura = leer(path.join(root, 'datos/georef/cobertura.json'));
  assert.equal(manifest.publicaciones.length, 8);
  assert.equal(listado.total, antes.total + 8);
  const hashes = new Set(anterior.publicaciones.flatMap(p => p.imagenes.map(i => i.sha256)));
  const esperadas = [];
  for (let d = new Date('2026-10-10T00:00:00Z'); d <= new Date('2027-01-31T00:00:00Z'); d.setUTCDate(d.getUTCDate() + 1)) esperadas.push(d.toISOString().slice(0, 10));
  const nuevas = [];
  for (const grupo of config.grupos) {
    const entrada = manifest.publicaciones.find(p => p.titulo === grupo.titulo);
    assert.ok(entrada, grupo.titulo);
    const pub = await get(`/publicaciones/${entrada.id}`);
    const lugar = cobertura.find(c => c.nombre === grupo.ciudad && c.provincia === grupo.provincia);
    assert.equal(pub.activa, true);
    assert.equal(pub.direccion, grupo.direccion);
    assert.equal(pub.anunciante.idUsuario, manifest.usuarioId);
    assert.equal(pub.modalidad.nombre, grupo.temporal ? 'Temporal' : 'Largo Plazo');
    assert.equal(pub.modalidad.permite_reservas_por_fecha, grupo.temporal);
    assert.equal(pub.tipoPropiedad.nombre, grupo.tipo);
    assert.equal(pub.ciudad.id, lugar.idCiudad);
    assert.equal(pub.provincia.id, lugar.idProvincia);
    assert.equal(Number(pub.latitud), grupo.ubicacion.latitud);
    assert.equal(Number(pub.longitud), grupo.ubicacion.longitud);
    assert.equal(entrada.ubicacion.confirmadaEnLeaflet, true);
    assert.equal(pub.tipoMoneda.nombre, 'Peso (ARS)');
    assert.equal(Number(pub.precio), grupo.temporal ? grupo.diario : grupo.mensual);
    assert.equal(pub.imagenes.length, grupo.fotos.length);
    assert.deepEqual(pub.imagenes.map(i => i.id), entrada.imagenes.map(i => i.id));
    assert.ok(!/ejemplo|temporal|largo plazo/i.test(pub.titulo));
    const galeria = await get(`/imagenes/publicacion/${entrada.id}`);
    assert.deepEqual(galeria.map(i => i.id), pub.imagenes.map(i => i.id));
    const fechas = await get(`/disponibilidad/publicacion/${entrada.id}`);
    if (grupo.temporal) {
      assert.deepEqual(fechas.map(f => f.fecha).sort(), esperadas);
      assert.ok(fechas.every(f => f.disponible));
    } else assert.equal(fechas.length, 0);
    for (const foto of entrada.imagenes) {
      assert.ok(!hashes.has(foto.sha256), 'Cada foto debe pertenecer a una única galería');
      hashes.add(foto.sha256);
    }
    nuevas.push({ ...resumen(pub), diasDisponibles: fechas.length });
  }
  const fotos = manifest.publicaciones.flatMap(p => p.imagenes);
  assert.equal(new Set(nuevas.map(p => `${p.latitud},${p.longitud}`)).size, 8, 'Cada inmueble tiene su propio marcador');
  assert.equal(fotos.length, 34);
  for (let indice = 0; indice < fotos.length; indice += 6) {
    await Promise.all(fotos.slice(indice, indice + 6).map(async foto => {
      const r = await fetch(foto.url, { method: 'HEAD', signal: AbortSignal.timeout(30000) });
      assert.equal(r.status, 200, `Imagen ${foto.id}`);
      assert.ok(r.headers.get('content-type')?.startsWith('image/'));
    }));
  }
  const comprobacion = {
    totalActivas: listado.total, nuevas: nuevas.length, fotos: fotos.length,
    temporales: nuevas.filter(p => p.modalidad === 'Temporal').length,
    largoPlazo: nuevas.filter(p => p.modalidad === 'Largo Plazo').length,
    anunciosAnterioresConservados: previas.length, imagenesAccesibles: fotos.length,
    ubicacionesConfirmadasEnLeaflet: nuevas.length,
    publicaciones: nuevas,
  };
  fs.writeFileSync(path.join(salida, 'verificacion.json'), JSON.stringify(comprobacion, null, 2));
  console.log(JSON.stringify({ ...comprobacion, publicaciones: nuevas.map(p => ({ id: p.id, titulo: p.titulo, ciudad: p.ciudad, provincia: p.provincia, modalidad: p.modalidad, fotos: p.imagenes.length })) }, null, 2));
}

main().catch(error => { console.error(`Verificación detenida: ${error.message}`); process.exitCode = 1; });
