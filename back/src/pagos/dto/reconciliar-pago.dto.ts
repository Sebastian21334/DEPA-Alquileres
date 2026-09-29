import { IsNumberString } from 'class-validator';

export class ReconciliarPagoDto {
  @IsNumberString()
  payment_id: string;
}
