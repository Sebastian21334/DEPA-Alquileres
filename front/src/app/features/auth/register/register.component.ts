import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { contraseniasIgualesValidator, passwordSeguraValidator } from '../../../shared/validators/password.validators';

// RF1 (alta de usuario) + caso de uso "Crear Cuenta" (ID 1 del documento):
// el registro siempre crea un usuario tipo Inquilino (back/src/usuarios/service
// /usuarios.service.ts asigna el rol automáticamente); convertirse en
// Propietario/Inmobiliaria es un flujo aparte (POST /anunciantes/solicitar,
// fuera del alcance de este componente).
//
// Flujo (ver back/src/auth/service/auth.service.ts#register): al enviar el
// formulario el backend crea la cuenta y dispara un mail con un link de
// verificación (RN-2). La cuenta no puede usarse para iniciar sesión hasta
// que ese link se consuma (ver verificar-cuenta.component.ts), así que acá
// no redirigimos a /login: mostramos el mensaje de éxito del backend y un
// aviso de que hay que revisar el correo.
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);

  protected readonly enviando = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly mensajeExito = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group(
    {
      nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      apellido: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.required, Validators.maxLength(20)]],
      contrasenia: ['', [Validators.required, passwordSeguraValidator()]],
      confirmarContrasenia: ['', [Validators.required]],
    },
    { validators: contraseniasIgualesValidator() },
  );

  protected onSubmit(): void {
    if (this.form.invalid || this.enviando()) {
      this.form.markAllAsTouched();
      return;
    }

    this.enviando.set(true);
    this.error.set(null);

    const { confirmarContrasenia, ...dto } = this.form.getRawValue();
    const email = dto.email.trim().toLowerCase();

    this.authService.register({ ...dto, email }).subscribe({
      next: (res) => {
        this.enviando.set(false);
        this.mensajeExito.set(res.mensaje);
        this.form.reset();
      },
      error: (err: Error) => {
        this.enviando.set(false);
        this.error.set(err.message);
      },
    });
  }
}
