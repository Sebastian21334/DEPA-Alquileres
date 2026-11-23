-- Conserva los expedientes existentes y vincula los reclamos por faltante a su cancelación.
ALTER TABLE public.reclamo_reserva
  ADD COLUMN IF NOT EXISTS id_solicitud_cancelacion integer
  CONSTRAINT fk_reclamo_solicitud_cancelacion
  REFERENCES public.solicitud_cancelacion(id_solicitud_cancelacion) ON DELETE RESTRICT;

CREATE UNIQUE INDEX IF NOT EXISTS uq_reclamo_faltante_abierto
  ON public.reclamo_reserva (id_reserva)
  WHERE id_solicitud_cancelacion IS NOT NULL AND estado IN ('ABIERTO', 'EN_REVISION');
