import { IsBoolean, IsInt, IsOptional, Min } from 'class-validator';

export class RevisarVerificacionDto {
  @IsInt()
  @Min(1)
  numero_revision: number;

  @IsOptional()
  @IsBoolean()
  revisar_cbu?: boolean;

  @IsOptional()
  @IsBoolean()
  titular_cbu_confirmado?: boolean;
}
