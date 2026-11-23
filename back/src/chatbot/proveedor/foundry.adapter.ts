import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { DEFINICION_BUSCAR_PUBLICACIONES } from '../dto/buscar-publicaciones.dto';
import type { IProveedorChatbot, MensajeChatbot } from './proveedor-chatbot.interface';

const TIEMPO_MAXIMO_MS = 20_000;

@Injectable()
export class FoundryAdapter implements IProveedorChatbot {
  private readonly cliente?: OpenAI;
  private readonly modelo?: string;

  constructor(config: ConfigService) {
    const apiKey = config.get<string>('FOUNDRY_API_KEY')?.trim();
    const endpoint = URL.parse(config.get<string>('FOUNDRY_ENDPOINT')?.trim() ?? '');
    this.modelo = config.get<string>('FOUNDRY_MODEL')?.trim();

    // Solo se envía la credencial a un endpoint HTTPS de recurso de Foundry.
    if (!apiKey || !this.modelo || !endpoint || endpoint.protocol !== 'https:' ||
        !/^[a-z0-9][a-z0-9-]*\.(services\.ai|openai)\.azure\.com$/.test(endpoint.hostname) ||
        endpoint.pathname !== '/' || endpoint.username || endpoint.password || endpoint.port ||
        endpoint.search || endpoint.hash) {
      return;
    }

    this.cliente = new OpenAI({
      apiKey,
      baseURL: `${endpoint.origin}/openai/v1/`,
      timeout: TIEMPO_MAXIMO_MS,
      maxRetries: 1,
      logLevel: 'off',
      fetchOptions: { redirect: 'error' },
    });
  }

  async completar(mensajes: MensajeChatbot[], habilitarBusqueda: boolean, signal: AbortSignal) {
    if (!this.cliente || !this.modelo) throw new Error('Foundry no está configurado');

    const resultado = await this.cliente.chat.completions.create({
      model: this.modelo,
      messages: mensajes,
      max_completion_tokens: 500,
      reasoning_effort: 'none',
      ...(habilitarBusqueda ? { tools: [DEFINICION_BUSCAR_PUBLICACIONES], parallel_tool_calls: false } : {}),
    }, { signal });
    const mensaje = resultado.choices[0]?.message;
    const llamadas = mensaje?.tool_calls ?? [];
    const funciones = llamadas.filter((llamada) => llamada.type === 'function');
    if (funciones.length !== llamadas.length) throw new Error('Tipo de herramienta inesperado');
    return { texto: typeof mensaje?.content === 'string' ? mensaje.content : null, llamadas: funciones };
  }
}
