import { IsNotEmpty, IsString } from 'class-validator';
import { ContraseniaSegura } from '../validators/contrasenia-segura.decorator';
import { CoincideCon } from '../validators/coincide-con.decorator';

export class CambiarContraseniaDto {
  @IsString()
  @IsNotEmpty()
  contraseniaActual: string;

  @ContraseniaSegura()
  nuevaContrasenia: string;

  @IsString()
  @CoincideCon('nuevaContrasenia')
  confirmarContrasenia: string;
}
