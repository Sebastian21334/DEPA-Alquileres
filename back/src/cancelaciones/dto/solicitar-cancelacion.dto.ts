import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class SolicitarCancelacionDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(500)
  motivo: string;
}
