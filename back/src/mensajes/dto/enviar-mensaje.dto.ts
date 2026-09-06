import { IsInt, IsString, MaxLength, MinLength } from 'class-validator';

export class EnviarMensajeDto {
  // El service comprueba que el destino sea el anunciante de la publicación.
  @IsInt()
  id_destino_usuario: number;

  @IsInt()
  id_publicacion: number;

  @IsString()
  // El límite coincide con la longitud máxima de la columna mensaje.texto.
  @MinLength(1)
  @MaxLength(250)
  texto: string;
}