import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import {
  contraseniasIgualesValidator,
  MENSAJE_CONTRASENIA_SEGURA,
  passwordSeguraValidator,
} from '../../shared/validators/password.validators';

@Component({
  selector: 'app-cambiar-contrasenia',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './cambiar-contrasenia.component.html',
  styles: `
    :host { display: block; }
    .security-head { display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap; }
    h2 { margin: 0; }
    .security-description { color: var(--color-text-muted); }
    form { display: flex; flex-direction: column; gap: 1rem; max-width: 38rem; }
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
