import { IsOptional, IsString, MaxLength } from 'class-validator';
import { CatalogoDto } from './catalogo.dto';

export class RolDto extends CatalogoDto {
  @IsOptional()
  @IsString()
  @MaxLength(250)
  declare descripcion?: string;
}
