// Carga manual autorizada de ejemplos usando los mismos servicios de la aplicación.
// Ejecutar primero sin --aplicar; no modifica el esquema ni cuentas de usuario.
require('reflect-metadata');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { DataSource } = require('typeorm');
const { ConfigService } = require('@nestjs/config');
const { validate } = require('class-validator');
const sharp = require('sharp');
require('dotenv').config({ path: path.join(__dirname, '..', '.env'), quiet: true });

const backend = path.join(__dirname, '..');
const root = path.join(backend, '..');
const loteIndex = process.argv.indexOf('--lote');
const lote = loteIndex < 0 ? null : JSON.parse(fs.readFileSync(path.resolve(process.argv[loteIndex + 1]), 'utf8'));
if (lote && (!/^[a-z0-9-]+$/.test(lote.nombre) || !Array.isArray(lote.grupos) || !lote.grupos.length)) {
  throw new Error('El lote debe tener nombre y grupos válidos');
}
const salida = path.join(root, 'datos', 'publicaciones-ejemplo', ...(lote ? [lote.nombre] : []));
const cargar = (archivo, clase) => require(path.join(backend, 'dist', archivo))[clase];
const entidad = (modulo, archivo, clase) => cargar(`${modulo}/entity/${archivo}.entity.js`, clase);
const Usuario = entidad('usuarios', 'usuario', 'Usuario');
const Anunciante = entidad('anunciantes', 'anunciante', 'Anunciante');
const Publicacion = entidad('publicaciones', 'publicacion', 'Publicacion');
const Imagen = entidad('imagenes', 'imagen', 'Imagen');
const Fecha = entidad('disponibilidad', 'fecha', 'Fecha');
const Reserva = entidad('reservas', 'reserva', 'Reserva');
const Provincia = entidad('ubicacion', 'provincia', 'Provincia');
const Ciudad = entidad('ubicacion', 'ciudad', 'Ciudad');
const Rol = entidad('catalogos', 'rol', 'Rol');
const TipoAnunciante = entidad('catalogos', 'tipo-anunciante', 'TipoAnunciante');
const TipoPropiedad = entidad('catalogos', 'tipo-propiedad', 'TipoPropiedad');
const Modalidad = entidad('catalogos', 'modalidad', 'Modalidad');
const TipoMoneda = entidad('catalogos', 'tipo-moneda', 'TipoMoneda');
const PublicacionesRepository = cargar('publicaciones/repository/publicaciones.repository.js', 'PublicacionesRepository');
const PublicacionesService = cargar('publicaciones/service/publicaciones.service.js', 'PublicacionesService');
const CatalogosRepository = cargar('catalogos/repository/catalogos.repository.js', 'CatalogosRepository');
const CatalogosService = cargar('catalogos/service/catalogos.service.js', 'CatalogosService');
const UbicacionRepository = cargar('ubicacion/repository/ubicacion.repository.js', 'UbicacionRepository');
const UbicacionService = cargar('ubicacion/service/ubicacion.service.js', 'UbicacionService');
const ImagenesRepository = cargar('imagenes/repository/imagenes.repository.js', 'ImagenesRepository');
const ImagenesService = cargar('imagenes/service/imagenes.service.js', 'ImagenesService');
const FechaRepository = cargar('disponibilidad/repository/fecha.repository.js', 'FechaRepository');
const DisponibilidadService = cargar('disponibilidad/service/disponibilidad.service.js', 'DisponibilidadService');
const CrearPublicacionDto = cargar('publicaciones/dto/crear-publicacion.dto.js', 'CrearPublicacionDto');
const CrearDisponibilidadDto = cargar('disponibilidad/dto/crear-disponibilidad.dto.js', 'CrearDisponibilidadDto');

