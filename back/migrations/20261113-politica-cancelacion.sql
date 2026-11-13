CREATE TABLE IF NOT EXISTS public.politica_cancelacion (
  vigente_desde date PRIMARY KEY,
  dias_devolucion_total integer NOT NULL CHECK (dias_devolucion_total >= 0),
  dias_devolucion_parcial integer NOT NULL CHECK (dias_devolucion_parcial >= 0),
  porcentaje_total integer NOT NULL CHECK (porcentaje_total BETWEEN 0 AND 100),
  porcentaje_parcial integer NOT NULL CHECK (porcentaje_parcial BETWEEN 0 AND 100),
  porcentaje_fuera_de_plazo integer NOT NULL CHECK (porcentaje_fuera_de_plazo BETWEEN 0 AND 100),
  porcentaje_otros_actores integer NOT NULL CHECK (porcentaje_otros_actores BETWEEN 0 AND 100),
  CHECK (dias_devolucion_total > dias_devolucion_parcial),
  CHECK (porcentaje_total >= porcentaje_parcial AND porcentaje_parcial >= porcentaje_fuera_de_plazo)
);
