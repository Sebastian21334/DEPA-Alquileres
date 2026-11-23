export const PROVEEDOR_CHATBOT = 'PROVEEDOR_CHATBOT';

export interface LlamadaChatbot {
  type: 'function';
  id: string;
  function: { name: string; arguments: string };
}

export type MensajeChatbot =
  | { role: 'system' | 'user' | 'assistant'; content: string }
  | { role: 'assistant'; content: string | null; tool_calls: LlamadaChatbot[] }
  | { role: 'tool'; tool_call_id: string; content: string };

export interface IProveedorChatbot {
  completar(mensajes: MensajeChatbot[], habilitarBusqueda: boolean, signal: AbortSignal): Promise<{ texto: string | null; llamadas: LlamadaChatbot[] }>;
}
