import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  MaxLength,
  Min,
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
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitud?: number;

  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitud?: number;

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
