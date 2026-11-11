require('reflect-metadata');
const { PruebaVidaService } = require('../dist/verificacion-anunciante/service/prueba-vida.service');
const { CAMPOS_PRUEBA_PRIVADOS } = require('../dist/verificacion-anunciante/dto/solicitud-verificacion-respuesta.dto');
const { test, before } = require('node:test');
const assert = require('node:assert/strict');
const { DataSource } = require('typeorm');
const { BlobServiceClient } = require('@azure/storage-blob');
const { SolicitudVerificacion: Solicitud } = require('../dist/verificacion-anunciante/entity/solicitud-verificacion.entity');
const { EstadoVerificacion: Estado } = require('../dist/catalogos/estados');
const { EliminacionDocumento: Trabajo } = require('../dist/verificacion-anunciante/entity/eliminacion-documento.entity');
const { RevisionVerificacion: Revision } = require('../dist/verificacion-anunciante/entity/revision-verificacion.entity');
const { Anunciante } = require('../dist/anunciantes/entity/anunciante.entity');
const { AnunciantesRepository } = require('../dist/anunciantes/repository/anunciantes.repository');
const { AnunciantesService } = require('../dist/anunciantes/service/anunciantes.service');
const { VerificacionRepository } = require('../dist/verificacion-anunciante/repository/verificacion.repository');
const { VerificacionAnuncianteService } = require('../dist/verificacion-anunciante/service/verificacion-anunciante.service');
const { EliminacionDocumentosService } = require('../dist/verificacion-anunciante/service/eliminacion-documentos.service');
const { AzureArchivoRepository } = require('../dist/almacenamiento/repository/azure-archivo.repository');

const campos = ['dni_frente_url', 'dni_dorso_url', 'rostro_url', 'matricula_url', 'constancia_cuit_url'];
const source = new DataSource({ type: 'postgres', entities: [__dirname + '/../dist/**/*.entity.js'] });
before(async () => source.buildMetadatas());

function solicitud(estado = Estado.PENDIENTE, empresa = false) {
  const s = Object.assign(new Solicitud(), {
    id: 4, numero_revision: 1, estado, motivo_rechazo: null,
    prueba_vida_desafio: 'desafio', prueba_vida_revision: 1,
    prueba_vida_rostro_hash: 'hash', prueba_vida_vence_en: new Date(),
    prueba_vida_consumida_en: new Date(), prueba_vida_validada_en: new Date(),
    razon_social: 'Inmobiliaria', matricula_profesional: '123',
    colegio_profesional: 'Colegio', domicilio_comercial: 'Calle 123', dni_corredor: '12345678',
    anunciante: Object.assign(new Anunciante(), {
      idUsuario: 7, verificado: false,
      usuario: { email: 'prueba@example.test', nombre: 'Ana', apellido: 'Prueba' },
      tipoAnunciante: { nombre: empresa ? 'Inmobiliaria' : 'Particular' },
    }),
  });
  campos.forEach((campo, i) => { s[campo] = empresa || i < 3 ? `https://almacen.test/privado/${campo}-revision-1` : null; });
  return s;
}