const descargas = path.join(process.env.USERPROFILE, 'Downloads');
const capturas = path.join(process.env.USERPROFILE, 'OneDrive', 'Pictures', 'Screenshots');
const gruposOriginales = [
  {
    clave: 'ph-terraza', titulo: 'PH luminoso con terraza y parrilla', tipo: 'PH', temporal: false,
    direccion: 'Obispo Trejo 850',
    ciudad: 'Córdoba', provincia: 'Córdoba', ambientes: 2, superficie: 65,
    diario: 48000, mensual: 680000,
    descripcion: 'PH luminoso con cocina integrada, living en desnivel y baño renovado. Terraza propia con parrilla, ideal para disfrutar al aire libre. Alquiler mensual en Córdoba.',
    fotos: [
      '2e50a855-3b0a-4750-8771-ceca4f2eb09f_u_large.webp',
      'f84fe86f-7d1d-4098-8495-f2b5473de63c_u_large.webp',
      'ec09fb05-9a82-4996-9dfe-618cb0061970_u_large.webp',
      '1d9f3273-7245-41cc-bb77-38f70cd96408_u_large.webp',
      'be3e9257-986e-4019-9570-77fc6470357f_u_large.webp',
      '5d7f15d6-f655-466a-a3cb-ccbc027c2a38_u_large.webp',
      'afa971ad-5a3c-4a90-80c6-a213e4675866_u_large.webp',
    ],
  },
  {
    clave: 'depto-balcon', titulo: 'Monoambiente con balcón en Villa María', tipo: 'Departamento', temporal: false,
    direccion: 'General Paz 480',
    ciudad: 'Villa María', provincia: 'Córdoba', ambientes: 1, superficie: 38,
    diario: 32000, mensual: 390000,
    descripcion: 'Monoambiente luminoso con balcón, aire acondicionado, pisos símil madera y cocina integrada con horno. Se entrega sin muebles. Una opción cómoda para vivir en Villa María.',
    fotos: [
      'f531df20-629d-41ba-a5f4-694172d96646_u_large.webp',
      'bf90bad5-1a16-42f4-a4b7-6b78d9fc746d_u_large.webp',
      '7e25d422-e6e9-4796-9f63-204207645e59_u_large.webp',
      '7b730b68-00f2-4dc2-9d3c-66631d507007_u_large.webp',
    ],
  },
  {
    clave: 'duplex-pileta', titulo: 'Dúplex amoblado con pileta y vistas a las sierras', tipo: 'Dúplex', temporal: true,
    direccion: 'San Martín 620',
    ciudad: 'Villa Carlos Paz', provincia: 'Córdoba', ambientes: 3, superficie: 78,
    diario: 72000, mensual: 890000,
    descripcion: 'Dúplex amoblado para disfrutar de Carlos Paz. Comedor, dormitorio con cama doble y aire acondicionado. Pileta en la terraza con vistas abiertas a las sierras. Consultá el calendario y reservá tu estadía.',
    fotos: [
      '57n2_Departamento_N6038DER.webp',
      '57n2-Departamento-MUNJLKFL (1).webp',
      '57n2-Departamento-WGDI5C2A.webp',
      '57n2-Departamento-QLU24RSX.webp',
      '57n2-Departamento-MUNJLKFL.webp',
    ],
  },
  {
    clave: 'depto-amenities', titulo: 'Departamento con pileta, parrillas y SUM', tipo: 'Departamento', temporal: true,
    direccion: '9 de Julio 360',
    ciudad: 'Villa Carlos Paz', provincia: 'Córdoba', ambientes: 2, superficie: 52,
    diario: 58000, mensual: 740000,
    descripcion: 'Departamento en edificio moderno de Carlos Paz, con pileta en terraza, vistas a las sierras, SUM y sector de parrillas. La galería muestra los espacios comunes del complejo. Disponible para estadías cortas.',
    fotos: [
      'we23-Departamento-8985MRTM.webp',
      'we23-Departamento-MRT9RKNB.webp',
      'we23-Departamento-1MT5QDP6.webp',
      'we23-Departamento-7IIJ6138.webp',
    ],
  },
  {
    clave: 'casa-jardin', titulo: 'Casa con pileta y jardín en Mina Clavero', tipo: 'Casa', temporal: true,
    direccion: 'Los Aromos 1450',
    ciudad: 'Mina Clavero', provincia: 'Córdoba', ambientes: 4, superficie: 120,
    diario: 95000, mensual: 1100000,
    descripcion: 'Casa con jardín, pileta y solárium para disfrutar de las sierras. Espacios al aire libre y un entorno tranquilo en Mina Clavero. La galería incluye la propiedad y paisajes de la zona en distintas estaciones.',
    fotos: [
      'sv75-Casa-Y71PPLSO.webp',
      'sv75-Casa-J2M5A5M6.webp',
      'sv75-Casa-4O452Z9I.webp',
      'sv75-Casa-RRSFK1SY.webp',
    ],
  },
  {
    clave: 'depto-parquet', titulo: 'Tres ambientes con parquet en Palermo', tipo: 'Departamento', temporal: false,
    direccion: 'Guatemala 4350',
    ciudad: 'Palermo', provincia: 'Ciudad Autónoma de Buenos Aires', ambientes: 3, superficie: 70,
    diario: 55000, mensual: 820000,
    descripcion: 'Departamento de tres ambientes con living comedor, cocina separada y pisos de parquet. Ambientes con luz natural y acceso al edificio cuidado. Alquiler mensual en Palermo.',
    carpeta: capturas,
    fotos: [
      'Captura de pantalla 2026-10-09 133204.png',
      'Captura de pantalla 2026-10-09 133138.png',
      'Captura de pantalla 2026-10-09 133124.png',
      'Captura de pantalla 2026-10-09 133112.png',
      'Captura de pantalla 2026-10-09 133102.png',
    ],
  },
];
const grupos = lote?.grupos ?? gruposOriginales;
if (new Set(grupos.map(g => g.clave)).size !== grupos.length || new Set(grupos.map(g => g.titulo)).size !== grupos.length) {
  throw new Error('Cada inmueble debe tener una clave y título únicos');
}

