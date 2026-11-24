import { FileInterceptor } from '@nestjs/platform-express';
import { MAX_BYTES_COMPROBANTE } from './service/almacenamiento.service';

/**
 * El navegador manda el nombre del archivo en UTF-8 y multer lo lee como latin1 si no se le indica:
 * una «—» quedaba guardada como «â€”». Lo usan las subidas que guardan el nombre original.
 */
export const NOMBRE_ARCHIVO_UTF8 = { defParamCharset: 'utf8' } as const;

/**
 * Configuración de subida compartida por los flujos que reciben un comprobante
 * (un solo archivo en el campo `comprobante`). El servicio vuelve a validar tipo y tamaño.
 */
export const ComprobanteInterceptor = () =>
  FileInterceptor('comprobante', { ...NOMBRE_ARCHIVO_UTF8, limits: { fileSize: MAX_BYTES_COMPROBANTE, files: 1 } });
