-- Las fechas con hora pasan a timestamptz para guardar el instante exacto, sin depender de la
-- zona horaria de la máquina que ejecuta el backend. Con timestamp sin zona, now() de Neon
-- guardaba la hora UTC y el backend guardaba la hora local de su máquina (Argentina en
-- desarrollo, UTC en el servidor publicado), y al leerlas se mezclaban con 3 horas de diferencia.
--
-- Cómo se interpreta cada valor guardado:
-- 1. Con microsegundos: lo generó now() de la base, así que está en UTC.
-- 2. Escrito por el backend con una referencia exacta en la misma fila (creación hecha por la
--    base o un timestamptz): si leído en UTC no queda antes de la referencia, se toma como UTC;
--    si quedaría antes, lo escribió un backend en hora argentina.
-- 3. El resto se toma como hora argentina.
-- Los valores que un backend en UTC escribió sin referencia (por ejemplo, mensajes del chat)
-- pueden quedar corridos 3 horas; son datos de prueba y no hay forma confiable de distinguirlos.
--
-- Se puede repetir: cada columna se convierte solo si todavía es timestamp sin zona horaria.
-- En cada tabla se convierten primero las columnas que usan a otra como referencia.
DO $$
DECLARE
  col record;
  tipo_referencia text;
  condicion_utc text;
BEGIN
  FOR col IN
    SELECT * FROM (VALUES
      (1, 'reclamo_reserva', 'resuelto_en', 'creado_en'),
      (2, 'reclamo_reserva', 'creado_en', NULL),
      (3, 'reclamo_mensaje', 'creado_en', NULL),
      (4, 'reclamo_evidencia', 'creado_en', NULL),
      (5, 'reembolso', 'resuelto_en', 'creado_en'),
      (6, 'reembolso', 'aplicado_en', 'creado_en'),
      (7, 'reembolso', 'creado_en', NULL),
      (8, 'solicitud_cancelacion', 'decidida_en', 'creada_en'),
      (9, 'solicitud_cancelacion', 'creada_en', NULL),
      (10, 'reprogramacion_reserva', 'notificada_en', 'creada_en'),
      (11, 'reprogramacion_reserva', 'creada_en', NULL),
      (12, 'liquidacion', 'fecha_resolucion', 'creado_en'),
      (13, 'liquidacion', 'fecha_pago_propietario', 'creado_en'),
      (14, 'liquidacion', 'creado_en', NULL),
      (15, 'liquidacion', 'actualizado_en', NULL),
      (16, 'pago', 'approved_at', 'created_at'),
      (17, 'pago', 'refunded_at', 'created_at'),
      (18, 'pago', 'created_at', NULL),
      (19, 'pago', 'updated_at', NULL),
      (20, 'reserva', 'fecha_pago', 'cotizacion_aceptada_en'),
      (21, 'reserva', 'codigo_generado_en', 'cotizacion_aceptada_en'),
      (22, 'reserva', 'codigo_validado_en', 'cotizacion_aceptada_en'),
      (23, 'reserva', 'fecha_cancelacion', 'presupuesto_emitido_en'),
      (24, 'solicitud_verificacion', 'actualizada_en', 'creada_en'),
      (25, 'solicitud_verificacion', 'creada_en', NULL),
      (26, 'revision_verificacion', 'creada_en', NULL),
      (27, 'favorito', 'creado_en', NULL),
      (28, 'mensaje', 'fecha', NULL),
      (29, 'mensaje', 'fecha_lectura', NULL),
      (30, 'usuario', 'token_recuperacion_expira', NULL)
    ) AS columnas(orden, tabla, columna, referencia)
    ORDER BY orden
  LOOP
    CONTINUE WHEN NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = col.tabla AND column_name = col.columna
        AND data_type = 'timestamp without time zone');

    SELECT data_type INTO tipo_referencia FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = col.tabla AND column_name = col.referencia;

    condicion_utc := format('%1$I::text ~ %2$L', col.columna, '\.\d{4,}$');
    IF tipo_referencia = 'timestamp without time zone' THEN
      condicion_utc := condicion_utc || format(' OR (%2$I::text ~ %3$L AND %1$I >= %2$I)', col.columna, col.referencia, '\.\d{4,}$');
    ELSIF tipo_referencia = 'timestamp with time zone' THEN
      condicion_utc := condicion_utc || format(' OR (%1$I AT TIME ZONE %3$L) >= %2$I', col.columna, col.referencia, 'UTC');
    END IF;

    EXECUTE format(
      'ALTER TABLE public.%1$I ALTER COLUMN %2$I TYPE timestamptz USING CASE WHEN %3$s THEN %2$I AT TIME ZONE %4$L ELSE %2$I AT TIME ZONE %5$L END',
      col.tabla, col.columna, condicion_utc, 'UTC', 'America/Argentina/Buenos_Aires');
  END LOOP;
END $$;
