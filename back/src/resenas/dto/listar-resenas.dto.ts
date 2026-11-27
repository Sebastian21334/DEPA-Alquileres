import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class ListarResenasDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  pagina = 1;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20)
  @IsOptional()
  limite = 6;
}
