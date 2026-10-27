-- Preparar con el backend detenido. El runner abre la transacción.
LOCK TABLE reserva, pago IN SHARE ROW EXCLUSIVE MODE;
ALTER TABLE reserva ADD COLUMN IF NOT EXISTS precio_unitario_contratado numeric(10,2);
ALTER TABLE reserva ADD COLUMN IF NOT EXISTS importe_contratado numeric(10,2);
ALTER TABLE reserva ADD COLUMN IF NOT EXISTS moneda_contratada varchar(3);

-- El pago es evidencia del importe y moneda originales. No usamos el precio actual
-- ni reconstruimos una tarifa diaria histórica a partir de fechas modificables.
UPDATE reserva r SET
  importe_contratado = COALESCE(r.importe_contratado, p.amount),
  moneda_contratada = COALESCE(r.moneda_contratada, p.currency)
FROM pago p
WHERE p.id_reserva = r.id_reserva AND p.status = 'approved'
  AND r.estado_pago = 'APROBADO' AND p.amount >= 0 AND length(p.currency) = 3
  AND (r.importe_contratado IS NULL OR r.moneda_contratada IS NULL);

CREATE TABLE IF NOT EXISTS reprogramacion_reserva (
  id_reprogramacion SERIAL PRIMARY KEY,
  id_reserva integer NOT NULL,
  fecha_inicio_anterior date NOT NULL,
  fecha_fin_anterior date NOT NULL,
  fecha_inicio_nueva date NOT NULL,
  fecha_fin_nueva date NOT NULL,
  creada_en timestamp NOT NULL DEFAULT now(),
  notificada_en timestamp,
  destinatario varchar(150),
  detalle jsonb NOT NULL,
  CONSTRAINT "FK_reprogramacion_reserva" FOREIGN KEY (id_reserva)
    REFERENCES reserva(id_reserva) ON DELETE CASCADE
);
