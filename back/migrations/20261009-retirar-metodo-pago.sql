-- Ejecutar con scripts/retirar-metodo-pago.cjs antes de iniciar el nuevo back.
-- El runner respalda el catálogo y las relaciones y ejecuta ambas operaciones
-- dentro de una transacción. Sin CASCADE: dependencias inesperadas abortan.
ALTER TABLE public.reserva DROP COLUMN IF EXISTS id_metodo_pago;
DROP TABLE IF EXISTS public.metodo_pago;
