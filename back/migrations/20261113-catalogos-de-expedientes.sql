INSERT INTO public.ambito (codigo, nombre) VALUES ('DISPUTA_ORIGEN', 'DISPUTA ORIGEN') ON CONFLICT (codigo) DO NOTHING;
INSERT INTO public.estado (codigo_ambito, codigo, nombre) VALUES
  ('DISPUTA_ORIGEN', 'CONTRACARGO', 'CONTRACARGO')
ON CONFLICT (codigo_ambito, codigo) DO NOTHING;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = 'public.disputa'::regclass AND conname = 'fk_disputa_origen_catalogo') THEN
    ALTER TABLE public.disputa ALTER COLUMN origen DROP DEFAULT;
    ALTER TABLE public.disputa ALTER COLUMN origen TYPE varchar(40) USING origen::text;
    
    ALTER TABLE public.disputa ADD COLUMN ambito_origen varchar(40) GENERATED ALWAYS AS ('DISPUTA_ORIGEN') STORED;
    ALTER TABLE public.disputa ADD CONSTRAINT fk_disputa_origen_catalogo
      FOREIGN KEY (ambito_origen, origen) REFERENCES public.estado(codigo_ambito, codigo) ON DELETE RESTRICT;
  END IF;
END $$;

INSERT INTO public.ambito (codigo, nombre) VALUES ('RECLAMO_CATEGORIA', 'RECLAMO CATEGORIA') ON CONFLICT (codigo) DO NOTHING;
INSERT INTO public.estado (codigo_ambito, codigo, nombre) VALUES
  ('RECLAMO_CATEGORIA', 'LIMPIEZA', 'LIMPIEZA'),
  ('RECLAMO_CATEGORIA', 'MANTENIMIENTO', 'MANTENIMIENTO'),
  ('RECLAMO_CATEGORIA', 'INGRESO', 'INGRESO'),
  ('RECLAMO_CATEGORIA', 'DESCRIPCION', 'DESCRIPCION'),
  ('RECLAMO_CATEGORIA', 'OTRO', 'OTRO')
ON CONFLICT (codigo_ambito, codigo) DO NOTHING;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = 'public.reclamo_reserva'::regclass AND conname = 'fk_reclamo_reserva_categoria_catalogo') THEN
    ALTER TABLE public.reclamo_reserva ALTER COLUMN categoria DROP DEFAULT;
    ALTER TABLE public.reclamo_reserva ALTER COLUMN categoria TYPE varchar(40) USING categoria::text;
    
    ALTER TABLE public.reclamo_reserva ADD COLUMN ambito_categoria varchar(40) GENERATED ALWAYS AS ('RECLAMO_CATEGORIA') STORED;
    ALTER TABLE public.reclamo_reserva ADD CONSTRAINT fk_reclamo_reserva_categoria_catalogo
      FOREIGN KEY (ambito_categoria, categoria) REFERENCES public.estado(codigo_ambito, codigo) ON DELETE RESTRICT;
  END IF;
END $$;

INSERT INTO public.ambito (codigo, nombre) VALUES ('RECLAMO_RESOLUCION', 'RECLAMO RESOLUCION') ON CONFLICT (codigo) DO NOTHING;
INSERT INTO public.estado (codigo_ambito, codigo, nombre) VALUES
  ('RECLAMO_RESOLUCION', 'SIN_DEVOLUCION', 'SIN DEVOLUCION'),
  ('RECLAMO_RESOLUCION', 'DEVOLUCION_TOTAL', 'DEVOLUCION TOTAL'),
  ('RECLAMO_RESOLUCION', 'DEVOLUCION_PARCIAL', 'DEVOLUCION PARCIAL')
ON CONFLICT (codigo_ambito, codigo) DO NOTHING;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = 'public.reclamo_reserva'::regclass AND conname = 'fk_reclamo_reserva_resolucion_catalogo') THEN
    ALTER TABLE public.reclamo_reserva ALTER COLUMN resolucion DROP DEFAULT;
    ALTER TABLE public.reclamo_reserva ALTER COLUMN resolucion TYPE varchar(40) USING resolucion::text;
    
    ALTER TABLE public.reclamo_reserva ADD COLUMN ambito_resolucion varchar(40) GENERATED ALWAYS AS ('RECLAMO_RESOLUCION') STORED;
    ALTER TABLE public.reclamo_reserva ADD CONSTRAINT fk_reclamo_reserva_resolucion_catalogo
      FOREIGN KEY (ambito_resolucion, resolucion) REFERENCES public.estado(codigo_ambito, codigo) ON DELETE RESTRICT;
  END IF;
END $$;

