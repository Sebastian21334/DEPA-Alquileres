import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

// RF2 (autenticación) + caso de uso "Iniciar sesión" (ID 2). Los mensajes de
// error específicos (credenciales inválidas, cuenta sin verificar, usuario
// bloqueado) ya vienen legibles desde el backend — ver
// back/src/auth/service/auth.service.ts#login y el errorInterceptor, que los
// deja disponibles en err.message.
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly enviando = signal(false);
  protected readonly error = signal<string | null>(null);

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

    const { email, contrasenia } = this.form.getRawValue();

    this.authService.login({ email: email.trim().toLowerCase(), contrasenia }).subscribe({
      next: () => {
        this.enviando.set(false);
        this.router.navigateByUrl('/');
      },
      error: (err: Error) => {
        this.enviando.set(false);
        this.error.set(err.message);
      },
    });
  }
}
