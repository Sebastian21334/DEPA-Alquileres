import { Transform } from 'class-transformer';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { ListarResenasDto } from './listar-resenas.dto';

export const ESTADOS_RESENAS_ADMINISTRACION = {
  VISIBLES: 'visibles',
  OCULTAS: 'ocultas',
  DENUNCIADAS: 'denunciadas',
  TODAS: 'todas',
} as const;

export type EstadoResenasAdministracion =
  (typeof ESTADOS_RESENAS_ADMINISTRACION)[keyof typeof ESTADOS_RESENAS_ADMINISTRACION];

export class ListarResenasAdministracionDto extends ListarResenasDto {
  @IsIn(Object.values(ESTADOS_RESENAS_ADMINISTRACION))
  @IsOptional()
  estado: EstadoResenasAdministracion = ESTADOS_RESENAS_ADMINISTRACION.TODAS;

  // La sección administrativa busca por ID exacto de reseña.
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @MaxLength(20)
  @IsOptional()
  q?: string;
}
