const fs = require('node:fs');
const path = require('node:path');
const { Client } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '..', '.env'), quiet: true });

const out = path.join(__dirname, '..', '..', 'datos', 'georef');
const normalizar = s => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').trim().toLocaleLowerCase('es-AR').replace(/\s+/g, ' ');
async function descargar(recurso) {
  const archivo = path.join(out, `${recurso}.json`);
  if (fs.existsSync(archivo)) return JSON.parse(fs.readFileSync(archivo, 'utf8'));
  const url = `https://apis.datos.gob.ar/georef/api/v2.0/${recurso}.json`;
  const res = await fetch(url, { signal: AbortSignal.timeout(60000) });
  if (!res.ok) throw new Error(`${recurso}: HTTP ${res.status}`);
  const data = await res.json();
  fs.writeFileSync(archivo, JSON.stringify(data));
  return data;
}
async function main() {
  fs.mkdirSync(out, { recursive: true });
  const [p, l] = await Promise.all([descargar('provincias'), descargar('localidades')]);
  const provincias = p.provincias;
  const localidades = l.localidades;
  if (!Array.isArray(provincias) || provincias.length !== 24 || !Array.isArray(localidades) || localidades.length < 3000) throw new Error('Fuente incompleta o formato inesperado');
  console.log(JSON.stringify({ provincias: provincias.length, localidades: localidades.length, muestra: localidades.slice(0, 2) }));
  const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();
  try {
    const existingP = (await client.query('SELECT * FROM provincia ORDER BY id_provincia')).rows;
    const existingC = (await client.query('SELECT * FROM ciudad ORDER BY id_ciudad')).rows;
    console.log(JSON.stringify({ provinciasExistentes: existingP.length, ciudadesExistentes: existingC.length }));
    if (!process.argv.includes('--aplicar')) return;
    const tablas = ['rol', 'tipo_anunciante', 'tipo_propiedad', 'modalidad', 'tipo_moneda'];
    const backup = { provincia: existingP, ciudad: existingC };
    for (const tabla of tablas) backup[tabla] = (await client.query(`SELECT * FROM ${tabla}`)).rows;
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    fs.writeFileSync(path.join(out, `respaldo-${stamp}.json`), JSON.stringify(backup, null, 2));

    // El esquema sólo dispone de nombre y provincia: se agrupan las entradas
    // simples y componentes con el mismo nombre y departamento. Los homónimos
    // en departamentos distintos conservan un nombre visible diferenciado.
    const grupos = new Map();
    for (const l of localidades) {
      if (!provincias.some(p => p.id === l.provincia.id)) throw new Error('Provincia desconocida en la fuente');
      const key = `${l.provincia.id}|${l.departamento.id}|${normalizar(l.nombre)}`;
      if (!grupos.has(key)) grupos.set(key, { ...l, idsFuente: [] });
      grupos.get(key).idsFuente.push(l.id);
    }
    const porNombre = new Map();
    for (const l of grupos.values()) {
      const key = `${l.provincia.id}|${normalizar(l.nombre)}`;
      porNombre.set(key, (porNombre.get(key) || 0) + 1);
    }
    const localidadesImportadas = [];
    let provinciasNuevas = 0, ciudadesNuevas = 0, nombresActualizados = 0;
    await client.query('BEGIN');
    try {
      await client.query('LOCK TABLE provincia, ciudad IN SHARE ROW EXCLUSIVE MODE');
      const mapaP = new Map();
      for (const p of provincias.sort((a,b) => a.nombre.localeCompare(b.nombre, 'es'))) {
        const coincidencias = existingP.filter(x => normalizar(x.nombre) === normalizar(p.nombre));
        if (coincidencias.length > 1) throw new Error(`Provincia duplicada existente: ${p.nombre}`);
        let fila = coincidencias[0];
        if (fila) {
          if (fila.nombre !== p.nombre) { await client.query('UPDATE provincia SET nombre=$1 WHERE id_provincia=$2', [p.nombre, fila.id_provincia]); nombresActualizados++; }
        } else {
          fila = (await client.query('INSERT INTO provincia(nombre) VALUES($1) RETURNING *', [p.nombre])).rows[0];
          provinciasNuevas++;
        }
        mapaP.set(p.id, fila.id_provincia);
      }
      const pendientes = [];
      for (const l of grupos.values()) {
        const idProvincia = mapaP.get(l.provincia.id);
        const homonimo = porNombre.get(`${l.provincia.id}|${normalizar(l.nombre)}`) > 1;
        const nombre = homonimo ? `${l.nombre} (${l.departamento.nombre})` : l.nombre;
        if (nombre.length > 100) throw new Error(`Nombre demasiado largo: ${nombre}`);
        const coincidencias = existingC.filter(c => c.id_provincia === idProvincia && normalizar(c.nombre) === normalizar(nombre));
        if (coincidencias.length > 1) throw new Error(`Ciudad duplicada existente: ${nombre}`);
        const existente = coincidencias[0];
        if (existente && existente.nombre !== nombre) {
          await client.query('UPDATE ciudad SET nombre=$1 WHERE id_ciudad=$2', [nombre, existente.id_ciudad]);
          nombresActualizados++;
        }
        if (!existente) pendientes.push({ nombre, idProvincia });
        localidadesImportadas.push({ nombre, provincia: l.provincia.nombre, idProvincia, departamento: l.departamento.nombre, idsGeoref: l.idsFuente });
      }
      for (let i = 0; i < pendientes.length; i += 500) {
        const lote = pendientes.slice(i, i + 500);
        await client.query('INSERT INTO ciudad(nombre, id_provincia) SELECT nombre, "idProvincia" FROM jsonb_to_recordset($1::jsonb) AS x(nombre text, "idProvincia" integer)', [JSON.stringify(lote)]);
        ciudadesNuevas += lote.length;
      }
      const catalogos = {
        rol: [['Administrador','Administra usuarios, verificaciones y catálogos del sistema.'],['Inquilino','Busca propiedades y gestiona sus reservas.']],
        tipo_anunciante: [['Particular','Persona que publica propiedades de forma particular.'],['Inmobiliaria','Empresa o profesional inmobiliario que publica propiedades.']],
        tipo_propiedad: [
          ['Departamento','Unidad independiente dentro de un edificio.'],['Casa','Vivienda independiente.'],['PH','Unidad de vivienda en propiedad horizontal.'],['Dúplex','Vivienda distribuida en dos plantas.'],['Cabaña','Vivienda turística o de descanso.'],['Quinta','Propiedad con vivienda y espacio verde.'],['Local comercial','Inmueble destinado a una actividad comercial.'],['Oficina','Espacio para actividades profesionales o administrativas.'],['Galpón','Inmueble para almacenamiento o actividades productivas.'],['Cochera','Espacio destinado al estacionamiento de vehículos.'],['Terreno','Parcela sin edificación para el uso acordado en el alquiler.']
        ],
        modalidad: [['Temporal','Alquiler por fechas con disponibilidad y reserva.',true],['Largo Plazo','Alquiler estable con condiciones acordadas con el anunciante.',false]],
        tipo_moneda: [['Peso (ARS)','Peso argentino.'],['Dólar (USD)','Dólar estadounidense.']]
      };
      const aliases = { tipo_moneda: {'Dólar (USD)':'dolar (usd)'} };
      const cambiosCatalogos = {};
      for (const [tabla, items] of Object.entries(catalogos)) {
        cambiosCatalogos[tabla] = { creados:0, completados:0 };
        for (const [nombre, descripcion, porFecha] of items) {
          const match = backup[tabla].find(x => normalizar(x.nombre) === normalizar(nombre) || normalizar(x.nombre) === aliases[tabla]?.[nombre]);
          if (match) {
            const idColumn = `id_${tabla}`;
            if (tabla === 'modalidad') await client.query(`UPDATE ${tabla} SET nombre=$1, descripcion=$2, permite_reservas_por_fecha=$3 WHERE ${idColumn}=$4`, [nombre, descripcion, porFecha, match[idColumn]]);
            else await client.query(`UPDATE ${tabla} SET nombre=$1, descripcion=$2 WHERE ${idColumn}=$3`, [nombre, descripcion, match[idColumn]]);
            cambiosCatalogos[tabla].completados++;
          } else {
            if (tabla === 'modalidad') await client.query('INSERT INTO modalidad(nombre,descripcion,permite_reservas_por_fecha) VALUES($1,$2,$3)', [nombre, descripcion, porFecha]);
            else await client.query(`INSERT INTO ${tabla}(nombre,descripcion) VALUES($1,$2)`, [nombre, descripcion]);
            cambiosCatalogos[tabla].creados++;
          }
        }
      }
      const finalP = (await client.query('SELECT * FROM provincia ORDER BY nombre')).rows;
      const finalC = (await client.query('SELECT * FROM ciudad ORDER BY nombre')).rows;
      const ciudadesPorClave = new Map(finalC.map(c => [`${c.id_provincia}|${normalizar(c.nombre)}`, c]));
      if (ciudadesPorClave.size !== finalC.length) throw new Error('Se detectaron ciudades duplicadas');
      for (const l of localidadesImportadas) {
        const fila = ciudadesPorClave.get(`${l.idProvincia}|${normalizar(l.nombre)}`);
        if (!fila) throw new Error(`Localidad no importada: ${l.nombre}`);
        l.idCiudad = fila.id_ciudad;
      }
      if (localidadesImportadas.flatMap(x => x.idsGeoref).length !== localidades.length) throw new Error('Cobertura incompleta');
      const resumen = { fuente:'https://apis.datos.gob.ar/georef/api/v2.0/localidades.json', fecha:new Date().toISOString(), registrosFuente:localidades.length, provincias:finalP.length, ciudades:finalC.length, provinciasNuevas, ciudadesNuevas, nombresActualizados, entradasAgrupadas:localidades.length-grupos.size, cambiosCatalogos, porProvincia:finalP.map(p => ({nombre:p.nombre,localidades:finalC.filter(c => c.id_provincia===p.id_provincia).length})) };
      fs.writeFileSync(path.join(out, 'cobertura.json'), JSON.stringify(localidadesImportadas, null, 2));
      await client.query('COMMIT');
      fs.writeFileSync(path.join(out, 'resumen.json'), JSON.stringify(resumen, null, 2));
      console.log(JSON.stringify(resumen));
    } catch (e) { await client.query('ROLLBACK'); throw e; }
  } finally { await client.end(); }
}
main().catch(e => { console.error(e.message); process.exitCode = 1; });