INSERT INTO public.ambito (codigo, nombre) VALUES ('RECLAMO_VISIBILIDAD', 'RECLAMO VISIBILIDAD') ON CONFLICT (codigo) DO NOTHING;
INSERT INTO public.estado (codigo_ambito, codigo, nombre) VALUES
  ('RECLAMO_VISIBILIDAD', 'TODOS', 'TODOS'),
  ('RECLAMO_VISIBILIDAD', 'ADMIN', 'ADMIN')
ON CONFLICT (codigo_ambito, codigo) DO NOTHING;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = 'public.reclamo_mensaje'::regclass AND conname = 'fk_reclamo_mensaje_visible_para_catalogo') THEN
    ALTER TABLE public.reclamo_mensaje ALTER COLUMN visible_para DROP DEFAULT;
    ALTER TABLE public.reclamo_mensaje ALTER COLUMN visible_para TYPE varchar(40) USING visible_para::text;
    ALTER TABLE public.reclamo_mensaje ALTER COLUMN visible_para SET DEFAULT 'TODOS';
    ALTER TABLE public.reclamo_mensaje ADD COLUMN ambito_visible_para varchar(40) GENERATED ALWAYS AS ('RECLAMO_VISIBILIDAD') STORED;
    ALTER TABLE public.reclamo_mensaje ADD CONSTRAINT fk_reclamo_mensaje_visible_para_catalogo
      FOREIGN KEY (ambito_visible_para, visible_para) REFERENCES public.estado(codigo_ambito, codigo) ON DELETE RESTRICT;
  END IF;
END $$;

INSERT INTO public.ambito (codigo, nombre) VALUES ('REEMBOLSO_TIPO', 'REEMBOLSO TIPO') ON CONFLICT (codigo) DO NOTHING;
INSERT INTO public.estado (codigo_ambito, codigo, nombre) VALUES
  ('REEMBOLSO_TIPO', 'TOTAL', 'TOTAL'),
  ('REEMBOLSO_TIPO', 'PARCIAL', 'PARCIAL'),
  ('REEMBOLSO_TIPO', 'CONTRACARGO', 'CONTRACARGO')
ON CONFLICT (codigo_ambito, codigo) DO NOTHING;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = 'public.reembolso'::regclass AND conname = 'fk_reembolso_tipo_catalogo') THEN
    ALTER TABLE public.reembolso ALTER COLUMN tipo DROP DEFAULT;
    ALTER TABLE public.reembolso ALTER COLUMN tipo TYPE varchar(40) USING tipo::text;
    
    ALTER TABLE public.reembolso ADD COLUMN ambito_tipo varchar(40) GENERATED ALWAYS AS ('REEMBOLSO_TIPO') STORED;
    ALTER TABLE public.reembolso ADD CONSTRAINT fk_reembolso_tipo_catalogo
      FOREIGN KEY (ambito_tipo, tipo) REFERENCES public.estado(codigo_ambito, codigo) ON DELETE RESTRICT;
  END IF;
END $$;

INSERT INTO public.ambito (codigo, nombre) VALUES ('REEMBOLSO_ORIGEN', 'REEMBOLSO ORIGEN') ON CONFLICT (codigo) DO NOTHING;
INSERT INTO public.estado (codigo_ambito, codigo, nombre) VALUES
  ('REEMBOLSO_ORIGEN', 'CANCELACION', 'CANCELACION'),
  ('REEMBOLSO_ORIGEN', 'RECLAMO', 'RECLAMO'),
  ('REEMBOLSO_ORIGEN', 'CONTRACARGO', 'CONTRACARGO'),
  ('REEMBOLSO_ORIGEN', 'PAGO_TARDIO', 'PAGO TARDIO'),
  ('REEMBOLSO_ORIGEN', 'AJUSTE_ADMIN', 'AJUSTE ADMIN')
ON CONFLICT (codigo_ambito, codigo) DO NOTHING;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = 'public.reembolso'::regclass AND conname = 'fk_reembolso_origen_catalogo') THEN
    ALTER TABLE public.reembolso ALTER COLUMN origen DROP DEFAULT;
    ALTER TABLE public.reembolso ALTER COLUMN origen TYPE varchar(40) USING origen::text;
    
    ALTER TABLE public.reembolso ADD COLUMN ambito_origen varchar(40) GENERATED ALWAYS AS ('REEMBOLSO_ORIGEN') STORED;
    ALTER TABLE public.reembolso ADD CONSTRAINT fk_reembolso_origen_catalogo
      FOREIGN KEY (ambito_origen, origen) REFERENCES public.estado(codigo_ambito, codigo) ON DELETE RESTRICT;
  END IF;
END $$;
