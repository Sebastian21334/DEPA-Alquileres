ALTER TABLE public.reembolso
  ADD COLUMN IF NOT EXISTS aplicado_en timestamp,
  ADD COLUMN IF NOT EXISTS revision_aplicacion boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS conciliar_en timestamptz,
  ADD COLUMN IF NOT EXISTS primer_intento_en timestamptz;

-- Las claves históricas se conservan. El origen se recupera cuando identifica
-- una operación concreta de la misma reserva.
UPDATE public.reembolso r SET referencia_interna = r.idempotency_key
FROM public.solicitud_cancelacion s
WHERE r.referencia_interna IS NULL AND r.origen = 'CANCELACION'
  AND r.id_reserva = s.id_reserva
  AND r.idempotency_key = 'can:' || s.id_solicitud_cancelacion;

UPDATE public.reembolso r SET referencia_interna = 'rec:' || c.id_reclamo
FROM public.reclamo_reserva c
WHERE r.referencia_interna IS NULL AND r.origen = 'RECLAMO'
  AND r.id_reserva = c.id_reserva AND r.motivo LIKE 'Reclamo #' || c.id_reclamo || ':%';

UPDATE public.reembolso r SET referencia_interna = 'dis:' || d.id_disputa
FROM public.disputa d
WHERE r.referencia_interna IS NULL AND r.origen = 'CONTRACARGO'
  AND r.id_pago = d.id_pago AND r.id_reserva = d.id_reserva
  AND r.referencia_externa = COALESCE(d.chargeback_id, 'contracargo-' || d.id_disputa);

UPDATE public.reembolso r
SET referencia_interna = CASE
  WHEN r.idempotency_key LIKE 'blq:%' THEN split_part(r.idempotency_key, ':', 1) || ':' || split_part(r.idempotency_key, ':', 2) || ':' || r.id_reserva
  ELSE 'liq:' || r.id_reserva
END
WHERE r.referencia_interna IS NULL
  AND ((r.origen = 'CANCELACION' AND r.idempotency_key LIKE 'blq:%')
    OR (r.origen = 'AJUSTE_ADMIN' AND r.idempotency_key LIKE 'liq:%'));

-- Solo se inicializa en el primer despliegue. Las filas nuevas aprobadas y
-- pendientes de aplicar deben seguir disponibles si se repite la migración.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = 'public.reembolso'::regclass
    AND conname = 'ck_reembolso_aplicacion') THEN
    UPDATE public.reembolso r
    SET aplicado_en = l.fecha_resolucion
    FROM public.liquidacion l
    WHERE r.estado = 'APROBADO' AND l.id_reserva = r.id_reserva
      AND l.estado IN ('DEVUELTO_INQUILINO', 'DEVUELTO_PARCIAL_INQUILINO')
      AND l.fecha_resolucion >= r.resuelto_en AND l.importe = r.importe
      AND (l.referencia = r.referencia_externa OR
        (SELECT count(*) FROM public.reembolso otro
         WHERE otro.id_reserva = r.id_reserva AND otro.estado = 'APROBADO') = 1);

    UPDATE public.reembolso
    SET revision_aplicacion = true
    WHERE estado = 'APROBADO' AND aplicado_en IS NULL;

    UPDATE public.reembolso SET conciliar_en = CURRENT_TIMESTAMP
    WHERE estado IN ('EN_PROCESO', 'FALLIDO') AND id_externo IS NOT NULL;

    ALTER TABLE public.reembolso ADD CONSTRAINT ck_reembolso_aplicacion
      CHECK (aplicado_en IS NULL OR (estado = 'APROBADO' AND NOT revision_aplicacion));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS ix_reembolso_pendiente_aplicacion
  ON public.reembolso (id_reembolso)
  WHERE estado = 'APROBADO' AND aplicado_en IS NULL AND NOT revision_aplicacion;
CREATE INDEX IF NOT EXISTS ix_reembolso_conciliar
  ON public.reembolso (conciliar_en, id_reembolso) WHERE conciliar_en IS NOT NULL;
CREATE INDEX IF NOT EXISTS ix_reembolso_origen
  ON public.reembolso (origen, referencia_interna, id_reembolso) WHERE referencia_interna IS NOT NULL;
