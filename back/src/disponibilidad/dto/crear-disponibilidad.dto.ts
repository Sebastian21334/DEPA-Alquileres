import { IsInt, IsDateString } from 'class-validator';

export class CrearDisponibilidadDto {
  // El service convierte este rango en una fila Fecha por cada día.
  @IsInt()
  id_publicacion: number;

  @IsDateString()
  fecha_inicio: string;

  @IsDateString()
  fecha_fin: string;
}