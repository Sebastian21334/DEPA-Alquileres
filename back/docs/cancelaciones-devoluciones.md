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
de pago admitido para reservar. Las tarjetas y el dinero en cuenta usan el mismo
circuito de devolución por Mercado Pago. Si falta el medio del pago o la pasarela
rechaza definitivamente la devolución, se coordina una transferencia con administración.

El anunciante puede solicitarla antes de la fecha de ingreso, hasta el día
anterior inclusive, con devolución del 100 % al inquilino si se aprueba dentro
de ese plazo. Que el código ya esté generado no impide solicitarla.
Se conservan los controles de reserva pagada y vigente y de liquidación sin resolver.

Los siguientes porcentajes se calculan con la fecha de envío de la solicitud,
en días calendario de Argentina. Una aprobación posterior no reduce el porcentaje, pero debe ocurrir antes de la fecha de ingreso.
El modal muestra antes de enviar el porcentaje, el importe y la moneda de la devolución
si se aprueba. El servidor registra `creada_en` y usa esa fecha al resolver;
el cliente no puede elegir la fecha ni el importe. La política sigue siendo la
versión aplicable a la fecha del pago. No cambia el esquema de la base.

El importe se calcula sobre `pago.amount`, en la moneda del pago registrado.
No se usa el monto de la reserva ni se vuelve a convertir el precio de la
publicación. La vista previa y la aprobación comparten este cálculo. Se trabaja
con centavos enteros y se redondea una sola vez: por ejemplo, el 50 % de ARS 75,35
devuelve ARS 37,68. Se conserva el control del saldo disponible de Reembolsos,
incluidas las devoluciones ya confirmadas o reservadas. Las devoluciones anteriores
no se modifican automáticamente.

La lista administrativa de solicitudes pendientes incluye `devolucion` con el
importe, la moneda, el porcentaje y la fecha de solicitud usados en ese mismo
cálculo. El panel muestra esos datos en cada solicitud y antes de confirmar su
aprobación. Un 0 % se muestra con importe cero y una aclaración de que no habrá
devolución; si falta el pago, se informa que el importe no está disponible y se
deshabilita la aprobación en el panel. Consultar la lista no genera reembolsos.

| Situación al enviar la solicitud | Devolución |
|---|---|
| Inquilino cancela con 7 días o más de anticipación | 100 % |
| Inquilino cancela entre 2 y 6 días antes | 50 % |
| Inquilino cancela el día anterior al ingreso | 0 %, con advertencia antes de enviar |
| Solicitud del Inquilino enviada dentro del plazo, aprobada cuando falta menos de 2 días calendario y la estadía aún no inició | Conserva el porcentaje del día de solicitud |
| Anunciante solicita hasta el día anterior al ingreso y se aprueba antes del ingreso | 100 % |
| Inquilino o anunciante solicita desde la fecha de ingreso | No admite nuevas solicitudes de cancelación |
| Código de ingreso ya validado | No admite nuevas solicitudes de cancelación |

Con devolución del 0 %, la aprobación cancela la reserva, conserva el pago y
libera las fechas, sin generar un registro de reembolso. La solicitud,
la cancelación y la liquidación se actualizan en la misma transacción.

Toda solicitud pendiente, del Inquilino o del Anunciante, se considera rechazada
si llega la fecha de ingreso sin resolución. Se registra como `RECHAZADA`, se
conserva la reserva en curso y se habilita el reclamo por demora administrativa
al solicitante. No se genera una devolución por la solicitud rechazada.

Una solicitud aprobada antes del ingreso conserva su devolución pendiente. Si la
confirmación llega después, se completa la cancelación y se libera el calendario
como parte de esa decisión previa; no se vuelve a aprobar ni se modifica el porcentaje.
Mientras la devolución esté activa no se permite validar el código de ingreso.

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

- Los pagos con medio confirmado por Mercado Pago, incluidas tarjetas (por
  ejemplo `visa`, `master`, `amex` o `debvisa`) y dinero en cuenta
  (`account_money`), usan el mismo circuito de devolución por API. Las pruebas
  simulan las respuestas del proveedor: no existe una aprobación ficticia en
  producción ni se configura un modo demo.
- Si falta el medio del pago, se mantiene la gestión por transferencia. Los
  reembolsos que ya tenían `transferencia_manual=true` conservan esa vía. Un
  rechazo definitivo de la pasarela habilita la transferencia en el mismo
  registro; un timeout conserva el resultado incierto y la misma clave de
  idempotencia para conciliar o reintentar, sin habilitar otra devolución manual.
