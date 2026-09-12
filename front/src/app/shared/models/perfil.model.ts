import { Anunciante } from './anunciante.model';

// Respuesta de GET /usuarios/me (usuarioSinSecretos en back/src/usuarios/service/usuarios.service.ts).
export interface PerfilUsuario {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  bloqueado: boolean;
  email_verificado: boolean;
  foto_url: string | null;
  rol: { id: number; nombre: string } | null;
}

/**
 * Nombre visible del rol. En la base el rol por defecto se llama "Usuario"
 * (lo asigna UsuariosService.crear), pero en la interfaz se muestra como "Inquilino".
 */
export function etiquetaRol(nombreRol?: string | null): string {
  return !nombreRol || nombreRol === 'Usuario' ? 'Inquilino' : nombreRol;
}

// Campos editables desde Mi perfil (subconjunto de ActualizarUsuarioDto del backend).
export interface ActualizarPerfilDto {
  nombre: string;
  apellido: string;
  telefono: string;
}

export type EstadoVerificacion = 'pendiente' | 'aprobada' | 'rechazada' | 'reenviada';

export interface RevisionVerificacion {
  id: number;
  numero_revision: number;
  estado: EstadoVerificacion;
  motivo: string | null;
  creada_en: string;
}

// Respuesta de GET /anunciantes/mi-solicitud (solicitud vigente + historial).
export interface SolicitudVerificacion {
  id: number;
  estado: EstadoVerificacion;
  dni_frente_url: string | null;
  dni_dorso_url: string | null;
  rostro_url: string | null;
  motivo_rechazo: string | null;
  numero_revision: number;
  creada_en: string;
  actualizada_en: string;
  anunciante: Anunciante;
  revisiones: RevisionVerificacion[];
}
