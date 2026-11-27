const path = require('node:path');
const { Client } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config({ path: path.join(__dirname, '..', '.env'), quiet: true });
const { cargarDatosBase } = require('./seed.cjs');

const DOMINIO_DEMO = '@depa.demo';
const PREFIJO_PUBLICACION = '[DEMO]';
const PASSWORD_DEMO = 'DepaDemo2026!';
const COSTO_BCRYPT = 12;

const USUARIOS = [
  { clave: 'inquilino', nombre: 'Lucía', apellido: 'Gómez', email: `demo.inquilino${DOMINIO_DEMO}`, telefono: '1145001001', rol: 'Inquilino' },
  { clave: 'huesped2', nombre: 'Martín', apellido: 'Pérez', email: `demo.huesped2${DOMINIO_DEMO}`, telefono: '1145001002', rol: 'Inquilino' },
  { clave: 'huesped3', nombre: 'Sofía', apellido: 'Rodríguez', email: `demo.huesped3${DOMINIO_DEMO}`, telefono: '1145001003', rol: 'Inquilino' },
  { clave: 'huesped4', nombre: 'Julián', apellido: 'Fernández', email: `demo.huesped4${DOMINIO_DEMO}`, telefono: '1145001004', rol: 'Inquilino' },
  { clave: 'huesped5', nombre: 'Valentina', apellido: 'López', email: `demo.huesped5${DOMINIO_DEMO}`, telefono: '1145001005', rol: 'Inquilino' },
  { clave: 'anunciante', nombre: 'Carlos', apellido: 'Domínguez', email: `demo.anunciante${DOMINIO_DEMO}`, telefono: '1145002001', rol: 'Inquilino' },
  { clave: 'inmobiliaria', nombre: 'María', apellido: 'Inmobiliaria', email: `demo.inmobiliaria${DOMINIO_DEMO}`, telefono: '1145002002', rol: 'Inquilino' },
  { clave: 'admin', nombre: 'Admin', apellido: 'DEPA', email: `demo.admin${DOMINIO_DEMO}`, telefono: '1145003001', rol: 'Administrador' },
];

const PUBLICACIONES = [
  {
    clave: 'palermo', titulo: `${PREFIJO_PUBLICACION} Departamento en Palermo`, anunciante: 'anunciante',
    modalidad: 'Temporal', tipoPropiedad: 'Departamento', ciudad: 'Palermo',
    descripcion: 'Departamento luminoso para alquiler temporal, a metros de Santa Fe y Scalabrini Ortiz. Incluye cocina equipada, wifi y ropa de cama.',
    precio: 48000, ambientes: 2, superficie: 55, direccion: 'Av. Santa Fe 3200',
    latitud: -34.5883, longitud: -58.4302,
    imagenes: ['https://picsum.photos/seed/depa-palermo-1/1200/800', 'https://picsum.photos/seed/depa-palermo-2/1200/800'],
  },
  {
    clave: 'belgrano', titulo: `${PREFIJO_PUBLICACION} Monoambiente en Belgrano`, anunciante: 'anunciante',
    modalidad: 'Temporal', tipoPropiedad: 'Departamento', ciudad: 'Belgrano',
    descripcion: 'Monoambiente completo y silencioso, ideal para una estadía corta. A dos cuadras de la estación de subte y del shopping.',
    precio: 39000, ambientes: 1, superficie: 32, direccion: 'Av. Cabildo 1800',
    latitud: -34.5621, longitud: -58.4567,
    imagenes: ['https://picsum.photos/seed/depa-belgrano-1/1200/800'],
  },
  {
    clave: 'villaCrespo', titulo: `${PREFIJO_PUBLICACION} Casa en Villa Crespo`, anunciante: 'inmobiliaria',
    modalidad: 'Largo Plazo', tipoPropiedad: 'Casa', ciudad: 'Villa Crespo',
    descripcion: 'Casa amplia con patio y parrilla para alquiler de largo plazo. Tres ambientes, cocina separada y espacio de trabajo.',
    precio: 420000, ambientes: 3, superficie: 90, direccion: 'Av. Corrientes 5200',
    latitud: -34.5995, longitud: -58.4472,
    imagenes: ['https://picsum.photos/seed/depa-villacrespo-1/1200/800'],
  },
  {
    clave: 'recoleta', titulo: `${PREFIJO_PUBLICACION} Loft en Recoleta`, anunciante: 'inmobiliaria',
    modalidad: 'Temporal', tipoPropiedad: 'Departamento', ciudad: 'Recoleta',
    descripcion: 'Loft moderno en el corazón de Recoleta, con balcón y vista abierta. Perfecto para viajes de trabajo o escapadas.',
    precio: 55000, ambientes: 2, superficie: 48, direccion: 'Av. Callao 1200',
    latitud: -34.5889, longitud: -58.3930,
    imagenes: ['https://picsum.photos/seed/depa-recoleta-1/1200/800'],
  },
];

