// reservas/dto/crear-reserva.dto.ts
import { IsInt, IsDateString, IsNumber, Min } from 'class-validator';

export class CrearReservaDto {
  // Las fechas se validan como ISO y luego se usan para consultar disponibilidad.
  @IsInt()
  id_publicacion: number;

  @IsInt()
  id_metodo_pago: number;

  @IsDateString()
  fecha_inicio: string;

  @IsDateString()
  fecha_fin: string;

  @IsNumber()
  @Min(0)
  monto_pago: number;
}