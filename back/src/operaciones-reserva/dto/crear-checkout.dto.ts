import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { CrearReservaDto } from '../../reservas/dto/crear-reserva.dto';

export class CrearCheckoutDto extends CrearReservaDto {
  @IsNotEmpty({
    message: 'Primero debés cotizar y aceptar un presupuesto antes de pagar',
  })
  @IsString()
  @MaxLength(8192)
  presupuesto_token: string;
}
