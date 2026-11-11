/**
 * CP-08 · Inicio de sesión con tablas de decisión
 * Requerimiento: RF2 Autenticación; RF3 Verificación de correo; RF20 Administración
 * de usuarios; RF22; RN-2; RN-36; RN-43; RNF13 Seguridad de usuarios.
 * Caso de uso: CU 2 Iniciar sesión.
 * Tipo de testing: funcional de caja negra. Técnica: tablas de decisión.
 * Autor del caso: Leandro Didrig. Versión 1.0.
 *
 * | Condición / Regla            | R1  | R2  | R3  | R4    |
 * | ---------------------------- | --- | --- | --- | ----- |
 * | Email y contraseña correctos | N   | S   | S   | S     |
 * | Cuenta activa                | -   | N   | S   | S     |
 * | Cuenta bloqueada             | -   | -   | S   | N     |
 * | Resultado                    | 401 | 403 | 403 | token |
 */
import request from 'supertest';
import { AppDePrueba, crearAppDePrueba, normalizar } from './soporte/app-de-prueba';

const DATA = {
  emailUsuario1: 'cuentadepruebadidrih1@gmail.com',
  contraseniaIncorrectaUsuario1: 'ContraseñitaDePruebovich123',
  contraseniaUsuario1: 'ContraseñitaDePruebovich123*',
  emailUsuario2: 'leandrodidrig@gmail.com',
  contraseniaUsuario2: 'ContraseñitaDePruebovich123*',
};

describe('CP-08 · Inicio de sesión con tablas de decisión', () => {
  let ctx: AppDePrueba;
  let idUsuario1: number;
  let tokenAdmin: string;

  // Precondiciones: "Tester_LD_TD" registrado y sin verificar su email; el
  // usuario leandrodidrig@gmail.com tiene rol Administrador.
  beforeAll(async () => {
    ctx = await crearAppDePrueba();
    await ctx.crearUsuario({
      nombre: 'Leandro',
      apellido: 'Didrig',
      email: DATA.emailUsuario2,
      contrasenia: DATA.contraseniaUsuario2,
      rol: 'Administrador',
    });
    const registro = await request(ctx.app.getHttpServer()).post('/auth/register').send({
      nombre: 'Tester_LD_TD',
      apellido: 'Prueba',
      email: DATA.emailUsuario1,
      telefono: '6942067',
      contrasenia: DATA.contraseniaUsuario1,
    });
    expect(registro.status).toBe(201);
    idUsuario1 = ctx.usuarios.porEmail(DATA.emailUsuario1)!.id;
  });

  afterAll(() => ctx.cerrar());

  const servidor = () => ctx.app.getHttpServer();
  const login = (email: string, contrasenia: string) =>
    request(servidor()).post('/auth/login').send({ email, contrasenia });
  const usuario1 = () => ctx.usuarios.filas.get(idUsuario1)!;

  test('Paso 1 (R1) · contraseña incorrecta → 401 "Credenciales inválidas"', async () => {
    const respuesta = await login(DATA.emailUsuario1, DATA.contraseniaIncorrectaUsuario1);
    expect(respuesta.status).toBe(401);
    expect(normalizar(respuesta.body.message)).toBe(normalizar('Credenciales invalidas'));
    expect(respuesta.body.codigo).toBeUndefined();
    expect(respuesta.body.access_token).toBeUndefined();
  });

  test('Paso 2 (R2) · credenciales correctas con la cuenta sin verificar → 403 "Tu cuenta está inactiva"', async () => {
    const respuesta = await login(DATA.emailUsuario1, DATA.contraseniaUsuario1);
    expect(respuesta.status).toBe(403);
    expect(respuesta.body.access_token).toBeUndefined();
    expect(normalizar(respuesta.body.message)).toBe(normalizar('Tu cuenta esta inactiva'));
    expect(respuesta.body.codigo).toBe('EMAIL_NO_VERIFICADO');
  });

  test('Paso 3 · el usuario 1 verifica su email → su cuenta queda activa', async () => {
    const token = ctx.correo.tokenVerificacion(DATA.emailUsuario1);
    expect(token).toEqual(expect.any(String));
    const respuesta = await request(servidor()).post('/auth/verificar-cuenta').send({ token });
    expect(respuesta.status).toBe(201);
    expect(usuario1().activa).toBe(true);
    expect(usuario1().email_verificado).toBe(true);
  });

  test('Paso 4 · el administrador inicia sesión y bloquea al usuario 1', async () => {
    const respuestaLogin = await login(DATA.emailUsuario2, DATA.contraseniaUsuario2);
    expect(respuestaLogin.status).toBe(201);
    tokenAdmin = respuestaLogin.body.access_token;

    const respuesta = await request(servidor())
      .patch(`/usuarios/${idUsuario1}/bloquear`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ motivo: 'Caso de prueba CP-08' });
    expect(respuesta.status).toBe(200);
    expect(usuario1().bloqueado).toBe(true);
  });

  test('Paso 5 (R3) · credenciales correctas, cuenta activa y bloqueada → 403 "Tu usuario está bloqueado"', async () => {
    const respuesta = await login(DATA.emailUsuario1, DATA.contraseniaUsuario1);
    expect(respuesta.status).toBe(403);
    expect(normalizar(respuesta.body.message)).toBe(normalizar('Tu usuario esta bloqueado'));
    expect(respuesta.body.access_token).toBeUndefined();
  });

  test('Paso 6 · el administrador habilita nuevamente al usuario 1', async () => {
    const respuesta = await request(servidor())
      .patch(`/usuarios/${idUsuario1}/habilitar`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({});
    expect(respuesta.status).toBe(200);
    expect(usuario1().bloqueado).toBe(false);
  });

  test('Paso 7 (R4) · credenciales correctas, cuenta activa y no bloqueada → entrega el token', async () => {
    const respuesta = await login(DATA.emailUsuario1, DATA.contraseniaUsuario1);
    expect(respuesta.status).toBe(201);
    expect(respuesta.body.access_token).toEqual(expect.any(String));
    // El token identifica al usuario 1.
    const payload = JSON.parse(
      Buffer.from(respuesta.body.access_token.split('.')[1], 'base64url').toString(),
    );
    expect(payload.sub).toBe(idUsuario1);
  });
});
