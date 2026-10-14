import { IsBoolean, IsOptional } from 'class-validator';
import { CatalogoDto } from './catalogo.dto';

export class ModalidadDto extends CatalogoDto {
  @IsOptional()
  @IsBoolean()
  permite_reservas_por_fecha?: boolean;
}
