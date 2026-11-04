import { IsEnum, IsInt, IsString, MaxLength, Min, MinLength } from 'class-validator';
import { CategoriaReclamo } from '../entity/reclamo.entity';

export class CrearReclamoDto {
  @IsInt()
  @Min(1)
  id_reserva: number;

  @IsEnum(CategoriaReclamo)
  categoria: CategoriaReclamo;

  @IsString()
  @MinLength(20)
  @MaxLength(1000)
  descripcion: string;
}
