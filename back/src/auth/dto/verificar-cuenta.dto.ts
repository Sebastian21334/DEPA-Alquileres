import { IsNotEmpty, IsString } from 'class-validator';

export class VerificarCuentaDto {
  @IsString()
  @IsNotEmpty()
  token: string;
}
