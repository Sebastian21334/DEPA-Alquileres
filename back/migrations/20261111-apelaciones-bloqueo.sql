ALTER TABLE public.usuario ADD COLUMN IF NOT EXISTS bloqueo_detalle jsonb;

-- Los bloqueos anteriores carecen de un motivo y un operador registrados.
UPDATE public.usuario
SET bloqueo_detalle = jsonb_build_object(
  'id', gen_random_uuid(), 'motivo', NULL, 'administradorId', NULL, 'fecha', NULL
)
WHERE activa AND bloqueado AND bloqueo_detalle IS NULL;
