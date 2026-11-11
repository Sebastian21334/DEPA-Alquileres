import { EstadoLiquidacionReserva } from '../../catalogos/estados';
import {
  IsIn,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';

export class ResolverLiquidacionDto {
  @IsIn(Object.values(EstadoLiquidacionReserva))
  estado: EstadoLiquidacionReserva;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  importe?: number;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  referencia?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  observacion?: string;
}
