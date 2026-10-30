import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const MENSAJE_CONTRASENIA_SEGURA =
  'Usá al menos 12 caracteres, con una letra, un número y un símbolo, sin espacios ni caracteres invisibles. Máximo 72 bytes en UTF-8.';

// Misma política que ContraseniaSegura en los DTO de registro y restablecimiento.
export function passwordSeguraValidator(): ValidatorFn {
  const encoder = new TextEncoder();

  return (control: AbstractControl): ValidationErrors | null => {
    const valor: unknown = control.value;
    if (valor === null || valor === undefined || valor === '') return null;
    if (typeof valor !== 'string') return { contraseniaInvalida: true };

    const errores: ValidationErrors = {};
    if (Array.from(valor).length < 12) errores['minlength'] = true;
    if (encoder.encode(valor).length > 72) errores['maxBytes'] = true;
    if (!/\p{L}/u.test(valor)) errores['sinLetra'] = true;
    if (!/[0-9]/.test(valor)) errores['sinNumero'] = true;
    if (!/[\p{P}\p{S}]/u.test(valor)) errores['sinCaracterEspecial'] = true;
    if (/[\s\p{C}]/u.test(valor)) errores['caracterNoPermitido'] = true;

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
