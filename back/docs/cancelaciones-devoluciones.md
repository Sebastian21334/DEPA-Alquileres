# Cancelaciones, devoluciones, reclamos y contracargos

## Política de cancelación

La cancelación de una reserva **pendiente de pago** es inmediata y no genera
devolución. Las fechas se liberan al cancelar.

La cancelación de una reserva **pagada** requiere una solicitud
y una decisión administrativa. La reserva no se cancela hasta que el reembolso
quede registrado cuando corresponde una devolución. El inquilino puede
enviar el pedido hasta el día anterior al ingreso, inclusive. Si faltan menos
de 2 días calendario, se muestra una advertencia de devolución del 0 % y debe
aceptar los términos, que aclaran que no recibirá una devolución. Desde la
fecha de ingreso el inquilino no puede solicitar la cancelación, aunque no se haya
validado el código de alojamiento. Se puede solicitar con cualquier medio
de pago admitido para reservar. Si el pago se hizo con tarjeta u otro medio
distinto de dinero en cuenta de Mercado Pago, la devolución se coordina por
transferencia con administración.

El anunciante puede solicitarla en cualquier momento mientras el código de
ingreso no esté validado, incluso el día del ingreso o después, con devolución
del 100 % al inquilino. Que el código ya esté generado no impide solicitarla.
Se conservan los controles de reserva pagada y vigente y de liquidación sin resolver.

Los siguientes porcentajes se calculan con la fecha de envío de la solicitud,
en días calendario de Argentina. Una aprobación posterior no reduce el porcentaje.
El modal muestra antes de enviar el porcentaje, el importe y la moneda de la devolución
si se aprueba. El servidor registra `creada_en` y usa esa fecha al resolver;
el cliente no puede elegir la fecha ni el importe. La política sigue siendo la
versión aplicable a la fecha del pago. No cambia el esquema de la base.

| Situación al enviar la solicitud | Devolución |
|---|---|
| Inquilino cancela con 7 días o más de anticipación | 100 % |
| Inquilino cancela entre 2 y 6 días antes | 50 % |
| Inquilino cancela el día anterior al ingreso | 0 %, con advertencia antes de enviar |
| Solicitud del Inquilino enviada dentro del plazo, aprobada cuando falta menos de 2 días calendario y la estadía aún no inició | Conserva el porcentaje del día de solicitud |
| Anunciante cancela antes de validar el código, independientemente de la fecha de ingreso | 100 % |
| Administrador cancela antes del inicio | Según la política contratada para otros actores |
| El inquilino solicita desde la fecha de ingreso | No se cancela; solo reclamo |
| Código de ingreso ya validado | No admite nuevas solicitudes de cancelación |

Con devolución del 0 %, la aprobación cancela la reserva, conserva el pago y
libera las fechas, sin generar un registro de reembolso. La solicitud,
la cancelación y la liquidación se actualizan en la misma transacción.

Una solicitud del anunciante no vence por llegar la fecha de ingreso. Si el
código se valida antes de resolverla, la solicitud queda `VENCIDA`, sin crear
una devolución, y se informa el motivo. La aprobación y la validación del código
bloquean la misma reserva: si se aprueba primero, no se permite validar el código
mientras la devolución esté activa. Al confirmar el reembolso se cancela la
reserva y se libera el calendario, incluso si la fecha de ingreso ya pasó.
Para el inquilino se conserva el vencimiento al llegar la fecha de ingreso.

### Módulo de cancelaciones

`CancelacionesModule` (`back/src/cancelaciones/`) es dueño de la solicitud, de la
política de la tabla anterior y de la decisión administrativa. Conserva las
rutas `/reservas/:id/cancelacion`, `/reservas/:id/cancelacion/:idSolicitud` y
`/reservas/cancelaciones/administracion`.

- Consulta la reserva y sus permisos mediante `ReservasService`. La cancelación
  inmediata de una reserva pendiente de pago (`PATCH /reservas/:id/cancelar`)
  sigue en Reservas.
- Al resolver, bloquea la solicitud y decide dentro de una transacción. Una
  segunda resolución de la misma solicitud responde 409.
- Con devolución: crea el reembolso en esa misma transacción, con la clave de
  idempotencia `can:<idSolicitud>`. La reserva se cancela cuando el reembolso
  queda aprobado.
- Sin devolución: pide a `ReservasService.cancelarConRetencionTotal` que
  cancele la estadía, deje la liquidación en revisión y libere las fechas. Si
  alguno de esos pasos falla, la aprobación se revierte y puede reintentarse.

Las devoluciones de cancelaciones anteriores a este módulo conservan su clave
aleatoria: se vinculan con su solicitud por la reserva, no por la clave.

## Reembolsos

`ReembolsosModule` es independiente y reutilizable. Se usa desde cancelaciones,
reclamos, contracargos, pagos tardíos y ajustes administrativos.