- La consulta de condiciones informa la misma vía que usará el nuevo reembolso.
  No se vuelve a convertir el importe ni se altera la política de cancelación.

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

### Faltantes de una cancelación aprobada

El Inquilino puede consultar `GET /reclamos/cancelacion/:idReserva` y enviar
`POST /reclamos/cancelacion/:idReserva` con una descripción de 20 a 1000
caracteres. El servidor calcula el importe con la política, el autor y la fecha
de la solicitud aprobada, y con el pago original. Descuenta lo ya devuelto y lo
reservado por devoluciones pendientes, en proceso o fallidas. La parte retenida
por la política no es un faltante. El cliente no puede elegir el importe.

Se reutiliza el expediente de Reclamos (categoría existente `OTRO`), vinculado
a la solicitud de cancelación mediante `id_solicitud_cancelacion`. Este reclamo
también admite reservas canceladas y no usa el plazo de los reclamos por estadía.
No altera las fechas ni reabre la liquidación. Solo el Inquilino puede iniciarlo
y solo se admite un reclamo abierto por reserva.

Administración ve el importe esperado, devuelto, en gestión y disponible. Puede
rechazar, devolver una parte o elegir **Completar faltante**. Esta última opción
devuelve exclusivamente la diferencia disponible, aunque la política original
fuese del 50 %. Se vuelve a calcular y se bloquean la reserva y el pago antes de
decidir. Crear el reclamo no mueve dinero; la decisión favorable crea el
complemento con el circuito habitual de Reembolsos y su clave de idempotencia.

La migración aditiva `20261121-reclamo-faltante-cancelacion.sql` conserva los
expedientes anteriores y debe aplicarse antes de iniciar esta versión. Está
incluida en el comando existente de preparación de cancelaciones y devoluciones.

### Problemas de una estadía

- El Inquilino puede reclamar por problemas de la estadía hasta el final del cuarto día
  calendario posterior a `fecha_fin`, antes de habilitarse el pago al anunciante.
  El reclamo por demora administrativa conserva su plazo específico de siete días.
- El reclamo pasa `reserva.estado_liquidacion` a `EN_REVISION`.
- El Administrador puede escribir al Inquilino y al Anunciante, dejar notas
  internas (`visible_para = ADMIN`) y revisar la evidencia.
- La evidencia admite hasta 10 imágenes JPEG/PNG por envío, 30 por reclamo y 5 MB
  por imagen. La descripción y los mensajes conservan sus adjuntos y su autor.
  Se guardan en el contenedor privado `reclamos`, con URLs firmadas por 15 minutos.
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


## Solicitudes sin respuesta y reclamo por demora administrativa

Al llegar la fecha de ingreso, una solicitud todavía PENDIENTE se considera
rechazada por falta de respuesta y se registra como RECHAZADA, con el motivo y
la fecha del rechazo automático. La tarea se ejecuta al iniciar el backend y
cada minuto. También se controla el plazo al intentar resolver o reclamar.
La reserva sigue en curso: no se cancela, no se liberan fechas ni se devuelve
dinero por el rechazo. Las solicitudes históricas VENCIDAS por demora conservan
su estado y también pueden dar lugar a un reclamo dentro del plazo.

El solicitante, ya sea inquilino o anunciante, puede usar «Reclamar por demora
administrativa» desde Mis reservas. El reclamo usa el catálogo existente, con
categoría DEMORA_ADMINISTRATIVA, y se vincula a la solicitud original. Se admite
desde la fecha de ingreso hasta siete días corridos después de finalizar la
estadía, con descripción de 20 a 1000 caracteres y un único reclamo abierto por
reserva. El servidor comprueba que exista una solicitud del usuario que no se
resolvió a tiempo; una solicitud rechazada por administración antes del ingreso
no habilita esta opción.

Presentar este reclamo conserva el estado de la reserva y de su liquidación,
por lo que no bloquea la validación normal del código. Administración lo tramita
mediante el circuito existente de Reclamos y decide cómo resolverlo. No hay
confirmaciones de ausencia, reembolso garantizado ni compensación a cargo de
DEPA por el mero hecho de la demora.

La migración 20261123-reclamo-demora-administrativa.sql incorpora la categoría
y retira la estructura de la excepción descartada únicamente si no tiene
revisiones ni compensaciones registradas. Se detiene antes de eliminarla si
encuentra datos que deban conservarse. Las solicitudes, pagos, reembolsos y
reclamos anteriores se preservan.
