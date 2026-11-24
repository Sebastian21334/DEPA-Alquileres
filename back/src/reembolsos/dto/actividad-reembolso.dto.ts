// Respuesta de GET /reembolsos/actividad: un reembolso del inquilino y el último mensaje de administración.
export interface ActividadReembolso {
  reembolsoId: number;
  reservaId: number;
  pendiente: boolean;
  mensajeId: number | null;
  texto: string | null;
  fecha: Date | null;
}
