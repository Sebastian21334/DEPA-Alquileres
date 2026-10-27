-- Ejecutar dentro de una transacción, con el backend detenido.
LOCK TABLE fecha IN ACCESS EXCLUSIVE MODE;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM fecha WHERE id_publicacion IS NULL) THEN
    RAISE EXCEPTION 'Hay fechas sin publicación; revisar los datos antes de migrar';
  END IF;
  IF EXISTS (
    SELECT 1 FROM fecha GROUP BY id_publicacion, fecha HAVING count(*) > 1
  ) THEN
    RAISE EXCEPTION 'Hay días duplicados por publicación; revisar los datos antes de migrar';
  END IF;
  ALTER TABLE fecha ALTER COLUMN id_publicacion SET NOT NULL;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'fecha'::regclass AND conname = 'UQ_fecha_publicacion_dia'
  ) THEN
    ALTER TABLE fecha ADD CONSTRAINT "UQ_fecha_publicacion_dia"
      UNIQUE (id_publicacion, fecha);
  END IF;
END $$;