Responsabilidades:

- crear el registro `reembolso`;
- validar importe, moneda y saldo;
- ejecutar por Mercado Pago y registrar devoluciones externas verificadas;
- actualizar `pago.amount_refunded`, `pago.refunded_at` y `pago.status`;
- conciliar webhooks y reintentos;
- garantizar idempotencia.

El módulo no decide la política, no cancela reservas y no libera fechas.

### Ejecución

- El administrador solicita la devolución con `PATCH /reservas/reembolsos/:id/ejecutar`.
  Se reembolsa el pago original por Mercado Pago con la clave de idempotencia
  persistida. Si ya hay un identificador externo, la conciliación consulta el
  movimiento. Ante un resultado incierto sin identificador, reutiliza la clave
  durante los 15 minutos siguientes al primer intento.
- Para recuperar una operación incierta con el identificador obtenido de
  Mercado Pago, un administrador puede llamar a
  `PATCH /reservas/reembolsos/:id/conciliar` con `{ "referencia": "<id de reembolso>" }`.
  El backend verifica el pago y el importe en la pasarela antes de confirmarla.

### Estados

`OperacionesReembolsoService` aplica los reembolsos aprobados que tienen
`aplicado_en` vacío. Actualiza la reserva, la liquidación y el expediente
asociado, cuando corresponde, en la misma transacción que la marca de
aplicación. `referencia_interna` identifica la operación que originó el
reembolso y las claves de idempotencia previas se conservan.

La migración vincula orígenes históricos identificables y marca como
aplicados los reembolsos con evidencia concordante en la liquidación. El
listado administrativo expone `revision_aplicacion=true` para los aprobados
históricos ambiguos. Quedan fuera del proceso automático hasta su revisión.

`Reembolso`: `PENDIENTE`, `EN_PROCESO`, `APROBADO`, `RECHAZADO`, `FALLIDO`,
`CANCELADO`.

`Pago`/`Reserva`:

- devolución total: `pago.status = refunded`, `reserva.estado_pago = REEMBOLSADO`,
  `reserva.estado_liquidacion = DEVUELTO_INQUILINO`;
- devolución parcial: el pago sigue `approved`, `pago.amount_refunded` aumenta y
  `reserva.estado_liquidacion = DEVUELTO_PARCIAL_INQUILINO`;
- el estado “reembolsado parcial” se calcula con los reembolsos aprobados, no se
  guarda como valor de `reserva.estado_pago`.

## Reclamos posteriores al ingreso

- El Inquilino puede reclamar desde el inicio de la estadía hasta 7 días corridos
  después de `fecha_fin` (23:59:59 de Argentina).
- El reclamo pasa `reserva.estado_liquidacion` a `EN_REVISION`.
- El Administrador puede escribir al Inquilino y al Anunciante, dejar notas
  internas (`visible_para = ADMIN`) y revisar la evidencia.
- La evidencia admite hasta 5 imágenes JPEG/PNG de 5 MB cada una. Se guardan en
  el contenedor privado `reclamos` y se consultan con URLs firmadas por 15 minutos.
- El reclamo no cancela la reserva ni libera fechas.
- La resolución puede ser sin devolución, con devolución total o con devolución
  parcial. Si hay devolución, se crea un `reembolso` con origen `RECLAMO`.

## Contracargos

Un contracargo (`charged_back`) es una disputa externa de Mercado Pago.

Al recibirlo:

- `pago.status = charged_back`;
- `reserva.estado_pago = CONTRACARGO`;
- `reserva.estado_estadia = EN_DISPUTA` (derivado);
- `reserva.estado_liquidacion = EN_REVISION`;
- se congela el pago al Anunciante y no se liberan fechas.

Si se gana, se restaura el pago aprobado y la liquidación anterior. Si se pierde,
se registra el reembolso por el importe disputado; si la estadía no comenzó y el
contracargo es total, se liberan las fechas.

La cuenta del Anunciante no puede darse de baja mientras exista un contracargo
abierto.

## Migración y configuración

Con el backend detenido, sobre una copia o base descartable:

```sh
node scripts/cancelaciones-devoluciones.cjs
npm run db:cancelaciones-devoluciones
npm run db:seed
```

Variables:

- `AZURE_RECLAMOS_CONTAINER` (por defecto `reclamos`).

El comando aplica la migración de cancelaciones si todavía corresponde y luego
`20261110-estados-por-ambito.sql`. Esta conserva los códigos de estado y pasa
las disputas del enum original o del catálogo histórico al catálogo compartido.
También crea `politica_cancelacion`, que la seed carga con los plazos y porcentajes
vigentes hasta este cambio. Cancelaciones elige la versión por la fecha del pago
en Argentina. Las reservas sin fecha de pago usan la política inicial.
Para modificar la política, agregar una versión con una fecha de vigencia nueva
y conservar las versiones anteriores para las reservas ya pagadas.
