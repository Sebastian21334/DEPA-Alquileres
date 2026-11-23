import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LucideArrowLeft, LucideEye, LucideEyeOff } from '@lucide/angular';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { ApiError } from '../../../core/interceptors/api-error';
import { contraseniasIgualesValidator, MENSAJE_CONTRASENIA_SEGURA, passwordSeguraValidator } from '../../../shared/validators/password.validators';

const FORMATO_NOMBRE = /^\p{L}[\p{L}\p{M}]*(?: +\p{L}[\p{L}\p{M}]*)*$/u;
const FORMATO_TELEFONO = /^\+?(?:[0-9]-?){0,14}[0-9]$/;

// RF1 (alta de usuario) + caso de uso "Crear Cuenta" (ID 1 del documento):
// el registro siempre crea un usuario tipo Inquilino (back/src/usuarios/service
// /usuarios.service.ts asigna el rol automáticamente); convertirse en
// Propietario/Inmobiliaria es un flujo aparte (POST /anunciantes/solicitar,
// fuera del alcance de este componente).
//
// Si el correo corresponde a una baja recuperable, el backend pide una
// elección antes de crear una cuenta.
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, LucideArrowLeft, LucideEye, LucideEyeOff],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  protected readonly politicaContrasenia = MENSAJE_CONTRASENIA_SEGURA;
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly toast = inject(ToastService);

  protected readonly enviando = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly errorEmail = signal<string | null>(null);
  protected readonly cuentaRecuperable = signal<{ email: string; constancia: string } | null>(null);
  protected readonly mensajeExito = signal<string | null>(null);
  protected readonly recuperacionEnviada = signal(false);
  protected readonly verContrasenia = signal(false);
  protected readonly verConfirmacion = signal(false);

  protected readonly form = this.fb.nonNullable.group(
    {
      nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100), Validators.pattern(FORMATO_NOMBRE)]],
      apellido: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100), Validators.pattern(FORMATO_NOMBRE)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
      telefono: ['', [Validators.required, Validators.maxLength(20), Validators.pattern(FORMATO_TELEFONO)]],
      contrasenia: ['', [Validators.required, passwordSeguraValidator()]],
      confirmarContrasenia: ['', [Validators.required]],
      aceptaTerminos: [false, [Validators.requiredTrue]],
    },
    { validators: contraseniasIgualesValidator() },
  );

  protected filtrarCampo(evento: Event, campo: 'nombre' | 'apellido' | 'telefono'): void {
    if ((evento as InputEvent).isComposing) return;

    const entrada = evento.target as HTMLInputElement;
    const { value, selectionStart, selectionEnd } = entrada;
    const caracteresInvalidos = campo === 'telefono' ? /[^0-9+-]/g : /[^\p{L}\p{M} ]/gu;
    const valor = value.replace(caracteresInvalidos, '');
    if (valor === value) return;

    this.form.controls[campo].setValue(valor);
    if (selectionStart !== null && selectionEnd !== null) {
      entrada.setSelectionRange(
        value.slice(0, selectionStart).replace(caracteresInvalidos, '').length,
        value.slice(0, selectionEnd).replace(caracteresInvalidos, '').length,
      );
    }
  }

  protected onSubmit(crearCuentaNueva = false): void {
    if (this.enviando() || (this.cuentaRecuperable() && !crearCuentaNueva)) return;
    const { nombre: nombreIngresado, apellido: apellidoIngresado, email: emailIngresado } = this.form.controls;
    nombreIngresado.setValue(nombreIngresado.value.trim());
    apellidoIngresado.setValue(apellidoIngresado.value.trim());
    emailIngresado.setValue(emailIngresado.value.trim().toLowerCase());
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { nombre, apellido, email, telefono, contrasenia, aceptaTerminos } = this.form.getRawValue();
    if (crearCuentaNueva && this.cuentaRecuperable()?.email !== email) return;

    this.error.set(null);
    this.errorEmail.set(null);
    this.enviando.set(true);

    this.authService.register({
      nombre, apellido, email, telefono, contrasenia, aceptaTerminos,
      crearCuentaNueva,
    }).subscribe({
      next: (res) => {
        this.enviando.set(false);
        this.cuentaRecuperable.set(null);
        this.mensajeExito.set(res.mensaje);
        this.form.reset();
      },
      error: (err: Error) => {
        this.enviando.set(false);
        if (err instanceof ApiError && err.status === 409) {
          if (err.codigo === 'CUENTA_RECUPERABLE') {
            if (err.constanciaReactivacion) {
              this.cuentaRecuperable.set({ email, constancia: err.constanciaReactivacion });
            } else {
              this.error.set('Volvé a cargar el registro para recuperar la cuenta.');
            }
            return;
          }
          this.volverAlFormulario();
          this.errorEmail.set('Ese email ya está registrado en otra cuenta. Iniciá sesión o usá otro.');
          this.toast.mostrar('El email ingresado ya está registrado en otra cuenta.');
          return;
        }
        this.error.set(err.message);
      },
    });
  }

  protected solicitarReactivacion(): void {
    const cuenta = this.cuentaRecuperable();
    if (!cuenta || this.enviando() || this.recuperacionEnviada()) return;

    this.error.set(null);
    this.enviando.set(true);
    this.authService.solicitarReactivacion(cuenta.email, cuenta.constancia).subscribe({
      next: () => {
        this.recuperacionEnviada.set(true);
        this.enviando.set(false);
      },
      error: (err: Error) => {
        this.error.set(err.message);
        this.enviando.set(false);
      },
    });
  }

  protected volverAlFormulario(): void {
    this.cuentaRecuperable.set(null);
    this.recuperacionEnviada.set(false);
    this.error.set(null);
  }
}
