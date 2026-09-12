import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ConversacionResumen, Mensaje } from '../../shared/models/mensaje.model';

// Datos mínimos para abrir una ventana de chat: la conversación queda definida
// por (publicación, interlocutor), igual que en el backend.
export interface ChatAbierto {
  idPublicacion: number;
  idOtroUsuario: number;
  titulo: string;
  nombreOtro: string;
  fotoOtro?: string | null;
  minimizado: boolean;
}

const MAX_VENTANAS = 3;

// Consume el módulo `mensajes` del backend y mantiene las ventanitas de chat
// abiertas (tipo Facebook) abajo a la derecha, compartidas por toda la app.
@Injectable({ providedIn: 'root' })
export class ChatService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/mensajes`;

  readonly abiertos = signal<ChatAbierto[]>([]);

  /** GET /mensajes — una fila por conversación, con el último mensaje. */
  listarConversaciones(): Observable<ConversacionResumen[]> {
    return this.http.get<ConversacionResumen[]>(this.baseUrl);
  }

  /** GET /mensajes/publicacion/:idPublicacion/usuario/:idOtroUsuario */
  listarMensajes(idPublicacion: number, idOtroUsuario: number): Observable<Mensaje[]> {
    return this.http.get<Mensaje[]>(`${this.baseUrl}/publicacion/${idPublicacion}/usuario/${idOtroUsuario}`);
  }

  /** POST /mensajes */
  enviar(idPublicacion: number, idDestino: number, texto: string): Observable<Mensaje> {
    return this.http.post<Mensaje>(this.baseUrl, {
      id_publicacion: idPublicacion,
      id_destino_usuario: idDestino,
      texto,
    });
  }

  abrir(chat: Omit<ChatAbierto, 'minimizado'>): void {
    this.abiertos.update((lista) => {
      const resto = lista.filter((c) => !this.esMismo(c, chat));
      // El más reciente queda primero (a la derecha) y se descarta el más viejo.
      return [{ ...chat, minimizado: false }, ...resto].slice(0, MAX_VENTANAS);
    });
  }

  cerrar(chat: ChatAbierto): void {
    this.abiertos.update((lista) => lista.filter((c) => !this.esMismo(c, chat)));
  }

  alternarMinimizado(chat: ChatAbierto): void {
    this.abiertos.update((lista) =>
      lista.map((c) => (this.esMismo(c, chat) ? { ...c, minimizado: !c.minimizado } : c)),
    );
  }

  cerrarTodos(): void {
    this.abiertos.set([]);
  }

  private esMismo(a: Pick<ChatAbierto, 'idPublicacion' | 'idOtroUsuario'>, b: typeof a): boolean {
    return a.idPublicacion === b.idPublicacion && a.idOtroUsuario === b.idOtroUsuario;
  }
}
