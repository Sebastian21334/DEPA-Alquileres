import { IsByteLength, IsNotEmpty, IsString, Matches } from 'class-validator';
import { OPCIONES_BYTES_CONTRASENIA } from './contrasenia-segura.dto';

export class CambiarContraseniaDto {
  @IsString()
  @IsNotEmpty()
  contraseniaActual: string;

  @Matches(/^(?=.*\p{L})(?=.*[0-9])(?=.*[\p{P}\p{S}])[^\s\p{C}]{12,}$/u)
  @IsByteLength(0, 72, OPCIONES_BYTES_CONTRASENIA)
  nuevaContrasenia: string;

  @IsString()
  confirmarContrasenia: string;
}
