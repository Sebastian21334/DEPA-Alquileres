-- Solo las bajas confirmadas desde el perfil pueden recuperarse.
-- Las bajas anteriores no registraban su origen y mantienen el valor false.
ALTER TABLE public.usuario
  ADD COLUMN IF NOT EXISTS baja_recuperable boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS version_sesion uuid;

CREATE INDEX IF NOT EXISTS idx_usuario_baja_recuperable
  ON public.usuario (email_historico, fecha_baja DESC, id_usuario DESC)
  WHERE baja_recuperable AND NOT activa AND NOT bloqueado;
