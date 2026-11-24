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
  MENSAJE_AMBIENTES_RANGO,
  MENSAJE_FORMATO_TITULO,
  MENSAJE_LARGO_TITULO,
  MENSAJE_PRECIO_RANGO,
  MENSAJE_SUPERFICIE_RANGO,
  PATRON_TITULO_PUBLICACION,
} from './crear-publicacion.dto';
import { PUBLICACION_LIMITES } from './publicacion-limites.generated';

export class ActualizarPublicacionDto {
  @ValidateIf((_dto, titulo: unknown) => titulo !== undefined)
  @IsString()
  @Length(LARGO_MINIMO_TITULO, LARGO_MAXIMO_TITULO, { message: MENSAJE_LARGO_TITULO })
  @Matches(PATRON_TITULO_PUBLICACION, { message: MENSAJE_FORMATO_TITULO })
  titulo?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  descripcion?: string;

  @ValidateIf((_dto, precio: unknown) => precio !== undefined)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Max(PUBLICACION_LIMITES.precioMaximo, { message: MENSAJE_PRECIO_RANGO })
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

  @ValidateIf((_dto, cantidad: unknown) => cantidad !== undefined)
  @IsInt()
  @IsPositive()
  @Max(PUBLICACION_LIMITES.ambientesMaximos, { message: MENSAJE_AMBIENTES_RANGO })
  cantidad_ambientes?: number;

  @ValidateIf((_dto, superficie: unknown) => superficie !== undefined)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Max(PUBLICACION_LIMITES.superficieMaxima, { message: MENSAJE_SUPERFICIE_RANGO })
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

  @ValidateIf((_dto, activa: unknown) => activa !== undefined)
  @IsBoolean()
  activa?: boolean;
}
