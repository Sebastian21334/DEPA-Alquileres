import { IsByteLength, IsString, Matches } from 'class-validator';
import { VerificarCuentaDto } from './verificar-cuenta.dto';
import { OPCIONES_BYTES_CONTRASENIA } from './contrasenia-segura.dto';

export class RestablecerContraseniaDto extends VerificarCuentaDto {
  @IsString()
  @Matches(/^(?=.*\p{L})(?=.*[0-9])(?=.*[\p{P}\p{S}])[^\s\p{C}]{12,}$/u)
  @IsByteLength(0, 72, OPCIONES_BYTES_CONTRASENIA)
  nuevaContrasenia: string;

  @IsString()
  confirmarContrasenia: string;
}
