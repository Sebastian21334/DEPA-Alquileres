import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

// Base de la corrección de datos. El alta conserva CbuDto para no interferir con T14.
export class DatosAnuncianteBaseDto {
  @IsNumber()
  idTipoAnunciante: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(15)
  @Matches(/^\d{2}-?\d{8}-?\d$/)
  cuit: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  numero_contacto: string;

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
