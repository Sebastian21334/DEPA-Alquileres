import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class BuscarDireccionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  direccion: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  ciudad: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  provincia: string;
}
