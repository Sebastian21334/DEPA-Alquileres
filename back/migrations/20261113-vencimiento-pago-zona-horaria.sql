DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'reserva'
      AND column_name = 'pago_vencimiento' AND data_type = 'timestamp without time zone'
  ) THEN
    -- Los checkouts anteriores guardaban el mismo instante que el presupuesto.
    ALTER TABLE public.reserva
      ALTER COLUMN pago_vencimiento TYPE timestamptz
      USING (CASE WHEN pago_vencimiento IS NOT NULL
        THEN COALESCE(presupuesto_vence_en, pago_vencimiento AT TIME ZONE 'UTC')
        ELSE NULL END);
  END IF;
END $$;
