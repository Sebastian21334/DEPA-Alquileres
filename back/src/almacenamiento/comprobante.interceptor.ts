import { FileInterceptor } from '@nestjs/platform-express';
import { MAX_BYTES_COMPROBANTE } from './service/almacenamiento.service';

/**
 * Configuración de subida compartida por los flujos que reciben un comprobante
 * (un solo archivo en el campo `comprobante`). El servicio vuelve a validar tipo y tamaño.
 */
export const ComprobanteInterceptor = () =>
  FileInterceptor('comprobante', { limits: { fileSize: MAX_BYTES_COMPROBANTE, files: 1 } });
