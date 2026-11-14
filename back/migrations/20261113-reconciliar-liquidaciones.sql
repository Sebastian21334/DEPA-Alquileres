-- Reconcilia el registro de fondos con la proyección histórica de reservas.
-- Si la reserva contiene una resolución fechada posterior, se recuperan sus
-- datos sin inferir importes. Para los demás casos prevalece la liquidación.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_attribute WHERE attrelid = 'public.reserva'::regclass
    AND attname = 'estado_liquidacion' AND NOT attisdropped) THEN
    RETURN;
  END IF;

UPDATE public.liquidacion AS l
SET estado = r.estado_liquidacion,
    referencia = r.referencia_liquidacion,
    observacion = r.observacion_liquidacion,
    fecha_resolucion = r.fecha_resolucion_liquidacion,
    fecha_pago_propietario = CASE WHEN r.estado_liquidacion = 'PAGADO_PROPIETARIO'
      THEN r.fecha_resolucion_liquidacion END,
    actualizado_en = CURRENT_TIMESTAMP
FROM public.reserva AS r
WHERE r.id_reserva = l.id_reserva
  AND r.fecha_resolucion_liquidacion IS NOT NULL
  AND r.fecha_resolucion_liquidacion > COALESCE(l.fecha_resolucion, l.actualizado_en);

UPDATE public.reserva AS r
SET estado_liquidacion = l.estado,
    referencia_liquidacion = l.referencia,
    observacion_liquidacion = l.observacion,
    fecha_resolucion_liquidacion = l.fecha_resolucion
FROM public.liquidacion AS l
WHERE l.id_reserva = r.id_reserva
  AND (r.estado_liquidacion, r.referencia_liquidacion, r.observacion_liquidacion, r.fecha_resolucion_liquidacion)
      IS DISTINCT FROM (l.estado, l.referencia, l.observacion, l.fecha_resolucion);
END $$;
