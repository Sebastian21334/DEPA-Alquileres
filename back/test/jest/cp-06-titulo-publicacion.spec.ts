/**
 * CP-06 · Formato del título de una publicación
 * Requerimiento: RF8 Gestión de publicaciones; RN-5.
 * Caso de uso: CU 9 Registrar Publicación (el caso modifica el título, ver CU 10).
 * Tipo de testing: funcional de caja negra. Técnica: partición de equivalencias.
 * Autor del caso: Leandro Didrig. Versión 1.0.
 *
 * Cada paso intenta modificar el título con PATCH /publicaciones/:id y
 * comprueba la respuesta y el título persistido.
 */
import request from 'supertest';
import { Anunciante } from '../../src/anunciantes/entity/anunciante.entity';
import { Publicacion } from '../../src/publicaciones/entity/publicacion.entity';
import { AppDePrueba, crearAppDePrueba } from './soporte/app-de-prueba';

const ID_PUBLICACION = 600;
const CONTRASENIA_TESTER = 'ClaveTesterLD2026!';

const DATA = {
  nombreUsuario: 'Tester_LD',
  tituloOriginal: 'Publicación original CP-06',
  titulo1: '',
  titulo2: ' ',
  titulo3: 'hola',
  titulo4:
    'Titulo de prueba para validar el limite maximo de caracteres Titulo de prueba para validar el limite maximo de caracteres Titulo de prueba para validar el limite maximo de caracteres Titulo de prueba para validar el limite maximo de caracteres Titulo de prueba para validar el limite maximo de caract',
  titulo5: '°|¬!"#$%&/()=?¡¿\'¨*+~[]{}^`<>;:,.-_@€£¥©®™§¶•±×÷µ¼½¾«»‰†‡∞≠≤≥√∑∆Ωπ←→↑↓✓✗★♥♦♣♠ñÑáéíóúüÇ¬',
  titulo6: '😀😂🥲😍🤔😴🔥💯✅❌⭐❤️👍👍🏽👋🏿🙏🎉🚀🍕⚽🐶🐱🌎🌈💻📱🏠🔑👨‍👩‍👧‍👦👩🏻‍💻🧑‍🚀🏳️‍🌈',
  titulo7: 'Titulo de prueba correcto',
};

// Casos complementarios al documento: bordes del largo mínimo y símbolos puntuales.
const BORDES = {
  catorceCaracteres: 'Casa en centro',
  quinceCaracteres: 'Casa en centros',
  simbolosPermitidos: 'Depto: 2 amb, Centro. Luminoso',
  conGuion: 'Depto 2 ambientes - Centro',
  conEmoji: 'Casa amplia con pileta 🏠',
  soloEspacios: ' '.repeat(20),
};

describe('CP-06 · Formato del título de una publicación (partición de equivalencias)', () => {
  let ctx: AppDePrueba;
  let token: string;

  // Precondiciones: backend disponible, sesión de "Tester_LD" con rol
  // Anunciante y una publicación activa con el título original.
  beforeAll(async () => {
    ctx = await crearAppDePrueba();
    const tester = await ctx.crearUsuario({
      nombre: DATA.nombreUsuario,
      email: 'tester.ld@depa.test',
      contrasenia: CONTRASENIA_TESTER,
      rol: 'Anunciante',
    });
    const anunciante = Object.assign(new Anunciante(), {
      idUsuario: tester.id,
      usuario: tester,
      verificado: true,
    });
    ctx.anunciantes.set(tester.id, anunciante);
    await ctx.publicaciones.guardar(
      Object.assign(new Publicacion(), {
        id: ID_PUBLICACION,
        titulo: DATA.tituloOriginal,
        descripcion: 'Departamento para el caso de prueba CP-06',
        activa: true,
        anunciante,
      }),
    );

    const login = await request(ctx.app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'tester.ld@depa.test', contrasenia: CONTRASENIA_TESTER });
    expect(login.status).toBe(201);
    token = login.body.access_token;
  });

  // Si un paso acepta un título inválido, se restaura el original para que
  // ese error no arrastre a los pasos siguientes.
  beforeEach(() => {
    const publicacion = ctx.publicaciones.filas.get(ID_PUBLICACION);
    if (publicacion) publicacion.titulo = DATA.tituloOriginal;
  });

  afterAll(() => ctx.cerrar());

  const modificarTitulo = (titulo: string) =>
    request(ctx.app.getHttpServer())
      .patch(`/publicaciones/${ID_PUBLICACION}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ titulo });

  const tituloPersistido = () => ctx.publicaciones.filas.get(ID_PUBLICACION)?.titulo;

  /** Pasos 1 a 6: error controlado y la publicación no cambia. */
  const esperarRechazo = async (titulo: string) => {
    const respuesta = await modificarTitulo(titulo);
    expect({ status: respuesta.status, tituloPersistido: tituloPersistido() }).toEqual({
      status: 400,
      tituloPersistido: DATA.tituloOriginal,
    });
  };

  test('Datos de prueba: el título 4 supera los 255 caracteres', () => {
    expect(DATA.titulo4.length).toBeGreaterThan(255);
  });

  test('Paso 1 · título vacío "" → error controlado, no se modifica', async () => {
    await esperarRechazo(DATA.titulo1);
  });

  test('Paso 2 · título con solo un espacio " " → error controlado, no se modifica', async () => {
    await esperarRechazo(DATA.titulo2);
  });

  test('Paso 3 · título "hola" (4 caracteres) → error controlado, no se modifica', async () => {
    await esperarRechazo(DATA.titulo3);
  });

  test('Paso 4 · título de más de 255 caracteres → error controlado, no se modifica', async () => {
    await esperarRechazo(DATA.titulo4);
  });

  test('Paso 5 · título con símbolos no permitidos → error controlado, no se modifica', async () => {
    await esperarRechazo(DATA.titulo5);
  });

  test('Paso 6 · título con emojis → error controlado, no se modifica', async () => {
    await esperarRechazo(DATA.titulo6);
  });

  test('Paso 7 · título correcto → se modifica la publicación', async () => {
    const respuesta = await modificarTitulo(DATA.titulo7);
    expect(respuesta.status).toBe(200);
    expect(tituloPersistido()).toBe(DATA.titulo7);
  });

  test('Borde · 14 caracteres → error controlado, no se modifica', async () => {
    expect(BORDES.catorceCaracteres).toHaveLength(14);
    await esperarRechazo(BORDES.catorceCaracteres);
  });

  test('Borde · 15 caracteres → se modifica la publicación', async () => {
    expect(BORDES.quinceCaracteres).toHaveLength(15);
    const respuesta = await modificarTitulo(BORDES.quinceCaracteres);
    expect(respuesta.status).toBe(200);
    expect(tituloPersistido()).toBe(BORDES.quinceCaracteres);
  });

  test('Símbolos permitidos (espacio, coma, dos puntos y punto) → se modifica la publicación', async () => {
    const respuesta = await modificarTitulo(BORDES.simbolosPermitidos);
    expect(respuesta.status).toBe(200);
    expect(tituloPersistido()).toBe(BORDES.simbolosPermitidos);
  });

  test('Título válido salvo por un guion → error controlado, no se modifica', async () => {
    await esperarRechazo(BORDES.conGuion);
  });

  test('Título válido salvo por un emoji → error controlado, no se modifica', async () => {
    await esperarRechazo(BORDES.conEmoji);
  });

  test('Título de 20 espacios → error controlado, no se modifica', async () => {
    await esperarRechazo(BORDES.soloEspacios);
  });
});
