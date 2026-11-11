export const ARCHIVO_REPOSITORY = 'ARCHIVO_REPOSITORY';
export type ContenedorArchivos = 'imagenes' | 'verificaciones' | 'reclamos';

export interface IArchivoRepository {
  subir(contenedor: ContenedorArchivos, nombre: string, contenido: Buffer, tipo: string): Promise<string>;
  eliminarImagenPropia(url: string): Promise<void>;
  firmarArchivo(contenedor: ContenedorArchivos, url: string): Promise<string>;
  eliminarDocumentoPropio(url: string): Promise<void>;
}
