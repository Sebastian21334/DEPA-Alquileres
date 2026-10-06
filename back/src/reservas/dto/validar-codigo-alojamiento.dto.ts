import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class ValidarCodigoAlojamientoDto {
  @IsString()
  @IsNotEmpty()
  @Length(8, 8)
  @Matches(/^[A-Z0-9]+$/i, { message: 'El código debe contener ocho letras o números' })
  codigo: string;
}
