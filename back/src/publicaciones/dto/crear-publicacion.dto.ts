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

// Topes alineados con las columnas: numeric(10,2) para precio/superficie e integer para ambientes.
export const PRECIO_MAXIMO = 99_999_999.99;
export const SUPERFICIE_MAXIMA = 10_000;
export const AMBIENTES_MAXIMOS = 50;
export const MENSAJE_PRECIO_RANGO =
  'El precio debe ser un número entre 1 y 99.999.999,99.';
export const MENSAJE_SUPERFICIE_RANGO =
  'La superficie debe ser un número entre 1 y 10.000 m².';
export const MENSAJE_AMBIENTES_RANGO =
  'La cantidad de ambientes debe ser un entero entre 1 y 50.';

export class CrearPublicacionDto {
  @IsString()
  @Length(LARGO_MINIMO_TITULO, LARGO_MAXIMO_TITULO, { message: MENSAJE_LARGO_TITULO })
  @Matches(PATRON_TITULO_PUBLICACION, { message: MENSAJE_FORMATO_TITULO })
  titulo: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  descripcion: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Max(PRECIO_MAXIMO, { message: MENSAJE_PRECIO_RANGO })
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
  @Max(AMBIENTES_MAXIMOS, { message: MENSAJE_AMBIENTES_RANGO })
  cantidad_ambientes: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Max(SUPERFICIE_MAXIMA, { message: MENSAJE_SUPERFICIE_RANGO })
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
