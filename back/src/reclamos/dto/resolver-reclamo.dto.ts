import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';
import { ResolucionReclamo } from '../entity/reclamo.entity';

export class ResolverReclamoDto {
  @IsEnum(ResolucionReclamo)
  resolucion: ResolucionReclamo;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  importe?: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  observacion?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  referencia?: string;
}
