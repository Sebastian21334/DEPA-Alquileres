import { Modalidad } from '../entity/modalidad.entity';

export class ModalidadRespuestaDto extends Modalidad {
  admite_reservas_por_fecha: boolean;
}
