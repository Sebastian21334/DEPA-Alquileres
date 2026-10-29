import { IsInt, Min } from 'class-validator';

export class RevisarVerificacionDto {
  @IsInt()
  @Min(1)
  numero_revision: number;
}
