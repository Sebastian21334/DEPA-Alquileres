import { Transform, Type } from 'class-transformer';
import {
  IsInt,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { MAX_CARACTERES_COMENTARIO } from '../resenas.constants';

export class CrearResenaDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  puntaje: number;

  // Se recorta antes de validar para que un comentario de espacios no cuente.
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @MinLength(1)
  @MaxLength(MAX_CARACTERES_COMENTARIO)
  comentario: string;
}
