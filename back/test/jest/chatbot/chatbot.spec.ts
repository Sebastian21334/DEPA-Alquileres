import 'reflect-metadata';
import { Module, type INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import OpenAI from 'openai';
import request from 'supertest';
import { ChatbotModule } from '../../../src/chatbot/chatbot.module';
import { BASE_DE_CONOCIMIENTO_DEPA } from '../../../src/chatbot/conocimiento/base-de-conocimiento';
import { PROMPT_DEL_SISTEMA_DEPA } from '../../../src/chatbot/conocimiento/prompt-del-sistema';
import { FoundryAdapter } from '../../../src/chatbot/proveedor/foundry.adapter';
import { ChatbotService } from '../../../src/chatbot/service/chatbot.service';
import { BuscarPublicacionesService } from '../../../src/chatbot/service/buscar-publicaciones.service';
import { PublicacionesModule } from '../../../src/publicaciones/publicaciones.module';
import { PublicacionesService } from '../../../src/publicaciones/service/publicaciones.service';
import { CatalogosModule } from '../../../src/catalogos/catalogos.module';
import { CatalogosService } from '../../../src/catalogos/service/catalogos.service';
import { UbicacionModule } from '../../../src/ubicacion/ubicacion.module';
import { UbicacionService } from '../../../src/ubicacion/service/ubicacion.service';

jest.mock('openai', () => ({ __esModule: true, default: jest.fn() }));

const construirOpenAI = jest.mocked(OpenAI);
const crearRespuesta = jest.fn();
const pregunta = { rol: 'user', contenido: '¿Cuánto dura el bloqueo de fechas?' } as const;
const respuestaSimulada = 'Las fechas quedan bloqueadas durante 15 minutos.';
const mensaje503 = 'El asistente de DEPA no está disponible en este momento. Volvé a intentar en unos minutos.';
const listarActivas = jest.fn();
const buscarIdsCiudadesPorNombre = jest.fn();
const catalogos = { getTiposMoneda: jest.fn().mockResolvedValue([{ id: 1, nombre: 'Peso argentino' }, { id: 2, nombre: 'Dólar estadounidense' }]) };
const ubicacion = { buscarIdsCiudadesPorNombre };
const publicaciones = { listarActivas };
const buscarPublicaciones = new BuscarPublicacionesService(publicaciones as unknown as PublicacionesService, ubicacion as unknown as UbicacionService, catalogos as unknown as CatalogosService);
const fila = {
  id: 13, titulo: 'Casa céntrica', ciudad: { nombre: 'Villa María' }, modalidad: { nombre: 'Temporario' },
  precio: '100.00', tipoMoneda: { nombre: 'Dólar estadounidense' }, cantidad_ambientes: 2,
  anunciante: { email: 'ejemplo@example.test', numero_contacto: 'privado' },
};
const tarjeta = { id: 13, titulo: 'Casa céntrica', ciudad: 'Villa María', modalidad: 'Temporario', precio: 100, moneda: 'Dólar estadounidense', ambientes: 2 };

@Module({ providers: [{ provide: PublicacionesService, useValue: publicaciones }], exports: [PublicacionesService] })
class CatalogoPublicacionesDePrueba {}

@Module({ providers: [{ provide: UbicacionService, useValue: ubicacion }], exports: [UbicacionService] })
class UbicacionDePrueba {}

@Module({ providers: [{ provide: CatalogosService, useValue: catalogos }], exports: [CatalogosService] })
class CatalogosDePrueba {}

function llamadaDelModelo(argumentos: string, id = 'call_1') {
  return { choices: [{ message: { content: null, tool_calls: [
    { id, type: 'function', function: { name: 'buscarPublicaciones', arguments: argumentos } },
  ] } }] };
}

function configuracion(endpoint = 'https://depa-prueba.services.ai.azure.com', credencial = 'simulada'): ConfigService {
  return new ConfigService({
    FOUNDRY_ENDPOINT: endpoint,
    FOUNDRY_API_KEY: credencial,
    FOUNDRY_MODEL: 'gpt-6-luna',
  });
}

beforeEach(() => {
  listarActivas.mockReset().mockResolvedValue({ datos: [] });
  buscarIdsCiudadesPorNombre.mockReset().mockResolvedValue([7]);
  crearRespuesta.mockReset().mockResolvedValue({ choices: [{ message: { content: ' ' + respuestaSimulada + ' ' } }] });
  construirOpenAI.mockReset().mockImplementation(() => ({ chat: { completions: { create: crearRespuesta } } }) as unknown as OpenAI);
});

describe('ChatbotService con el cliente de OpenAI simulado', () => {
  test('envía un solo mensaje de sistema seguido por el historial y respeta el tope de salida', async () => {
    const servicio = new ChatbotService(new FoundryAdapter(configuracion()), buscarPublicaciones);
    const historial = [
      { rol: 'user', contenido: '¿Cómo se paga una reserva?' },
      { rol: 'assistant', contenido: 'Con Mercado Pago.' },
      pregunta,
    ] as const;

    await expect(servicio.consultar([...historial])).resolves.toEqual({ respuesta: respuestaSimulada, publicaciones: [] });
    expect(construirOpenAI).toHaveBeenCalledWith(expect.objectContaining({
      baseURL: 'https://depa-prueba.services.ai.azure.com/openai/v1/',
      maxRetries: 1,
      timeout: 20_000,
      logLevel: 'off',
      fetchOptions: { redirect: 'error' },
    }));
    expect(crearRespuesta).toHaveBeenCalledWith({
      model: 'gpt-6-luna',
      max_completion_tokens: 500,
      reasoning_effort: 'none',
      tools: [expect.objectContaining({ function: expect.objectContaining({ name: 'buscarPublicaciones' }) })],
      parallel_tool_calls: false,
      messages: [
        { role: 'system', content: expect.stringContaining(PROMPT_DEL_SISTEMA_DEPA) },
        ...historial.map(({ rol, contenido }) => ({ role: rol, content: contenido })),
      ],
    }, { signal: expect.any(AbortSignal) });
    const [solicitud] = crearRespuesta.mock.calls[0];
    expect(solicitud.messages[0].content).toContain(BASE_DE_CONOCIMIENTO_DEPA);
  });

  test('acepta el host alternativo de Azure con una barra final', async () => {
    const servicio = new ChatbotService(new FoundryAdapter(configuracion('https://depa-prueba.openai.azure.com/')), buscarPublicaciones);

    await expect(servicio.consultar([pregunta])).resolves.toEqual({ respuesta: respuestaSimulada, publicaciones: [] });
    expect(construirOpenAI).toHaveBeenCalledWith(expect.objectContaining({
      baseURL: 'https://depa-prueba.openai.azure.com/openai/v1/',
    }));
  });

  test.each([
    ['https://depa-prueba.services.ai.azure.com', ''],
    ['https://ejemplo.test', 'simulada'],
    ['http://depa-prueba.services.ai.azure.com', 'simulada'],
  ])('devuelve un error amigable si falta configuración o el destino es inválido', async (endpoint, credencial) => {
    const servicio = new ChatbotService(new FoundryAdapter(configuracion(endpoint, credencial)), buscarPublicaciones);

    await expect(servicio.consultar([pregunta])).rejects.toMatchObject({
      response: { statusCode: 503, message: mensaje503 },
    });
    expect(construirOpenAI).not.toHaveBeenCalled();
  });

  test('devuelve un error amigable si el modelo responde sin texto', async () => {
    crearRespuesta.mockResolvedValueOnce({ choices: [{ message: { content: ' ' } }] });
    const servicio = new ChatbotService(new FoundryAdapter(configuracion()), buscarPublicaciones);

    await expect(servicio.consultar([pregunta])).rejects.toMatchObject({
      response: { statusCode: 503, message: mensaje503 },
    });
  });
});

describe('buscarPublicaciones', () => {
  test.each(['{', '[]', '{"precioMax":"100"}', '{"ordenOculto":"x"}', '{"precioMin":200,"precioMax":100}', '{"ambientes":["7"]}'])('rechaza los argumentos %s antes de buscar', async (argumentos) => {
    await expect(buscarPublicaciones.buscar(argumentos)).resolves.toEqual({ error: expect.any(String) });
    expect(listarActivas).not.toHaveBeenCalled();
  });

  test('distingue el catálogo sin coincidencias y una ciudad inexistente', async () => {
    await expect(buscarPublicaciones.buscar('{"modalidad":"temporales"}')).resolves.toEqual({ publicaciones: [] });
    listarActivas.mockClear();
    buscarIdsCiudadesPorNombre.mockResolvedValueOnce([]);
    await expect(buscarPublicaciones.buscar('{"ciudad":"Ciudad inexistente"}')).resolves.toEqual({ publicaciones: [] });
    expect(listarActivas).not.toHaveBeenCalled();
  });

  test('reutiliza el listado público y devuelve cinco fichas con moneda y sin datos del anunciante', async () => {
    listarActivas.mockResolvedValueOnce({ datos: Array.from({ length: 6 }, () => fila) });
    await expect(buscarPublicaciones.buscar('{"ciudad":"Villa María","modalidad":"temporales","moneda":"USD","ambientes":["2"],"precioMax":150}'))
      .resolves.toEqual({ publicaciones: Array.from({ length: 5 }, () => tarjeta) });
    expect(buscarIdsCiudadesPorNombre).toHaveBeenCalledWith('Villa María');
    expect(listarActivas).toHaveBeenCalledWith(1, 5, 'temporales', expect.objectContaining({
      idsCiudad: [7], idsTipoMoneda: [2], ambientes: ['2'], precioMax: 150,
    }));
  });

  test('deshabilita la herramienta tras tres vueltas aunque el modelo vuelva a pedirla', async () => {
    crearRespuesta.mockResolvedValue(llamadaDelModelo('{}'));
    const servicio = new ChatbotService(new FoundryAdapter(configuracion()), buscarPublicaciones);
    await expect(servicio.consultar([pregunta])).rejects.toMatchObject({ response: { statusCode: 503 } });
    expect(listarActivas).toHaveBeenCalledTimes(3);
    expect(crearRespuesta).toHaveBeenCalledTimes(4);
    expect(crearRespuesta.mock.calls[3][0]).not.toHaveProperty('tools');
    expect(crearRespuesta.mock.calls[3][1].signal).toBe(crearRespuesta.mock.calls[0][1].signal);
  });
});

describe('POST /chatbot', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const modulo = await Test.createTestingModule({ imports: [ChatbotModule] })
      .overrideModule(PublicacionesModule).useModule(CatalogoPublicacionesDePrueba)
      .overrideModule(UbicacionModule).useModule(UbicacionDePrueba)
      .overrideModule(CatalogosModule).useModule(CatalogosDePrueba)
      .overrideProvider(ConfigService)
      .useValue(configuracion())
      .compile();
    app = modulo.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    await app.init();
  });

  afterEach(async () => {
    jest.restoreAllMocks();
    await app?.close();
  });

  test('responde sin autenticación y devuelve solo el texto de la respuesta', async () => {
    const mensajes = Array.from({ length: 10 }, () => ({ ...pregunta, contenido: 'a'.repeat(500) }));
    await request(app.getHttpServer()).post('/chatbot').send({ mensajes })
      .expect(200, { respuesta: respuestaSimulada, publicaciones: [] });
  });

  test('devuelve tarjetas reales del catálogo después de ejecutar la tool', async () => {
    listarActivas.mockResolvedValueOnce({ datos: [fila] });
    crearRespuesta.mockResolvedValueOnce(llamadaDelModelo('{"ciudad":"Villa María"}'))
      .mockResolvedValueOnce({ choices: [{ message: { content: 'Encontré una casa en Villa María.' } }] });

    await request(app.getHttpServer()).post('/chatbot').send({ mensajes: [{ ...pregunta, contenido: 'Busco casa en Villa María' }] })
      .expect(200, { respuesta: 'Encontré una casa en Villa María.', publicaciones: [tarjeta] });
    const mensajeTool = crearRespuesta.mock.calls[1][0].messages.at(-1);
    expect(mensajeTool).toEqual({ role: 'tool', tool_call_id: 'call_1', content: JSON.stringify({ publicaciones: [tarjeta] }) });
  });

  test('rechaza roles reservados, datos ajenos al contrato, mensajes vacíos y tamaños inválidos', async () => {
    const cuerposInvalidos = [
      { mensajes: [{ ...pregunta, rol: 'system' }] },
      { mensajes: [{ ...pregunta, rol: 'tool' }] },
      { mensajes: [{ ...pregunta, opcionAjena: true }] },
      { mensajes: [pregunta], opcionAjena: true },
      { mensajes: [{ ...pregunta, contenido: ' \n\t ' }] },
      { mensajes: [{ ...pregunta, contenido: 'a'.repeat(501) }] },
      { mensajes: Array.from({ length: 11 }, () => pregunta) },
      { mensajes: [] },
      { mensajes: [[pregunta]] },
      { mensajes: [null] },
    ];

    for (const cuerpo of cuerposInvalidos) {
      await request(app.getHttpServer()).post('/chatbot').send(cuerpo).expect(400);
    }
    expect(crearRespuesta).not.toHaveBeenCalled();
  });

  test('devuelve 503 sin exponer detalles de errores de Azure', async () => {
    crearRespuesta.mockRejectedValueOnce(new Error('Detalle interno simulado del proveedor.'));

    await request(app.getHttpServer()).post('/chatbot').send({ mensajes: [pregunta] })
      .expect(503, { statusCode: 503, message: mensaje503, error: 'Service Unavailable' });
  });

  test('limita a diez consultas por IP e ignora encabezados de IP fuera de Azure', async () => {
    jest.replaceProperty(process, 'env', { ...process.env, WEBSITE_SITE_NAME: '' });
    const servidor = request(app.getHttpServer());
    for (let i = 1; i <= 10; i++) {
      await servidor.post('/chatbot').set('Client-Ip', '192.0.2.' + i)
        .send({ mensajes: [pregunta] }).expect(200);
    }
    await servidor.post('/chatbot').set('Client-Ip', '192.0.2.11')
      .send({ mensajes: [pregunta] }).expect(429);
    expect(crearRespuesta).toHaveBeenCalledTimes(10);
  });

  test('en App Service separa clientes por IP, aunque cambie el puerto', async () => {
    jest.replaceProperty(process, 'env', { ...process.env, WEBSITE_SITE_NAME: 'depa-prueba' });
    const servidor = request(app.getHttpServer());
    for (let i = 0; i < 10; i++) {
      await servidor.post('/chatbot').set('Client-Ip', '192.0.2.1:' + (50000 + i))
        .send({ mensajes: [pregunta] }).expect(200);
    }
    await servidor.post('/chatbot').set('Client-Ip', '192.0.2.1:50010')
      .send({ mensajes: [pregunta] }).expect(429);
    await servidor.post('/chatbot').set('Client-Ip', '192.0.2.2:50010')
      .send({ mensajes: [pregunta] }).expect(200);
    expect(crearRespuesta).toHaveBeenCalledTimes(11);
  });
});
