import { Transform } from 'class-transformer';
import { IsInt, IsNumber, IsOptional, Max, Min } from 'class-validator';
import { FiltrosPublicacionesDto } from './listar-publicaciones.dto';

const numeroQuery = ({ value }: { value: unknown }) =>
  typeof value === 'string' && value.trim() !== '' ? Number(value) : value;

export class ListarPublicacionesMapaDto extends FiltrosPublicacionesDto {
  @IsOptional()
  @Transform(numeroQuery)
  @IsInt()
  @Min(1)
  @Max(2147483647)
  antesDe?: number;

  @IsOptional()
  @Transform(numeroQuery)
  @IsNumber()
  @Min(-90)
  @Max(90)
  sur?: number;

  @IsOptional()
  @Transform(numeroQuery)
  @IsNumber()
  @Min(-90)
  @Max(90)
  norte?: number;

  @IsOptional()
  @Transform(numeroQuery)
  @IsNumber()
  @Min(-180)
  @Max(180)
  oeste?: number;

  @IsOptional()
  @Transform(numeroQuery)
  @IsNumber()
  @Min(-180)
  @Max(180)
  este?: number;
}
