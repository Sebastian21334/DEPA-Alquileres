-- Comprobante de la transferencia de un reembolso.
-- Observación opcional del admin al registrar esa transferencia.
-- Agrega las columnas sin tocar los reembolsos existentes, que quedan sin comprobante ni observación.
-- Se puede repetir: si ya existen las columnas del comprobante, solo agrega la de la observación.
ALTER TABLE public.reembolso
  ADD COLUMN IF NOT EXISTS comprobante_url varchar(1000),
  ADD COLUMN IF NOT EXISTS comprobante_nombre varchar(255),
  ADD COLUMN IF NOT EXISTS observacion_transferencia varchar(500);
