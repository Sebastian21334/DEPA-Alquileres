-- Retira la excepción descartada solo cuando no tiene datos de negocio.
-- Los estados y las solicitudes anteriores se conservan.
DO $$
BEGIN
  IF to_regclass('public.compensacion_demora') IS NOT NULL THEN
    LOCK TABLE public.compensacion_demora IN ACCESS EXCLUSIVE MODE;
    IF EXISTS (SELECT 1 FROM public.compensacion_demora) THEN
      RAISE EXCEPTION 'La excepción tiene compensaciones registradas; se requiere conciliación antes de retirarla';
    END IF;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='solicitud_cancelacion' AND column_name='revision_demora') THEN
    LOCK TABLE public.solicitud_cancelacion IN ACCESS EXCLUSIVE MODE;
    IF EXISTS (SELECT 1 FROM public.solicitud_cancelacion WHERE revision_demora IS NOT NULL) THEN
      RAISE EXCEPTION 'La excepción tiene revisiones registradas; se requiere conservarlas antes de retirarla';
    END IF;
  END IF;
END $$;
DROP TABLE IF EXISTS public.compensacion_demora;
ALTER TABLE public.solicitud_cancelacion DROP COLUMN IF EXISTS revision_demora;

INSERT INTO public.estado (codigo_ambito,codigo,nombre)
VALUES ('RECLAMO_CATEGORIA','DEMORA_ADMINISTRATIVA','Demora administrativa')
ON CONFLICT (codigo_ambito,codigo) DO NOTHING;
