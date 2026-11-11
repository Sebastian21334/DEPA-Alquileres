import type { SolicitudVerificacion } from '../entity/solicitud-verificacion.entity';

export const CAMPOS_PRUEBA_PRIVADOS = [
  'prueba_vida_desafio',
  'prueba_vida_revision',
  'prueba_vida_rostro_hash',
  'prueba_vida_vence_en',
  'prueba_vida_consumida_en',
] as const;

export type SolicitudVerificacionRespuestaDto = Omit<
  SolicitudVerificacion,
  (typeof CAMPOS_PRUEBA_PRIVADOS)[number]
>;
