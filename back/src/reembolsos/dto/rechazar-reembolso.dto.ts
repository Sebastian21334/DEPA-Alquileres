import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class RechazarReembolsoDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  motivo: string;
}
