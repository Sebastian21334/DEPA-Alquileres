import { Transform } from 'class-transformer';
import { IsString, Length } from 'class-validator';

export class ConsultarBloqueoDto {
  @IsString()
  @Length(1, 2048)
  token!: string;
}

export class ApelacionBloqueoDto extends ConsultarBloqueoDto {
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsString()
  @Length(1, 2000)
  texto!: string;
}
