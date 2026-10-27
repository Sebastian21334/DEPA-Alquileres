import { Injectable } from '@nestjs/common';
import type { IProveedorDolar, DatosDolar } from './proveedor-dolar.interface';

@Injectable()
export class DolarApiAdapter implements IProveedorDolar {
  async consultar(): Promise<DatosDolar> {
    const respuesta = await fetch('https://dolarapi.com/v1/dolares/blue', {
      signal: AbortSignal.timeout(5000),
      redirect: 'error',
    });
    if (!respuesta.ok) throw new Error('DolarApi no respondió correctamente');
    const datos: unknown = await respuesta.json();
    if (
      !datos ||
      typeof datos !== 'object' ||
      !('compra' in datos) ||
      !('venta' in datos) ||
      !('fechaActualizacion' in datos) ||
      !('casa' in datos) ||
      datos.casa !== 'blue' ||
      !('moneda' in datos) ||
      datos.moneda !== 'USD' ||
      typeof datos.compra !== 'number' ||
      typeof datos.venta !== 'number' ||
      typeof datos.fechaActualizacion !== 'string'
    )
      throw new Error('DolarApi devolvió datos incompletos');
    return {
      compra: datos.compra,
      venta: datos.venta,
      actualizadaEn: new Date(datos.fechaActualizacion),
    };
  }
}
