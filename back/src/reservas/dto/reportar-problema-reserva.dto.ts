import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class ReportarProblemaReservaDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(500)
  motivo: string;
}
