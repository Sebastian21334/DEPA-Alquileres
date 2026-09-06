import { IsString, IsNotEmpty, MaxLength, IsInt } from 'class-validator';

export class CrearCiudadDto {
  // La ciudad se crea dentro de una provincia existente.
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombre: string;

  @IsInt()
  idProvincia: number;
}