import { IsString, IsNotEmpty } from 'class-validator';

export class CambiarRolDto {
  // El service vuelve a resolver el nombre para asegurar que el rol exista.
  @IsString()
  @IsNotEmpty()
  nombreRol: string;
}