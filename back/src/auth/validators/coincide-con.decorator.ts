import { ValidateBy, type ValidationOptions } from 'class-validator';

/** Compara campos del mismo DTO sin confiar en la validación del navegador. */
export function CoincideCon(
  propiedad: string,
  options?: ValidationOptions,
): PropertyDecorator {
  return ValidateBy(
    {
      name: 'coincideCon',
      constraints: [propiedad],
      validator: {
        validate: (valor: unknown, args) =>
          typeof valor === 'string' &&
          valor === (args?.object as Record<string, unknown>)?.[propiedad],
        defaultMessage: () => 'Las contraseñas no coinciden',
      },
    },
    options,
  );
}
