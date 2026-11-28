import { Transform } from 'class-transformer';
import { IsBoolean, IsString, MaxLength, MinLength } from 'class-validator';
import { MAX_CARACTERES_MOTIVO_MODERACION, MIN_CARACTERES_MOTIVO_MODERACION } from '../resenas.constants';

export class ResolverDenunciaDto {
  @IsBoolean()
  aceptada: boolean;

  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsString()
  @MinLength(MIN_CARACTERES_MOTIVO_MODERACION)
  @MaxLength(MAX_CARACTERES_MOTIVO_MODERACION)
  motivo: string;
}
