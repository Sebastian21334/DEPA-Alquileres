import { IsJWT, IsString, MaxLength } from 'class-validator';

export class ConfirmarBajaDto {
  @IsString()
  @MaxLength(1024)
  @IsJWT()
  token: string;
}
