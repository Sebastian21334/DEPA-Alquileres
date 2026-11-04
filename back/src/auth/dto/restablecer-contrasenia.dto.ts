import { IsString } from 'class-validator';
import { VerificarCuentaDto } from './verificar-cuenta.dto';
import { ContraseniaSegura } from '../validators/contrasenia-segura.decorator';
import { CoincideCon } from '../validators/coincide-con.decorator';

export class RestablecerContraseniaDto extends VerificarCuentaDto {
  @IsString()
  @ContraseniaSegura()
  nuevaContrasenia: string;

  @IsString()
  @CoincideCon('nuevaContrasenia')
  confirmarContrasenia: string;
}
