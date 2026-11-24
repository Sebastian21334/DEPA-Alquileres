-- El motivo que escribe el admin al resolver un reclamo queda en el reclamo y lo ven las dos partes.
-- Los reclamos ya resueltos con devolución lo recuperan del motivo del reembolso; los demás quedan sin motivo.
-- Se puede repetir: solo completa los reclamos que todavía no tienen motivo.
ALTER TABLE public.reclamo_reserva
  ADD COLUMN IF NOT EXISTS motivo_resolucion varchar(500);

UPDATE public.reclamo_reserva r
SET motivo_resolucion = left(regexp_replace(re.motivo, '^Reclamo #[0-9]+: ', ''), 500)
FROM public.reembolso re
WHERE r.motivo_resolucion IS NULL
  AND r.resolucion IS NOT NULL
  AND re.referencia_interna = 'rec:' || r.id_reclamo
  AND re.motivo ~ '^Reclamo #[0-9]+: .'
  -- Textos que se guardaban cuando el admin no escribía un motivo.
  AND regexp_replace(re.motivo, '^Reclamo #[0-9]+: ', '') NOT IN ('resolución favorable al inquilino', 'faltante de cancelación');
