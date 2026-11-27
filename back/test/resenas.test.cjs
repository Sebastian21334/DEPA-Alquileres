require('reflect-metadata');
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { PGlite } = require('@electric-sql/pglite');
const { validate } = require('class-validator');
const { plainToInstance } = require('class-transformer');
const {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Logger,
  NotFoundException,
} = require('@nestjs/common');
const { GUARDS_METADATA } = require('@nestjs/common/constants');
const { CrearResenaDto } = require('../dist/resenas/dto/crear-resena.dto');
const { ModerarResenaDto } = require('../dist/resenas/dto/moderar-resena.dto');
const { ResenasObjetivoController } = require('../dist/resenas/controller/resenas-objetivo.controller');
const { ResenasAdministracionController } = require('../dist/resenas/controller/resenas-administracion.controller');
const { ResenasController } = require('../dist/resenas/controller/resenas.controller');
const { JwtAuthGuard } = require('../dist/seguridad/guards/jwt-auth.guard');
const { OptionalJwtAuthGuard } = require('../dist/seguridad/guards/optional-jwt-auth.guard');
const { RolesGuard } = require('../dist/seguridad/guards/roles.guard');
const { CatalogosService } = require('../dist/catalogos/service/catalogos.service');
const { ReservasService } = require('../dist/reservas/service/reservas.service');
const { ValorDuplicadoError } = require('../dist/common/persistence/valor-duplicado.error');
const { ImagenInvalidaError } = require('../dist/almacenamiento/proveedor/procesador-imagenes.interface');
const { paginar } = require('../dist/common/persistence/paginacion');
const { ResenasRepository } = require('../dist/resenas/repository/resenas.repository');
const { ResenasImagenesRepository } = require('../dist/resenas/repository/resenas-imagenes.repository');
const { Resena } = require('../dist/resenas/entity/resena.entity');
const { ResenaImagen } = require('../dist/resenas/entity/resena-imagen.entity');
const { crearPostgresPruebas } = require('./soporte/postgres-pruebas.cjs');
const {
  resenaMock,
  publicacionMock,
  servicioMock,
  imagenServicioMock,
} = require('./soporte/resenas-pruebas.cjs');

const MIGRACION = readFileSync('migrations/20261126-resenas.sql', 'utf8');

test('los DTO validan puntaje, comentario y motivo de moderación', async () => {
  for (const puntaje of [0, 6, 2.5]) {
    const dto = plainToInstance(CrearResenaDto, { puntaje, comentario: 'Comentario válido' });
    assert.ok((await validate(dto)).length, `puntaje ${puntaje} debería fallar`);
  }
  for (const puntaje of [1, 5, '5']) {
    const dto = plainToInstance(CrearResenaDto, { puntaje, comentario: 'Comentario válido' });
    assert.equal((await validate(dto)).length, 0);
  }
  const comenta = (comentario) => plainToInstance(CrearResenaDto, { puntaje: 5, comentario });
  assert.ok((await validate(comenta('   '))).length);
  assert.ok((await validate(comenta('x'.repeat(201)))).length);
  assert.equal((await validate(comenta('x'.repeat(200)))).length, 0);
});

test('moderar valida siempre el tipo del motivo y solo exige longitud al ocultar', async () => {
  const moderar = (datos) => plainToInstance(ModerarResenaDto, datos);
  assert.ok((await validate(moderar({ visible: true, motivo: 123 }))).length);
  assert.ok((await validate(moderar({ visible: true, motivo: { texto: 'x' } }))).length);
  assert.ok((await validate(moderar({ visible: false, motivo: 123 }))).length);
  assert.equal((await validate(moderar({ visible: true }))).length, 0);
  assert.equal((await validate(moderar({ visible: true, motivo: 'Texto válido' }))).length, 0);
  assert.ok((await validate(moderar({ visible: false, motivo: 'mal' }))).length);
  assert.equal((await validate(moderar({ visible: false }))).length, 0);
  assert.equal((await validate(moderar({ visible: false, motivo: 'Texto válido' }))).length, 0);
});

