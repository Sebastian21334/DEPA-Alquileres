import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CambiarBloqueoDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  motivo?: string;
}
