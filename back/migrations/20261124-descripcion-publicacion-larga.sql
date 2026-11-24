-- Amplía la descripción sin alterar las publicaciones existentes.
ALTER TABLE publicacion
  ALTER COLUMN descripcion TYPE varchar(5000);
