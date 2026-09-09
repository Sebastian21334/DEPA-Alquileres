// Refleja la entidad Imagen. La URL apunta a Azure Blob Storage; el backend
// solo persiste la referencia, no el binario.
export interface Imagen {
  id: number;
  url: string;
}
