import { ValidateBy, type ValidationOptions } from 'class-validator';

const MENSAJE_CONTRASENIA_SEGURA =
  'Usá al menos 12 caracteres, con una letra, un número y un símbolo, sin espacios ni caracteres invisibles. Máximo 72 bytes en UTF-8.';

/** Política común de registro y restablecimiento. El límite evita truncar en bcrypt. */
export function ContraseniaSegura(
  options?: ValidationOptions,
): PropertyDecorator {
  return ValidateBy(
    {
      name: 'contraseniaSegura',
      validator: {
        validate: (valor: unknown): boolean =>
          typeof valor === 'string' &&
          Array.from(valor).length >= 12 &&
          Buffer.byteLength(valor, 'utf8') <= 72 &&
          /\p{L}/u.test(valor) &&
          /[0-9]/.test(valor) &&
          /[\p{P}\p{S}]/u.test(valor) &&
          !/[\s\p{C}]/u.test(valor),
        defaultMessage: () => MENSAJE_CONTRASENIA_SEGURA,
      },
    },
    options,
  );
}
