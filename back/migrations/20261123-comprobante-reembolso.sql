-- T44: comprobante de la transferencia de un reembolso.
-- Agrega las columnas sin tocar los reembolsos existentes, que quedan sin comprobante.
-- Se puede repetir.
ALTER TABLE public.reembolso
  ADD COLUMN IF NOT EXISTS comprobante_url varchar(1000),
  ADD COLUMN IF NOT EXISTS comprobante_nombre varchar(255);
