// Consulta las mismas direcciones del selector Leaflet, sin publicar ni modificar cuentas.
require('reflect-metadata');
const fs = require('node:fs');
const path = require('node:path');
const { UbicacionService } = require('../dist/ubicacion/service/ubicacion.service.js');
const base = path.resolve(__dirname, '../../datos/publicaciones-ejemplo');
const config = JSON.parse(fs.readFileSync(path.join(base, 'lote-villa-maria-la-paz.json'), 'utf8'));
const servicio = new UbicacionService(null);
const salida = path.join(base, 'villa-maria-la-paz/ubicaciones-encontradas.json');
const soloIndex = process.argv.indexOf('--solo');
const seleccionadas = soloIndex < 0 ? null : new Set(process.argv[soloIndex + 1].split(','));

(async () => {
  const resultados = seleccionadas && fs.existsSync(salida) ? JSON.parse(fs.readFileSync(salida, 'utf8')) : [];
  for (const grupo of config.grupos) {
    if (seleccionadas && !seleccionadas.has(grupo.clave)) continue;
    const puntos = await servicio.buscarDireccion(grupo.direccion, grupo.ciudad, grupo.provincia);
    const entrada = { clave: grupo.clave, direccion: grupo.direccion, ciudad: grupo.ciudad, provincia: grupo.provincia, puntos };
    const indice = resultados.findIndex(r => r.clave === grupo.clave);
    if (indice < 0) resultados.push(entrada);
    else resultados[indice] = entrada;
    fs.writeFileSync(salida, JSON.stringify(resultados, null, 2));
    console.log(JSON.stringify({ clave: grupo.clave, puntos }));
  }
})().catch(error => { console.error(`Búsqueda detenida: ${error.message}`); process.exitCode = 1; });
