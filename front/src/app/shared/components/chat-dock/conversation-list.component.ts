import { Component, input, output } from '@angular/core';
import { ConversacionResumen } from '../../models/mensaje.model';
import { AvatarComponent } from '../avatar/avatar.component';
import { SpinnerComponent } from '../spinner/spinner.component';
import { interlocutor, nombreInterlocutor } from '../../utils/conversaciones';

@Component({
  selector: 'app-conversation-list',
  standalone: true,
  imports: [AvatarComponent, SpinnerComponent],
  template: `
    @if (cargando()) {
      <div class="lista__estado"><app-spinner label="Cargando chats…" /><p>Cargando chats…</p></div>
    } @else if (error()) {
      <p class="lista__estado lista__estado--error" role="alert">{{ error() }}</p>
    } @else {
      <div class="lista">
        @for (conversacion of conversaciones(); track conversacion.idPublicacion + '-' + conversacion.idOtroUsuario) {
          <button type="button" class="conversacion" (click)="seleccionar.emit(conversacion)">
            <app-avatar class="conversacion__avatar" [foto]="interlocutor(conversacion).foto_url" [nombre]="nombreInterlocutor(conversacion)" />
            <span class="conversacion__texto">
              <strong>{{ nombreInterlocutor(conversacion) }}</strong>
              <small class="conversacion__titulo">{{ conversacion.ultimoMensaje.publicacion.titulo }}</small>
              <small>{{ conversacion.ultimoMensaje.texto }}</small>
            </span>
            @if (conversacion.cantidadNoLeidos) {
              <span class="conversacion__unread" [attr.aria-label]="conversacion.cantidadNoLeidos + ' mensajes sin leer'">{{ conversacion.cantidadNoLeidos }}</span>
            }
          </button>
        } @empty {
          <p class="lista__estado">{{ vacio() }}</p>
        }
      </div>
    }
  `,
  styles: `
    :host { display: block; min-width: 0; }
    .lista { display: flex; flex-direction: column; gap: 2px; }
    .lista__estado { margin: 0.4rem 0.6rem; color: var(--color-text-muted); font-size: 0.82rem; line-height: 1.4; }
    .lista__estado--error { color: var(--color-danger); }
    .conversacion { display: flex; width: 100%; align-items: center; gap: 0.6rem; padding: 0.55rem; border: 0; border-radius: var(--radius-sm); background: transparent; color: var(--color-text); text-align: left; cursor: pointer; }
    .conversacion:hover { background: var(--color-bg); }
    .conversacion:focus-visible { outline: 2px solid var(--color-primary); outline-offset: 2px; }
    .conversacion__avatar { display: grid; place-items: center; width: 2.2rem; height: 2.2rem; flex-shrink: 0; border-radius: 50%; background: #ffbc59; color: var(--color-primary); font-weight: 700; }
    .conversacion__texto { display: flex; min-width: 0; flex: 1; flex-direction: column; }
    .conversacion__texto strong, .conversacion__texto small { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .conversacion__titulo { color: var(--color-primary); font-weight: 600; }
    .conversacion__texto small { color: var(--color-text-muted); font-size: 0.8rem; }
    .conversacion__unread { display: grid; place-items: center; min-width: 1.35rem; height: 1.35rem; margin-left: auto; padding: 0 0.3rem; border-radius: 999px; background: var(--color-accent); color: #fff; font-size: 0.7rem; font-weight: 800; }
  `,
})
export class ConversationListComponent {
  readonly conversaciones = input.required<ConversacionResumen[]>();
  readonly cargando = input(false);
  readonly error = input('');
  readonly vacio = input('Todavía no tenés conversaciones.');
  readonly seleccionar = output<ConversacionResumen>();

  protected readonly interlocutor = interlocutor;
  protected readonly nombreInterlocutor = nombreInterlocutor;
}
