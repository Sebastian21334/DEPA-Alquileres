import { Transform } from 'class-transformer';
import { IsOptional, IsString, Length, MaxLength } from 'class-validator';

export class BloquearUsuarioDto {
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsString()
  @Length(1, 500)
  motivo!: string;
}

export class CambiarBloqueoDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  motivo?: string;
}
