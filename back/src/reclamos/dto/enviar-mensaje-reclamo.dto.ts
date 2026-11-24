import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { VisibilidadMensajeReclamo } from '../entity/reclamo-mensaje.entity';

/** Llega como JSON o como multipart con imágenes; sin imágenes, el texto es obligatorio (lo valida el servicio). */
export class EnviarMensajeReclamoDto {
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  texto?: string;

  @IsOptional()
  @IsEnum(VisibilidadMensajeReclamo)
  visible_para?: VisibilidadMensajeReclamo;
}