test('la migración crea el modelo, conserva la idempotencia y recalcula las cachés', async () => {
  const db = new PGlite();
  try {
    await db.exec(`
      CREATE TABLE public.usuario (id_usuario integer PRIMARY KEY);
      CREATE TABLE public.modalidad (
        id_modalidad integer PRIMARY KEY,
        permite_reservas_por_fecha boolean NOT NULL
      );
      CREATE TABLE public.publicacion (
        id_publicacion integer PRIMARY KEY,
        id_modalidad integer REFERENCES public.modalidad(id_modalidad)
      );
      CREATE TABLE public.anunciante (
        id_usuario integer PRIMARY KEY REFERENCES public.usuario(id_usuario)
      );
      INSERT INTO public.usuario VALUES (1), (2), (3);
      INSERT INTO public.modalidad VALUES (1, true), (2, false);
      INSERT INTO public.publicacion VALUES (5, 1), (6, 2);
      INSERT INTO public.anunciante VALUES (1);
    `);
    await db.exec(MIGRACION);
    await db.query(
      `INSERT INTO public.resena (id_usuario, id_publicacion, puntaje, comentario)
       VALUES (2, 5, 5, 'Primera reseña'), (3, 5, 4, 'Segunda reseña')`,
    );
    await db.query(
      `INSERT INTO public.resena (id_usuario, id_publicacion, puntaje, comentario, denunciada, motivo_denuncia, fecha_denuncia)
       VALUES (2, 6, 3, 'Reseña de largo plazo', true, 'Prueba', now())`,
    );
    await db.query(
      `INSERT INTO public.resena (id_usuario, id_anunciante, puntaje, comentario)
       VALUES (2, 1, 5, 'Reseña del perfil')`,
    );
    await db.exec(MIGRACION);

    const { rows: [publicacion] } = await db.query(
      'SELECT cantidad_resenas, promedio_resenas FROM public.publicacion WHERE id_publicacion = 5',
    );
    assert.equal(publicacion.cantidad_resenas, 2);
    assert.equal(Number(publicacion.promedio_resenas), 4.5);
    const { rows: [anunciante] } = await db.query(
      'SELECT cantidad_resenas, promedio_resenas FROM public.anunciante WHERE id_usuario = 1',
    );
    assert.equal(anunciante.cantidad_resenas, 1);
    assert.equal(Number(anunciante.promedio_resenas), 5);
    const { rows: [largoplazo] } = await db.query(
      'SELECT count(*)::int AS cantidad FROM public.resena WHERE id_publicacion = 6',
    );
    assert.equal(largoplazo.cantidad, 0);
    const { rows: [denunciada] } = await db.query(
      `SELECT denunciada, motivo_denuncia FROM public.resena
       WHERE id_publicacion = 5 AND id_usuario = 2`,
    );
    assert.equal(denunciada.denunciada, false);

    await assert.rejects(() => db.query(
      `INSERT INTO public.resena (id_usuario, puntaje, comentario) VALUES (1, 5, 'Sin objetivo')`,
    ));
    await assert.rejects(() => db.query(
      `INSERT INTO public.resena (id_usuario, id_publicacion, id_anunciante, puntaje, comentario)
       VALUES (1, 5, 1, 5, 'Dos objetivos')`,
    ));
    await assert.rejects(() => db.query(
      `INSERT INTO public.resena (id_usuario, id_publicacion, puntaje, comentario)
       VALUES (1, 5, 0, 'Puntaje inválido')`,
    ));
    await assert.rejects(() => db.query(
      `INSERT INTO public.resena (id_usuario, id_publicacion, puntaje, comentario)
       VALUES (2, 5, 4, 'Duplicada')`,
    ));
  } finally {
    await db.close();
  }
});

test('el listado público no filtra datos privados y calcula la elegibilidad', async () => {
  const { servicio } = servicioMock({
    reservas: {
      existeEstadiaFinalizadaEnPublicacion: async (_idPublicacion, idUsuario) => idUsuario === 3,
    },
  });
  const resultado = await servicio.listarPublicacion(5, 3, { pagina: 1, limite: 6 });
  assert.equal(resultado.promedio, 5);
  assert.equal(resultado.cantidad, 1);
  assert.equal(resultado.puedeResenar, true);
  assert.equal(resultado.resenas[0].autor.nombre, 'Ana');
  assert.equal('email' in resultado.resenas[0].autor, false);
  assert.equal('telefono' in resultado.resenas[0].autor, false);

  const sinEstadia = await servicio.listarPublicacion(5, 4, { pagina: 1, limite: 6 });
  assert.equal(sinEstadia.puedeResenar, false);
  assert.equal(sinEstadia.motivoNoPuede, 'SIN_ESTADIA');

  const propia = await servicio.listarPublicacion(5, 2, { pagina: 1, limite: 6 });
  assert.equal(propia.puedeResenar, false);
  assert.equal(propia.motivoNoPuede, 'PROPIO');
});

