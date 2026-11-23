-- T49: cada imagen de un reclamo puede quedar adjunta al mensaje del chat con el que se envió.
-- Las imágenes existentes quedan sin mensaje y se muestran con la descripción del reclamo.
-- Se puede repetir: la columna y la restricción se agregan solo si faltan.
ALTER TABLE public.reclamo_evidencia ADD COLUMN IF NOT EXISTS id_mensaje integer;

DO $$
BEGIN
  ALTER TABLE public.reclamo_evidencia
    ADD CONSTRAINT FK_reclamo_evidencia_mensaje FOREIGN KEY (id_mensaje)
    REFERENCES public.reclamo_mensaje(id_mensaje_reclamo) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
