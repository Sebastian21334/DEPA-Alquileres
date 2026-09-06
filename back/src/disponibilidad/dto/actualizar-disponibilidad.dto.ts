import { IsBoolean } from 'class-validator';

export class ActualizarDisponibilidadDto {
  // Cambia únicamente el estado del día; la identidad llega en la URL.
  @IsBoolean()
  disponible: boolean;
}