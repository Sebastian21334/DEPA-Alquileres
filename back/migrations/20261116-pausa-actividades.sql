ALTER TABLE public.anunciante
    ADD COLUMN IF NOT EXISTS actividades_pausadas boolean NOT NULL DEFAULT false;
