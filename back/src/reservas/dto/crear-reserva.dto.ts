// reservas/dto/crear-reserva.dto.ts
import { IsInt, IsDateString } from 'class-validator';

export class CrearReservaDto {
  // Las fechas se validan como ISO y luego se usan para consultar disponibilidad.
  @IsInt()
  id_publicacion: number;

  @IsDateString()
  fecha_inicio: string;

  @IsDateString()
  fecha_fin: string;
}
