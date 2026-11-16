ALTER TABLE public.anunciante
  ADD COLUMN IF NOT EXISTS cbu_validado varchar(22);

ALTER TABLE public.solicitud_verificacion
  ADD COLUMN IF NOT EXISTS cbu_pendiente varchar(22),
  ADD COLUMN IF NOT EXISTS motivo_rechazo_cbu varchar(500);

ALTER TABLE public.revision_verificacion
  ADD COLUMN IF NOT EXISTS identidad_aprobada boolean,
  ADD COLUMN IF NOT EXISTS cbu_aprobado boolean;

-- Las cuentas verificadas sin solicitud histórica solo necesitan revisión bancaria.
INSERT INTO public.solicitud_verificacion (id_anunciante, estado)
SELECT anunciante.id_usuario, 'aprobada'
FROM public.anunciante AS anunciante
WHERE anunciante.verificado
  AND NOT EXISTS (
    SELECT 1 FROM public.solicitud_verificacion AS solicitud
    WHERE solicitud.id_anunciante = anunciante.id_usuario
  );
