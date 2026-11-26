import { IsOptional, IsString, MaxLength } from 'class-validator';

/** Llega como JSON o como multipart con imágenes; sin imágenes, el texto es obligatorio (lo valida el servicio). */
export class EnviarMensajeReclamoDto {
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  texto?: string;
}
