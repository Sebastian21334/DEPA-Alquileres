-- Conserva las relaciones de publicaciones eliminadas para reservas e historial.
ALTER TABLE publicacion
  ADD COLUMN IF NOT EXISTS eliminada boolean NOT NULL DEFAULT false;
