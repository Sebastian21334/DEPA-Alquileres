import { IsOptional, IsString, MaxLength } from 'class-validator';

/**
 * Campos de texto del formulario multipart con que el admin registra una transferencia manual:
 * la devolución al inquilino (T44) o el pago al anunciante (T56). El comprobante llega como archivo.
 */
export class RegistrarTransferenciaDto {
  @IsOptional()
  @IsString()
  @MaxLength(150)
  referencia?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  observacion?: string;
}
