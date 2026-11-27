import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsIn, IsInt, IsOptional, IsString, Length, Max, MaxLength, Min, ValidateIf } from 'class-validator';
import { CLAVES_CATALOGO, type ClaveCatalogo } from '../codigos-catalogo';

export class CatalogoParametroDto {
  @IsIn(CLAVES_CATALOGO)
  catalogo: ClaveCatalogo;
}

export class ItemCatalogoParametroDto extends CatalogoParametroDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(2_147_483_647)
  id: number;
}

export class GuardarCatalogoDto {
  @Transform(({ value }: { value: unknown }) => typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : value)
  @IsString()
  @Length(1, 100)
  nombre: string;

  @IsOptional()
  @Transform(({ value }: { value: unknown }) => typeof value === 'string' ? value.trim() : value)
  @IsString()
  @MaxLength(250)
  descripcion?: string | null;

  @ValidateIf((_obj, value: unknown) => value !== undefined)
  @IsBoolean()
  permite_reservas_por_fecha?: boolean;
}
