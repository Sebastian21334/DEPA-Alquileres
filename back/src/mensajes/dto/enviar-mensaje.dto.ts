import { IsInt, IsString, MaxLength, MinLength } from 'class-validator';

export class EnviarMensajeDto {
  @IsInt()
  id_destino_usuario: number;

  @IsInt()
  id_publicacion: number;

  @IsString()
  @MinLength(1)
  @MaxLength(250)
  texto: string;
}