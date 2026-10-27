import type { CotizacionDolar } from '../entity/cotizacion-dolar.entity';
import type { ConsultaCotizacion } from '../entity/consulta-cotizacion.entity';

export const COTIZACION_REPOSITORY = 'COTIZACION_REPOSITORY';
export interface ICotizacionRepository {
  ultima(): Promise<CotizacionDolar | null>;
  ultimaConsulta(): Promise<ConsultaCotizacion | null>;
  guardar(datos: Partial<CotizacionDolar>): Promise<CotizacionDolar>;
  registrarConsulta(exitosa: boolean, error: string | null): Promise<void>;
  historial(
    desde: Date | undefined,
    hasta: Date | undefined,
    pagina: number,
  ): Promise<{ items: CotizacionDolar[]; total: number }>;
  consultas(): Promise<ConsultaCotizacion[]>;
  conBloqueo<T>(
    operacion: (repo: ICotizacionRepository) => Promise<T>,
  ): Promise<T>;
}
