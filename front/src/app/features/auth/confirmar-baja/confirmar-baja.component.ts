import { Location } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ChatService } from '../../../core/services/chat.service';
import { PerfilService } from '../../../core/services/perfil.service';

@Component({
  selector: 'app-confirmar-baja',
  imports: [RouterLink],
  styleUrl: '../restablecer-contrasenia/restablecer-contrasenia.component.scss',
  styles: `
    .confirmar-baja__acciones {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.85rem;
      text-align: center;
    }

    .confirmar-baja__confirmar {
      min-inline-size: min(13.5rem, 100%);
    }
  `,
  template: `
    <section class="auth auth--pantalla-completa">
      <div class="auth__card">
        <a routerLink="/" class="auth__brand" aria-label="Ir al inicio">
          <img src="/images/Logo.png" alt="DEPA" />
        </a>
        <h1 class="auth__title">Confirmar baja de cuenta</h1>
        @if (mensaje()) {
          <p class="auth__subtitle" role="status">{{ mensaje() }}</p>
        } @else {
          @if (error()) {
            <p class="auth__error" role="alert">{{ error() }}</p>
          }
          @if (token) {
            <p class="auth__subtitle">
              Al confirmar, perderás el acceso a tu cuenta.
              @if (esAnunciante) {
                Tus publicaciones dejarán de estar disponibles.
              }
              Tus datos e historial se conservarán. Si volvés a registrarte con el mismo email,
              podrás recuperar esta cuenta o crear una nueva.
            </p>
          }
        }
        <div class="confirmar-baja__acciones">
          @if (token && !mensaje()) {
            <button type="button" class="btn btn--primary confirmar-baja__confirmar" [disabled]="enviando()" (click)="confirmar()">
              {{ enviando() ? 'Confirmando…' : 'Confirmar baja de cuenta' }}
            </button>
          }
          <a routerLink="/" [class.btn]="mensaje()" [class.btn--primary]="mensaje()">Volver al inicio</a>
        </div>
      </div>
    </section>
  `,
})
export class ConfirmarBajaComponent {
  private readonly perfil = inject(PerfilService);
  private readonly auth = inject(AuthService);
  private readonly chat = inject(ChatService);
  private readonly location = inject(Location);

  protected readonly token = inject(ActivatedRoute).snapshot.fragment;
  protected readonly esAnunciante = this.leerTipoDeCuenta();
  protected readonly enviando = signal(false);
  protected readonly mensaje = signal('');
  protected readonly error = signal(this.token ? '' : 'Abrí el enlace que te enviamos por correo para confirmar la baja.');

  private leerTipoDeCuenta(): boolean {
    const contenido = this.token?.split('.')[1];
    if (!contenido) return false;
    try {
      // Este dato solo elige el texto. El backend verifica y autoriza la baja.
      const payload = JSON.parse(atob(contenido.replace(/-/g, '+').replace(/_/g, '/')));
      return payload?.esAnunciante === true;
    } catch {
      return false;
    }
  }

  protected confirmar(): void {
    if (!this.token || this.enviando() || this.mensaje()) return;
    this.enviando.set(true);
    this.error.set('');
    this.perfil.confirmarBajaCuenta(this.token).subscribe({
      next: ({ mensaje, usuarioId }) => {
        this.location.replaceState('/confirmar-baja');
        if (this.auth.currentUser()?.sub === usuarioId) {
          this.auth.logout();
          this.perfil.limpiar();
          this.chat.cerrarTodos();
        }
        this.mensaje.set(mensaje);
        this.enviando.set(false);
      },
      error: (err: Error) => {
        this.error.set(err.message);
        this.enviando.set(false);
      },
    });
  }
}
