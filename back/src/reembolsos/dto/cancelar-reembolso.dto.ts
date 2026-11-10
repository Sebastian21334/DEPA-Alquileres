import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CancelarReembolsoDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  motivo: string;
}
