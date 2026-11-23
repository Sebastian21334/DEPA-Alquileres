-- T34: pedido de reinicio del código de alojamiento.
-- Agrega la categoría con la que el anunciante pide el reinicio y las dos
-- resoluciones a su favor. Solo inserta valores nuevos y se puede repetir.
INSERT INTO public.estado (codigo_ambito, codigo, nombre) VALUES
  ('RECLAMO_CATEGORIA', 'CODIGO_BLOQUEADO', 'CODIGO BLOQUEADO'),
  ('RECLAMO_RESOLUCION', 'REINICIAR_CODIGO', 'REINICIAR CODIGO'),
  ('RECLAMO_RESOLUCION', 'CONFIRMAR_INGRESO', 'CONFIRMAR INGRESO')
ON CONFLICT (codigo_ambito, codigo) DO NOTHING;
