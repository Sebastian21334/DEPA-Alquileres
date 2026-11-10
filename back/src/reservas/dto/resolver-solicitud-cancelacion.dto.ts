import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class ResolverSolicitudCancelacionDto {
  @IsIn(['APROBADA', 'RECHAZADA'])
  decision: 'APROBADA' | 'RECHAZADA';

  @IsOptional()
  @IsString()
  @MaxLength(500)
  observacion?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  referencia?: string;
}