// Adaptador transaccional en memoria para el repositorio real: publica los
// cambios solo tras completar el callback. No conecta con servicios desplegados.
function escenario(s = solicitud()) {
  let estado = { solicitud: s, revisiones: [], trabajos: [] };
  let falloRevision = false, falloCommit = false, falloAzure = false;
  const borrados = [], avisos = [], consultas = [], correos = [];
  const clonar = valor => {
    if (valor instanceof Date) return new Date(valor);
    if (Array.isArray(valor)) return valor.map(clonar);
    if (!valor || typeof valor !== 'object') return valor;
    return Object.assign(Object.create(Object.getPrototypeOf(valor)),
      Object.fromEntries(Object.entries(valor).map(([k, v]) => [k, clonar(v)])));
  };
  const ds = { async transaction(fn) {
    const previo = estado;
    const copia = clonar(previo);
    const manager = { getRepository(entidad) {
      if (entidad === Solicitud) return {
        createQueryBuilder() {
          const b = { addSelect: () => b, leftJoinAndSelect: () => b,
            where: () => b, setLock: () => b, getOne: async () => copia.solicitud };
          return b;
        },
        async save(actual) { copia.solicitud = actual; return actual; },
      };
      if (entidad === Anunciante) return { async update(criterio, cambios) {
        assert.deepEqual(criterio, { idUsuario: copia.solicitud.anunciante.idUsuario });
        assert.deepEqual(cambios, { verificado: true });
        Object.assign(copia.solicitud.anunciante, cambios);
      } };
      if (entidad === Revision) return { async save(r) {
        if (falloRevision) throw new Error('fallo de historial');
        copia.revisiones.push(r); return r;
      } };
      if (entidad === Trabajo) return {
        createQueryBuilder(alias) {
          if (!alias) {
            let valores;
            const b = { insert: () => b, values(v) { valores = v; return b; }, orIgnore: () => b,
              async execute() { for (const { url } of valores) {
                if (!copia.trabajos.some(t => t.url === url)) copia.trabajos.push({ id: copia.trabajos.length + 1, url, intentos: 0, proximo_intento: new Date(0) });
              } } };
            return b;
          }
          // Construye el SQL real de PostgreSQL, incluido SKIP LOCKED y LIMIT.
          const b = source.getRepository(Trabajo).createQueryBuilder(alias);
          b.getMany = async () => {
            consultas.push(b.getQuery());
            const ahora = b.getParameters().ahora;
            return copia.trabajos.filter(t => t.proximo_intento <= ahora).slice(0, 25);
          };
          return b;
        },
        async save(t) { return t; },
        async delete(id) { copia.trabajos = copia.trabajos.filter(t => t.id !== id); },
      };
      throw new Error(`Entidad inesperada: ${entidad.name}`);
    } };
    const resultado = await fn(manager);
    if (falloCommit) throw new Error('fallo de COMMIT');
    estado = copia;
    return resultado;
  } };
  const repo = new VerificacionRepository({}, { create: datos => Object.assign(new Revision(), datos) }, ds);
  const archivos = { async eliminarDocumentoPropio(url) {
    if (falloAzure) throw new Error('fallo Azure con URL privada');
    borrados.push(url);
  } };
  const limpieza = new EliminacionDocumentosService(repo, archivos);
  limpieza.logger = { error: msg => avisos.push(msg), warn: msg => avisos.push(msg) };
  const mail = { async enviarResultadoVerificacion(...args) { correos.push(args); } };
  const anunciantes = new AnunciantesService(new AnunciantesRepository({}));
  const catalogos = { esInmobiliaria: (tipo) => tipo?.nombre === 'Inmobiliaria' };
  const servicio = new VerificacionAnuncianteService(anunciantes, {}, catalogos, repo, mail, archivos, new PruebaVidaService(), limpieza);
  return { repo, limpieza, servicio, borrados, avisos, consultas, correos,
    get estado() { return estado; },
    fallarRevision: v => { falloRevision = v; }, fallarCommit: v => { falloCommit = v; },
    fallarAzure: v => { falloAzure = v; },
  };
}

for (const empresa of [false, true]) {
  for (const aprobada of [false, true]) {
    test(`${aprobada ? 'aprobar' : 'rechazar'} ${empresa ? 'inmobiliaria' : 'particular'} borra adjuntos y conserva auditoría`, async () => {
      const e = escenario(solicitud(Estado.PENDIENTE, empresa));
      const fechaPrueba = e.estado.solicitud.prueba_vida_validada_en.getTime();
      if (aprobada) await e.servicio.aprobar(7, 12, { numero_revision: 1 });
      else await e.servicio.rechazar(7, 12, { numero_revision: 1, motivo: 'Documento ilegible' });
      const s = e.estado.solicitud;
      assert.equal(s.estado, aprobada ? Estado.APROBADA : Estado.RECHAZADA);
      assert.equal(s.anunciante.verificado, aprobada);
      campos.forEach(campo => assert.equal(s[campo], null));
      CAMPOS_PRUEBA_PRIVADOS.forEach(campo => assert.equal(s[campo], null));
      assert.equal(s.prueba_vida_validada_en.getTime(), fechaPrueba);
      assert.ok(s.actualizada_en instanceof Date);
      assert.equal(e.estado.revisiones.length, 1);
      assert.equal(e.estado.revisiones[0].id_administrador, 12);
      assert.equal(e.estado.revisiones[0].numero_revision, 1);
      assert.equal(e.estado.revisiones[0].motivo, aprobada ? null : 'Documento ilegible');
      assert.deepEqual(e.correos, [['prueba@example.test', aprobada, aprobada ? undefined : 'Documento ilegible']]);
      assert.equal(e.borrados.length, empresa ? 5 : 3);
      assert.equal(e.estado.trabajos.length, 0);
      assert.match(e.consultas[0], /FOR UPDATE SKIP LOCKED/);
      assert.match(e.consultas[0], /LIMIT 25/);
    });
  }
}

