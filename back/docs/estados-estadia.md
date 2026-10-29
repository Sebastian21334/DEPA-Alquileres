# Estados de la estadía

La API serializa `estado_estadia` en cada Reserva, tanto en listados como en
detalles, respuestas de acciones y resúmenes de pagos. Se calcula con las fechas
del período y el ingreso validado. No se almacena otra columna ni se requiere
una migración para esta funcionalidad. `finalizada` conserva los cierres manuales;
para saber si la estadía sigue vigente se usa `estado_estadia`.

El cálculo pertenece a la entidad `Reserva`, mediante `calcularEstadoEstadia()`.
Los servicios consultan su propiedad `estado_estadia`; el controlador y el
repositorio conservan sus responsabilidades de entrada y persistencia. No se
agrega una capa `domain`. Las utilidades compartidas de fecha están en
`common/utils/fechas.ts`.

Con pago aprobado y sin cancelación ni cierre manual:

| Condición | Estado |
| --- | --- |
| Antes del inicio | CONFIRMADA |
| Dentro del período, sin código validado | PENDIENTE_INGRESO |
| Dentro del período, con código validado | EN_CURSO |
| Después del fin, con código validado | FINALIZADA |
| Después del fin, sin código validado | INGRESO_NO_VERIFICADO |
| Fechas ausentes, inválidas o invertidas | FECHAS_A_REVISAR |

Se incluyen los dos extremos del período. La fecha de negocio se calcula en
America/Argentina/Buenos_Aires, independientemente de la zona del servidor o del
navegador. Un período hasta el 30 cambia de estado a las 00:00 del 31.
Los estados de pago pendiente, rechazo, devolución y cancelación tienen prioridad.
Los cierres manuales ya guardados se conservan.

El inquilino puede consultar su código antes del inicio y durante el período.
El anunciante solo puede validarlo durante el período y una sola vez. Las reservas
cerradas o con ingreso no verificado no admiten validar códigos ni reprogramar.
La reprogramación se permite antes del inicio, sin ingreso validado, conservando
los controles de disponibilidad, duración, importes y transacciones existentes.
El cierre manual se permite en una estadía en curso con ingreso validado.

Mis reservas, el resumen y el panel vuelven a consultar cada minuto mientras la
página es visible y al recuperar el foco. Las consultas se descartan al salir.
La pantalla de gestión no refresca durante una escritura; el servidor vuelve a
validar el estado dentro de la transacción y bajo el bloqueo existente.

El paso del tiempo no modifica pagos, liquidaciones, fechas ocupadas ni envía
correos. Ingreso no verificado no demuestra ausencia del huésped: puede requerir
revisión a través del flujo de reclamos existente.
