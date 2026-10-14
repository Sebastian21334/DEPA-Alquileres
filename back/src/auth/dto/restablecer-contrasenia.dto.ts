import { IsString, MinLength } from 'class-validator';
import { VerificarCuentaDto } from './verificar-cuenta.dto';

export class RestablecerContraseniaDto extends VerificarCuentaDto {
  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  nuevaContrasenia: string;
}
