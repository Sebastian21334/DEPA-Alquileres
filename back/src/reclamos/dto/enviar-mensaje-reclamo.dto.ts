import { IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { VisibilidadMensajeReclamo } from '../entity/reclamo-mensaje.entity';

export class EnviarMensajeReclamoDto {
  @IsString()
  @MinLength(1)
  @MaxLength(1000)
  texto: string;

  @IsOptional()
  @IsEnum(VisibilidadMensajeReclamo)
  visible_para?: VisibilidadMensajeReclamo;
}
