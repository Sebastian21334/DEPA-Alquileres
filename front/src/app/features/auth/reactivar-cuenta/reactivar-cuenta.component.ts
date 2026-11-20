import { Location } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ApiError } from '../../../core/interceptors/api-error';

@Component({
  selector: 'app-reactivar-cuenta',
  imports: [ReactiveFormsModule, RouterLink],
  styleUrl: '../restablecer-contrasenia/restablecer-contrasenia.component.scss',
  template: `
    <section class="auth auth--pantalla-completa">
      <div class="auth__card">
        <a routerLink="/" class="auth__brand" aria-label="Ir al inicio">
          <img src="/images/Logo.png" alt="DEPA" />
        </a>
        <h1 class="auth__title">Recuperá tu cuenta</h1>

        @if (mensaje(); as resultado) {
          <p class="auth__subtitle" role="status">{{ resultado }}</p>
          <a routerLink="/login" class="btn btn--primary">Iniciar sesión</a>
        } @else if (enlaceValido()) {
          <p class="auth__subtitle">Ingresá la contraseña que usabas antes de dar de baja tu cuenta.</p>
          <form class="auth__form" [formGroup]="form" (ngSubmit)="confirmar()" novalidate>
            @if (error()) {
              <p class="auth__error" role="alert">{{ error() }}</p>
            }
            <div class="auth__field">
              <label for="contrasenia">Contraseña de la cuenta anterior</label>
              <input id="contrasenia" type="password" formControlName="contrasenia" autocomplete="current-password" />
              @if (contrasenia.touched && contrasenia.invalid) {
                <span class="auth__hint auth__hint--error">Ingresá tu contraseña anterior.</span>
              }
            </div>
            <button type="submit" class="btn btn--primary" [disabled]="enviando()">
              {{ enviando() ? 'Recuperando…' : 'Recuperar mi cuenta' }}
            </button>
          </form>
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
  private readonly token = inject(ActivatedRoute).snapshot.fragment ?? '';

  protected readonly enlaceValido = signal(/^[a-f0-9]{64}$/.test(this.token));
  protected readonly contrasenia = new FormControl('', { nonNullable: true, validators: Validators.required });
  protected readonly form = new FormGroup({ contrasenia: this.contrasenia });
  protected readonly enviando = signal(false);
  protected readonly mensaje = signal('');
  protected readonly error = signal(this.enlaceValido() ? '' : 'Abrí el enlace de recuperación que recibiste por email.');

  protected confirmar(): void {
    if (this.enviando() || !this.enlaceValido()) return;
    if (this.contrasenia.invalid) {
      this.contrasenia.markAsTouched();
      return;
    }

    this.enviando.set(true);
    this.error.set('');
    this.auth.confirmarReactivacion(this.token, this.contrasenia.value).subscribe({
      next: ({ mensaje }) => {
        this.location.replaceState('/reactivar-cuenta');
        this.contrasenia.reset();
        this.mensaje.set(mensaje);
        this.enviando.set(false);
      },
      error: (err: Error) => {
        this.error.set(err.message);
        if (err instanceof ApiError && (err.codigo === 'ENLACE_REACTIVACION_INVALIDO' || err.status === 409)) {
          this.enlaceValido.set(false);
          this.contrasenia.reset();
        }
        this.enviando.set(false);
      },
    });
  }
}
