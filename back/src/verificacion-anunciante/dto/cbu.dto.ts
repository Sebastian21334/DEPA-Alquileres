import { Equals, IsString, Matches } from 'class-validator';

export class CbuDto {
  @IsString()
  @Matches(/^\d{22}$/, { message: 'El CBU debe contener 22 dígitos' })
  cbu: string;

  @Equals(true, { message: 'Confirmá que la cuenta bancaria está a tu nombre' })
  titularidad_declarada: boolean;
}
