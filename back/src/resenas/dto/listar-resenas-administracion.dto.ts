import { Transform } from 'class-transformer';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import {
  ESTADOS_RESENAS_ADMINISTRACION,
  type EstadoResenasAdministracion,
} from '../resenas.constants';
import { ListarResenasDto } from './listar-resenas.dto';

export class ListarResenasAdministracionDto extends ListarResenasDto {
  @IsIn(ESTADOS_RESENAS_ADMINISTRACION)
  @IsOptional()
  estado: EstadoResenasAdministracion = 'todas';

  // La sección administrativa busca por ID exacto de reseña.
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @MaxLength(20)
  @IsOptional()
  q?: string;
}