async function validarDto(clase, datos) {
  const dto = Object.assign(new clase(), datos);
  const errores = await validate(dto);
  if (errores.length) throw new Error(`Datos inválidos: ${errores.map(e => e.property).join(', ')}`);
  if (datos.descripcion?.length > 255) throw new Error('Descripción demasiado larga');
  return dto;
}

async function ajustarCalendario(ds, idPublicacion) {
  // DATE se escribe como YYYY-MM-DD para evitar que UTC desplace el día en Argentina.
  // Conserva días ocupados y deduplica únicamente filas sin reserva de esta carga.
  const esperadas = [];
  for (let d = new Date('2026-10-10T00:00:00Z'); d <= new Date('2027-01-31T00:00:00Z'); d.setUTCDate(d.getUTCDate() + 1)) {
    esperadas.push(d.toISOString().slice(0, 10));
  }
  await ds.transaction(async tx => {
    const actuales = await tx.query('SELECT id_fecha, fecha, disponible, id_reserva FROM fecha WHERE id_publicacion = $1 ORDER BY id_fecha FOR UPDATE', [idPublicacion]);
    const vistas = new Set();
    const eliminar = [];
    for (const fila of actuales) {
      const fecha = fila.fecha instanceof Date ? fila.fecha.toISOString().slice(0, 10) : fila.fecha;
      if (!esperadas.includes(fecha) || vistas.has(fecha)) {
        if (fila.id_reserva !== null) throw new Error('No se puede corregir una fecha vinculada a una reserva');
        eliminar.push(fila.id_fecha);
      } else {
        vistas.add(fecha);
      }
    }
    const fechaRepo = tx.getRepository(Fecha);
    if (eliminar.length) await fechaRepo.delete(eliminar);
    const nuevas = esperadas.filter(fecha => !vistas.has(fecha)).map(fecha => fechaRepo.create({ fecha, disponible: true, publicacion: { id: idPublicacion } }));
    if (nuevas.length) await fechaRepo.save(nuevas);
  });
}

