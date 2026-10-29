ALTER TABLE solicitud_verificacion
  ADD COLUMN IF NOT EXISTS prueba_vida_desafio UUID,
  ADD COLUMN IF NOT EXISTS prueba_vida_revision INTEGER,
  ADD COLUMN IF NOT EXISTS prueba_vida_rostro_hash VARCHAR(64),
  ADD COLUMN IF NOT EXISTS prueba_vida_validada_en TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS prueba_vida_vence_en TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS prueba_vida_consumida_en TIMESTAMPTZ;

ALTER TABLE revision_verificacion
  ADD COLUMN IF NOT EXISTS id_administrador INTEGER;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'revision_verificacion'::regclass
      AND conname = 'FK_revision_administrador'
  ) THEN
    ALTER TABLE revision_verificacion
      ADD CONSTRAINT "FK_revision_administrador"
      FOREIGN KEY (id_administrador) REFERENCES usuario(id_usuario)
      ON DELETE SET NULL;
  END IF;
END $$;

-- Los registros anteriores quedan sin evidencia o responsable inventados.
-- No se modifica ninguna aprobación, rechazo, documento ni anunciante existente.
