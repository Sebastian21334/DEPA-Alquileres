export const ARCHIVO_REPOSITORY = 'ARCHIVO_REPOSITORY';
export type ContenedorArchivos = 'imagenes' | 'verificaciones';

export interface IArchivoRepository {
  subir(
    contenedor: ContenedorArchivos,
    nombre: string,
    contenido: Buffer,
    tipo: string,
  ): Promise<string>;
  eliminarImagenPropia(url: string): Promise<void>;
  firmarDocumento(url: string): Promise<string>;
}
