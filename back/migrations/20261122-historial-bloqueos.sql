ALTER TABLE public.usuario ADD COLUMN IF NOT EXISTS historial_bloqueos jsonb NOT NULL DEFAULT '[]'::jsonb;

-- Antes de esta versión solo quedaba el último bloqueo, sin fecha de desbloqueo.
UPDATE public.usuario AS u
SET historial_bloqueos = historial_bloqueos || jsonb_build_array(
  u.bloqueo_detalle || jsonb_build_object('fechaDesbloqueo', NULL, 'desbloqueadoPorId', NULL)
)
WHERE NOT u.bloqueado AND u.bloqueo_detalle IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM jsonb_array_elements(u.historial_bloqueos) AS anterior
    WHERE anterior->>'id' IS NOT DISTINCT FROM u.bloqueo_detalle->>'id'
  );
