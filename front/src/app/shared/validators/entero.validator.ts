import type { AbstractControl, ValidationErrors } from '@angular/forms';

/**
 * Exige un número entero. Los valores vacíos quedan a cargo de `Validators.required`
 * para no duplicar el mensaje de campo obligatorio.
 */
export function enteroValidator(control: AbstractControl): ValidationErrors | null {
  const valor = control.value;
  if (valor === null || valor === undefined || valor === '') return null;
  return Number.isInteger(Number(valor)) ? null : { entero: true };
}
