import { IsDateString, Matches } from 'class-validator';

export class ActualizarFechasReservaDto {
  @IsDateString({ strict: true })
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  fecha_inicio: string;

  @IsDateString({ strict: true })
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  fecha_fin: string;
}
