// Refleja únicamente los campos públicos de la entidad Usuario (nunca se expone
// contrasenia, token_verificacion ni token_recuperacion desde el backend).

export interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  /** null cuando la cuenta se dio de baja; el original queda en email_historico (RN-37). */
  email?: string | null;
  email_historico?: string | null;
  telefono?: string;
  foto_url?: string | null;
}
