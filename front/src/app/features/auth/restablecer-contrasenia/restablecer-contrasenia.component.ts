import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { contraseniasIgualesValidator, passwordSeguraValidator } from '../../../shared/validators/password.validators';

// Segundo paso del caso de uso "Cambiar contraseña" (ID 4): consume el link
// que llega por mail (back/src/mail/mail.service.ts#enviarRecuperacion, que
// arma "${frontendUrl}/restablecer-contrasena?token=...") y fija la nueva
// contraseña. OJO: la ruta del link usa "restablecer-contrasena" (sin la
// "i" de "contrasenia") — así la armó el backend, y hay que respetarla tal
// cual en app.routes.ts o el link del mail rompería.
//
// A diferencia de verificar-cuenta.component.ts, acá el POST se dispara
// recién en onSubmit() (clic del usuario), nunca en ngOnInit, así que no
// aplica la misma trampa de SSR/hidratación (ver memoria de proyecto
// "frontend-ssr-post-en-ngoninit"): leer el token de la URL en ngOnInit es
// una simple lectura sin efectos secundarios.
@Component({
  selector: 'app-restablecer-contrasenia',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './restablecer-contrasenia.component.html',
  styleUrl: './restablecer-contrasenia.component.scss',
})
export class RestablecerContraseniaComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);

  protected readonly enviando = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly mensajeExito = signal<string | null>(null);
  protected readonly tokenValido = signal(true);

  private token: string | null = null;

  protected readonly form = this.fb.nonNullable.group(
    {
      contrasenia: ['', [Validators.required, passwordSeguraValidator()]],
      confirmarContrasenia: ['', [Validators.required]],
    },
    { validators: contraseniasIgualesValidator() },
  );

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token');
    if (!this.token) {
      this.tokenValido.set(false);
      this.error.set('El link de recuperación no es válido: falta el token.');
    }
  }

  protected onSubmit(): void {
    if (!this.token || this.form.invalid || this.enviando()) {
      this.form.markAllAsTouched();
      return;
    }

    this.enviando.set(true);
    this.error.set(null);

    const { contrasenia } = this.form.getRawValue();

    this.authService.restablecerContrasenia(this.token, contrasenia).subscribe({
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