test('una decisión fallida revierte cola, historial y referencias sin borrar Azure', async () => {
  const e = escenario();
  const originales = campos.map(c => e.estado.solicitud[c]);
  e.fallarRevision(true);
  await assert.rejects(e.servicio.aprobar(7, 12, { numero_revision: 1 }), /historial/);
  assert.equal(e.estado.solicitud.estado, Estado.PENDIENTE);
  assert.equal(e.estado.solicitud.anunciante.verificado, false);
  assert.deepEqual(campos.map(c => e.estado.solicitud[c]), originales);
  assert.equal(e.estado.trabajos.length, 0);
  assert.equal(e.estado.revisiones.length, 0);
  assert.equal(e.borrados.length, 0);
  assert.equal(e.correos.length, 0);
});

test('un fallo de Azure persiste el trabajo y permite continuar con una nueva revisión', async () => {
  const e = escenario();
  e.fallarAzure(true);
  await e.servicio.rechazar(7, 12, { numero_revision: 1, motivo: 'Documento ilegible' });
  assert.equal(e.estado.solicitud.estado, Estado.RECHAZADA);
  assert.equal(e.estado.trabajos.length, 3);
  assert.ok(e.estado.trabajos.every(t => t.intentos === 1 && t.proximo_intento > new Date()));
  assert.ok(e.avisos.every(msg => !msg.includes('https://') && !msg.includes('URL privada')));
  const s = e.estado.solicitud;
  // Simula que el usuario presentó otra revisión antes de que se reintente la limpieza.
  Object.assign(s, {
    dni_frente_url: 'frente-nuevo', dni_dorso_url: 'dorso-nuevo', rostro_url: 'rostro-nuevo',
    estado: Estado.REENVIADA, numero_revision: 2,
  });
  assert.equal(s.estado, Estado.REENVIADA);
  assert.equal(s.numero_revision, 2);
  const nuevaLimpieza = new EliminacionDocumentosService(e.repo, { async eliminarDocumentoPropio(url) { e.borrados.push(url); } });
  e.estado.trabajos.forEach(t => { t.proximo_intento = new Date(0); });
  await nuevaLimpieza.ejecutar();
  assert.equal(e.estado.trabajos.length, 0);
  assert.ok(e.borrados.every(url => url.endsWith('revision-1')));
  assert.equal(e.estado.solicitud.dni_frente_url, 'frente-nuevo');
  assert.equal(e.estado.solicitud.numero_revision, 2);
});

test('si falla el COMMIT después del borrado se reintenta sin perder el trabajo', async () => {
  const e = escenario();
  e.fallarAzure(true);
  await e.servicio.aprobar(7, 12, { numero_revision: 1 });
  e.fallarAzure(false);
  e.estado.trabajos.forEach(t => { t.proximo_intento = new Date(0); });
  e.fallarCommit(true);
  await e.limpieza.ejecutar();
  assert.equal(e.estado.trabajos.length, 3);
  assert.equal(e.borrados.length, 3);
  e.fallarCommit(false);
  await e.limpieza.ejecutar();
  assert.equal(e.estado.trabajos.length, 0);
  assert.equal(e.borrados.length, 6);
});

for (const estado of [Estado.BORRADOR, Estado.PENDIENTE, Estado.REENVIADA]) {
  test(`el procesador no elimina documentos de solicitudes ${estado}`, async () => {
    const e = escenario(solicitud(estado));
    await e.limpieza.ejecutar();
    assert.equal(e.borrados.length, 0);
    assert.ok(e.estado.solicitud.dni_frente_url);
  });
}

test('rechaza resoluciones repetidas o de otra revisión sin borrar archivos', async () => {
  for (const s of [solicitud(Estado.APROBADA), Object.assign(solicitud(), { numero_revision: 2 })]) {
    const e = escenario(s);
    await assert.rejects(e.servicio.aprobar(7, 12, { numero_revision: 1 }));
    assert.equal(e.borrados.length, 0);
    assert.equal(e.estado.trabajos.length, 0);
  }
});

test('no aprueba una identidad sin evidencia válida ni constancias requeridas', async () => {
  for (const cambio of [{ prueba_vida_consumida_en: null }, { dni_frente_url: null }, { matricula_url: null }]) {
    const e = escenario(Object.assign(solicitud(Estado.PENDIENTE, true), cambio));
    await assert.rejects(e.servicio.aprobar(7, 12, { numero_revision: 1 }));
    assert.equal(e.estado.trabajos.length, 0);
    assert.equal(e.borrados.length, 0);
  }
});

