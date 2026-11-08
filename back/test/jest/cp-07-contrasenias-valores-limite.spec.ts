/**
 * CP-07 · Valores límite de las contraseñas de usuario
 * Requerimiento: RF1 Gestión de cuentas; RNF5 Seguridad de contraseñas; RN-1; RN-32.
 * Caso de uso: CU 1 Crear usuario, flujo principal / alternativo A2.
 * Tipo de testing: funcional de caja negra. Técnica: valores límite.
 * Autor del caso: Leandro Didrig. Versión 1.0.
 *
 * RNF5: mínimo 12 caracteres y máximo 72 bytes en UTF-8. Cada par de pasos
 * prueba el valor justo fuera del límite (rechazo) y el valor en el límite
 * (aceptación) mediante POST /auth/register.
 */
import * as bcrypt from 'bcrypt';
import request from 'supertest';
import { AppDePrueba, crearAppDePrueba } from './soporte/app-de-prueba';

const DATA = {
  usuario1: { nombre: 'Tester_NuevoLD1', apellido: 'Prueba', email: 'leandro.prueba1@gmail.com', telefono: '6942067' },
  usuario2: { nombre: 'Tester_NuevoLD2', apellido: 'Prueba', email: 'leandro.prueba2@gmail.com', telefono: '6942067' },
  usuario3: { nombre: 'Tester_NuevoLD3', apellido: 'Prueba', email: 'leandro.prueba3@gmail.com', telefono: '6942067' },
  contrasenia1: 'Depa2026!xy',
  contrasenia2: 'Depa2026!xyz',
  contrasenia3: 'DepaAlquileres2026!SeminarioIntegradorUTNVillaMaria2026#ReservaSegura$Ok',
  contrasenia4: 'DepaAlquileres2026!SeminarioIntegradorUTNVillaMaria2026#ReservaSegura$Oka',
  contrasenia5: 'ÑandúCañónAcciónCanción2026!PingüinoÁrbolMañanaCorazónÉxitoñ',
  contrasenia6: 'ÑandúCañónAcciónCanción2026!PingüinoÁrbolMañanaCorazónÉxitoña',
};

const caracteres = (texto: string) => Array.from(texto).length;
const bytes = (texto: string) => Buffer.byteLength(texto, 'utf8');

describe('CP-07 · Valores límite de las contraseñas de usuario', () => {
  let ctx: AppDePrueba;

  beforeAll(async () => {
    ctx = await crearAppDePrueba();
    // Ya existe un administrador, así las cuentas nuevas se crean como Inquilino (RN-4).
    await ctx.crearUsuario({
      nombre: 'Admin',
      email: 'admin.cp07@depa.test',
      contrasenia: 'AdminCp07Clave!',
      rol: 'Administrador',
    });
  });

  afterAll(() => ctx.cerrar());

  const registrar = (datos: object, contrasenia: string) =>
    request(ctx.app.getHttpServer())
      .post('/auth/register')
      .send({ ...datos, contrasenia });

  /** El registro se rechaza con 400 y la cuenta no se crea. */
  const esperarRechazo = async (datos: { email: string }, contrasenia: string) => {
    const respuesta = await registrar(datos, contrasenia);
    expect(respuesta.status).toBe(400);
    expect(ctx.usuarios.porEmail(datos.email)).toBeUndefined();
  };

  /** El registro se acepta y la cuenta queda pendiente de verificar el email. */
  const esperarAlta = async (datos: { email: string }, contrasenia: string) => {
    const respuesta = await registrar(datos, contrasenia);
    expect(respuesta.status).toBe(201);
    const usuario = ctx.usuarios.porEmail(datos.email);
    expect(usuario).toBeDefined();
    expect(usuario?.email_verificado).toBe(false);
    expect(ctx.correo.tokenVerificacion(datos.email)).toEqual(expect.any(String));
  };

  describe('Datos de prueba: los valores están en los límites de RNF5', () => {
    test.each([
      ['contraseña 1', DATA.contrasenia1, 11, 11],
      ['contraseña 2', DATA.contrasenia2, 12, 12],
      ['contraseña 3', DATA.contrasenia3, 72, 72],
      ['contraseña 4', DATA.contrasenia4, 73, 73],
      ['contraseña 5', DATA.contrasenia5, 60, 72],
      ['contraseña 6', DATA.contrasenia6, 61, 73],
    ])('%s tiene %i caracteres y %i bytes', (_nombre, contrasenia, cantCaracteres, cantBytes) => {
      expect(caracteres(contrasenia)).toBe(cantCaracteres);
      expect(bytes(contrasenia)).toBe(cantBytes);
    });
  });

  test('Paso 1 · usuario 1 con contraseña 1 (11 caracteres) → rechazo por corta', async () => {
    await esperarRechazo(DATA.usuario1, DATA.contrasenia1);
  });

  test('Paso 2 · usuario 1 con contraseña 2 (12 caracteres) → alta pendiente de verificación', async () => {
    await esperarAlta(DATA.usuario1, DATA.contrasenia2);
  });

  test('Paso 3 · usuario 2 con contraseña 4 (73 bytes) → rechazo por larga en bytes', async () => {
    await esperarRechazo(DATA.usuario2, DATA.contrasenia4);
  });

  test('Paso 4 · usuario 2 con contraseña 3 (72 bytes) → alta pendiente de verificación', async () => {
    await esperarAlta(DATA.usuario2, DATA.contrasenia3);
  });

  test('Paso 5 · usuario 3 con contraseña 6 (61 caracteres, 73 bytes) → rechazo por larga en bytes', async () => {
    await esperarRechazo(DATA.usuario3, DATA.contrasenia6);
  });

  test('Paso 6 · usuario 3 con contraseña 5 (60 caracteres, 72 bytes) → alta pendiente de verificación', async () => {
    await esperarAlta(DATA.usuario3, DATA.contrasenia5);
  });

  test('Postcondición · los 3 usuarios existen solo con las contraseñas 2, 3 y 5, guardadas como hash bcrypt de costo ≥ 12 (RN-32)', async () => {
    const esperadas: [string, string][] = [
      [DATA.usuario1.email, DATA.contrasenia2],
      [DATA.usuario2.email, DATA.contrasenia3],
      [DATA.usuario3.email, DATA.contrasenia5],
    ];
    for (const [email, contrasenia] of esperadas) {
      const usuario = ctx.usuarios.porEmail(email);
      expect(usuario?.contrasenia).not.toBe(contrasenia);
      expect(bcrypt.getRounds(usuario!.contrasenia)).toBeGreaterThanOrEqual(12);
      expect(await bcrypt.compare(contrasenia, usuario!.contrasenia)).toBe(true);
      expect(usuario?.rol?.nombre).toBe('Inquilino');
    }
  });
});
