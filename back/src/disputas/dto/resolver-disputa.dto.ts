import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { EstadoDisputa } from '../../catalogos/estados';

const RESULTADOS_DISPUTA = [EstadoDisputa.GANADA, EstadoDisputa.PERDIDA] as const;

export class ResolverDisputaDto {
  @IsIn(RESULTADOS_DISPUTA)
  resultado: (typeof RESULTADOS_DISPUTA)[number];

  @IsOptional()
  @IsString()
  @MaxLength(150)
  referencia?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  observacion?: string;
}
