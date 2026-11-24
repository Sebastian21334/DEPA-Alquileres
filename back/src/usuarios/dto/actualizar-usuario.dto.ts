import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

// D10: el correo no se modifica por acá, porque quedaría verificado sin confirmar el nuevo.
export class ActualizarUsuarioDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  nombre?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  apellido?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  telefono?: string;
}