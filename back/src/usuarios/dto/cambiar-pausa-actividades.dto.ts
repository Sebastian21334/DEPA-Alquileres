import { IsBoolean } from 'class-validator';

export class CambiarPausaActividadesDto {
  @IsBoolean()
  actividades_pausadas: boolean;
}