test('el correo fallido no revierte la decisión ni evita la eliminación', async () => {
  const e = escenario();
  e.servicio.mailService.enviarResultadoVerificacion = async () => { throw new Error('fallo correo'); };
  e.servicio.logger = { error() {} };
  await e.servicio.aprobar(7, 12, { numero_revision: 1 });
  assert.equal(e.estado.solicitud.estado, Estado.APROBADA);
  assert.equal(e.borrados.length, 3);
});

test('no solapa dos ejecuciones locales y libera el indicador tras fallar la base', async () => {
  let resolver, llamadas = 0;
  const limpieza = new EliminacionDocumentosService({ conEliminacionesPendientes: async () => {
    llamadas += 1;
    await new Promise(r => { resolver = r; });
    throw new Error('fallo base');
  } }, {});
  limpieza.logger = { error() {} };
  const primera = limpieza.ejecutar();
  await limpieza.ejecutar();
  assert.equal(llamadas, 1);
  resolver(); await primera;
  const segunda = limpieza.ejecutar();
  assert.equal(llamadas, 2);
  resolver(); await segunda;
});

test('Azure borra solo del contenedor propio, incluye snapshots y detecta copias recuperables', async (t) => {
  const original = BlobServiceClient.fromConnectionString;
  t.after(() => { BlobServiceClient.fromConnectionString = original; });
  let copias = [], borrados = 0, consulta;
  BlobServiceClient.fromConnectionString = () => ({ getContainerClient: () => ({
    url: 'https://cuenta.blob.core.windows.net/verificaciones',
    getBlobClient: () => ({ async deleteIfExists(opciones) {
      assert.equal(opciones.deleteSnapshots, 'include'); borrados += 1;
    } }),
    async *listBlobsFlat(opciones) { consulta = opciones; yield* copias; },
  }) });
  const repo = new AzureArchivoRepository({ getOrThrow: () => 'conexion', get: () => undefined });
  const url = 'https://cuenta.blob.core.windows.net/verificaciones/usuarios/7/dni.jpg';
  await repo.eliminarDocumentoPropio(url);
  assert.equal(consulta.prefix, 'usuarios/7/dni.jpg');
  assert.equal(consulta.includeDeleted, true);
  assert.equal(consulta.includeVersions, true);
  assert.equal(consulta.includeSnapshots, true);
  copias = [{ name: 'usuarios/7/dni.jpg', deleted: true }];
  await assert.rejects(repo.eliminarDocumentoPropio(url), /conserva copias/);
  copias = [{ name: 'usuarios/7/dni.jpg', versionId: 'version-anterior' }];
  await assert.rejects(repo.eliminarDocumentoPropio(url), /conserva copias/);
  copias = [{ name: 'usuarios/7/dni.jpg-otro' }];
  await repo.eliminarDocumentoPropio(url);
  const antes = borrados;
  await assert.rejects(repo.eliminarDocumentoPropio('https://otro.test/verificaciones/archivo'), /ajeno/);
  await assert.rejects(repo.eliminarDocumentoPropio('https://cuenta.blob.core.windows.net/verificaciones-ajeno/archivo'), /ajeno/);
  assert.equal(borrados, antes);
});

