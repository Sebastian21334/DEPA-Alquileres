import { IsByteLength, IsString, Matches } from 'class-validator';

export class ConfirmarReactivacionDto {
  @IsString()
  @Matches(/^[a-f0-9]{64}$/)
  token: string;

  @IsString()
  @IsByteLength(1, 72)
  contrasenia: string;
}
