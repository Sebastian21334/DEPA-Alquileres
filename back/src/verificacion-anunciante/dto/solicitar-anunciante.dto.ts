import {
  IsNotEmpty,
  IsString,
  MaxLength,
  IsNumber,
  IsOptional,
  Matches,
} from 'class-validator';

export class SolicitarAnuncianteDto {
  // El CUIT/CUIL y el contacto identifican la solicitud que revisará un administrador.
  @IsString()
  @IsNotEmpty()
  @MaxLength(15)
  @Matches(/^\d{2}-?\d{8}-?\d$/)
  cuit: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  numero_contacto: string;

  @IsNumber()
  // El service resuelve este ID contra el catálogo antes de guardar.
  idTipoAnunciante: number;
  @IsOptional()
  @IsString()
  @MaxLength(150)
  razon_social?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  matricula_profesional?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  colegio_profesional?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  domicilio_comercial?: string;

  @IsOptional()
  @IsString()
  @MaxLength(15)
  dni_corredor?: string;
}
