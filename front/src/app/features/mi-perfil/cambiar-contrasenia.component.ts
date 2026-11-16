import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideLockKeyhole } from '@lucide/angular';
import { AuthService } from '../../core/services/auth.service';
import {
  contraseniasIgualesValidator,
  MENSAJE_CONTRASENIA_SEGURA,
  passwordSeguraValidator,
} from '../../shared/validators/password.validators';

@Component({
  selector: 'app-cambiar-contrasenia',
  standalone: true,
  imports: [ReactiveFormsModule, LucideLockKeyhole],
  templateUrl: './cambiar-contrasenia.component.html',
  styles: `
    :host { display: block; }
    .account-setting-row, .account-setting-label { display: flex; align-items: center; gap: 0.75rem; }
    .account-setting-row { justify-content: space-between; flex-wrap: wrap; min-height: 3.2rem; padding: 0.5rem 0.35rem; }
    .account-setting-label { margin: 0; font-size: 1rem; font-weight: 550; }
    .account-setting-label svg { flex: none; }
    .security-description { margin: 0; color: var(--color-text-muted); line-height: 1.5; }
    form { display: flex; flex-direction: column; gap: 1rem; max-width: 34rem; padding: 0.5rem 0 1.25rem; }
    .acct-alert--success { margin-bottom: 0.75rem; }
  `,
})
export class CambiarContraseniaComponent {
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  protected readonly abierto = signal(false);
  protected readonly guardando = signal(false);
  protected readonly error = signal('');
  protected readonly mensaje = signal('');
  protected readonly politica = MENSAJE_CONTRASENIA_SEGURA;

  protected readonly form = this.fb.nonNullable.group(
    {
      contraseniaActual: ['', Validators.required],
      contrasenia: ['', [Validators.required, passwordSeguraValidator()]],
      confirmarContrasenia: ['', Validators.required],
    },
    { validators: contraseniasIgualesValidator() },
  );

  protected abrir(): void {
    this.form.reset();
    this.error.set('');
    this.mensaje.set('');
    this.abierto.set(true);
  }

  protected cerrar(): void {
    if (this.guardando()) return;
    this.form.reset();
    this.error.set('');
    this.abierto.set(false);
  }

  protected guardar(): void {
    if (this.guardando()) return;
    this.error.set('');
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { contraseniaActual, contrasenia, confirmarContrasenia } = this.form.getRawValue();
    if (contraseniaActual === contrasenia) {
      this.error.set('La nueva contraseña debe ser distinta de la actual.');
      return;
    }
    this.guardando.set(true);
    this.auth.cambiarContrasenia(contraseniaActual, contrasenia, confirmarContrasenia).subscribe({
      next: (res) => {
        this.guardando.set(false);
        this.form.reset();
        this.abierto.set(false);
        this.mensaje.set(res.mensaje);
      },
      error: (err: Error) => {
        this.guardando.set(false);
        this.error.set(err.message);
      },
    });
  }
}
