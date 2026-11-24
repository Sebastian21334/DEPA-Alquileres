const path = require('node:path');
const { Client } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '..', '.env'), quiet: true });

async function main() {
  if (!process.env.DATABASE_URL) throw new Error('Falta DATABASE_URL en back/.env');
  const url = new URL(process.env.DATABASE_URL);
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
  if (!local) for (const key of ['sslmode', 'ssl', 'sslnegotiation', 'uselibpqcompat']) url.searchParams.delete(key);
  const client = new Client({ connectionString: url.toString(), connectionTimeoutMillis: 10000, ...(!local ? { ssl: { rejectUnauthorized: true } } : {}) });
  await client.connect();
  try {
    const ciudades = await client.query(`SELECT c.nombre AS ciudad, pr.nombre AS provincia, count(*)::int AS cantidad
      FROM publicacion p LEFT JOIN ciudad c ON c.id_ciudad = p.id_ciudad
      LEFT JOIN provincia pr ON pr.id_provincia = p.id_provincia
      WHERE p.latitud IS NULL OR p.longitud IS NULL GROUP BY c.nombre, pr.nombre ORDER BY cantidad DESC LIMIT 30`);
    const muestra = await client.query(`SELECT p.id_publicacion, p.titulo, p.direccion, c.nombre AS ciudad,
      t.nombre AS tipo, p.activa FROM publicacion p
      LEFT JOIN ciudad c ON c.id_ciudad = p.id_ciudad
      LEFT JOIN tipo_propiedad t ON t.id_tipo_propiedad = p.id_tipo_propiedad
      WHERE p.latitud IS NULL OR p.longitud IS NULL ORDER BY p.id_publicacion LIMIT 20`);
    console.log('CIUDADES SIN COORDENADAS'); console.table(ciudades.rows);
    console.log('MUESTRA DE PUBLICACIONES SIN COORDENADAS'); console.table(muestra.rows);
    const catalogo = await client.query(`SELECT pr.nombre AS provincia, c.nombre AS ciudad FROM ciudad c JOIN provincia pr ON pr.id_provincia = c.id_provincia ORDER BY pr.nombre, c.nombre`);
    console.log('CATÁLOGO DE CIUDADES'); console.table(catalogo.rows);
  } finally { await client.end(); }
}
main().catch(error => { console.error('No se pudo consultar:', error.code || error.message); process.exitCode = 1; });
