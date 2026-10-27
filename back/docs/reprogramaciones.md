# Reprogramación de reservas: política para RN-18 y RF18

El inquilino puede cambiar las fechas de una reserva pagada, abierta y con una
publicación existente. El nuevo rango debe contener exactamente la misma cantidad
de días (se incluyen ambos extremos) y estar disponible. Puede conservar días del
rango propio. La operación cambia reserva y calendario en una sola transacción.

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

Antes de iniciar esta versión con una base existente, detener el backend, aplicar
primero la migración de unicidad del calendario y luego, desde `back`:

```sh
node scripts/reprogramacion-reservas.cjs
npm run db:reprogramacion-reservas
```

El primer comando informa reservas que requieren revisión. El segundo prepara
las columnas y el historial; no ejecuta pagos ni envía correos. Aplicar antes de
arrancar: `synchronize` está desactivado y el backend requiere el esquema migrado.
