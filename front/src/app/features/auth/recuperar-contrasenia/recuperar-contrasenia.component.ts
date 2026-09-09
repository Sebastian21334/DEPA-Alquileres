import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

// Caso de uso "Cambiar contraseña" (ID 4) — primer paso: pedir el link de
// restablecimiento (back/src/auth/service/auth.service.ts#solicitarRecuperacion).
// El backend responde siempre el mismo mensaje neutro exista o no la cuenta
// (RN anti-enumeración de emails), así que acá no hay estado de "error de
// negocio": ante cualquier envío válido se muestra el mismo aviso.
@Component({
  selector: 'app-recuperar-contrasenia',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './recuperar-contrasenia.component.html',
  styleUrl: './recuperar-contrasenia.component.scss',
})
export class RecuperarContraseniaComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);

  protected readonly enviando = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly mensajeExito = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  protected onSubmit(): void {
    if (this.form.invalid || this.enviando()) {
      this.form.markAllAsTouched();
      return;
    }

    this.enviando.set(true);
    this.error.set(null);

    const email = this.form.getRawValue().email.trim().toLowerCase();

    this.authService.solicitarRecuperacion(email).subscribe({
      next: (res) => {
        this.enviando.set(false);
        this.mensajeExito.set(res.mensaje);
      },
      error: (err: Error) => {
        this.enviando.set(false);
        this.error.set(err.message);
      },
    });
  }
}
