import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';
import { ContraseniaSegura } from '../validators/contrasenia-segura.decorator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombre: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  apellido: string;

  @IsEmail()
  @IsNotEmpty()
  @MaxLength(150)
  email: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  telefono: string;

  @IsString()
  @ContraseniaSegura()
  contrasenia: string;
}
