-- D10: el enlace de verificación del correo vence a las 24 horas.
-- Los enlaces emitidos antes de esta columna quedan sin vencimiento cargado y,
-- por lo tanto, vencidos: la cuenta pide uno nuevo desde el inicio de sesión.
-- Se puede repetir.
ALTER TABLE public.usuario
  ADD COLUMN IF NOT EXISTS token_verificacion_expira timestamptz;