async function main() {
  const email = process.argv[process.argv.indexOf('--usuario') + 1];
  if (!process.argv.includes('--usuario') || !email?.includes('@')) throw new Error('Indicá --usuario con la cuenta ya verificada que recibirá los ejemplos');
  const aplicar = process.argv.includes('--aplicar');
  const ds = new DataSource({
    type: 'postgres', url: process.env.DATABASE_URL,
    entities: [path.join(backend, 'dist', '**', '*.entity.js').replaceAll('\\', '/')],
    synchronize: false, logging: false, ssl: { rejectUnauthorized: false },
  });
  await ds.initialize();
  try {
    const repo = clase => ds.getRepository(clase);
    const usuario = await repo(Usuario).findOneBy({ email });
    if (!usuario || usuario.bloqueado || !usuario.email_verificado) throw new Error('La cuenta no está habilitada');
    const anunciante = await repo(Anunciante).findOneBy({ idUsuario: usuario.id });
    if (!anunciante?.verificado) throw new Error('La cuenta debe ser anunciante verificado antes de cargar ejemplos');
    const catalogos = new CatalogosService(new CatalogosRepository(repo(Rol), repo(TipoAnunciante), repo(TipoPropiedad), repo(Modalidad), repo(TipoMoneda)));
    const ubicacion = new UbicacionService(new UbicacionRepository(repo(Provincia), repo(Ciudad)));
    const publicaciones = new PublicacionesService(new PublicacionesRepository(repo(Publicacion), repo(Reserva)), catalogos, ubicacion);
    const imagenes = new ImagenesService(new ImagenesRepository(repo(Imagen)), publicaciones, new ConfigService());
    const disponibilidad = new DisponibilidadService(new FechaRepository(repo(Fecha)), publicaciones);
    const moneda = await repo(TipoMoneda).findOneBy({ nombre: 'Peso (ARS)' });
    if (!moneda) throw new Error('Falta el catálogo Peso (ARS)');
    const cobertura = JSON.parse(fs.readFileSync(path.join(root, 'datos', 'georef', 'cobertura.json'), 'utf8'));
    const localidades = JSON.parse(fs.readFileSync(path.join(root, 'datos', 'georef', 'localidades.json'), 'utf8')).localidades;
    const plan = [];
    const hashes = new Set();
    for (const grupo of grupos) {
      const punto = grupo.ubicacion;
      if (lote && (!punto?.confirmadaEnLeaflet || !Number.isFinite(punto.latitud) || !Number.isFinite(punto.longitud)
        || !fs.existsSync(path.join(salida, `mapa-${grupo.clave}.jpg`)))) {
        throw new Error(`Falta confirmar el punto en Leaflet: ${grupo.clave}`);
      }
      const ciudad = cobertura.find(c => c.nombre === grupo.ciudad && c.provincia === grupo.provincia);
      if (!ciudad) throw new Error(`No existe la ubicación ${grupo.ciudad}`);
      const fuente = localidades.find(l => ciudad.idsGeoref.includes(l.id));
      const tipo = await repo(TipoPropiedad).findOneBy({ nombre: grupo.tipo });
      if (!fuente || !tipo) throw new Error(`Falta el tipo o ubicación de ${grupo.clave}`);
      const fotos = [];
      for (const referencia of grupo.fotos) {
        if (path.basename(referencia) !== referencia) throw new Error('La referencia de una foto debe ser un nombre de archivo');
        const carpeta = grupo.carpeta ?? descargas;
        let nombre = referencia;
        if (!path.extname(referencia)) {
          // Los nombres largos enviados por el usuario se identifican por su prefijo único.
          if (!/^[A-Fa-f0-9]{8,}$/.test(referencia)) throw new Error('Prefijo de imagen inválido');
          const coincidencias = fs.readdirSync(carpeta).filter(n => n.startsWith(referencia) && /\.(jpg|jpeg|png|webp)$/i.test(n));
          if (coincidencias.length !== 1) throw new Error(`La referencia no identifica una única foto: ${referencia}`);
          nombre = coincidencias[0];
        }
        const archivo = path.join(carpeta, nombre);
        const buffer = fs.readFileSync(archivo);
        if (buffer.length > 10 * 1024 * 1024) throw new Error(`Foto supera 10 MB: ${nombre}`);
        const metadata = await sharp(buffer).metadata();
        if (!['webp', 'png', 'jpeg'].includes(metadata.format)) throw new Error(`Formato inesperado: ${nombre}`);
        const sha256 = crypto.createHash('sha256').update(buffer).digest('hex');
        if (hashes.has(sha256)) throw new Error(`La foto se repite en el lote: ${nombre}`);
        hashes.add(sha256);
        fotos.push({ archivo, nombre, sha256, mimetype: `image/${metadata.format}` });
      }
      {
        const temporal = grupo.temporal;
        const modo = temporal ? 'Temporal' : 'Largo Plazo';
        const modalidad = await repo(Modalidad).findOneBy({ nombre: modo });
        if (!modalidad || Boolean(modalidad.permite_reservas_por_fecha) !== temporal) throw new Error(`Modalidad inválida: ${modo}`);
        const datos = {
          titulo: grupo.titulo,
          descripcion: grupo.descripcion,
          precio: temporal ? grupo.diario : grupo.mensual,
          direccion: grupo.direccion,
          latitud: Number((punto?.latitud ?? fuente.centroide.lat).toFixed(7)), longitud: Number((punto?.longitud ?? fuente.centroide.lon).toFixed(7)),
          cantidad_ambientes: grupo.ambientes, superficie: grupo.superficie,
          idTipoMoneda: moneda.id, idModalidad: modalidad.id, idProvincia: ciudad.idProvincia,
          idCiudad: ciudad.idCiudad, idTipoPropiedad: tipo.id,
        };
        await validarDto(CrearPublicacionDto, datos);
        plan.push({ clave: `${grupo.clave}-${temporal ? 'temporal' : 'largo-plazo'}`, datos, fotos, temporal, ciudad: grupo.ciudad, ubicacion: punto });
      }
    }
    console.log(JSON.stringify({ fase: 'validado', publicaciones: plan.length, imagenes: plan.reduce((n, p) => n + p.fotos.length, 0), temporales: plan.filter(p => p.temporal).length, aplicar }));
    if (!aplicar) return;
    fs.mkdirSync(salida, { recursive: true });
    const manifestPath = path.join(salida, 'carga-2026-10-09.json');
    const manifest = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, 'utf8')) : { usuarioId: usuario.id, publicaciones: [] };
    if (manifest.usuarioId !== usuario.id) throw new Error('El manifiesto pertenece a otra cuenta');
    const sobrantes = manifest.publicaciones.filter(p => !plan.some(item => item.clave === p.clave));
    if (lote && sobrantes.length) throw new Error('El manifiesto contiene otros inmuebles; no se retirará ninguna publicación');
    for (const entrada of sobrantes) {
      if (!grupos.some(g => entrada.clave === `${g.clave}-temporal` || entrada.clave === `${g.clave}-largo-plazo`)) throw new Error('El registro sobrante no pertenece a esta carga');
      const pub = await publicaciones.buscarPorId(entrada.id);
      if (pub.anunciante.idUsuario !== usuario.id || pub.titulo !== entrada.titulo) throw new Error('Una publicación duplicada fue modificada; revisar antes de corregir');
      for (const tabla of ['reserva', 'favorito', 'mensaje']) {
        const [{ cantidad }] = await ds.query(`SELECT count(*)::int AS cantidad FROM ${tabla} WHERE id_publicacion = $1`, [entrada.id]);
        if (cantidad > 0) throw new Error(`La publicación ${entrada.id} tiene actividad en ${tabla}; revisar antes de corregir`);
      }
    }
    if (sobrantes.length) {
      const backup = path.join(salida, 'carga-2026-10-09-antes-de-corregir.json');
      if (!fs.existsSync(backup)) fs.copyFileSync(manifestPath, backup);
    }
    const guardar = () => {
      fs.writeFileSync(`${manifestPath}.tmp`, JSON.stringify(manifest, null, 2));
      try {
        fs.renameSync(`${manifestPath}.tmp`, manifestPath);
      } catch (error) {
        // OneDrive puede mantener abierto el destino y bloquear su reemplazo en Windows.
        if (!['EPERM', 'EACCES'].includes(error.code)) throw error;
        fs.copyFileSync(`${manifestPath}.tmp`, manifestPath);
      }
    };
    for (const item of plan) {
      let entrada = manifest.publicaciones.find(p => p.clave === item.clave);
      const existente = entrada
        ? await publicaciones.buscarPorId(entrada.id)
        : await repo(Publicacion).findOne({ where: { titulo: item.datos.titulo, anunciante: { idUsuario: usuario.id } }, relations: { anunciante: true } });
      if (lote && existente && !entrada) throw new Error('Ya existe un anuncio con ese título fuera del manifiesto de este lote');
      let pub = existente ?? await publicaciones.crear(anunciante, await validarDto(CrearPublicacionDto, item.datos));
      if (pub.anunciante.idUsuario !== usuario.id || (pub.titulo !== item.datos.titulo && pub.titulo !== entrada?.titulo)) throw new Error('El registro existente no coincide con la carga de esta cuenta');
      if (existente) {
        // La corrección conserva la propiedad, modalidad, precio y galería del anuncio elegido.
        pub = await publicaciones.actualizar(pub.id, anunciante, {
          titulo: item.datos.titulo, descripcion: item.datos.descripcion, direccion: item.datos.direccion,
          ...(lote ? { latitud: item.datos.latitud, longitud: item.datos.longitud } : {}),
        });
      }
      if (!entrada) {
        entrada = { clave: item.clave, id: pub.id, titulo: item.datos.titulo, modalidad: item.temporal ? 'Temporal' : 'Largo Plazo', ciudad: item.ciudad, precio: item.datos.precio, imagenes: [] };
        manifest.publicaciones.push(entrada);
        guardar();
      }
      entrada.titulo = item.datos.titulo;
      entrada.descripcion = item.datos.descripcion;
      entrada.direccion = item.datos.direccion;
      if (item.ubicacion) entrada.ubicacion = item.ubicacion;
      const actuales = (await imagenes.listarPorPublicacion(pub.id)).sort((a, b) => a.id - b.id);
      if (actuales.length > item.fotos.length) throw new Error(`Cantidad inesperada de imágenes en ${pub.id}`);
      for (const [indice, foto] of item.fotos.entries()) {
        const registrada = entrada.imagenes[indice];
        if (registrada && registrada.sha256 !== foto.sha256) throw new Error(`La fuente cambió: ${foto.nombre}`);
        // Las cargas son secuenciales: si se interrumpió luego del insert, recuperamos esa fila.
        let imagen = actuales[indice];
        if (registrada && imagen?.id !== registrada.id) throw new Error(`La galería del ejemplo ${pub.id} cambió; revisar antes de reanudar`);
        if (!imagen) {
          const buffer = fs.readFileSync(foto.archivo);
          imagen = await imagenes.subir(pub.id, anunciante, { buffer, size: buffer.length, mimetype: foto.mimetype, originalname: foto.nombre });
        }
        entrada.imagenes[indice] = { id: imagen.id, archivo: foto.nombre, sha256: foto.sha256, url: imagen.url };
        guardar();
        console.log(JSON.stringify({ fase: 'foto', publicacion: pub.id, cargadas: indice + 1, total: item.fotos.length }));
      }
      if (item.temporal) {
        const dto = await validarDto(CrearDisponibilidadDto, { id_publicacion: pub.id, fecha_inicio: '2026-10-10', fecha_fin: '2027-01-31' });
        await ajustarCalendario(ds, pub.id);
        entrada.disponibilidad = { desde: dto.fecha_inicio, hasta: dto.fecha_fin };
      }
      const verificada = await publicaciones.buscarPorId(pub.id);
      if (!verificada.activa || verificada.imagenes.length !== item.fotos.length) throw new Error(`Publicación ${pub.id} incompleta`);
      const fechas = await disponibilidad.listarPorPublicacion(pub.id);
      if (item.temporal && (fechas.length !== 114 || new Set(fechas.map(f => String(f.fecha))).size !== 114)) throw new Error(`Disponibilidad incompleta en ${pub.id}`);
      if (!item.temporal && fechas.length !== 0) throw new Error(`El ejemplo de largo plazo ${pub.id} tiene fechas inesperadas`);
      entrada.verificada = true;
      guardar();
      console.log(JSON.stringify({ fase: 'publicada', id: pub.id, titulo: pub.titulo, fotos: verificada.imagenes.length, diasDisponibles: fechas.length }));
    }
    for (const entrada of sobrantes) {
      // Sólo los duplicados de esta carga y sin reservas, mensajes o favoritos.
      const pub = await publicaciones.buscarPorId(entrada.id);
      await publicaciones.eliminar(pub.id, anunciante);
      manifest.publicaciones = manifest.publicaciones.filter(p => p.id !== entrada.id);
      guardar();
      console.log(JSON.stringify({ fase: 'duplicado-retirado', id: entrada.id }));
    }
    console.log(JSON.stringify({ fase: 'completo', publicaciones: manifest.publicaciones.length, imagenes: manifest.publicaciones.reduce((n, p) => n + p.imagenes.length, 0) }));
  } finally {
    await ds.destroy();
  }
}

main().catch(error => {
  // Evita volcar configuraciones, consultas con datos personales o credenciales.
  console.error(`Carga detenida: ${error instanceof Error ? error.message : 'error inesperado'}`);
  process.exitCode = 1;
});