test('la migración PostgreSQL es repetible, preserva solicitudes abiertas e historial y procesa la cola real', async () => {
  const { PGlite } = require('@electric-sql/pglite');
  const fs = require('node:fs');
  const path = require('node:path');
  const db = new PGlite();
  try {
    await db.exec(`CREATE TABLE solicitud_verificacion (
      id INT PRIMARY KEY, estado TEXT, numero_revision INT, motivo_rechazo TEXT,
      actualizada_en TIMESTAMP, prueba_vida_validada_en TIMESTAMPTZ,
      dni_frente_url VARCHAR(500), dni_dorso_url VARCHAR(500), rostro_url VARCHAR(500),
      matricula_url VARCHAR(500), constancia_cuit_url VARCHAR(500),
      prueba_vida_desafio UUID, prueba_vida_revision INT, prueba_vida_rostro_hash VARCHAR(64),
      prueba_vida_vence_en TIMESTAMPTZ, prueba_vida_consumida_en TIMESTAMPTZ);
      CREATE TABLE revision_verificacion (id INT, id_administrador INT, motivo TEXT);
      INSERT INTO revision_verificacion VALUES (1, 12, 'Documento ilegible');`);
    for (const [i, estado] of Object.values(Estado).entries()) {
      await db.query(`INSERT INTO solicitud_verificacion VALUES
        ($1, $2, 1, 'Motivo original', '2026-11-01', '2026-11-01',
         $3, $4, $5, $6, $7, '00000000-0000-0000-0000-000000000001',
         1, 'hash', '2026-11-01', '2026-11-01')`,
      [i, estado, ...campos.map(campo => `${estado}/${campo}`)]);
    }
    const consultar = async () => (await db.query('SELECT * FROM solicitud_verificacion ORDER BY id')).rows;
    const originales = await consultar();
    const revisiones = (await db.query('SELECT * FROM revision_verificacion')).rows;
    const migracion = fs.readFileSync(path.join(__dirname, '../migrations/20261105-eliminacion-documentos.sql'), 'utf8');
    await db.exec('BEGIN;');
    await db.exec(migracion);
    await db.exec('COMMIT;');
    const primera = await consultar();
    for (const actual of primera) {
      const anterior = originales.find(s => s.id === actual.id);
      if ([Estado.APROBADA, Estado.RECHAZADA].includes(actual.estado)) {
        campos.forEach(c => assert.equal(actual[c], null));
        CAMPOS_PRUEBA_PRIVADOS.forEach(c => assert.equal(actual[c], null));
        for (const c of ['estado', 'numero_revision', 'motivo_rechazo', 'actualizada_en', 'prueba_vida_validada_en']) {
          assert.deepEqual(actual[c], anterior[c]);
        }
      } else assert.deepEqual(actual, anterior);
    }
    assert.equal((await db.query('SELECT * FROM eliminacion_documento')).rows.length, 10);
    assert.deepEqual((await db.query('SELECT * FROM revision_verificacion')).rows, revisiones);
    await db.exec('BEGIN;'); await db.exec(migracion); await db.exec('COMMIT;');
    assert.deepEqual(await consultar(), primera);
    assert.equal((await db.query('SELECT * FROM eliminacion_documento')).rows.length, 10);

    // Ejecuta las consultas reales del procesador con el motor PostgreSQL local.
    const ejecutar = async (tx, qb) => {
      const [sql, params] = qb.getQueryAndParameters();
      return (await tx.query(sql, params)).rows;
    };
    const ds = { transaction: fn => db.transaction(tx => fn({ getRepository: () => ({
      createQueryBuilder(alias) {
        const qb = source.getRepository(Trabajo).createQueryBuilder(alias);
        qb.getMany = async () => (await ejecutar(tx, qb)).map(fila =>
          Object.assign(new Trabajo(), Object.fromEntries(Object.entries(fila)
            .map(([campo, valor]) => [campo.slice(alias.length + 1), valor]))));
        return qb;
      },
      save(t) { return ejecutar(tx, source.createQueryBuilder().update(Trabajo)
        .set({ intentos: t.intentos, proximo_intento: t.proximo_intento }).where('id = :id', { id: t.id })); },
      delete(id) { return ejecutar(tx, source.createQueryBuilder().delete().from(Trabajo).where('id = :id', { id })); },
    }) })) };
    const repo = new VerificacionRepository({}, {}, ds);
    const ahora = new Date('2100-01-01T00:00:00Z');
    const procesar = async (eliminar, fecha) => {
      let resultado;
      const limpieza = new EliminacionDocumentosService({
        conEliminacionesPendientes: async (...args) => {
          resultado = await repo.conEliminacionesPendientes(...args);
          return resultado;
        },
      }, { eliminarDocumentoPropio: eliminar });
      limpieza.logger = { error() {}, warn() {} };
      await limpieza.ejecutar(fecha);
      return resultado;
    };
    const intento = await procesar(async url => {
      if (url.startsWith('rechazada/')) throw new Error('proveedor no disponible');
    }, ahora);
    assert.deepEqual(intento, { eliminados: 5, fallidos: 5 });
    const pendientes = (await db.query('SELECT * FROM eliminacion_documento')).rows;
    assert.equal(pendientes.length, 5);
    assert.ok(pendientes.every(t => t.intentos === 1 && t.proximo_intento > ahora));
    assert.deepEqual(await procesar(async () => {}, ahora), { eliminados: 0, fallidos: 0 });
    assert.deepEqual(await procesar(async () => {}, new Date(ahora.getTime() + 60_000)),
      { eliminados: 5, fallidos: 0 });
    assert.equal((await db.query('SELECT * FROM eliminacion_documento')).rows.length, 0);
    assert.deepEqual((await db.query('SELECT * FROM revision_verificacion')).rows, revisiones);
  } finally { await db.close(); }
});
