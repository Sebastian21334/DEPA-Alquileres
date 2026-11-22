import { IsIn } from 'class-validator';
import { ListarAdministracionDto } from '../../common/dto/listar-administracion.dto';

export const ESTADOS_PUBLICACION_ADMINISTRACION = [
  'todas',
  'activas',
  'inactivas',
  'bajas',
] as const;

export type EstadoPublicacionAdministracion =
  (typeof ESTADOS_PUBLICACION_ADMINISTRACION)[number];

export class ListarPublicacionesAdministracionDto extends ListarAdministracionDto {
  @IsIn(ESTADOS_PUBLICACION_ADMINISTRACION, {
    message: `El estado debe ser uno de: ${ESTADOS_PUBLICACION_ADMINISTRACION.join(', ')}`,
  })
  estado: EstadoPublicacionAdministracion = 'todas';
}
