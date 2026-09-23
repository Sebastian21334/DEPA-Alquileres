import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LucideArrowLeft, LucideEye, LucideEyeOff } from '@lucide/angular';
import { AuthService } from '../../../core/services/auth.service';

// RF2 (autenticación) + caso de uso "Iniciar sesión" (ID 2). Los mensajes de
// error específicos (credenciales inválidas, cuenta sin verificar, usuario
// bloqueado) ya vienen legibles desde el backend — ver
// back/src/auth/service/auth.service.ts#login y el errorInterceptor, que los
// deja disponibles en err.message.
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, LucideArrowLeft, LucideEye, LucideEyeOff],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly enviando = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly reenviandoVerificacion = signal(false);
  protected readonly verificacionReenviada = signal<string | null>(null);
  protected readonly verContrasenia = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    contrasenia: ['', [Validators.required]],
  });

  protected onSubmit(): void {
    if (this.form.invalid || this.enviando()) {
      this.form.markAllAsTouched();
      return;
    }

    this.enviando.set(true);
    this.error.set(null);
    this.verificacionReenviada.set(null);

    const { email, contrasenia } = this.form.getRawValue();

    this.authService.login({ email: email.trim().toLowerCase(), contrasenia }).subscribe({
      next: () => {
        this.enviando.set(false);
        const destino = this.route.snapshot.queryParamMap.get('returnUrl');
        this.router.navigateByUrl(destino?.startsWith('/') ? destino : '/');
      },
      error: (err: Error) => {
        this.enviando.set(false);
        this.error.set(err.message);
      },
    });
  }

  protected puedeReenviarVerificacion(): boolean {
    return this.error() === 'Tenés que verificar tu email antes de iniciar sesión';
  }

  protected reenviarVerificacion(): void {
    if (this.reenviandoVerificacion() || this.form.controls.email.invalid || !this.form.controls.contrasenia.value) {
      this.form.controls.email.markAsTouched();
      this.form.controls.contrasenia.markAsTouched();
      return;
    }

    const { email, contrasenia } = this.form.getRawValue();
    this.reenviandoVerificacion.set(true);

    this.authService.reenviarVerificacion({ email: email.trim().toLowerCase(), contrasenia }).subscribe({
      next: ({ mensaje }) => {
        this.reenviandoVerificacion.set(false);
        this.error.set(null);
        this.verificacionReenviada.set(mensaje);
      },
      error: (err: Error) => {
        this.reenviandoVerificacion.set(false);
        this.error.set(err.message);
      },
    });
  }
}
