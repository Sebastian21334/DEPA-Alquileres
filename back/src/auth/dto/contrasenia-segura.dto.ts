import { IsByteLength, IsString, Matches } from 'class-validator';

export const OPCIONES_BYTES_CONTRASENIA = {
  // El conteo de bytes falla con sustitutos Unicode aislados.
  validateIf: (_dto: unknown, valor: unknown) =>
    typeof valor === 'string' && !/\p{Cs}/u.test(valor),
};

export class ContraseniaSeguraDto {
  @IsString()
  @Matches(/^(?=.*\p{L})(?=.*[0-9])(?=.*[\p{P}\p{S}])[^\s\p{C}]{12,}$/u)
  @IsByteLength(0, 72, OPCIONES_BYTES_CONTRASENIA)
  contrasenia: string;
}
