import { IsEmail, MaxLength } from 'class-validator';

export class RecuperarContraseniaDto {
  @IsEmail()
  @MaxLength(150)
  email: string;
}
