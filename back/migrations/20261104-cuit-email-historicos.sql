-- RN-37: CUIT/CUIL y email únicos entre las cuentas vigentes.
-- Al dar de baja una cuenta, sus valores pasan a columnas históricas y quedan libres.
-- Reejecutable. Aplicar con scripts/cuit-email-historicos.cjs --aplicar.

ALTER TABLE public.anunciante ADD COLUMN IF NOT EXISTS cuit_cuil_historico character varying(15);
ALTER TABLE public.usuario ADD COLUMN IF NOT EXISTS email_historico character varying(150);
ALTER TABLE public.usuario ALTER COLUMN email DROP NOT NULL;

-- Cuentas dadas de baja antes de esta versión: sus valores pasan al histórico.
UPDATE public.usuario
   SET email_historico = email, email = NULL
 WHERE activa = false AND email IS NOT NULL;

UPDATE public.anunciante a
   SET cuit_cuil_historico = a.cuit_cuil, cuit_cuil = NULL
  FROM public.usuario u
 WHERE u.id_usuario = a.id_usuario
   AND u.activa = false
   AND a.cuit_cuil IS NOT NULL;

-- Nunca se fusionan ni se modifican CUIT/CUIL repetidos entre cuentas vigentes:
-- si los hay, la migración se revierte para que se revisen a mano.
DO $$
DECLARE
  repetidos text;
BEGIN
  SELECT string_agg(digitos || ' (cuentas ' || ids || ')', '; ')
    INTO repetidos
    FROM (
      SELECT regexp_replace(cuit_cuil, '[^0-9]', '', 'g') AS digitos,
             string_agg(id_usuario::text, ', ' ORDER BY id_usuario) AS ids
        FROM public.anunciante
       WHERE cuit_cuil IS NOT NULL
       GROUP BY 1
      HAVING count(*) > 1
    ) d;
  IF repetidos IS NOT NULL THEN
    RAISE EXCEPTION 'Hay CUIT/CUIL repetidos entre cuentas vigentes: %. Resolverlos antes de aplicar la migración.', repetidos;
  END IF;
END $$;

-- Compara solo los dígitos: «20-12345678-9» y «20123456789» son el mismo CUIT/CUIL.
CREATE UNIQUE INDEX IF NOT EXISTS uq_anunciante_cuit_cuil_digitos
  ON public.anunciante ((regexp_replace(cuit_cuil, '[^0-9]', '', 'g')))
  WHERE cuit_cuil IS NOT NULL;
