import { Component, inject } from '@angular/core';
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
    @media (max-width: 760px) {
      .dock { right: 0.5rem; }
      .dock > *:not(:first-child) { display: none; }
    }
  `,
})
export class ChatDockComponent {
  protected readonly auth = inject(AuthService);
  protected readonly chatService = inject(ChatService);
}
