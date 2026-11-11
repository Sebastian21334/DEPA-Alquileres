import estadosIniciales from './estados-iniciales.json';

/** Códigos que usan los flujos de negocio y devuelve la API. */
export const AmbitoEstado = {
  PAGO_RESERVA: 'PAGO_RESERVA',
  LIQUIDACION_RESERVA: 'LIQUIDACION_RESERVA',
  SOLICITUD_CANCELACION: 'SOLICITUD_CANCELACION',
  REEMBOLSO: 'REEMBOLSO',
  RECLAMO: 'RECLAMO',
  VERIFICACION_ANUNCIANTE: 'VERIFICACION_ANUNCIANTE',
  DISPUTA: 'DISPUTA',
} as const;

type Valores<T> = T[keyof T];
export type CodigoAmbitoEstado = Valores<typeof AmbitoEstado>;

export const EstadoPagoReserva = {
  PENDIENTE: 'PENDIENTE',
  APROBADO: 'APROBADO',
  RECHAZADO: 'RECHAZADO',
  CANCELADO: 'CANCELADO',
  REEMBOLSADO: 'REEMBOLSADO',
  CONTRACARGO: 'CONTRACARGO',
} as const;
export type EstadoPagoReserva = Valores<typeof EstadoPagoReserva>;

export const EstadoLiquidacionReserva = {
  NO_APLICA: 'NO_APLICA',
  RETENIDO: 'RETENIDO',
  PENDIENTE_PAGO_PROPIETARIO: 'PENDIENTE_PAGO_PROPIETARIO',
  EN_REVISION: 'EN_REVISION',
  PAGADO_PROPIETARIO: 'PAGADO_PROPIETARIO',
  DEVUELTO_INQUILINO: 'DEVUELTO_INQUILINO',
  DEVUELTO_PARCIAL_INQUILINO: 'DEVUELTO_PARCIAL_INQUILINO',
} as const;
export type EstadoLiquidacionReserva = Valores<typeof EstadoLiquidacionReserva>;

export const EstadoSolicitudCancelacion = {
  PENDIENTE: 'PENDIENTE',
  APROBADA: 'APROBADA',
  RECHAZADA: 'RECHAZADA',
  VENCIDA: 'VENCIDA',
} as const;
export type EstadoSolicitudCancelacion = Valores<typeof EstadoSolicitudCancelacion>;

export const EstadoReembolso = {
  PENDIENTE: 'PENDIENTE',
  EN_PROCESO: 'EN_PROCESO',
  APROBADO: 'APROBADO',
  RECHAZADO: 'RECHAZADO',
  FALLIDO: 'FALLIDO',
  CANCELADO: 'CANCELADO',
} as const;
export type EstadoReembolso = Valores<typeof EstadoReembolso>;

export const EstadoReclamo = {
  ABIERTO: 'ABIERTO',
  EN_REVISION: 'EN_REVISION',
  RESUELTO_INQUILINO: 'RESUELTO_INQUILINO',
  RESUELTO_ANUNCIANTE: 'RESUELTO_ANUNCIANTE',
  CERRADO: 'CERRADO',
} as const;
export type EstadoReclamo = Valores<typeof EstadoReclamo>;

export const EstadoVerificacion = {
  BORRADOR: 'borrador',
  PENDIENTE: 'pendiente',
  APROBADA: 'aprobada',
  RECHAZADA: 'rechazada',
  REENVIADA: 'reenviada',
} as const;
export type EstadoVerificacion = Valores<typeof EstadoVerificacion>;

export const EstadoDisputa = {
  ABIERTA: 'ABIERTA',
  EN_REVISION: 'EN_REVISION',
  GANADA: 'GANADA',
  PERDIDA: 'PERDIDA',
  CERRADA: 'CERRADA',
} as const;

type CodigosPorAmbito = {
  [AmbitoEstado.PAGO_RESERVA]: EstadoPagoReserva;
  [AmbitoEstado.LIQUIDACION_RESERVA]: EstadoLiquidacionReserva;
  [AmbitoEstado.SOLICITUD_CANCELACION]: EstadoSolicitudCancelacion;
  [AmbitoEstado.REEMBOLSO]: EstadoReembolso;
  [AmbitoEstado.RECLAMO]: EstadoReclamo;
  [AmbitoEstado.VERIFICACION_ANUNCIANTE]: EstadoVerificacion;
  [AmbitoEstado.DISPUTA]: Valores<typeof EstadoDisputa>;
};

export const ESTADOS_INICIALES = estadosIniciales satisfies {
  [Ambito in CodigoAmbitoEstado]: {
    nombre: string;
    estados: Record<CodigosPorAmbito[Ambito], string>;
  };
};
