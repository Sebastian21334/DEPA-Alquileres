import { IsString, IsNotEmpty, MaxLength, IsInt } from 'class-validator';

export class CrearCiudadDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombre: string;

  @IsInt()
  idProvincia: number;
}