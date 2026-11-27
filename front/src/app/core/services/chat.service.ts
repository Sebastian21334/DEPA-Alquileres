import { contextoCarga } from '../interceptors/carga.interceptor';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable, PLATFORM_ID, computed, effect, inject, signal } from '@angular/core';
import { EMPTY, Observable, Subject, catchError, exhaustMap, merge, timer } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ConversacionResumen, Mensaje } from '../../shared/models/mensaje.model';
import { chatDeConversacion } from '../../shared/utils/conversaciones';
import { AuthService } from './auth.service';

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
  private readonly auth = inject(AuthService);
  private readonly navegador = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly baseUrl = `${environment.apiUrl}/mensajes`;
  private readonly refresco = new Subject<void>();

  readonly abiertos = signal<ChatAbierto[]>([]);
  /** Bandeja del usuario, compartida por la burbuja del chat y la campana de notificaciones. */
  readonly conversaciones = signal<ConversacionResumen[]>([]);
  readonly mensajesNoLeidos = computed(() =>
    this.conversaciones().reduce((total, conversacion) => total + conversacion.cantidadNoLeidos, 0));

  constructor() {
    // Un solo sondeo por pestaña: antes la burbuja y la campana pedían la bandeja cada una por su lado.
    effect(onCleanup => {
      const usuario = this.auth.currentUser()?.sub;
      this.conversaciones.set([]);
      if (!this.navegador || usuario == null) return;
      const consulta = merge(timer(0, 5000), this.refresco).pipe(exhaustMap(() =>
        this.listarConversaciones(true).pipe(catchError(() => EMPTY)),
      )).subscribe(lista => this.conversaciones.set(lista));
      onCleanup(() => consulta.unsubscribe());
    });
  }

  /** Pide la bandeja ya, sin esperar el próximo sondeo. */
  actualizar(): void {
    this.refresco.next();
  }

  /** GET /mensajes — una fila por conversación, con el último mensaje. */
  listarConversaciones(silenciosa = false): Observable<ConversacionResumen[]> {
    return this.http.get<ConversacionResumen[]>(this.baseUrl, { context: contextoCarga(silenciosa) });
  }

  /** GET /mensajes/publicacion/:idPublicacion/usuario/:idOtroUsuario */
  listarMensajes(idPublicacion: number, idOtroUsuario: number, silenciosa = false): Observable<Mensaje[]> {
    return this.http.get<Mensaje[]>(`${this.baseUrl}/publicacion/${idPublicacion}/usuario/${idOtroUsuario}`, { context: contextoCarga(silenciosa) });
  }

  /** POST /mensajes */
  enviar(idPublicacion: number, idDestino: number, texto: string): Observable<Mensaje> {
    return this.http.post<Mensaje>(this.baseUrl, {
      id_publicacion: idPublicacion,
      id_destino_usuario: idDestino,
      texto,
    });
  }

  marcarComoLeidos(idPublicacion: number, idOtroUsuario: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/publicacion/${idPublicacion}/usuario/${idOtroUsuario}/leer`, {}, { context: contextoCarga(true) });
  }

  abrir(chat: Omit<ChatAbierto, 'minimizado'>): void {
    this.abiertos.update((lista) => {
      const resto = lista.filter((c) => !this.esMismo(c, chat));
      // El más reciente queda primero (a la derecha) y se descarta el más viejo.
      return [{ ...chat, minimizado: false }, ...resto].slice(0, MAX_VENTANAS);
    });
  }

  /** Abre la conversación que indica un aviso por correo, con los datos de la bandeja; si no existe, no abre nada. */
  abrirDesdeAviso(idPublicacion: number, idOtroUsuario: number): void {
    this.listarConversaciones().pipe(catchError(() => EMPTY)).subscribe(conversaciones => {
      const conversacion = conversaciones.find(item => this.esMismo(item, { idPublicacion, idOtroUsuario }));
      if (conversacion) this.abrir(chatDeConversacion(conversacion));
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
    this.conversaciones.set([]);
  }

  private esMismo(a: Pick<ChatAbierto, 'idPublicacion' | 'idOtroUsuario'>, b: typeof a): boolean {
    return a.idPublicacion === b.idPublicacion && a.idOtroUsuario === b.idOtroUsuario;
  }
}
