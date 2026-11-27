import { Transform } from 'class-transformer';
import {
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { MAX_CARACTERES_MOTIVO_DENUNCIA } from '../resenas.constants';

export class DenunciarResenaDto {
  // El front no lo pide; queda disponible para una denuncia con detalle.
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @MinLength(3)
  @MaxLength(MAX_CARACTERES_MOTIVO_DENUNCIA)
  @IsOptional()
  motivo?: string;
}
