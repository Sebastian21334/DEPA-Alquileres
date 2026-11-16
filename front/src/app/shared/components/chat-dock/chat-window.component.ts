import { ConversationPanelComponent } from '../conversation-panel/conversation-panel.component';
import { ConversationComposerComponent } from '../conversation-panel/conversation-composer.component';
import {
  Component,
  OnInit,
  PLATFORM_ID,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { EMPTY, Subject, catchError, switchMap, timer } from 'rxjs';
import { LucideMinus, LucideX } from '@lucide/angular';
import { AuthService } from '../../../core/services/auth.service';
import { ChatAbierto, ChatService } from '../../../core/services/chat.service';
import { Mensaje } from '../../models/mensaje.model';
import { AvatarComponent } from '../avatar/avatar.component';

// El backend no tiene websockets: se consulta la conversación cada pocos segundos
// mientras la ventana está abierta (y enseguida después de enviar).
const INTERVALO_MS = 5000;

@Component({
  selector: 'app-chat-window',
  standalone: true,
  imports: [RouterLink, AvatarComponent, LucideMinus, LucideX, ConversationPanelComponent, ConversationComposerComponent],
  templateUrl: './chat-window.component.html',
  styleUrl: './chat-window.component.scss',
})
export class ChatWindowComponent implements OnInit {
  readonly chat = input.required<ChatAbierto>();

  protected readonly chatService = inject(ChatService);
  private readonly auth = inject(AuthService);
  private readonly refrescar$ = new Subject<void>();

  protected readonly mensajes = signal<Mensaje[]>([]);
  protected readonly cargando = signal(true);
  protected readonly enviando = signal(false);
  protected readonly error = signal('');
  protected texto = '';
  protected readonly miId = computed(() => Number(this.auth.currentUser()?.sub));
  protected readonly publicacionEliminada = computed(
    () => this.mensajes()[0]?.publicacion.eliminada === true,
  );
  protected readonly contactoSuspendido = computed(() => {
    if (this.publicacionEliminada()) return true;
    const mensaje = this.mensajes()[0];
    if (!mensaje) return false;
    const otro = mensaje.origenUsuario.id === this.miId()
      ? mensaje.destinoUsuario : mensaje.origenUsuario;
    return otro.bloqueado === true || otro.activa === false;
  });

  constructor() {
    if (isPlatformBrowser(inject(PLATFORM_ID))) {
      this.refrescar$
        .pipe(
          switchMap(() => timer(0, INTERVALO_MS)),
          switchMap(() =>
            this.chatService.listarMensajes(this.chat().idPublicacion, this.chat().idOtroUsuario).pipe(
              // Un fallo puntual no debe cortar el polling de la ventana.
              catchError((err: Error) => {
                this.error.set(err.message);
                this.cargando.set(false);
                return EMPTY;
              }),
            ),
          ),
          takeUntilDestroyed(),
        )
          .subscribe((mensajes) => {
          this.mensajes.set(mensajes);
          this.cargando.set(false);
          if (!this.enviando()) this.error.set('');
          if (mensajes.some((m) => m.destinoUsuario.id === this.miId() && !m.leido)) {
            this.chatService.marcarComoLeidos(this.chat().idPublicacion, this.chat().idOtroUsuario).subscribe({
              next: () => this.refrescar$.next(),
            });
          }
        });
    }

  }

  ngOnInit(): void {
    // Recién acá el input `chat` está disponible; en SSR no hay suscriptores.
    this.refrescar$.next();
  }

  protected enviar(): void {
    const texto = this.texto.trim();
    if (!texto || this.enviando() || this.contactoSuspendido()) return;

    this.enviando.set(true);
    this.error.set('');
    const { idPublicacion, idOtroUsuario } = this.chat();
    this.chatService.enviar(idPublicacion, idOtroUsuario, texto).subscribe({
      next: () => {
        this.texto = '';
        this.enviando.set(false);
        this.refrescar$.next();
      },
      error: (err: Error) => {
        this.error.set(err.message);
        this.enviando.set(false);
      },
    });
  }

  protected readonly hilo = computed(() => this.mensajes().map(mensaje => {
    const autor = mensaje.origenUsuario;
    const propio = autor.id === this.miId();
    return {
      id: mensaje.id, autor: [autor.nombre, autor.apellido].filter(Boolean).join(' ') || 'Usuario',
      foto: autor.foto_url, texto: mensaje.texto, fecha: mensaje.fecha, propio,
      leido: propio ? mensaje.leido : undefined,
    };
  }));
}
