import { IsString, IsNotEmpty, IsNumber, IsPositive, IsInt, Max, MaxLength, Min } from 'class-validator';

export class CrearPublicacionDto {
  // Los IDs siguientes representan relaciones con catálogos y ubicación.
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  titulo: string;

  @IsString()
  @IsNotEmpty()
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
