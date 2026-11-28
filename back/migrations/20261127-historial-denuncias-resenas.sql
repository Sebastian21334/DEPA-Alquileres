-- Historial de decisiones, independiente de la reseña para conservar la auditoría.
CREATE TABLE IF NOT EXISTS public.resena_denuncia_resolucion (
  id serial PRIMARY KEY,
  id_resena integer NOT NULL,
  id_denunciante integer REFERENCES public.usuario(id_usuario) ON DELETE SET NULL,
  motivo_denuncia varchar(300),
  fecha_denuncia timestamptz,
  aceptada boolean NOT NULL,
  motivo_resolucion varchar(300) NOT NULL,
  id_administrador integer REFERENCES public.usuario(id_usuario) ON DELETE SET NULL,
  fecha_resolucion timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ix_resena_denuncia_resolucion_fecha
  ON public.resena_denuncia_resolucion (fecha_resolucion DESC, id DESC);
