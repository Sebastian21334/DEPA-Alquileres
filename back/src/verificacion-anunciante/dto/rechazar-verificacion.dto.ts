import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { RevisarVerificacionDto } from './revisar-verificacion.dto';

export class RechazarVerificacionDto extends RevisarVerificacionDto {
  // El administrador debe justificar el rechazo para que el anunciante pueda corregirlo.
  @IsString()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(500)
  motivo: string;
}
