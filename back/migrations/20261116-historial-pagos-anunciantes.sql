ALTER TABLE public.liquidacion ADD COLUMN IF NOT EXISTS pagos_anunciante jsonb;

-- Conserva los comprobantes existentes aunque luego cambie el estado de la liquidación.
UPDATE public.liquidacion
SET pagos_anunciante = jsonb_build_array(jsonb_build_object(
  'fecha', to_char(COALESCE(fecha_pago_propietario, fecha_resolucion), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
  'importe', importe,
  'moneda', moneda,
  'referencia', referencia,
  'observacion', observacion,
  'administradorId', id_admin_resolucion
))
WHERE estado = 'PAGADO_PROPIETARIO' AND pagos_anunciante IS NULL;