test('el listado público usa la visibilidad de la publicación y excluye la reseña propia', async () => {
  let llamado;
  const { servicio } = servicioMock({
    publicaciones: {
      buscarPublicaPorId: async () => {
        throw new NotFoundException('Publicación no disponible');
      },
    },
  });
  await assert.rejects(
    () => servicio.listarPublicacion(5, 3, { pagina: 1, limite: 6 }),
    NotFoundException,
  );

  const { servicio: conPagina } = servicioMock({
    repo: {
      buscarPaginaPorObjetivo: async (...args) => {
        llamado = args;
        return {
          datos: [resenaMock({ id: 11, autor: { ...resenaMock().autor, id: 4 } })],
          pagina: 1,
          limite: 6,
          total: 1,
          totalPaginas: 1,
        };
      },
    },
  });
  const resultado = await conPagina.listarPublicacion(5, 3, { pagina: 1, limite: 6 });
  assert.deepEqual(llamado, ['PUBLICACION', 5, 1, 6, 3]);
  assert.equal(resultado.resenas.length, 1);
  assert.equal(resultado.resenas[0].id, 11);
});

test('listar una publicación eliminada o un anunciante inexistente devuelve 404', async () => {
  const { servicio } = servicioMock({
    publicaciones: {
      buscarPublicaPorId: async () => publicacionMock({ eliminada: true }),
    },
  });
  await assert.rejects(
    () => servicio.crearPublicacion(5, 3, { puntaje: 5, comentario: 'No permitida' }),
    NotFoundException,
  );

  const { servicio: sinAnunciante } = servicioMock({
    anunciantes: { buscarPorId: async () => null },
  });
  await assert.rejects(
    () => sinAnunciante.listarAnunciante(2, 3, { pagina: 1, limite: 6 }),
    NotFoundException,
  );
});

test('la regla Temporal usa el fallback de la modalidad legada', () => {
  const catalogos = new CatalogosService({});
  assert.equal(catalogos.admiteReservaPorFecha({
    nombre: 'Temporal',
    permite_reservas_por_fecha: null,
  }), true);
  assert.equal(catalogos.admiteReservaPorFecha({
    nombre: 'Largo Plazo',
    permite_reservas_por_fecha: null,
  }), false);
  assert.equal(catalogos.admiteReservaPorFecha({
    nombre: 'Cualquiera',
    permite_reservas_por_fecha: false,
  }), false);
});

test('el perfil filtra las modalidades temporales resueltas por CatalogosService', async () => {
  let argumentos;
  const repo = {
    existeEstadiaFinalizadaConAnunciante: async (...args) => {
      argumentos = args;
      return true;
    },
  };
  const catalogos = {
    getModalidades: async () => [
      { id: 1, admite_reservas_por_fecha: true },
      { id: 2, admite_reservas_por_fecha: false },
      { id: 3, admite_reservas_por_fecha: true },
    ],
    codigoEstado: () => 'APROBADO',
  };
  const reservas = new ReservasService(
    undefined, repo, undefined, undefined, undefined, undefined, undefined,
    undefined, undefined, catalogos,
  );
  await reservas.existeEstadiaFinalizadaConAnunciante(7, 4);
  assert.equal(argumentos[0], 7);
  assert.equal(argumentos[1], 4);
  assert.equal(argumentos[3], 'APROBADO');
  assert.deepEqual(argumentos[4], [1, 3]);
});

test('denunciar exige ser otro usuario y deja el estado en revisión', async () => {
  const { servicio, estado } = servicioMock();
  const resultado = await servicio.denunciar(10, 4, {});
  assert.equal(resultado.denunciada, true);
  assert.equal(estado.denuncia[1], 4);
  assert.equal(estado.denuncia[2], 'Marcada como inapropiada por un usuario');
  assert.ok(estado.denuncia[3] instanceof Date);

  await assert.rejects(() => servicio.denunciar(10, 3, {}), ForbiddenException);

  const { servicio: oculta } = servicioMock({
    repo: { buscarPorId: async () => resenaMock({ visible: false }) },
  });
  await assert.rejects(() => oculta.denunciar(10, 4, {}), BadRequestException);

  const { servicio: yaDenunciada } = servicioMock({
    repo: { buscarPorId: async () => resenaMock({ denunciada: true }) },
  });
  assert.equal((await yaDenunciada.denunciar(10, 4, {})).denunciada, true);
});

