// Datos simulados exclusivamente para la presentación. No representan domicilios reales.
const fs = require('node:fs');
const path = require('node:path');
const { Client } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '..', '.env'), quiet: true });

const destinos = [
  ['Córdoba', 'Córdoba', -31.4167, -64.1833], ['Villa María', 'Córdoba', -32.4075, -63.2402],
  ['Río Cuarto', 'Córdoba', -33.1307, -64.3499], ['Santa Fe', 'Santa Fe', -31.6333, -60.7000],
  ['Rosario', 'Santa Fe', -32.9442, -60.6505], ['Mar del Plata', 'Buenos Aires', -38.0055, -57.5426],
  ['La Plata', 'Buenos Aires', -34.9214, -57.9544], ['Mendoza', 'Mendoza', -32.8895, -68.8458],
  ['Salta', 'Salta', -24.7821, -65.4232], ['San Miguel de Tucumán', 'Tucumán', -26.8083, -65.2176],
  ['Neuquén', 'Neuquén', -38.9516, -68.0591], ['Posadas', 'Misiones', -27.3621, -55.9009],
  ['Corrientes', 'Corrientes', -27.4692, -58.8306], ['Paraná', 'Entre Ríos', -31.7319, -60.5238],
  ['San Juan', 'San Juan', -31.5375, -68.5364], ['San Luis', 'San Luis', -33.2950, -66.3356],
  ['Resistencia', 'Chaco', -27.4514, -58.9867], ['Formosa', 'Formosa', -26.1852, -58.1757],
  ['San Salvador de Jujuy', 'Jujuy', -24.1858, -65.2995], ['San Carlos de Bariloche', 'Río Negro', -41.1335, -71.3103],
  ['Ushuaia', 'Tierra del Fuego', -54.8019, -68.3030], ['Río Gallegos', 'Santa Cruz', -51.6230, -69.2168],
  ['Trelew', 'Chubut', -43.2489, -65.3051], ['Santa Rosa', 'La Pampa', -36.6167, -64.2833],
  ['Santiago del Estero', 'Santiago del Estero', -27.7833, -64.2667], ['La Rioja', 'La Rioja', -29.4131, -66.8558],
  ['San Fernando del Valle de Catamarca', 'Catamarca', -28.4696, -65.7852],
];

async function main() {
  if (!process.env.DATABASE_URL) throw new Error('Falta DATABASE_URL en back/.env');
  const url = new URL(process.env.DATABASE_URL);
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
  if (!local) for (const key of ['sslmode', 'ssl', 'sslnegotiation', 'uselibpqcompat']) url.searchParams.delete(key);
  const client = new Client({ connectionString: url.toString(), connectionTimeoutMillis: 10000, ...(!local ? { ssl: { rejectUnauthorized: true } } : {}) });
  await client.connect();
  try {
    await client.query('BEGIN');
    const result = await client.query(`SELECT p.id_publicacion, p.titulo, p.direccion, p.latitud, p.longitud, p.id_ciudad, p.id_provincia,
      c.nombre AS ciudad, t.nombre AS tipo FROM publicacion p
      JOIN ciudad c ON c.id_ciudad = p.id_ciudad JOIN tipo_propiedad t ON t.id_tipo_propiedad = p.id_tipo_propiedad
      WHERE p.titulo LIKE '[RNF8 %' AND p.direccion LIKE 'Domicilio ficticio RNF8 %'
      AND (p.latitud IS NULL OR p.longitud IS NULL) ORDER BY p.id_publicacion FOR UPDATE OF p`);
    const pendientes = result.rows;
    const catalogo = await client.query('SELECT c.id_ciudad, c.nombre AS ciudad, pr.id_provincia, pr.nombre AS provincia FROM ciudad c JOIN provincia pr ON pr.id_provincia=c.id_provincia');
    const normalizar = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
    const disponibles = destinos.flatMap(([ciudad, provincia, lat, lon]) => {
      const coincidencias = catalogo.rows.filter(r => normalizar(r.ciudad) === normalizar(ciudad) && normalizar(r.provincia) === normalizar(provincia));
      return coincidencias.length === 1 ? [{ ...coincidencias[0], lat, lon }] : [];
    });
    if (!disponibles.length) throw new Error('No se encontraron ciudades del catálogo para distribuir las publicaciones.');
    if (!pendientes.length) { await client.query('ROLLBACK'); console.log('No hay publicaciones RNF8 elegibles para actualizar.'); return; }
    const carpeta = path.join(__dirname, '..', '.tmp');
    fs.mkdirSync(carpeta, { recursive: true });
    const backup = path.join(carpeta, `respaldo-mapa-rnf8-${Date.now()}.json`);
    fs.writeFileSync(backup, JSON.stringify(pendientes, null, 2), { flag: 'wx' });
    const calificativos = ['para alquilar', 'en alquiler', 'disponible para alquilar', 'en zona residencial'];
    const porCiudad = new Map();
    for (const [indice, fila] of pendientes.entries()) {
      const destino = disponibles[indice % disponibles.length];
      const n = porCiudad.get(destino.ciudad) || 0;
      porCiudad.set(destino.ciudad, n + 1);
      const { lat, lon } = destino;
      // Distribución aproximada en una grilla; dirección y punto son ficticios.
      const latitud = lat + (Math.floor(n / 13) - 5) * 0.003;
      const longitud = lon + ((n % 13) - 6) * 0.003;
      const tipo = fila.tipo === 'Quintasadas' ? 'Quinta' : fila.tipo;
      const titulo = `${tipo} ${calificativos[n % calificativos.length]} en ${destino.ciudad}`;
      const direccion = `Ubicación simulada ${n + 1} (solo demostración)`;
      await client.query('UPDATE publicacion SET titulo=$1, direccion=$2, latitud=$3, longitud=$4, id_ciudad=$5, id_provincia=$6 WHERE id_publicacion=$7',
        [titulo, direccion, latitud.toFixed(7), longitud.toFixed(7), destino.id_ciudad, destino.id_provincia, fila.id_publicacion]);
    }
    await client.query('COMMIT');
    console.log(`Actualizadas: ${pendientes.length}. Ciudades usadas: ${disponibles.length}.`);
    console.table([...porCiudad].map(([ciudad, cantidad]) => ({ ciudad, cantidad })));
    console.log(`Respaldo de datos anteriores: ${backup}`);
    console.log('Las direcciones y coordenadas son simuladas para la presentación.');
  } catch (error) { await client.query('ROLLBACK'); throw error; }
  finally { await client.end(); }
}
main().catch(error => { console.error('No se pudo actualizar:', error.code || error.message); process.exitCode = 1; });
