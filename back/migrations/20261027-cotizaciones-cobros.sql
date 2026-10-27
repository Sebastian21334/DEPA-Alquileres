-- El runner abre una transacción. Ejecutar con el backend detenido.
CREATE TABLE IF NOT EXISTS cotizacion_dolar (
  id SERIAL PRIMARY KEY,
  compra numeric(18,6) NOT NULL,
  venta numeric(18,6) NOT NULL,
  tipo varchar(20) NOT NULL,
  proveedor varchar(60) NOT NULL,
  actualizada_fuente_en timestamptz NOT NULL,
  consultada_en timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS consulta_cotizacion (
  id SERIAL PRIMARY KEY,
  realizada_en timestamptz NOT NULL DEFAULT now(),
  exitosa boolean NOT NULL,
  error varchar(300)
);
LOCK TABLE reserva IN SHARE ROW EXCLUSIVE MODE;
ALTER TABLE reserva ADD COLUMN IF NOT EXISTS moneda_origen varchar(3);
ALTER TABLE reserva ADD COLUMN IF NOT EXISTS importe_origen numeric(10,2);
ALTER TABLE reserva ADD COLUMN IF NOT EXISTS id_cotizacion_dolar integer;
ALTER TABLE reserva ADD COLUMN IF NOT EXISTS cotizacion_aceptada_en timestamptz;
ALTER TABLE reserva ADD COLUMN IF NOT EXISTS presupuesto_emitido_en timestamptz;
ALTER TABLE reserva ADD COLUMN IF NOT EXISTS presupuesto_vence_en timestamptz;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = 'reserva'::regclass AND conname = 'FK_reserva_cotizacion_dolar') THEN
    ALTER TABLE reserva ADD CONSTRAINT "FK_reserva_cotizacion_dolar" FOREIGN KEY (id_cotizacion_dolar)
      REFERENCES cotizacion_dolar(id) ON DELETE RESTRICT;
  END IF;
END $$;
-- No se inventa una conversión ni moneda original para cobros históricos.
