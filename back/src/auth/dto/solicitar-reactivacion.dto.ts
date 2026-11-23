import { IsJWT, IsOptional, MaxLength } from 'class-validator';
import { RecuperarContraseniaDto } from './recuperar-contrasenia.dto';

export class SolicitarReactivacionDto extends RecuperarContraseniaDto {
  @IsOptional()
  @IsJWT()
  @MaxLength(1024)
  constanciaReactivacion?: string;
}
