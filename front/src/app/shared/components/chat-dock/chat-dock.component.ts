import { isPlatformBrowser } from '@angular/common';
import { Component, DestroyRef, inject, PLATFORM_ID } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EMPTY, catchError, switchMap, timer } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { ChatService } from '../../../core/services/chat.service';
import { ChatWindowComponent } from './chat-window.component';

// Contenedor fijo abajo a la derecha con las ventanas de chat abiertas.
@Component({
  selector: 'app-chat-dock',
  standalone: true,
  imports: [ChatWindowComponent],
  template: `
    @if (auth.isAuthenticated) {
      <div class="dock">
        @for (chat of chatService.abiertos(); track chat.idPublicacion + '-' + chat.idOtroUsuario) {
          <app-chat-window [chat]="chat" />
        }
      </div>
      @if (chatService.toast(); as toast) {
        <div class="chat-toast" role="status">{{ toast }}</div>
      }
    }
  `,
  styles: `
    .dock {
      position: fixed;
      right: 1rem;
      bottom: 0;
      z-index: 30;
      display: flex;
      flex-direction: row-reverse;
      align-items: flex-end;
      gap: 0.75rem;
      pointer-events: none;
    }
    .dock > * { pointer-events: auto; }
    .chat-toast { position: fixed; right: 1rem; bottom: 1rem; z-index: 35; padding: .8rem 1rem; border: 0; border-radius: 10px; background: #1d2939; color: #fff; font: inherit; font-weight: 700; box-shadow: 0 10px 26px rgba(16,24,40,.25); cursor: pointer; animation: toast-in .3s ease both; }
    @keyframes toast-in { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
    @media (max-width: 760px) {
      .dock { right: 0.5rem; }
      .dock > *:not(:first-child) { display: none; }
    }
  `,
})
export class ChatDockComponent {
  protected readonly auth = inject(AuthService);
  protected readonly chatService = inject(ChatService);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    if (!isPlatformBrowser(inject(PLATFORM_ID))) return;
    timer(0, 5000).pipe(
      switchMap(() => this.auth.isAuthenticated ? this.chatService.listarConversaciones() : EMPTY),
      catchError(() => EMPTY),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe((conversaciones) => this.chatService.actualizarNoLeidos(conversaciones));
  }
}
