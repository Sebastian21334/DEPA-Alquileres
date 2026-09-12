// Refleja únicamente los campos públicos de la entidad Usuario (nunca se expone
// contrasenia, token_verificacion ni token_recuperacion desde el backend).

export interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  email?: string;
  telefono?: string;
  foto_url?: string | null;
}
