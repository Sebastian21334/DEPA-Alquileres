import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { EstadoLiquidacionReserva } from '../entity/reserva.entity';

export class ResolverLiquidacionDto {
  @IsEnum(EstadoLiquidacionReserva)
  estado: EstadoLiquidacionReserva;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  referencia?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  observacion?: string;
}
