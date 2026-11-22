import { DatosAnuncianteBaseDto } from './datos-anunciante-base.dto';

// No incluye CBU ni titularidad: se actualizan por el flujo específico de CBU.
export class ActualizarDatosSolicitanteDto extends DatosAnuncianteBaseDto {}
