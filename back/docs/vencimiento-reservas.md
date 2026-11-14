# Bloqueo, vencimiento y liberación de fechas

Este documento describe la política implementada para reservas temporales y el tratamiento de pagos demorados. Complementa RN-16, RN-19 y CU41 del informe del proyecto.

## Bloqueo al crear la reserva

- Al crear una reserva pendiente, el sistema verifica el rango y bloquea cada día en la misma transacción.
- Las fechas quedan asociadas a la reserva antes de enviar al inquilino a Mercado Pago.
- Una fecha no puede quedar asociada a dos reservas: el calendario se modifica bajo el bloqueo de la publicación y existe una restricción única por publicación y día.
- Si la creación de la preferencia de pago falla, la reserva se cierra y las fechas se liberan.

## Vencimiento de los 15 minutos

- El presupuesto debe estar vigente al crear la reserva. El plazo de pago empieza al crearla y dura 15 minutos. `pago_vencimiento` se guarda como un instante con zona horaria para compartirlo entre instancias del backend.
- `ReservasService.expirarPendientes()` busca reservas `PENDIENTE` con `pago_vencimiento < ahora`, las cierra con estado `CANCELADO` y libera sus fechas.
- El proceso se ejecuta:
  1. al iniciar el backend;
  2. cada 60 segundos mientras el backend está activo;
  3. antes de crear una nueva reserva, como medida defensiva.
- El vencimiento está en la base, por lo que un reinicio no deja fechas bloqueadas. Si hay varias instancias, el bloqueo de cada reserva y la condición de estado hacen que la operación sea idempotente.
- Un error al consultar o liberar una reserva se registra en el log y no impide procesar las demás.

## Pagos demorados y conciliación

Cuando Mercado Pago informa un pago aprobado sobre una reserva ya cerrada:

1. Si el pago fue aprobado dentro del plazo (`fechaPago <= pago_vencimiento`) y las fechas siguen libres, la reserva se reactiva: se vuelven a bloquear las fechas, se emite el código de alojamiento y se confirma.
2. Si las fechas ya fueron reasignadas, el pago llegó fuera de plazo o la reserva había sido cancelada manualmente, la reserva queda:
   - `estado_pago = APROBADO`;
   - `cancelada = true`;
   - `estado_liquidacion = EN_REVISION`;
   - sin código de alojamiento;
   - con una observación que indica que requiere devolución.
3. La reserva aparece en `GET /reservas/liquidaciones/administracion` para que un administrador registre la devolución. No se habilita el pago al propietario sin código validado.
4. Un webhook repetido no vuelve a confirmar, no genera otro código y no duplica la revisión.

## Notificaciones

- La confirmación de reserva se envía únicamente cuando la reserva queda efectivamente confirmada.
- Los pagos en revisión no se presentan como una reserva confirmada.
- Las banderas `email_confirmacion_inquilino_enviado` y `email_nueva_reserva_anunciante_enviado` permiten reintentar solo los correos pendientes si Mercado Pago repite la notificación.
- La liberación por vencimiento no envía un correo nuevo; el estado cancelado queda disponible en la consulta de la reserva.

## Consultas y administración

- `GET /reservas/mis-reservas` muestra la reserva cancelada y su estado de liquidación.
- `GET /reservas/recibidas` excluye reservas canceladas.
- `GET /reservas/liquidaciones/administracion` incluye las reservas en revisión.
- `PATCH /reservas/:id/liquidacion` permite registrar la devolución al inquilino.

## Compatibilidad

No se agregaron columnas ni migraciones. Se reutilizan `pago_vencimiento`, `estado_pago`, `estado_liquidacion`, `observacion_liquidacion` y `fecha_resolucion_liquidacion`.