test('crear una reseña exige estadía, bloquea el propio contenido y traduce duplicados', async () => {
  const { servicio, estado } = servicioMock({
    repo: { buscarPorId: async () => resenaMock({ id: 99 }) },
  });
  const creada = await servicio.crearPublicacion(5, 3, {
    puntaje: 5,
    comentario: '  Muy buena estadía  ',
  });
  assert.equal(creada.id, 99);
  assert.equal(estado.crearPublicacion.idPublicacion, 5);
  assert.equal(estado.crearPublicacion.idUsuario, 3);
  assert.equal(estado.crearPublicacion.comentario, 'Muy buena estadía');
  assert.deepEqual(estado.resumenPublicacion, [5, 1, 5]);

  await assert.rejects(
    () => servicio.crearPublicacion(5, 2, { puntaje: 5, comentario: 'Propia' }),
    ForbiddenException,
  );

  const { servicio: sinEstadia } = servicioMock({
    reservas: { existeEstadiaFinalizadaEnPublicacion: async () => false },
  });
  await assert.rejects(
    () => sinEstadia.crearPublicacion(5, 3, { puntaje: 5, comentario: 'Sin estadía' }),
    ForbiddenException,
  );

  const { servicio: duplicada } = servicioMock({
    repo: {
      buscarPorObjetivoYAutor: async () => resenaMock(),
    },
  });
  await assert.rejects(
    () => duplicada.crearPublicacion(5, 3, { puntaje: 5, comentario: 'Duplicada' }),
    ConflictException,
  );

  const { servicio: carrera } = servicioMock({
    repo: {
      guardar: async () => {
        throw new ValorDuplicadoError('uq_resena_publicacion_autor', new Error('duplicado'));
      },
    },
  });
  await assert.rejects(
    () => carrera.crearPublicacion(5, 3, { puntaje: 5, comentario: 'Carrera' }),
    ConflictException,
  );

  const { servicio: perfil, estado: estadoPerfil } = servicioMock({
    repo: { buscarPorId: async () => resenaMock({ id: 100 }) },
  });
  const creadaPerfil = await perfil.crearAnunciante(2, 3, {
    puntaje: 4,
    comentario: 'Perfil',
  });
  assert.equal(estadoPerfil.crearAnunciante.idAnunciante, 2);
  assert.equal(estadoPerfil.crearAnunciante.idUsuario, 3);
  assert.equal(creadaPerfil.id, 100);
});

test('editar y borrar exige ser el autor, respeta la moderación y borra la fila antes del storage', async () => {
  const orden = [];
  const { servicio, estado } = servicioMock({
    repo: {
      buscarPorId: async () => resenaMock({
        imagenes: [{ id: 7, url: 'https://storage.test/resena.jpg' }],
      }),
      eliminar: async () => {
        orden.push('fila');
        estado.eliminar = true;
      },
    },
    imagenes: {
      eliminarArchivos: async () => {
        orden.push('storage');
        estado.archivosEliminados = true;
      },
    },
  });
  await servicio.actualizar(10, 3, { puntaje: 4, comentario: 'Editada' });
  assert.equal(estado.actualizar.puntaje, 4);
  assert.equal(estado.actualizar.comentario, 'Editada');
  assert.ok(estado.actualizar.actualizada_en instanceof Date);

  await assert.rejects(
    () => servicio.actualizar(10, 4, { puntaje: 4, comentario: 'Ajena' }),
    ForbiddenException,
  );

  const { servicio: oculta } = servicioMock({
    repo: { buscarPorId: async () => resenaMock({ visible: false }) },
  });
  await assert.rejects(
    () => oculta.actualizar(10, 3, { puntaje: 4, comentario: 'Oculta' }),
    ConflictException,
  );

  await servicio.eliminar(10, 3);
  assert.deepEqual(orden, ['fila', 'storage']);
  assert.equal(estado.eliminar, true);

  await assert.rejects(() => servicio.eliminar(10, 4), ForbiddenException);
});

