import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CrearProvinciaDto {
  // DTO administrativo para mantener nombres acotados al tamaño de la columna.
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombre: string;
}