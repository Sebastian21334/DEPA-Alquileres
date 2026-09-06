export interface ArchivoSubido {
  // Es la forma mínima que necesita ImagenesService después de Multer.
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
}