import { IsOptional, IsString, MaxLength } from 'class-validator';
import { CrearReservaDto } from '../../reservas/dto/crear-reserva.dto';

export class CrearCheckoutDto extends CrearReservaDto {
  @IsOptional()
  @IsString()
  @MaxLength(8192)
  presupuesto_token?: string;
}
