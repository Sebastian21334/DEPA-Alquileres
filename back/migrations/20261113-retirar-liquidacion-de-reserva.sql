LOCK TABLE public.reserva, public.liquidacion IN ACCESS EXCLUSIVE MODE;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_attribute WHERE attrelid = 'public.reserva'::regclass
    AND attname = 'estado_liquidacion' AND NOT attisdropped) THEN
    IF EXISTS (
      SELECT 1 FROM public.reserva r
      LEFT JOIN public.liquidacion l ON l.id_reserva = r.id_reserva
      WHERE l.id_reserva IS NULL OR
        (r.estado_liquidacion, r.referencia_liquidacion, r.observacion_liquidacion, r.fecha_resolucion_liquidacion)
        IS DISTINCT FROM (l.estado, l.referencia, l.observacion, l.fecha_resolucion)
    ) THEN
      RAISE EXCEPTION 'Hay reservas con liquidaciones sin reconciliar';
    END IF;
    ALTER TABLE public.reserva
      DROP COLUMN estado_liquidacion,
      DROP COLUMN ambito_estado_liquidacion,
      DROP COLUMN referencia_liquidacion,
      DROP COLUMN observacion_liquidacion,
      DROP COLUMN fecha_resolucion_liquidacion;
  END IF;
END $$;
