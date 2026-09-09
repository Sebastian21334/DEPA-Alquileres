import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class RechazarVerificacionDto {
  // El administrador debe justificar el rechazo para que el anunciante pueda corregirlo.
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(500)
  motivo: string;
}