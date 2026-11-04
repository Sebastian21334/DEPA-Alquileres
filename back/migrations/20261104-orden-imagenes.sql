-- Conserva la portada y el orden histórico por ID. Reejecutable sin pisar cambios posteriores.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'imagen' AND column_name = 'orden'
  ) THEN
    ALTER TABLE public.imagen ADD COLUMN orden integer NOT NULL DEFAULT 0;
    WITH posiciones AS (
      SELECT id_imagen,
        (row_number() OVER (PARTITION BY id_publicacion ORDER BY id_imagen) - 1)::integer AS orden
      FROM public.imagen
    )
    UPDATE public.imagen i SET orden = p.orden
    FROM posiciones p WHERE p.id_imagen = i.id_imagen;
  END IF;
END $$;
CREATE INDEX IF NOT EXISTS idx_imagen_publicacion_orden
  ON public.imagen (id_publicacion, orden, id_imagen);
