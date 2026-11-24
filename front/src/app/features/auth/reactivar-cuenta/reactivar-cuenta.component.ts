import { Location } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ApiError } from '../../../core/interceptors/api-error';

@Component({
  selector: 'app-reactivar-cuenta',
  imports: [RouterLink],
  styleUrl: '../restablecer-contrasenia/restablecer-contrasenia.component.scss',
  template: `
    <section class="auth auth--pantalla-completa">
      <div class="auth__card">
        <a routerLink="/" class="auth__brand" aria-label="Ir al inicio"><img src="/images/Logo.png" alt="DEPA" /></a>
        <h1 class="auth__title">Recuperá tu cuenta</h1>
        @if (enlaceValido()) {
          <p class="auth__subtitle">Confirmá el alta para volver a usar tu cuenta. Después podrás iniciar sesión o recuperar tu contraseña.</p>
          <div class="auth__form">
            @if (error()) { <p class="auth__error" role="alert">{{ error() }}</p> }
            <button type="button" class="btn btn--primary" [disabled]="enviando()" (click)="confirmar()">
              {{ enviando() ? 'Confirmando…' : 'Confirmar alta' }}
            </button>
          </div>
        } @else {
          <p class="auth__subtitle auth__subtitle--error" role="alert">{{ error() }}</p>
          <a routerLink="/registro" class="btn btn--primary">Volver al registro</a>
        }
      </div>
    </section>
  `,
})
export class ReactivarCuentaComponent {
  private readonly auth = inject(AuthService);
  private readonly location = inject(Location);
  private readonly router = inject(Router);
  private readonly token = inject(ActivatedRoute).snapshot.fragment ?? '';

  protected readonly enlaceValido = signal(/^[a-f0-9]{64}$/.test(this.token));
  protected readonly enviando = signal(false);
  protected readonly error = signal(this.enlaceValido() ? '' : 'Abrí el enlace de recuperación que recibiste por email.');

  protected confirmar(): void {
    if (this.enviando() || !this.enlaceValido()) return;
    this.enviando.set(true);
    this.error.set('');
    this.auth.confirmarReactivacion(this.token).subscribe({
      next: () => {
        this.location.replaceState('/reactivar-cuenta');
        void this.router.navigate(['/login'], { queryParams: { cuentaReactivada: '1' }, replaceUrl: true });
      },
      error: (err: Error) => {
        this.error.set(err.message);
        if (err instanceof ApiError && (err.codigo === 'ENLACE_REACTIVACION_INVALIDO' || err.status === 409))
          this.enlaceValido.set(false);
        this.enviando.set(false);
      },
    });
  }
}