test('las imágenes se limitan a tres, exigen autoría y borran la fila antes del storage', async () => {
  const { servicio, llamadas } = imagenServicioMock();
  const archivo = { buffer: Buffer.from('png'), size: 3 };
  const imagen = await servicio.agregar(10, 3, archivo);
  assert.equal(imagen.url, 'https://storage.test/resena.jpg');

  await assert.rejects(() => servicio.agregar(10, 4, archivo), ForbiddenException);
  await assert.rejects(() => servicio.agregar(10, 3, undefined), BadRequestException);

  const { servicio: lleno } = imagenServicioMock({
    imagenesRepo: { contarPorResena: async () => 3 },
  });
  await assert.rejects(() => lleno.agregar(10, 3, archivo), BadRequestException);

  const { servicio: oculto } = imagenServicioMock({
    acceso: { buscarParaImagenes: async () => ({ id: 10, visible: false, autor: { id: 3 } }) },
  });
  await assert.rejects(() => oculto.agregar(10, 3, archivo), ConflictException);

  await servicio.eliminar(10, 2, 3);
  assert.deepEqual(llamadas.orden, ['fila', 'storage']);

  const { servicio: carrera } = imagenServicioMock({
    imagenesRepo: {
      guardar: async () => {
        throw new ValorDuplicadoError('uq_resena_imagen_orden', new Error('duplicado'));
      },
    },
  });
  await assert.rejects(() => carrera.agregar(10, 3, archivo), ConflictException);
});

test('un archivo inválido es 400 y una falla interna del procesamiento no se enmascara', async () => {
  const registrarError = Logger.prototype.error;
  Logger.prototype.error = () => undefined;
  try {
    const { servicio } = imagenServicioMock({
      preparacion: {
        preparar: async () => {
          throw new ImagenInvalidaError();
        },
      },
    });
    await assert.rejects(
      () => servicio.agregar(10, 3, { buffer: Buffer.from('x'), size: 1 }),
      BadRequestException,
    );

    const errorInterno = new Error('falló el procesador');
    const { servicio: interno } = imagenServicioMock({
      preparacion: {
        preparar: async () => {
          throw errorInterno;
        },
      },
    });
    await assert.rejects(
      () => interno.agregar(10, 3, { buffer: Buffer.from('x'), size: 1 }),
      (error) => error === errorInterno,
    );
  } finally {
    Logger.prototype.error = registrarError;
  }
});

test('el paginador clampa la página antes de consultar la fila', async () => {
  let skip;
  const consulta = {
    clone() { return this; },
    async getCount() { return 7; },
    skip(valor) { skip = valor; return this; },
    take() { return this; },
    async getMany() { return [{ id: 7 }]; },
  };
  const resultado = await paginar(consulta, { pagina: 99, limite: 3 });
  assert.equal(resultado.pagina, 3);
  assert.equal(resultado.totalPaginas, 3);
  assert.equal(skip, 6);
  assert.deepEqual(resultado.datos, [{ id: 7 }]);
});

