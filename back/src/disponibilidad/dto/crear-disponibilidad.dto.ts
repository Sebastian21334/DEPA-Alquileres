import { IsInt, IsDateString } from 'class-validator';

export class CrearDisponibilidadDto {
  @IsInt()
  id_publicacion: number;

  @IsDateString()
  fecha_inicio: string;

  @IsDateString()
  fecha_fin: string;
}