import { TipoAnunciante } from './catalogo.model';
import { Usuario } from './usuario.model';

// Refleja la entidad Anunciante (extensión 1 a 1 de Usuario). `verificado` es el
// campo que RN-10/RN-21 usan indirectamente: solo anunciantes verificados publican,
// y la tarjeta de listado usa este flag para mostrar el indicador "Dueño verificado".
export interface Anunciante {
  idUsuario: number;
  verificado: boolean;
  cuit_cuil: string | null;
  numero_contacto: string;
  tipoAnunciante?: TipoAnunciante;
  usuario?: Usuario;
}
