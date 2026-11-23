import { Inject, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { BASE_DE_CONOCIMIENTO_DEPA } from '../conocimiento/base-de-conocimiento';
import { PROMPT_DEL_SISTEMA_DEPA } from '../conocimiento/prompt-del-sistema';
import { DEFINICION_BUSCAR_PUBLICACIONES } from '../dto/buscar-publicaciones.dto';
import type { MensajeChatbotDto } from '../dto/consultar-chatbot.dto';
import { PROVEEDOR_CHATBOT, type IProveedorChatbot, type MensajeChatbot } from '../proveedor/proveedor-chatbot.interface';
import { BuscarPublicacionesService, type PublicacionChatbot } from './buscar-publicaciones.service';

const MENSAJE_NO_DISPONIBLE = 'El asistente de DEPA no está disponible en este momento. Volvé a intentar en unos minutos.';
const INSTRUCCIONES_DEPA = `${PROMPT_DEL_SISTEMA_DEPA}\n\nBase de conocimiento de DEPA\n\n${BASE_DE_CONOCIMIENTO_DEPA}`;
const MAX_VUELTAS_BUSQUEDA = 3;

export interface RespuestaChatbot {
  respuesta: string;
  publicaciones: PublicacionChatbot[];
}

@Injectable()
export class ChatbotService {
  constructor(@Inject(PROVEEDOR_CHATBOT) private readonly proveedor: IProveedorChatbot, private readonly busqueda: BuscarPublicacionesService) {}

  async consultar(historial: MensajeChatbotDto[]): Promise<RespuestaChatbot> {
    const mensajes: MensajeChatbot[] = [
      { role: 'system', content: INSTRUCCIONES_DEPA },
      ...historial.map(({ rol, contenido }) => ({ role: rol, content: contenido })),
    ];
    const signal = AbortSignal.timeout(20_000);
    let publicaciones: PublicacionChatbot[] = [];
    try {
      for (let vuelta = 0; vuelta <= MAX_VUELTAS_BUSQUEDA; vuelta++) {
        const habilitarBusqueda = vuelta < MAX_VUELTAS_BUSQUEDA;
        signal.throwIfAborted();
        const { texto, llamadas } = await this.proveedor.completar(mensajes, habilitarBusqueda, signal);
        if (llamadas.length === 0 && texto?.trim()) return { respuesta: texto.trim(), publicaciones };
        if (!habilitarBusqueda || llamadas.length !== 1) break;

        const [llamada] = llamadas;
        if (llamada.function.name !== DEFINICION_BUSCAR_PUBLICACIONES.function.name) break;
        signal.throwIfAborted();
        const resultado = await this.busqueda.buscar(llamada.function.arguments);
        if ('publicaciones' in resultado) publicaciones = resultado.publicaciones;
        mensajes.push(
          { role: 'assistant', content: texto, tool_calls: [llamada] },
          { role: 'tool', tool_call_id: llamada.id, content: JSON.stringify(resultado) },
        );
      }
    } catch {
      throw new ServiceUnavailableException(MENSAJE_NO_DISPONIBLE);
    }
    throw new ServiceUnavailableException(MENSAJE_NO_DISPONIBLE);
  }
}
