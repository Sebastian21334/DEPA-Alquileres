import { IsOptional, IsString, MaxLength } from 'class-validator';

export class RegistrarReembolsoManualDto {
  @IsOptional()
  @IsString()
  @MaxLength(150)
  referencia?: string;
}
