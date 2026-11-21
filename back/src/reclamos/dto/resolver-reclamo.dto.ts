import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { ResolucionReclamo } from '../entity/reclamo.entity';

export class ResolverReclamoDto {
  @IsEnum(ResolucionReclamo)
  resolucion: ResolucionReclamo;

  /** Solo la devolución parcial usa el importe ingresado; la total devuelve el saldo y sin devolución, nada. */
  @ValidateIf((dto: ResolverReclamoDto) => dto.resolucion === ResolucionReclamo.DEVOLUCION_PARCIAL)
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Indicá el importe de la devolución parcial' })
  @IsPositive({ message: 'El importe de la devolución parcial debe ser mayor a cero' })
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
