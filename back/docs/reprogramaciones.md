# Reprogramación de reservas: política para RN-18 y RF18

El inquilino puede cambiar las fechas de una reserva pagada, abierta y con una
publicación existente. El nuevo rango debe contener exactamente la misma cantidad
de días (se incluyen ambos extremos) y estar disponible. Puede conservar días del
rango propio. La operación cambia reserva y calendario en una sola transacción.

## Estados y condiciones

- Solo puede reprogramar el Inquilino que realizó la reserva.
- La reserva debe estar pagada, `CONFIRMADA`, no cancelada, no finalizada y antes
  de la fecha de inicio.
- No debe tener el código de alojamiento validado.
- No debe tener un reclamo o liquidación `EN_REVISION`, ni una liquidación
  resuelta (`PAGADO_PROPIETARIO` o `DEVUELTO_INQUILINO`).
- La publicación debe existir. Se permite reprogramar aunque esté inactiva,
  porque la reserva ya fue confirmada; las fechas nuevas deben seguir disponibles.
- El nuevo inicio no puede ser anterior a hoy y el nuevo fin no puede ser anterior
  al inicio.
- Deben existir condiciones económicas verificables: precio unitario, importe,
  monto pagado y moneda contratada. Si falta alguna o el monto no coincide con el
  importe contratado, se rechaza y se solicita revisión.
- No se limita la cantidad de reprogramaciones: cada una debe cumplir las mismas
  condiciones. Tampoco se exige una anticipación mínima adicional; el límite es
  el inicio de la estadía.

La reprogramación conserva el total pagado, la tarifa y la moneda contratadas.
Nunca toma el precio actual de la publicación ni genera cobros o devoluciones.
Cambiar la duración requiere un futuro flujo de ajuste económico y aceptación;
actualmente se rechaza tanto ampliar como acortar la estadía.

Las nuevas reservas guardan precio unitario, importe y moneda al contratar.
La moneda es la utilizada por el checkout configurado. Para reservas anteriores,
la migración recupera importe y moneda de un pago aprobado. No estima la tarifa
original si no existe evidencia histórica. Si faltan condiciones verificables o
el importe de la reserva difiere del contratado, se exige revisión antes del cambio.
No se corrigen importes anteriores automáticamente.

En Mis reservas, el inquilino elige el inicio; el fin se calcula conservando la
duración. Antes de confirmar ve fechas anteriores, nuevas, total y moneda. El
servidor vuelve a validar todas las condiciones y la disponibilidad bajo bloqueo.

Cada cambio guarda un historial y un aviso pendiente al anunciante en la misma
transacción. Después del commit se envía un correo con el antes y después y el
total conservado. No requiere aprobación del anunciante. Un error del correo no
revierte las fechas ni se presenta como éxito del envío: ambas partes pueden ver
el aviso pendiente y reintentarlo desde Mis reservas, incluso tras recargar.
Los reintentos no vuelven a modificar el calendario y se serializan por aviso.
Repetir las mismas fechas no crea otro evento. Si el proveedor entrega el correo
pero falla la confirmación local, un reintento podría repetir ese correo.

El destinatario del aviso es el Anunciante. El Inquilino ve el cambio y su
historial en la interfaz; no se envía un correo al Inquilino ni al Administrador.
Si el Anunciante no tiene correo registrado, el aviso queda pendiente y la
operación de fechas no se revierte.

## Organización del código

`ReservaReprogramacionService` es un servicio interno de `ReservasModule`.
Concentra el cambio de fechas y la coordinación del reintento del aviso.
Reutiliza las entidades, repositorios y transacción del calendario existentes;
no requiere un módulo ni tablas adicionales.

El controlador conserva las rutas `PATCH /reservas/:id/fechas` y
`PATCH /reservas/:id/reprogramaciones/:idCambio/notificar`, con los mismos DTO
y controles de autenticación. Solo el inquilino puede cambiar fechas. Para
reintentar el aviso se reutiliza la consulta autorizada de `ReservasService`,
que exige que el usuario participe en la reserva.

`ReservaNotificacionesService` conserva el registro y envío de los avisos,
delegando el contenido y transporte del correo en `MailService`.
`ReservaLiquidacionesService` conserva los códigos de ingreso, reportes y
liquidaciones. La separación no modifica las reglas ni el esquema de datos.

La extracción se comprobó con compilación, oxlint y 42 pruebas externas al
repositorio, incluidas las rutas HTTP. Se utilizaron persistencia y correo
simulados: no fue una prueba contra PostgreSQL ni un envío real.

## Preparación de una base existente

Antes de iniciar esta versión con una base existente, detener el backend, aplicar
primero la migración de unicidad del calendario y luego, desde `back`:

```sh
node scripts/reprogramacion-reservas.cjs
npm run db:reprogramacion-reservas
```

El primer comando informa reservas que requieren revisión. El segundo prepara
las columnas y el historial; no ejecuta pagos ni envía correos. Aplicar antes de
arrancar: `synchronize` está desactivado y el backend requiere el esquema migrado.
