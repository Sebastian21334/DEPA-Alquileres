import { IsString, IsNotEmpty } from 'class-validator';

export class CambiarRolDto {
  @IsString()
  @IsNotEmpty()
  nombreRol: string;
}