test('el repositorio real pagina con joins, excluye al autor y traduce duplicados', async () => {
  const { db, source, cerrar } = await crearPostgresPruebas();
  try {
    await db.exec(`
      INSERT INTO public.usuario (id_usuario, nombre, apellido, email, telefono, contrasenia)
      VALUES (1, 'Ana', 'Uno', 'ana1@test.invalid', '1', 'x'),
             (2, 'Beto', 'Dos', 'beto@test.invalid', '2', 'x'),
             (3, 'Caro', 'Tres', 'caro@test.invalid', '3', 'x'),
             (4, 'Dani', 'Cuatro', 'dani@test.invalid', '4', 'x');
      INSERT INTO public.modalidad (id_modalidad, nombre, permite_reservas_por_fecha)
      VALUES (1, 'Temporal', true);
      INSERT INTO public.anunciante (id_usuario, verificado, numero_contacto)
      VALUES (2, true, '2');
      INSERT INTO public.publicacion
        (id_publicacion, titulo, descripcion, fecha_publicacion, precio, activa, direccion, cantidad_ambientes, superficie, id_modalidad, id_anunciante)
      VALUES (5, 'Depto demo', 'x', '2026-01-01', 100, true, 'Calle 1', 2, 30, 1, 2);
    `);
    const repo = new ResenasRepository(source.getRepository(Resena));
    const creadas = [];
    for (const idUsuario of [1, 3, 4]) {
      creadas.push(await repo.guardar(repo.crearParaPublicacion({
        idUsuario,
        idPublicacion: 5,
        puntaje: 5,
        comentario: `Reseña de ${idUsuario}`,
        fecha: new Date('2026-11-20T12:00:00.000Z'),
      })));
    }
    assert.equal(creadas.length, 3);
    const imagenesRepo = new ResenasImagenesRepository(source.getRepository(ResenaImagen));
    await imagenesRepo.guardar(imagenesRepo.crear(creadas[0].id, 'https://storage.test/1.jpg', 1));

    await assert.rejects(
      () => repo.guardar(repo.crearParaPublicacion({
        idUsuario: 1,
        idPublicacion: 5,
        puntaje: 4,
        comentario: 'Duplicada',
        fecha: new Date(),
      })),
      ValorDuplicadoError,
    );

    const primera = await repo.buscarPaginaPorObjetivo('PUBLICACION', 5, 1, 2);
    assert.equal(primera.total, 3);
    assert.equal(primera.totalPaginas, 2);
    assert.equal(primera.datos.length, 2);

    const fuera = await repo.buscarPaginaPorObjetivo('PUBLICACION', 5, 99, 2);
    assert.equal(fuera.pagina, 2);
    assert.equal(fuera.total, 3);
    assert.equal(fuera.datos.length, 1);

    const sinAutor = await repo.buscarPaginaPorObjetivo('PUBLICACION', 5, 1, 10, 1);
    assert.equal(sinAutor.total, 2);
    assert.equal(sinAutor.datos.every((resena) => resena.autor.id !== 1), true);

    const idResena = creadas[0].id;
    const acceso = await repo.buscarParaImagenes(idResena);
    assert.equal(acceso.autor.id, 1);
    await repo.registrarDenuncia(idResena, 3, 'Motivo real', new Date('2026-11-21T12:00:00.000Z'));
    let actualizada = await repo.buscarPorId(idResena);
    assert.equal(actualizada.denunciada, true);
    assert.equal(actualizada.denunciante.id, 3);
    await repo.quitarDenuncia(idResena);
    actualizada = await repo.buscarPorId(idResena);
    assert.equal(actualizada.denunciada, false);
    assert.equal(actualizada.denunciante, null);

    await repo.registrarModeracion(idResena, {
      visible: false,
      motivo: 'Lenguaje ofensivo',
      idAdministrador: 2,
      fecha: new Date('2026-11-22T12:00:00.000Z'),
    });
    actualizada = await repo.buscarPorId(idResena);
    assert.equal(actualizada.visible, false);
    assert.equal(actualizada.moderador.id, 2);

    await assert.rejects(
      () => imagenesRepo.guardar(imagenesRepo.crear(idResena, 'https://storage.test/2.jpg', 1)),
      ValorDuplicadoError,
    );
  } finally {
    await cerrar();
  }
});

test('los endpoints públicos y privados conservan sus guards y roles', () => {
  const guardias = (controlador, metodo) =>
    Reflect.getMetadata(GUARDS_METADATA, controlador.prototype[metodo]) ?? [];
  assert.ok(guardias(ResenasObjetivoController, 'listarPublicacion').includes(OptionalJwtAuthGuard));
  assert.ok(guardias(ResenasObjetivoController, 'listarAnunciante').includes(OptionalJwtAuthGuard));
  assert.ok(guardias(ResenasObjetivoController, 'crearPublicacion').includes(JwtAuthGuard));
  assert.ok(guardias(ResenasObjetivoController, 'crearAnunciante').includes(JwtAuthGuard));
  assert.ok(guardias(ResenasController, 'subirImagen').includes(JwtAuthGuard));
  assert.ok(guardias(ResenasController, 'denunciar').includes(JwtAuthGuard));
  assert.ok(guardias(ResenasAdministracionController, 'listar').includes(JwtAuthGuard));
  assert.ok(guardias(ResenasAdministracionController, 'listar').includes(RolesGuard));
  assert.ok(guardias(ResenasAdministracionController, 'quitarDenuncia').includes(JwtAuthGuard));
  assert.ok(guardias(ResenasAdministracionController, 'quitarDenuncia').includes(RolesGuard));
  assert.deepEqual(
    Reflect.getMetadata('roles', ResenasAdministracionController.prototype.listar),
    ['Administrador'],
  );
  assert.deepEqual(
    Reflect.getMetadata('roles', ResenasAdministracionController.prototype.moderar),
    ['Administrador'],
  );
  assert.deepEqual(
    Reflect.getMetadata('roles', ResenasAdministracionController.prototype.quitarDenuncia),
    ['Administrador'],
  );
});
