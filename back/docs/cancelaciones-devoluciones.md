# Cancelaciones, devoluciones, reclamos y contracargos

## Política de cancelación

La cancelación de una reserva **pendiente de pago** es inmediata y no genera
devolución. Las fechas se liberan al cancelar.

La cancelación de una reserva **pagada** antes del inicio requiere una solicitud
y una decisión administrativa. La reserva no se cancela hasta que el reembolso
quede registrado, salvo que el porcentaje sea 0 %.

| Situación | Devolución |
|---|---|
| Inquilino cancela con 7 días o más de anticipación | 100 % |
| Inquilino cancela entre 2 y 6 días antes | 50 % |
| Inquilino cancela con menos de 48 horas | 0 % |
| Anunciante o Administrador cancela antes del inicio | 100 % |
| La estadía ya comenzó o terminó | No se cancela; solo reclamo |

Si la solicitud llega a la fecha de inicio sin resolución, queda `VENCIDA`.
Después del inicio no se admite cancelación con devolución automática: el
Inquilino debe abrir un reclamo.

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
- Sin devolución (0 %): pide a `ReservasService.cancelarConRetencionTotal` que
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
- ejecutar por Mercado Pago o registrar manualmente;
- actualizar `pago.amount_refunded`, `pago.refunded_at` y `pago.status`;
- conciliar webhooks y reintentos;
- garantizar idempotencia.

El módulo no decide la política, no cancela reservas y no libera fechas.

### Modos de ejecución

- `MP_REFUNDS_ENABLED=false` (por defecto): el Administrador registra la
  devolución manualmente con una referencia o comprobante.
- `MP_REFUNDS_ENABLED=true`: se reembolsa el pago original con la clave de
  idempotencia persistida. Si hay un identificador externo, la conciliación
  consulta el movimiento. Ante un resultado incierto sin identificador, reusa
  la clave durante los 15 minutos siguientes al primer intento.
- Para recuperar una operación incierta con el identificador obtenido de
  Mercado Pago, un administrador puede llamar a
  `PATCH /reservas/reembolsos/:id/conciliar` con `{ "referencia": "<id de reembolso>" }`.
  El backend verifica el pago y el importe en la pasarela antes de confirmarla.
- En ningún modo se marca `APROBADO` sin una referencia o confirmación.

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

- `MP_REFUNDS_ENABLED` (`false` por defecto).
- `AZURE_RECLAMOS_CONTAINER` (por defecto `reclamos`).

El comando aplica la migración de cancelaciones si todavía corresponde y luego
`20261110-estados-por-ambito.sql`. Esta conserva los códigos de estado y pasa
las disputas del enum original o del catálogo histórico al catálogo compartido.
También crea `politica_cancelacion`, que la seed carga con los plazos y porcentajes
vigentes hasta este cambio. Cancelaciones elige la versión por la fecha del pago
en Argentina. Las reservas sin fecha de pago usan la política inicial.
Para modificar la política, agregar una versión con una fecha de vigencia nueva
y conservar las versiones anteriores para las reservas ya pagadas.
