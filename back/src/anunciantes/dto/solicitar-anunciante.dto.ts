import { IsNotEmpty, IsString, MaxLength, IsNumber } from 'class-validator';

export class SolicitarAnuncianteDto {
  // El CUIT/CUIL y el contacto identifican la solicitud que revisará un administrador.
  @IsString()
  @IsNotEmpty()
  @MaxLength(15)
  cuit: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  numero_contacto: string;

  @IsNumber()
  // El service resuelve este ID contra el catálogo antes de guardar.
  idTipoAnunciante: number; 
}
