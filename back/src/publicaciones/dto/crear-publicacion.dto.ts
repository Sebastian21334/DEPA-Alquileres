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
  /^(?=\S)(?=.*[\p{L}\p{Nd}])(?!.*[\uFE0F\u20E3])[\p{L}\p{M}\p{Nd} ,:.]+(?<! )$/u;
export const MENSAJE_FORMATO_TITULO =
  'El título debe incluir letras o números y solo admite espacios, comas, dos puntos y puntos.';
export const LARGO_MINIMO_TITULO = 15;
export const LARGO_MAXIMO_TITULO = 255;
export const MENSAJE_LARGO_TITULO = `El título debe tener entre ${LARGO_MINIMO_TITULO} y ${LARGO_MAXIMO_TITULO} caracteres.`;

export class CrearPublicacionDto {
  @IsString()
  @Length(LARGO_MINIMO_TITULO, LARGO_MAXIMO_TITULO, { message: MENSAJE_LARGO_TITULO })
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
