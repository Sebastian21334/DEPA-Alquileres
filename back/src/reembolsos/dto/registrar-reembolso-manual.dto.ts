import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class RegistrarReembolsoManualDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  referencia: string;
}
