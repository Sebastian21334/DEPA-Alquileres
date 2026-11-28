import { Transform, Type } from 'class-transformer';
import { IsInt, IsString, Length, Max, Min } from 'class-validator';

export class IdUbicacionDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(2_147_483_647)
  id: number;
}

export class ModificarUbicacionDto {
  @Transform(({ value }: { value: unknown }) => typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : value)
  @IsString()
  @Length(1, 100)
  nombre: string;
}

export class CrearCiudadDto extends ModificarUbicacionDto {
  @IsInt()
  @Min(1)
  @Max(2_147_483_647)
  idProvincia: number;
}
