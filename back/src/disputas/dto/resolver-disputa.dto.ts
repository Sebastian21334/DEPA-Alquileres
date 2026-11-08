import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class ResolverDisputaDto {
  @IsIn(['GANADA', 'PERDIDA'])
  resultado: 'GANADA' | 'PERDIDA';

  @IsOptional()
  @IsString()
  @MaxLength(150)
  referencia?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  observacion?: string;
}
