import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import {
  MAX_CARACTERES_MOTIVO_MODERACION,
  MIN_CARACTERES_MOTIVO_MODERACION,
} from '../resenas.constants';

export class ModerarResenaDto {
  @IsBoolean()
  visible: boolean;

  // El tipo se valida siempre: un motivo numérico no debe llegar al service.
  // La obligatoriedad al ocultar se verifica en el service; si viene, se exige
  // el largo mínimo para conservar la calidad de la auditoría.
  @IsOptional()
  @IsString()
  @MinLength(MIN_CARACTERES_MOTIVO_MODERACION)
  @MaxLength(MAX_CARACTERES_MOTIVO_MODERACION)
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  motivo?: string;
}
