import {
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LucideMessageCircle, LucideX } from '@lucide/angular';
import { AuthService } from '../../../core/services/auth.service';
import { ChatService } from '../../../core/services/chat.service';
import { ConversacionResumen } from '../../models/mensaje.model';
import { chatDeConversacion } from '../../utils/conversaciones';
import { ChatWindowComponent } from './chat-window.component';
import { ConversationListComponent } from './conversation-list.component';

@Component({
  selector: 'app-chat-dock',
  standalone: true,
  imports: [ChatWindowComponent, ConversationListComponent, LucideMessageCircle, LucideX],
  template: `
    @if (auth.isAuthenticated) {
      <div class="dock">
        @for (chat of chatService.abiertos(); track chat.idPublicacion + '-' + chat.idOtroUsuario) {
          <app-chat-window [chat]="chat" />
        }
      </div>

      @if (listaAbierta()) {
        <section
          #listaPanel
          id="chat-inbox"
          class="chat-inbox"
          role="dialog"
          aria-modal="false"
          aria-labelledby="chat-inbox-title"
          tabindex="-1"
        >
          <header class="chat-inbox__head">
            <div>
              <h2 id="chat-inbox-title">Mensajes</h2>
              <p>{{ totalNoLeidos() }} sin leer</p>
            </div>
            <button type="button" class="chat-inbox__close" aria-label="Cerrar chats" (click)="cerrarLista()">
              <svg lucideX [size]="20" aria-hidden="true"></svg>
            </button>
          </header>
          <app-conversation-list
            [conversaciones]="conversaciones()"
            [cargando]="cargandoLista()"
            [error]="errorLista()"
            (seleccionar)="abrirConversacion($event)"
          />
        </section>
      }

      <button
        #burbuja
        type="button"
        class="chat-bubble"
        aria-controls="chat-inbox"
        [attr.aria-expanded]="listaAbierta()"
        [attr.aria-label]="'Ver más chats. ' + totalNoLeidos() + ' mensajes sin leer'"
        (click)="alternarLista()"
      >
        <svg lucideMessageCircle [size]="22" aria-hidden="true"></svg>
        <span class="chat-bubble__label">Chats</span>
        @if (totalNoLeidos()) {
          <span class="chat-bubble__count" aria-hidden="true">{{ totalNoLeidos() }}</span>
        }
        <span class="chat-bubble__more">Ver más</span>
      </button>
      <span class="sr-only" aria-live="polite">{{ totalNoLeidos() }} mensajes sin leer</span>
    }
  `,
  styles: `
    .dock {
      position: fixed;
      right: 1rem;
      bottom: 5.5rem;
      z-index: 30;
      display: flex;
      flex-direction: row-reverse;
      align-items: flex-end;
      gap: 0.75rem;
      pointer-events: none;
    }
    .dock > * { pointer-events: auto; }

    .chat-bubble {
      position: fixed;
      right: 1rem;
      bottom: 1rem;
      z-index: 32;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      min-height: 48px;
      padding: 0.55rem 0.9rem;
      border: 1px solid color-mix(in srgb, var(--color-primary) 75%, black);
      border-radius: var(--radius-pill);
      background: var(--color-primary);
      color: #fff;
      box-shadow: 0 10px 26px rgba(16, 24, 40, 0.28);
      font: inherit;
      font-weight: 800;
      cursor: pointer;
      transition: transform 0.15s ease, background 0.15s ease;
    }
    .chat-bubble:hover { background: var(--color-primary-dark); transform: translateY(-1px); }
    .chat-bubble:focus-visible { outline: 3px solid color-mix(in srgb, var(--color-accent) 70%, transparent); outline-offset: 3px; }
    .chat-bubble__label { font-size: 0.88rem; }
    .chat-bubble__more { padding-left: 0.5rem; border-left: 1px solid rgba(255, 255, 255, 0.35); font-size: 0.72rem; font-weight: 700; opacity: 0.9; }
    .chat-bubble__count {
      display: grid;
      place-items: center;
      min-width: 1.4rem;
      height: 1.4rem;
      padding: 0 0.3rem;
      border-radius: 999px;
      background: var(--color-accent);
      color: #1a1200;
      font-size: 0.72rem;
    }

    .chat-inbox {
      position: fixed;
      right: 1rem;
      bottom: 5.5rem;
      z-index: 34;
      display: flex;
      width: min(360px, calc(100vw - 2rem));
      max-height: min(60dvh, 520px);
      flex-direction: column;
      overflow: hidden;
      border: 1px solid var(--color-border);
      border-radius: 16px;
      background: #fff;
      box-shadow: 0 20px 50px rgba(16, 24, 40, 0.25);
    }
    .chat-inbox:focus { outline: none; }
    .chat-inbox__head { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; padding: 0.9rem 1rem 0.7rem; border-bottom: 1px solid var(--color-border); }
    .chat-inbox__head h2 { margin: 0; font-size: 1rem; font-weight: 800; }
    .chat-inbox__head p { margin: 0.15rem 0 0; color: var(--color-text-muted); font-size: 0.78rem; }
    .chat-inbox__close { display: grid; place-items: center; width: 36px; height: 36px; flex-shrink: 0; border: 0; border-radius: 50%; background: transparent; color: var(--color-text-muted); cursor: pointer; }
    .chat-inbox__close:hover { background: var(--color-bg); color: var(--color-text); }
    .chat-inbox app-conversation-list { min-height: 0; overflow: auto; padding: 0.4rem; }
    .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }

    @media (max-width: 760px) {
      .dock { right: 0.5rem; bottom: 5.5rem; }
      .dock > *:not(:first-child) { display: none; }
    }
    @media (max-width: 480px) {
      .dock { left: 0.5rem; bottom: 5.5rem; }
      .dock > * { width: 100%; min-width: 0; }
      .chat-bubble { right: 0.75rem; bottom: 0.75rem; }
      .chat-inbox { right: 0.5rem; bottom: 5.25rem; width: calc(100vw - 1rem); max-height: 58dvh; }
    }
  `,
})
export class ChatDockComponent {
  protected readonly auth = inject(AuthService);
  protected readonly chatService = inject(ChatService);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly totalNoLeidos = this.chatService.mensajesNoLeidos;
  protected readonly listaAbierta = signal(false);
  protected readonly conversaciones = signal<ConversacionResumen[]>([]);
  protected readonly cargandoLista = signal(false);
  protected readonly errorLista = signal('');
  private readonly listaPanel = viewChild<ElementRef<HTMLElement>>('listaPanel');
  private readonly burbuja = viewChild<ElementRef<HTMLButtonElement>>('burbuja');

  protected alternarLista(): void {
    const abrir = !this.listaAbierta();
    this.listaAbierta.set(abrir);
    if (!abrir) {
      this.burbuja()?.nativeElement.focus();
      return;
    }
    this.cargarConversaciones();
    setTimeout(() => this.listaPanel()?.nativeElement.focus());
  }

  protected cerrarLista(): void {
    if (!this.listaAbierta()) return;
    this.listaAbierta.set(false);
    this.burbuja()?.nativeElement.focus();
  }

  @HostListener('document:keydown.escape')
  protected alPresionarEscape(): void {
    this.cerrarLista();
  }

  protected abrirConversacion(conversacion: ConversacionResumen): void {
    this.chatService.abrir(chatDeConversacion(conversacion));
    this.listaAbierta.set(false);
    this.burbuja()?.nativeElement.focus();
  }

  private cargarConversaciones(): void {
    this.cargandoLista.set(true);
    this.errorLista.set('');
    this.chatService.listarConversaciones().pipe(
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: (conversaciones) => {
        this.conversaciones.set(conversaciones);
        this.cargandoLista.set(false);
      },
      error: (error: Error) => {
        this.errorLista.set(error.message);
        this.cargandoLista.set(false);
      },
    });
  }
}
