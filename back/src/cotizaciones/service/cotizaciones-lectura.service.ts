import { Inject, Injectable } from '@nestjs/common';
import { COTIZACION_REPOSITORY, type ICotizacionRepository } from '../repository/cotizacion.repository.interface';

// Lee la última cotización guardada sin consultar la fuente: sirve para comparar importes, no para cobrar.
@Injectable()
export class CotizacionesLecturaService {
  constructor(@Inject(COTIZACION_REPOSITORY) private readonly repo: ICotizacionRepository) {}

  /** Venta del dólar blue registrada más reciente, o null si todavía no hay una válida. */
  async ventaRegistrada(): Promise<number | null> {
    const venta = Number((await this.repo.ultima())?.venta);
    return Number.isFinite(venta) && venta > 0 ? venta : null;
  }
}
