-- Ejecutar una sola vez antes de desplegar el backend actualizado.
-- Idempotente y no modifica ni elimina usuarios, publicaciones o reservas existentes.
ALTER TABLE usuario
  ADD COLUMN IF NOT EXISTS activa BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS fecha_baja TIMESTAMPTZ NULL;