const RESERVAS = [
  { huesped: 'huesped2', publicacion: 'palermo', inicio: -15, fin: -12, precio: 48000, codigo: 'DEMOA001' },
  { huesped: 'huesped3', publicacion: 'palermo', inicio: -12, fin: -9, precio: 48000, codigo: 'DEMOA002' },
  { huesped: 'huesped4', publicacion: 'palermo', inicio: -8, fin: -6, precio: 48000, codigo: 'DEMOA003' },
  { huesped: 'huesped5', publicacion: 'palermo', inicio: -7, fin: -4, precio: 48000, codigo: 'DEMOA004' },
  { huesped: 'huesped2', publicacion: 'recoleta', inicio: -18, fin: -15, precio: 55000, codigo: 'DEMOA005' },
  // Margen de dos días: la elegibilidad usa la fecha argentina y el seed corre en UTC.
  { huesped: 'inquilino', publicacion: 'belgrano', inicio: -6, fin: -3, precio: 39000, codigo: 'DEMOA006' },
  // Estadía temporal: habilita reseñar Recoleta y el perfil de la inmobiliaria.
  { huesped: 'inquilino', publicacion: 'recoleta', inicio: -5, fin: -2, precio: 55000, codigo: 'DEMOA007' },
  // Estadía de Largo Plazo: no habilita "Comentar" ni reseñar el perfil por sí sola.
  { huesped: 'inquilino', publicacion: 'villaCrespo', inicio: -9, fin: -6, precio: 14000, codigo: 'DEMOA008' },
];

const RESENAS = [
  {
    huesped: 'huesped2', publicacion: 'palermo', puntaje: 5, fecha: -12,
    comentario: 'Excelente ubicación y muy limpio. La comunicación con el anfitrión fue rápida y clara.',
    imagenes: ['https://picsum.photos/seed/depa-resena-palermo-1/900/600', 'https://picsum.photos/seed/depa-resena-palermo-2/900/600'],
  },
  {
    huesped: 'huesped3', publicacion: 'palermo', puntaje: 4, fecha: -9,
    comentario: 'Muy buena estadía. El departamento es tal cual las fotos; solo faltaba un poco de luz natural.',
  },
  {
    huesped: 'huesped4', publicacion: 'palermo', puntaje: 5, fecha: -6,
    comentario: 'Volvería sin dudarlo. Todo impecable y el barrio tiene de todo cerca.',
    imagenes: ['https://picsum.photos/seed/depa-resena-palermo-3/900/600'],
  },
  {
    huesped: 'huesped5', publicacion: 'palermo', puntaje: 1, fecha: -4,
    comentario: 'Comentario de prueba que el administrador oculta para verificar la moderación.',
    visible: false, motivo: 'Lenguaje ofensivo (demo)',
  },
  {
    huesped: 'huesped2', publicacion: 'recoleta', puntaje: 3, fecha: -15,
    comentario: 'Cumple, aunque el edificio tiene bastante ruido por la noche.',
    denunciada: true, motivoDenuncia: 'Denuncia de prueba para moderación',
    denunciadaPor: 'huesped4',
  },
  {
    huesped: 'huesped2', anunciante: 'anunciante', puntaje: 5, fecha: -11,
    comentario: 'Carlos respondió siempre rápido y nos ayudó con el check-in.',
    imagenes: ['https://picsum.photos/seed/depa-resena-anunciante-1/900/600'],
  },
  {
    huesped: 'huesped3', anunciante: 'anunciante', puntaje: 4, fecha: -8,
    comentario: 'Muy buena predisposición. El departamento estaba limpio y ordenado.',
  },
];

function fecha(dias) {
  const hoy = new Date();
  const dia = new Date(Date.UTC(hoy.getUTCFullYear(), hoy.getUTCMonth(), hoy.getUTCDate() + dias));
  return dia.toISOString().slice(0, 10);
}

function timestamp(dias) {
  return `${fecha(dias)}T15:00:00-03:00`;
}

