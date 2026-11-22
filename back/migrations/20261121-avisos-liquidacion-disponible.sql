ALTER TABLE public.liquidacion
  ADD COLUMN IF NOT EXISTS aviso_pago_admin_en timestamptz,
  ADD COLUMN IF NOT EXISTS aviso_pago_anunciante_en timestamptz;
