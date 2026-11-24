import { Equals, IsNotEmpty, IsNumber, IsString, MaxLength, Min, MinLength } from 'class-validator';

export class SolicitarCancelacionDto {
  @Equals(true, { message: 'Tenés que aceptar los términos y condiciones de cancelación' })
  aceptaTerminos: true;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  importeAceptado: number;

  @IsString()
  @MinLength(3)
  @MaxLength(3)
  monedaAceptada: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(500)
  motivo: string;
}
