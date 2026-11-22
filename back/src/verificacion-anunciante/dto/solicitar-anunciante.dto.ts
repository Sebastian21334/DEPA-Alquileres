import { Equals, IsString, Matches } from 'class-validator';
import { DatosAnuncianteBaseDto } from './datos-anunciante-base.dto';

export class SolicitarAnuncianteDto extends DatosAnuncianteBaseDto {
  @IsString()
  @Matches(/^\d{22}$/)
  cbu: string;

  @Equals(true)
  titularidad_declarada: boolean;
}
