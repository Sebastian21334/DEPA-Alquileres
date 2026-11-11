import { Injectable } from '@nestjs/common';
import type { IProveedorDolar, DatosDolar } from './proveedor-dolar.interface';

const MAX_BYTES_RESPUESTA = 16 * 1024;

@Injectable()
export class DolarApiAdapter implements IProveedorDolar {
  async consultar(): Promise<DatosDolar> {
    const respuesta = await fetch('https://dolarapi.com/v1/dolares/blue', {
      signal: AbortSignal.timeout(5000),
      redirect: 'error',
    });
    if (!respuesta.ok) {
      await respuesta.body?.cancel().catch(() => undefined);
      throw new Error('DolarApi no respondió correctamente');
    }
    const datos = await this.leerRespuesta(respuesta);
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

  private async leerRespuesta(respuesta: Response): Promise<unknown> {
    if (!respuesta.body) throw new Error('DolarApi devolvió una respuesta vacía');

    const lector = respuesta.body.getReader();
    const partes: Uint8Array[] = [];
    let bytes = 0;
    try {
      while (true) {
        const parte = await lector.read();
        if (parte.done) break;
        bytes += parte.value.byteLength;
        if (bytes > MAX_BYTES_RESPUESTA) {
          await lector.cancel().catch(() => undefined);
          throw new Error('DolarApi devolvió una respuesta demasiado grande');
        }
        partes.push(parte.value);
      }
    } finally {
      lector.releaseLock();
    }

    try {
      return JSON.parse(new TextDecoder().decode(Buffer.concat(partes, bytes)));
    } catch {
      throw new Error('DolarApi devolvió JSON inválido');
    }
  }
}