async function main() {
  const argumentos = process.argv.slice(2);
  const aplicar = argumentos.includes('--aplicar');
  const limpiar = argumentos.includes('--limpiar');
  if (argumentos.some((arg) => !['--aplicar', '--limpiar'].includes(arg))) {
    throw new Error('Usar sin argumentos, --aplicar o --limpiar');
  }
  if (!process.env.DATABASE_URL) throw new Error('Falta DATABASE_URL');
  const url = new URL(process.env.DATABASE_URL);
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
  if (!local && process.env.DEPA_PERMITIR_DEMO_REMOTA !== 'si') {
    throw new Error('Los datos demo solo se aplican en una base local. Para una base remota, definir DEPA_PERMITIR_DEMO_REMOTA=si bajo confirmación explícita.');
  }
  const client = new Client({
    connectionString: url.toString(),
    connectionTimeoutMillis: 10000,
    ...(local ? {} : { ssl: { rejectUnauthorized: false } }),
  });
  await client.connect();
  try {
    if (!aplicar) {
      const { rows: [resumen] } = await client.query(`
        SELECT
          (SELECT count(*)::int FROM public.usuario WHERE email LIKE '%@depa.demo') AS usuarios_demo,
          (SELECT count(*)::int FROM public.publicacion WHERE titulo LIKE '[DEMO]%') AS publicaciones_demo,
          (SELECT count(*)::int FROM public.resena) AS resenas_totales
      `);
      console.log(JSON.stringify({ host: url.hostname, ...resumen,
        accion: limpiar ? 'limpiar sin guardar; usar --aplicar' : 'sin guardar; usar --aplicar' }, null, 2));
      return;
    }
    await cargarDatosBase(client);
    await client.query('BEGIN');
    try {
      await client.query("SET LOCAL lock_timeout = '10s'");
      await client.query(`SELECT pg_advisory_xact_lock(hashtext('depa:datos-resenas:demo'))`);
      await client.query(`
        DELETE FROM public.resena
        WHERE id_usuario IN (SELECT id_usuario FROM public.usuario WHERE email LIKE '%@depa.demo')
           OR id_publicacion IN (SELECT id_publicacion FROM public.publicacion WHERE titulo LIKE '[DEMO]%')
           OR id_anunciante IN (SELECT id_usuario FROM public.usuario WHERE email LIKE '%@depa.demo')
      `);
      await client.query(`
        DELETE FROM public.reserva
        WHERE id_usuario IN (SELECT id_usuario FROM public.usuario WHERE email LIKE '%@depa.demo')
           OR id_publicacion IN (SELECT id_publicacion FROM public.publicacion WHERE titulo LIKE '[DEMO]%')
      `);
      await client.query("DELETE FROM public.publicacion WHERE titulo LIKE '[DEMO]%'");
      await client.query(`
        DELETE FROM public.anunciante
        WHERE id_usuario IN (SELECT id_usuario FROM public.usuario WHERE email LIKE '%@depa.demo')
      `);
      await client.query("DELETE FROM public.usuario WHERE email LIKE '%@depa.demo'");
      await recalcularResumenes(client);
      if (limpiar) {
        await client.query('COMMIT');
        console.log(JSON.stringify({ limpieza: true, host: url.hostname }, null, 2));
        return;
      }
      const datos = await cargarDemo(client);
      await recalcularResumenes(client);
      await client.query('COMMIT');
      console.log(JSON.stringify({ aplicada: true, host: url.hostname, password: PASSWORD_DEMO, ...datos }, null, 2));
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    }
  } finally {
    await client.end();
  }
}

async function recalcularResumenes(client) {
  await client.query('UPDATE public.publicacion SET cantidad_resenas = 0, promedio_resenas = NULL');
  await client.query(`
    UPDATE public.publicacion AS publicacion
    SET cantidad_resenas = resumen.cantidad, promedio_resenas = resumen.promedio
    FROM (
      SELECT id_publicacion, count(*)::int AS cantidad, round(avg(puntaje)::numeric, 2) AS promedio
      FROM public.resena WHERE visible AND id_publicacion IS NOT NULL GROUP BY id_publicacion
    ) AS resumen
    WHERE publicacion.id_publicacion = resumen.id_publicacion
  `);
  await client.query('UPDATE public.anunciante SET cantidad_resenas = 0, promedio_resenas = NULL');
  await client.query(`
    UPDATE public.anunciante AS anunciante
    SET cantidad_resenas = resumen.cantidad, promedio_resenas = resumen.promedio
    FROM (
      SELECT id_anunciante, count(*)::int AS cantidad, round(avg(puntaje)::numeric, 2) AS promedio
      FROM public.resena WHERE visible AND id_anunciante IS NOT NULL GROUP BY id_anunciante
    ) AS resumen
    WHERE anunciante.id_usuario = resumen.id_anunciante
  `);
}

