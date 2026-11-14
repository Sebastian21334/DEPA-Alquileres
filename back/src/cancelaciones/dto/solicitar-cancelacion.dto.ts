import { Equals, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class SolicitarCancelacionDto {
  @Equals(true, { message: 'Tenés que aceptar los términos y condiciones de cancelación' })
  aceptaTerminos: true;

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(500)
  motivo: string;
}
