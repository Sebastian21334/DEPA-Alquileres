import { IsDateString, IsInt } from 'class-validator';

export class CrearCheckoutDto {
  @IsInt()
  id_publicacion: number;

  @IsDateString()
  fecha_inicio: string;

  @IsDateString()
  fecha_fin: string;
}
