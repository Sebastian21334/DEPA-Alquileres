import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import type {
  CategoriaInicio,
  OrdenPublicaciones,
} from '../repository/publicaciones.repository.interface';

const lista = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.split(',').filter(Boolean) : value;
const ids = (entrada: { value: unknown }): unknown => {
  const valores = lista(entrada);
  return Array.isArray(valores) ? valores.map(Number) : valores;
};

export class ListarPublicacionesDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pagina = 1;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  limite = 12;

  @IsOptional()
  @IsIn(['recientes', 'temporales', 'largo-plazo', 'villa-maria', 'reservadas'])
  categoria?: CategoriaInicio;

  @IsOptional()
  @IsIn(['recientes', 'antiguas', 'precio-menor', 'precio-mayor', 'titulo'])
  orden?: OrdenPublicaciones;

  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  idProvincia?: number;

  @IsOptional()
  @Transform(ids)
  @IsArray()
  @IsInt({ each: true })
  @Min(1, { each: true })
  idsCiudad?: number[];

  @IsOptional()
  @Transform(ids)
  @IsArray()
  @IsInt({ each: true })
  @Min(1, { each: true })
  idsTipoPropiedad?: number[];

  @IsOptional()
  @Transform(ids)
  @IsArray()
  @IsInt({ each: true })
  @Min(1, { each: true })
  idsTipoMoneda?: number[];

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  precioMin?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  precioMax?: number;

  @IsOptional()
  @Transform(lista)
  @IsArray()
  @IsIn(['1', '2', '3', '4+'], { each: true })
  ambientes?: string[];
}
