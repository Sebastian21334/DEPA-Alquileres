import { IsString, Matches, MaxLength } from 'class-validator';

export class MensajeReembolsoDto {
  @IsString()
  @Matches(/\S/)
  @MaxLength(1000)
  texto: string;
}
