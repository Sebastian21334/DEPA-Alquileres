import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CrearProvinciaDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombre: string;
}