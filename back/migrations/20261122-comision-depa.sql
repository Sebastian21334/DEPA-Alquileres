CREATE TABLE IF NOT EXISTS public.configuracion_comision (
  id smallint PRIMARY KEY CHECK (id = 1),
  porcentaje numeric(5,2) NOT NULL CHECK (porcentaje >= 0 AND porcentaje <= 100)
);

INSERT INTO public.configuracion_comision (id, porcentaje) VALUES (1, 10)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.reserva ADD COLUMN IF NOT EXISTS porcentaje_comision_depa numeric(5,2);
