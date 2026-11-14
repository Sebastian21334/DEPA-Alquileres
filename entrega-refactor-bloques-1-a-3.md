# DEPA Alquileres — cambios implementados en los bloques 1 a 3

Rama `refactor/base-para-cancelaciones` · Commit `e782c5f` · Cambios sobre la implementación del bloque 1 en `2164ead`.

## Bloque 1 — Correcciones a Cancelaciones

- Se versionó la política de cancelación en base de datos. Se selecciona por la fecha de pago y la política inicial cubre las reservas históricas. Se incorporó la carga de la política a `npm run db:seed`.
- El alta bloquea la reserva antes de buscar solicitudes activas. Si ya hay una solicitud aprobada con devolución activa, la consulta y el reintento recuperan esa solicitud.
- La resolución bloquea la solicitud y vuelve a validar la reserva. La aprobación y el registro del reembolso se confirman juntos, con clave `can:<idSolicitud>`. Si corresponde retención total, la cancelación y la liberación de fechas quedan en la misma transacción. Si falla una escritura, se revierte el conjunto.
- En Mis Reservas se distingue una solicitud pendiente de una aprobada cuya devolución sigue activa.

Archivos principales · `back/src/cancelaciones/`, `back/migrations/20261113-politica-cancelacion.sql`, `back/scripts/seed.cjs` y `front/src/app/features/mis-reservas/`.

## Bloque 2 — Separación de Pagos y Mercado Pago

- `PagosModule` absorbió `PagosPersistenciaModule`. `PagosService` registra y consulta pagos con su repositorio privado.
- `MercadoPagoModule` reemplazó `PasarelaModule`. Expone `MercadoPagoService` y mantiene privado el adaptador del SDK.
- `OperacionesReservaModule` recibió presupuesto, checkout, webhook, consultas y conciliación. Conserva las rutas `/pagos` y sus permisos.
- El webhook de pagos exige `MP_WEBHOOK_SECRET`. La conciliación consulta a Mercado Pago y valida importe y moneda. El alta del contracargo y el congelamiento de la liquidación se confirman en la misma transacción. Los avisos repetidos conservan la confirmación original.

Archivos principales · `back/src/pagos/`, `back/src/mercado-pago/`, `back/src/operaciones-reserva/` y `back/src/disputas/`.

## Bloque 3 — Reembolsos y conciliación

- `ReembolsosService` concentra saldo, cobertura y ejecución sobre el pago original. `OperacionesReembolsoService` coordina la conciliación y la aplicación de los efectos. Se retiraron los servicios anteriores de cobertura y aplicación de reembolsos de Reservas.
- Los reintentos consultan por identificador externo cuando está disponible. Si se perdió la respuesta antes de guardarlo, se reutiliza la clave de idempotencia del primer intento durante 15 minutos. Un contracargo perdido registra la reversión ya realizada por Mercado Pago.
- `referencia_interna` vincula el origen. `aplicado_en` se guarda en la misma transacción que los efectos sobre reserva, liquidación, calendario y expediente cuando corresponda. El proceso periódico consulta los pendientes de aplicar.
- La migración conserva las claves históricas. Los aprobados sin evidencia suficiente quedan con `revision_aplicacion=true` y requieren revisión. La ruta administrativa `PATCH /reservas/reembolsos/:id/conciliar` verifica en Mercado Pago el identificador y el importe de un intento incierto.

Archivos principales · `back/src/reembolsos/`, `back/src/operaciones-reserva/service/operaciones-reembolso.service.ts` y `back/migrations/20261113-aplicacion-reembolsos.sql`. Las migraciones quedaron integradas en `npm run db:cancelaciones-devoluciones`.

## Verificación realizada

Pasaron la compilación, el lint y 226 pruebas del backend. En PostgreSQL 18 se verificaron notificaciones repetidas y devoluciones parciales concurrentes con la pasarela simulada.
