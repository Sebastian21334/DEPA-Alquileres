export const ActorCancelacion = {
  INQUILINO: 'INQUILINO',
  ANUNCIANTE: 'ANUNCIANTE',
  ADMINISTRADOR: 'ADMINISTRADOR',
  SISTEMA: 'SISTEMA',
} as const;

export type ActorCancelacion = (typeof ActorCancelacion)[keyof typeof ActorCancelacion];
