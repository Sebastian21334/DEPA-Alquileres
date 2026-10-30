import { IsString } from 'class-validator';
import { VerificarCuentaDto } from './verificar-cuenta.dto';
import { ContraseniaSegura } from '../validators/contrasenia-segura.decorator';

export class RestablecerContraseniaDto extends VerificarCuentaDto {
  @IsString()
  @ContraseniaSegura()
  nuevaContrasenia: string;
}
