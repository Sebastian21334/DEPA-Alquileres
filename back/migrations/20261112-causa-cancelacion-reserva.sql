ALTER TABLE public.reserva
  ADD COLUMN IF NOT EXISTS causa_cancelacion varchar(40);

UPDATE public.reserva
SET causa_cancelacion = 'BLOQUEO_ANUNCIANTE'
WHERE causa_cancelacion IS NULL
  AND cancelada IS TRUE
  AND cancelada_por = 'ADMINISTRADOR'
  AND motivo_cancelacion LIKE 'Bloqueo de cuenta del anunciante%';
