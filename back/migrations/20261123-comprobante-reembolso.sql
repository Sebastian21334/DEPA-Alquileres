-- T44: comprobante de la transferencia de un reembolso.
-- T56: observación opcional del admin al registrar esa transferencia.
-- Agrega las columnas sin tocar los reembolsos existentes, que quedan sin comprobante ni observación.
-- Se puede repetir: si ya se aplicó la versión de T44, solo agrega la columna nueva.
ALTER TABLE public.reembolso
  ADD COLUMN IF NOT EXISTS comprobante_url varchar(1000),
  ADD COLUMN IF NOT EXISTS comprobante_nombre varchar(255),
  ADD COLUMN IF NOT EXISTS observacion_transferencia varchar(500);