async function cargarDemo(client) {
  const roles = await mapa(client, 'SELECT id_rol AS id, nombre FROM public.rol');
  const tiposAnunciante = await mapa(client, 'SELECT id_tipo_anunciante AS id, nombre FROM public.tipo_anunciante');
  const modalidades = await mapa(client, 'SELECT id_modalidad AS id, nombre FROM public.modalidad');
  const monedas = await mapa(client, 'SELECT id_tipo_moneda AS id, nombre FROM public.tipo_moneda');
  const tiposPropiedad = await mapa(client, 'SELECT id_tipo_propiedad AS id, nombre FROM public.tipo_propiedad');
  const { rows: [provincia] } = await client.query("SELECT id_provincia FROM public.provincia WHERE nombre = 'Ciudad Autónoma de Buenos Aires'");
  if (!provincia) throw new Error('Falta la provincia de prueba');
  const ciudades = await mapa(client, 'SELECT id_ciudad AS id, nombre FROM public.ciudad WHERE id_provincia = $1', [provincia.id_provincia]);

  const contrasenia = await bcrypt.hash(PASSWORD_DEMO, COSTO_BCRYPT);
  const usuarios = {};
  for (const usuario of USUARIOS) {
    const { rows: [fila] } = await client.query(`
      INSERT INTO public.usuario
        (nombre, apellido, email, telefono, contrasenia, id_rol, email_verificado, activa, bloqueado)
      VALUES ($1, $2, $3, $4, $5, $6, true, true, false)
      RETURNING id_usuario
    `, [usuario.nombre, usuario.apellido, usuario.email, usuario.telefono, contrasenia, roles[usuario.rol]]);
    usuarios[usuario.clave] = { ...usuario, id: fila.id_usuario };
  }

  for (const clave of ['anunciante', 'inmobiliaria']) {
    const usuario = usuarios[clave];
    await client.query(`
      INSERT INTO public.anunciante
        (id_usuario, verificado, numero_contacto, id_tipo_anunciante, cuit_cuil, cbu_validado)
      VALUES ($1, true, $2, $3, $4, $5)
    `, [
      usuario.id,
      usuario.telefono,
      clave === 'inmobiliaria' ? tiposAnunciante.Inmobiliaria : tiposAnunciante.Particular,
      clave === 'inmobiliaria' ? '27234567890' : '20123456789',
      clave === 'inmobiliaria' ? '0170099220000067797371' : '0170099220000067797370',
    ]);
    // El guard del frontend exige una solicitud aprobada, no solo la fila de anunciante.
    await client.query(`
      INSERT INTO public.solicitud_verificacion
        (estado, id_anunciante, ambito_estado, numero_revision, razon_social,
         creada_en, actualizada_en, prueba_vida_validada_en)
      VALUES ('aprobada', $1, 'VERIFICACION_ANUNCIANTE', 1, $2,
              now() - interval '20 days', now() - interval '19 days', now() - interval '20 days')
    `, [
      usuario.id,
      clave === 'inmobiliaria' ? 'Inmobiliaria Demo S.A.' : null,
    ]);
    await client.query(`
      INSERT INTO public.revision_verificacion
        (numero_revision, estado, id_anunciante, id_administrador, ambito_estado,
         identidad_aprobada, cbu_aprobado, creada_en)
      VALUES (1, 'aprobada', $1, $2, 'VERIFICACION_ANUNCIANTE', true, true,
              now() - interval '19 days')
    `, [usuario.id, usuarios.admin.id]);
  }

  const publicaciones = {};
  for (const publicacion of PUBLICACIONES) {
    const anunciante = usuarios[publicacion.anunciante];
    const { rows: [fila] } = await client.query(`
      INSERT INTO public.publicacion
        (titulo, descripcion, fecha_publicacion, precio, activa, direccion,
         cantidad_ambientes, superficie, id_tipo_moneda, id_modalidad, id_anunciante,
         id_provincia, id_ciudad, id_tipo_propiedad, latitud, longitud)
      VALUES ($1, $2, CURRENT_DATE, $3, true, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING id_publicacion
    `, [
      publicacion.titulo, publicacion.descripcion, publicacion.precio, publicacion.direccion,
      publicacion.ambientes, publicacion.superficie, monedas['Peso (ARS)'],
      modalidades[publicacion.modalidad], anunciante.id, provincia.id_provincia,
      ciudades[publicacion.ciudad], tiposPropiedad[publicacion.tipoPropiedad],
      publicacion.latitud, publicacion.longitud,
    ]);
    publicaciones[publicacion.clave] = { ...publicacion, id: fila.id_publicacion, idAnunciante: anunciante.id };
    for (const [orden, url] of publicacion.imagenes.entries()) {
      await client.query(
        'INSERT INTO public.imagen (url, id_publicacion, orden) VALUES ($1, $2, $3)',
        [url, fila.id_publicacion, orden],
      );
    }
  }

  for (const reserva of RESERVAS) {
    const huesped = usuarios[reserva.huesped];
    const publicacion = publicaciones[reserva.publicacion];
    const inicio = fecha(reserva.inicio);
    const fin = fecha(reserva.fin);
    const dias = Math.max(1, Math.round((Date.parse(fin) - Date.parse(inicio)) / 86_400_000));
    const importe = reserva.precio * dias;
    await client.query(`
      INSERT INTO public.reserva
        (finalizada, monto_pago, id_usuario, id_publicacion, fecha_inicio, fecha_fin,
         usuario_nombre, usuario_apellido, usuario_email, usuario_telefono,
         cancelada, estado_pago, ambito_estado_pago, fecha_pago, pago_vencimiento,
         codigo_alojamiento, codigo_generado_en, codigo_validado_en, intentos_codigo,
         email_confirmacion_inquilino_enviado, email_nueva_reserva_anunciante_enviado,
         precio_unitario_contratado, importe_contratado, moneda_contratada,
         moneda_origen, importe_origen, porcentaje_comision_depa)
      VALUES (true, $1, $2, $3, $4, $5, $6, $7, $8, $9,
              false, 'APROBADO', 'PAGO_RESERVA', $10, $10, $11, $12, $12, 0,
              true, true, $13, $1, 'ARS', 'ARS', $1, 10)
    `, [
      importe, huesped.id, publicacion.id, inicio, fin,
      huesped.nombre, huesped.apellido, huesped.email, huesped.telefono,
      timestamp(reserva.inicio - 1), reserva.codigo, timestamp(reserva.inicio), reserva.precio,
    ]);
  }

  for (const resena of RESENAS) {
    const huesped = usuarios[resena.huesped];
    const publicacion = resena.publicacion ? publicaciones[resena.publicacion] : null;
    const { rows: [fila] } = await client.query(`
      INSERT INTO public.resena
        (id_usuario, id_publicacion, id_anunciante, puntaje, comentario, fecha,
         visible, motivo_moderacion, moderada_por, fecha_moderacion,
         denunciada, motivo_denuncia, denunciada_por, fecha_denuncia)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING id_resena
    `, [
      huesped.id,
      publicacion?.id ?? null,
      resena.anunciante ? usuarios[resena.anunciante].id : null,
      resena.puntaje,
      resena.comentario,
      timestamp(resena.fecha),
      resena.visible !== false,
      resena.motivo ?? null,
      resena.visible === false ? usuarios.admin.id : null,
      resena.visible === false ? timestamp(-2) : null,
      resena.denunciada === true,
      resena.motivoDenuncia ?? null,
      resena.denunciadaPor ? usuarios[resena.denunciadaPor].id : null,
      resena.denunciada ? timestamp(resena.fecha + 1) : null,
    ]);
    for (const [orden, url] of (resena.imagenes ?? []).entries()) {
      await client.query(
        'INSERT INTO public.resena_imagen (id_resena, url, orden) VALUES ($1, $2, $3)',
        [fila.id_resena, url, orden],
      );
    }
  }

  for (const clave of ['palermo', 'belgrano', 'recoleta']) {
    const publicacion = publicaciones[clave];
    for (let dia = 1; dia <= 21; dia++) {
      await client.query(`
        INSERT INTO public.fecha (fecha, disponible, id_publicacion)
        VALUES ($1, true, $2)
        ON CONFLICT (id_publicacion, fecha) DO NOTHING
      `, [fecha(dia), publicacion.id]);
    }
  }

  await recalcularResumenes(client);
  return {
    usuarios: USUARIOS.map((usuario) => ({
      email: usuario.email,
      id: usuarios[usuario.clave].id,
    })),
    publicaciones: PUBLICACIONES.map((publicacion) => ({
      id: publicaciones[publicacion.clave].id,
      titulo: publicacion.titulo,
    })),
    perfiles: {
      anunciante: usuarios.anunciante.id,
      inmobiliaria: usuarios.inmobiliaria.id,
    },
    resenas: RESENAS.length,
  };
}

async function mapa(client, sql, parametros = []) {
  const { rows } = await client.query(sql, parametros);
  return Object.fromEntries(rows.map((fila) => [fila.nombre, fila.id]));
}

main().catch((error) => {
  console.error('No se pudieron cargar los datos demo de reseñas:', error.code || error.message);
  process.exitCode = 1;
});
