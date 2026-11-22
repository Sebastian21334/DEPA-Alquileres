import { IsNumber, Max, Min } from 'class-validator';

export class ComisionDto {
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  porcentaje: number;
}
