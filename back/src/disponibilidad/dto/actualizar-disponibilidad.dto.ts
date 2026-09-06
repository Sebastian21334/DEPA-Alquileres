import { IsBoolean } from 'class-validator';

export class ActualizarDisponibilidadDto {
  @IsBoolean()
  disponible: boolean;
}