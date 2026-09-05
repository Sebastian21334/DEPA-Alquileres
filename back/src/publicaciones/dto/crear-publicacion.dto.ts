import { IsString, IsNotEmpty, IsNumber, IsPositive, IsInt, MaxLength } from 'class-validator';

export class CrearPublicacionDto {
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