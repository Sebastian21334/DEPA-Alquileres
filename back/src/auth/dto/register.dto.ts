import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ContraseniaSeguraDto } from './contrasenia-segura.dto';

const FORMATO_NOMBRE = /^\p{L}[\p{L}\p{M}]*(?: +\p{L}[\p{L}\p{M}]*)*$/u;
const FORMATO_TELEFONO = /^\+?(?:[0-9]-?){0,14}[0-9]$/;

export class RegisterDto extends ContraseniaSeguraDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  @Matches(FORMATO_NOMBRE, { message: 'El nombre solo admite letras y espacios entre palabras.' })
  nombre: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  @Matches(FORMATO_NOMBRE, { message: 'El apellido solo admite letras y espacios entre palabras.' })
  apellido: string;

  @IsEmail()
  @IsNotEmpty()
  @MaxLength(150)
  email: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20, { message: 'El teléfono admite hasta 20 caracteres.' })
  @Matches(FORMATO_TELEFONO, { message: 'El teléfono admite hasta 15 dígitos, un + al inicio y guiones entre números.' })
  telefono: string;

  @IsOptional()
  @IsBoolean()
  crearCuentaNueva?: boolean;
}
