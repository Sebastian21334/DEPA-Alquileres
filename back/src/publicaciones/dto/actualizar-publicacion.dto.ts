import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';

export class ActualizarPublicacionDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  titulo?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  descripcion?: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  precio?: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  direccion?: string;

  @IsOptional()
  @IsInt()
  @IsPositive()
  cantidad_ambientes?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  superficie?: number;

  @IsOptional()
  @IsInt()
  idTipoMoneda?: number;

  @IsOptional()
  @IsInt()
  idModalidad?: number;

  @IsOptional()
  @IsInt()
  idProvincia?: number;

  @IsOptional()
  @IsInt()
  idCiudad?: number;

  @IsOptional()
  @IsInt()
  idTipoPropiedad?: number;

  @IsOptional()
  @IsBoolean()
  activa?: boolean;
}
