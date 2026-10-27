// reservas/dto/crear-reserva.dto.ts
import { IsInt, IsDateString, Matches, Min } from 'class-validator';

export class CrearReservaDto {
  // Las fechas se validan como ISO y luego se usan para consultar disponibilidad.
  @IsInt()
  @Min(1)
  id_publicacion: number;

  @IsDateString({ strict: true })
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  fecha_inicio: string;

  @IsDateString({ strict: true })
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  fecha_fin: string;
}
