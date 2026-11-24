-- Repara los nombres de archivo que se guardaron leídos como latin1 en lugar de UTF-8:
-- una «—» quedaba como «â€”» y una «ñ» como «Ã±». Corrige los comprobantes de reembolsos,
-- los de pagos al anunciante y las imágenes de reclamos.
-- Solo toca un nombre si todos sus caracteres, tomados como bytes, forman UTF-8 válido y hay al
-- menos un carácter de varios bytes. Un nombre bien guardado no cumple eso y queda igual, por eso es
-- reejecutable. Los bytes se arman con el código de cada carácter, sin funciones de conversión.
CREATE OR REPLACE FUNCTION pg_temp.reparar_nombre_archivo(nombre text) RETURNS text
LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE
    WHEN nombre ~ '[Â-ô][\u0080-¿]'
      AND nombre ~ '^(?:[\u0001-\u007f]|[Â-ß][\u0080-¿]|à[ -¿][\u0080-¿]|[á-ìîï][\u0080-¿]{2}|í[\u0080-\u009f][\u0080-¿]|ð[\u0090-¿][\u0080-¿]{2}|[ñ-ó][\u0080-¿]{3}|ô[\u0080-\u008f][\u0080-¿]{2})*$'
    THEN (
      SELECT convert_from(decode(string_agg(lpad(to_hex(ascii(letra)), 2, '0'), '' ORDER BY posicion), 'hex'), 'UTF8')
      FROM regexp_split_to_table(nombre, '') WITH ORDINALITY AS separado(letra, posicion)
    )
    ELSE nombre
  END
$$;

UPDATE public.reembolso
SET comprobante_nombre = pg_temp.reparar_nombre_archivo(comprobante_nombre)
WHERE comprobante_nombre IS DISTINCT FROM pg_temp.reparar_nombre_archivo(comprobante_nombre);

UPDATE public.reclamo_evidencia
SET nombre_archivo = pg_temp.reparar_nombre_archivo(nombre_archivo)
WHERE nombre_archivo IS DISTINCT FROM pg_temp.reparar_nombre_archivo(nombre_archivo);

-- En los pagos al anunciante el nombre va dentro de cada elemento del jsonb; se conserva el orden.
UPDATE public.liquidacion AS liquidacion
SET pagos_anunciante = reparado.pagos
FROM (
  SELECT origen.id_liquidacion, jsonb_agg(
    CASE WHEN jsonb_typeof(elemento.pago -> 'comprobanteNombre') = 'string'
      THEN jsonb_set(elemento.pago, '{comprobanteNombre}', to_jsonb(pg_temp.reparar_nombre_archivo(elemento.pago ->> 'comprobanteNombre')))
      ELSE elemento.pago END
    ORDER BY elemento.orden) AS pagos
  FROM public.liquidacion AS origen
  CROSS JOIN LATERAL jsonb_array_elements(origen.pagos_anunciante) WITH ORDINALITY AS elemento(pago, orden)
  WHERE jsonb_typeof(origen.pagos_anunciante) = 'array'
  GROUP BY origen.id_liquidacion
) AS reparado
WHERE liquidacion.id_liquidacion = reparado.id_liquidacion
  AND liquidacion.pagos_anunciante IS DISTINCT FROM reparado.pagos;

DROP FUNCTION pg_temp.reparar_nombre_archivo(text);
