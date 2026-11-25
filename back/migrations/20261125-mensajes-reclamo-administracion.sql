-- Desde qué chat se escribió cada mensaje de un reclamo: true si fue desde el panel de Administración.
-- Un admin que es inquilino o anunciante de la reserva escribe como esa parte desde su propio chat.
-- Los mensajes anteriores se marcan por su autor: quien no es parte de la reserva escribió desde Administración.
-- Se puede repetir: solo marca mensajes de quien no es parte y nunca desmarca los ya marcados.
ALTER TABLE public.reclamo_mensaje
  ADD COLUMN IF NOT EXISTS como_administracion boolean NOT NULL DEFAULT false;

UPDATE public.reclamo_mensaje m
SET como_administracion = true
FROM public.reclamo_reserva r
WHERE m.id_reclamo = r.id_reclamo
  AND NOT m.como_administracion
  AND m.id_autor IS DISTINCT FROM r.id_inquilino
  AND m.id_autor IS DISTINCT FROM r.id_anunciante;
