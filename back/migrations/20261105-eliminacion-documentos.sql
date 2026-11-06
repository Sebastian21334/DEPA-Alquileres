-- Ejecutar dentro de una transacción, con el backend detenido.
CREATE TABLE IF NOT EXISTS eliminacion_documento (
  id SERIAL PRIMARY KEY,
  url VARCHAR(500) NOT NULL UNIQUE,
  intentos INTEGER NOT NULL DEFAULT 0,
  proximo_intento TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "IDX_eliminacion_documento_proximo_intento"
  ON eliminacion_documento (proximo_intento);

-- Las solicitudes históricas resueltas siguen la misma política. No tocar
-- borradores, pendientes ni reenviadas: todavía requieren sus documentos.
INSERT INTO eliminacion_documento (url)
SELECT DISTINCT documento.url
FROM solicitud_verificacion solicitud
CROSS JOIN LATERAL unnest(ARRAY[
  solicitud.dni_frente_url, solicitud.dni_dorso_url, solicitud.rostro_url,
  solicitud.matricula_url, solicitud.constancia_cuit_url
]) AS documento(url)
WHERE solicitud.estado IN ('aprobada', 'rechazada')
  AND documento.url IS NOT NULL AND documento.url <> ''
ON CONFLICT (url) DO NOTHING;

UPDATE solicitud_verificacion
SET dni_frente_url = NULL, dni_dorso_url = NULL, rostro_url = NULL,
    matricula_url = NULL, constancia_cuit_url = NULL,
    prueba_vida_desafio = NULL, prueba_vida_revision = NULL,
    prueba_vida_rostro_hash = NULL, prueba_vida_vence_en = NULL,
    prueba_vida_consumida_en = NULL
WHERE estado IN ('aprobada', 'rechazada');
-- Se conservan actualizada_en, prueba_vida_validada_en, el resultado, el motivo,
-- el anunciante y todas las filas de revision_verificacion con su responsable.
