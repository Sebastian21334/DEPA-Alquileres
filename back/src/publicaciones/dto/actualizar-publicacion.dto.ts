import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Length,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';
import {
  LARGO_MAXIMO_TITULO,
  LARGO_MINIMO_TITULO,
  MENSAJE_FORMATO_TITULO,
  MENSAJE_LARGO_TITULO,
  PATRON_TITULO_PUBLICACION,
} from './crear-publicacion.dto';

export class ActualizarPublicacionDto {
  @ValidateIf((_dto, titulo: unknown) => titulo !== undefined)
  @IsString()
  @Length(LARGO_MINIMO_TITULO, LARGO_MAXIMO_TITULO, { message: MENSAJE_LARGO_TITULO })
  @Matches(PATRON_TITULO_PUBLICACION, { message: MENSAJE_FORMATO_TITULO })
  titulo?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
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
