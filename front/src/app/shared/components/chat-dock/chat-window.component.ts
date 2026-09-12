import {
  Component,
  ElementRef,
  OnInit,
  PLATFORM_ID,
  afterRenderEffect,
  computed,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { EMPTY, Subject, catchError, switchMap, timer } from 'rxjs';
import { LucideMinus, LucideSend, LucideX } from '@lucide/angular';
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
  imports: [FormsModule, RouterLink, AvatarComponent, LucideMinus, LucideSend, LucideX],
  templateUrl: './chat-window.component.html',
  styleUrl: './chat-window.component.scss',
})
export class ChatWindowComponent implements OnInit {
  readonly chat = input.required<ChatAbierto>();

  protected readonly chatService = inject(ChatService);
  private readonly auth = inject(AuthService);
  private readonly lista = viewChild<ElementRef<HTMLElement>>('lista');
  private readonly refrescar$ = new Subject<void>();

  protected readonly mensajes = signal<Mensaje[]>([]);
  protected readonly cargando = signal(true);
  protected readonly enviando = signal(false);
  protected readonly error = signal('');
  protected texto = '';
  protected readonly miId = computed(() => Number(this.auth.currentUser()?.sub));

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
        });
    }

    // Mantiene visible el último mensaje cada vez que llegan mensajes nuevos.
    afterRenderEffect(() => {
      this.mensajes();
      const el = this.lista()?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    });
  }

  ngOnInit(): void {
    // Recién acá el input `chat` está disponible; en SSR no hay suscriptores.
    this.refrescar$.next();
  }

  protected enviar(): void {
    const texto = this.texto.trim();
    if (!texto || this.enviando()) return;

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

  protected hora(fecha: string): string {
    return new Date(fecha).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  }
}
