import { IsDateString } from 'class-validator';

export class ActualizarFechasReservaDto {
  @IsDateString()
  fecha_inicio: string;

  @IsDateString()
  fecha_fin: string;
}
