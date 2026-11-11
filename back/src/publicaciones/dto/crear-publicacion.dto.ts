import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsInt,
  Length,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export const PATRON_TITULO_PUBLICACION =
  /^(?=\S)(?=.*[\p{L}\p{Nd}])(?!.*[\uFE0F\u20E3])[\p{L}\p{M}\p{Nd} .,'’()/-]+(?<! )$/u;
export const MENSAJE_FORMATO_TITULO =
  'El título debe incluir letras o números y admite espacios, puntos, comas, apóstrofos, paréntesis, guiones y barras.';

export class CrearPublicacionDto {
  @IsString()
  @Length(5, 255, { message: 'El título debe tener entre 5 y 255 caracteres.' })
  @Matches(PATRON_TITULO_PUBLICACION, { message: MENSAJE_FORMATO_TITULO })
  titulo: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  descripcion: string;

  @IsNumber()
  @IsPositive()
  precio: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  direccion: string;

  @IsNumber()
  @Min(-90)
  @Max(90)
  latitud: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  longitud: number;

  @IsInt()
  @IsPositive()
  cantidad_ambientes: number;

  @IsNumber()
  @IsPositive()
  superficie: number;

  @IsInt()
  idTipoMoneda: number;

  @IsInt()
  idModalidad: number;

  @IsInt()
  idProvincia: number;

  @IsInt()
  idCiudad: number;

  @IsInt()
  idTipoPropiedad: number;
}
