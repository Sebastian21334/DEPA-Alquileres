import { IsInt, IsDateString, Matches, Min } from 'class-validator';

export class CrearDisponibilidadDto {
  // El service convierte este rango en una fila Fecha por cada día.
  @IsInt()
  @Min(1)
  id_publicacion: number;

  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  @IsDateString({ strict: true })
  fecha_inicio: string;

  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  @IsDateString({ strict: true })
  fecha_fin: string;
}