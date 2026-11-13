import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

const DECISIONES_CANCELACION = [
  'APROBADA',
  'RECHAZADA',
] as const;

export class ResolverSolicitudCancelacionDto {
  @IsIn(DECISIONES_CANCELACION)
  decision: (typeof DECISIONES_CANCELACION)[number];

  @IsOptional()
  @IsString()
  @MaxLength(500)
  observacion?: string;
}
