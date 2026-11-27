-- Reseñas de publicaciones y perfiles de anunciantes.
-- Idempotente: se puede aplicar sobre una base con la migración ya ejecutada.
-- El promedio se guarda como caché derivada para que las tarjetas del catálogo
-- no consulten la tabla de reseñas en cada listado.

ALTER TABLE public.publicacion
  ADD COLUMN IF NOT EXISTS cantidad_resenas integer NOT NULL DEFAULT 0;
ALTER TABLE public.publicacion
  ADD COLUMN IF NOT EXISTS promedio_resenas numeric(3,2);

ALTER TABLE public.anunciante
  ADD COLUMN IF NOT EXISTS cantidad_resenas integer NOT NULL DEFAULT 0;
ALTER TABLE public.anunciante
  ADD COLUMN IF NOT EXISTS promedio_resenas numeric(3,2);

CREATE TABLE IF NOT EXISTS public.resena (
  id_resena serial PRIMARY KEY,
  id_usuario integer NOT NULL,
  id_publicacion integer,
  id_anunciante integer,
  puntaje smallint NOT NULL,
  comentario character varying(200) NOT NULL,
  fecha timestamptz NOT NULL DEFAULT now(),
  actualizada_en timestamptz,
  visible boolean NOT NULL DEFAULT true,
  motivo_moderacion character varying(300),
  moderada_por integer,
  fecha_moderacion timestamptz,
  denunciada boolean NOT NULL DEFAULT false,
  motivo_denuncia character varying(300),
  denunciada_por integer,
  fecha_denuncia timestamptz,
  CONSTRAINT fk_resena_autor FOREIGN KEY (id_usuario)
    REFERENCES public.usuario(id_usuario) ON DELETE CASCADE,
  CONSTRAINT fk_resena_publicacion FOREIGN KEY (id_publicacion)
    REFERENCES public.publicacion(id_publicacion) ON DELETE CASCADE,
  CONSTRAINT fk_resena_anunciante FOREIGN KEY (id_anunciante)
    REFERENCES public.anunciante(id_usuario) ON DELETE CASCADE,
  CONSTRAINT fk_resena_moderador FOREIGN KEY (moderada_por)
    REFERENCES public.usuario(id_usuario) ON DELETE SET NULL,
  CONSTRAINT fk_resena_denunciante FOREIGN KEY (denunciada_por)
    REFERENCES public.usuario(id_usuario) ON DELETE SET NULL,
  CONSTRAINT ck_resena_un_objetivo CHECK (
    ((id_publicacion IS NOT NULL)::int + (id_anunciante IS NOT NULL)::int) = 1
  ),
  CONSTRAINT ck_resena_puntaje CHECK (puntaje BETWEEN 1 AND 5)
);

-- Columnas para instalaciones que ya tenían la tabla creada por una versión
-- anterior de esta misma migración.
ALTER TABLE public.resena
  ADD COLUMN IF NOT EXISTS denunciada boolean NOT NULL DEFAULT false;
ALTER TABLE public.resena
  ADD COLUMN IF NOT EXISTS motivo_denuncia character varying(300);
ALTER TABLE public.resena
  ADD COLUMN IF NOT EXISTS denunciada_por integer;
ALTER TABLE public.resena
  ADD COLUMN IF NOT EXISTS fecha_denuncia timestamptz;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'fk_resena_denunciante'
      AND conrelid = 'public.resena'::regclass
  ) THEN
    ALTER TABLE public.resena
      ADD CONSTRAINT fk_resena_denunciante FOREIGN KEY (denunciada_por)
      REFERENCES public.usuario(id_usuario) ON DELETE SET NULL;
  END IF;
END $$;

-- Una sola reseña por autor y objetivo. El índice parcial deja convivir las
-- dos variantes (publicación y perfil) sin chocar entre sí.
CREATE UNIQUE INDEX IF NOT EXISTS uq_resena_publicacion_autor
  ON public.resena (id_publicacion, id_usuario)
  WHERE id_publicacion IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_resena_anunciante_autor
  ON public.resena (id_anunciante, id_usuario)
  WHERE id_anunciante IS NOT NULL;

CREATE INDEX IF NOT EXISTS ix_resena_publicacion_fecha
  ON public.resena (id_publicacion, visible, fecha DESC)
  WHERE id_publicacion IS NOT NULL;
CREATE INDEX IF NOT EXISTS ix_resena_anunciante_fecha
  ON public.resena (id_anunciante, visible, fecha DESC)
  WHERE id_anunciante IS NOT NULL;
CREATE INDEX IF NOT EXISTS ix_resena_denunciada
  ON public.resena (denunciada, fecha DESC)
  WHERE denunciada;

CREATE TABLE IF NOT EXISTS public.resena_imagen (
  id_resena_imagen serial PRIMARY KEY,
  id_resena integer NOT NULL,
  url character varying(500) NOT NULL,
  orden integer NOT NULL DEFAULT 0,
  CONSTRAINT fk_resena_imagen_resena FOREIGN KEY (id_resena)
    REFERENCES public.resena(id_resena) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS ix_resena_imagen_resena
  ON public.resena_imagen (id_resena, orden);
-- Evita que dos subidas simultáneas ocupen el mismo orden y superen el tope.
CREATE UNIQUE INDEX IF NOT EXISTS uq_resena_imagen_orden
  ON public.resena_imagen (id_resena, orden);

-- Las reseñas solo aplican a alquileres temporales. Se eliminan las que
-- hubieran quedado asociadas a una modalidad sin reservas por fecha.
DELETE FROM public.resena AS resena
USING public.publicacion AS publicacion, public.modalidad AS modalidad
WHERE resena.id_publicacion = publicacion.id_publicacion
  AND publicacion.id_modalidad = modalidad.id_modalidad
  AND modalidad.permite_reservas_por_fecha = false;

-- Backfill idempotente: recalcula las cachés desde las reseñas visibles.
UPDATE public.publicacion
  SET cantidad_resenas = 0, promedio_resenas = NULL;
UPDATE public.publicacion AS publicacion
  SET cantidad_resenas = resumen.cantidad, promedio_resenas = resumen.promedio
  FROM (
    SELECT id_publicacion, count(*)::int AS cantidad,
      round(avg(puntaje)::numeric, 2) AS promedio
    FROM public.resena
    WHERE visible AND id_publicacion IS NOT NULL
    GROUP BY id_publicacion
  ) AS resumen
  WHERE publicacion.id_publicacion = resumen.id_publicacion;

UPDATE public.anunciante
  SET cantidad_resenas = 0, promedio_resenas = NULL;
UPDATE public.anunciante AS anunciante
  SET cantidad_resenas = resumen.cantidad, promedio_resenas = resumen.promedio
  FROM (
    SELECT id_anunciante, count(*)::int AS cantidad,
      round(avg(puntaje)::numeric, 2) AS promedio
    FROM public.resena
    WHERE visible AND id_anunciante IS NOT NULL
    GROUP BY id_anunciante
  ) AS resumen
  WHERE anunciante.id_usuario = resumen.id_anunciante;
