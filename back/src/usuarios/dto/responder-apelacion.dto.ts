import { Transform } from 'class-transformer';
import { IsString, IsUUID, Length } from 'class-validator';

export class ResponderApelacionDto {
  @IsUUID('4')
  bloqueoId!: string;

  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsString()
  @Length(1, 2000)
  texto!: string;
}
