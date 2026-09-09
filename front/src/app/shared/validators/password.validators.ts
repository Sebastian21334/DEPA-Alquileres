import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

// RNF5: "La contraseña debe contener al menos 8 dígitos alfanuméricos, un
// número y un carácter especial." El backend hoy solo valida longitud mínima
// (ver back/src/auth/dto/register.dto.ts), pero el formulario igual exige la
// regla completa del documento para no depender de esa validación faltante.
export function passwordSeguraValidator(): ValidatorFn {
  const tieneLetra = /[A-Za-z]/;
  const tieneNumero = /\d/;
  const tieneCaracterEspecial = /[^A-Za-z0-9]/;

  return (control: AbstractControl): ValidationErrors | null => {
    const valor = control.value as string | null;
    if (!valor) return null; // Validators.required se encarga de este caso

    const errores: ValidationErrors = {};
    if (valor.length < 8) errores['minlength'] = true;
    if (!tieneLetra.test(valor)) errores['sinLetra'] = true;
    if (!tieneNumero.test(valor)) errores['sinNumero'] = true;
    if (!tieneCaracterEspecial.test(valor)) errores['sinCaracterEspecial'] = true;

    return Object.keys(errores).length ? errores : null;
  };
}

// Validador a nivel de FormGroup: confirma que "contrasenia" y
// "confirmarContrasenia" coincidan. Se aplica sobre el grupo (no sobre el
// control individual) para poder comparar ambos valores.
export function contraseniasIgualesValidator(): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const contrasenia = group.get('contrasenia')?.value;
    const confirmacion = group.get('confirmarContrasenia')?.value;
    if (!contrasenia || !confirmacion) return null;
    return contrasenia === confirmacion ? null : { contraseniasDistintas: true };
  };
}
