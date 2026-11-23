import { IsString, MaxLength, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';
import type { SaldoDevolucionCancelacionDto } from '../../cancelaciones/dto/condiciones-cancelacion.dto';
import type { ReclamoRespuesta } from './reclamo-respuesta.dto';

export class ReclamarFaltanteCancelacionDto {
  @Transform(({ value }: { value: unknown }) => typeof value === 'string' ? value.trim() : value)
  @IsString()
  @MinLength(20)
  @MaxLength(1000)
  descripcion: string;
}

export interface FaltanteCancelacionDto {
  devolucion: SaldoDevolucionCancelacionDto | null;
  reclamoAbierto: boolean;
}

export interface ReclamoRespuestaDto extends ReclamoRespuesta {
  devolucion_cancelacion?: SaldoDevolucionCancelacionDto | null;
}
