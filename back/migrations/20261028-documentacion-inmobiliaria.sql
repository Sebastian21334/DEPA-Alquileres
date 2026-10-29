ALTER TABLE solicitud_verificacion
  ADD COLUMN IF NOT EXISTS razon_social VARCHAR(150),
  ADD COLUMN IF NOT EXISTS matricula_profesional VARCHAR(50),
  ADD COLUMN IF NOT EXISTS colegio_profesional VARCHAR(150),
  ADD COLUMN IF NOT EXISTS domicilio_comercial VARCHAR(255),
  ADD COLUMN IF NOT EXISTS dni_corredor VARCHAR(15),
  ADD COLUMN IF NOT EXISTS matricula_url VARCHAR(500),
  ADD COLUMN IF NOT EXISTS constancia_cuit_url VARCHAR(500);

-- No se inventan datos para solicitudes existentes ni se cambian sus estados.
