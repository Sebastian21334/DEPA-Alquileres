-- Se retiran las notas internas de los reclamos: todos los mensajes del chat los ven las partes y la Administración.
-- Una nota que quedara se borra antes de quitar la columna, para no mostrársela a las partes; las notas no admitían imágenes.
-- Aplicarla con la versión del backend sin notas internas: la anterior exige este catálogo al iniciar y escribe la columna.
-- Se puede repetir.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema = 'public' AND table_name = 'reclamo_mensaje' AND column_name = 'visible_para') THEN
    DELETE FROM public.reclamo_mensaje WHERE visible_para::text = 'ADMIN';
  END IF;
END $$;

ALTER TABLE public.reclamo_mensaje DROP CONSTRAINT IF EXISTS fk_reclamo_mensaje_visible_para_catalogo;
ALTER TABLE public.reclamo_mensaje DROP COLUMN IF EXISTS ambito_visible_para;
ALTER TABLE public.reclamo_mensaje DROP COLUMN IF EXISTS visible_para;
DROP TYPE IF EXISTS public.reclamo_mensaje_visibilidad_enum;

DO $$
BEGIN
  IF to_regclass('public.estado') IS NOT NULL THEN
    DELETE FROM public.estado WHERE codigo_ambito = 'RECLAMO_VISIBILIDAD';
  END IF;
  IF to_regclass('public.ambito') IS NOT NULL THEN
    DELETE FROM public.ambito WHERE codigo = 'RECLAMO_VISIBILIDAD';
  END IF;
END $$;
