# Conservación de las condiciones económicas de las reservas

Fecha: 02/11/2026.

## Objetivo

Alinear el flujo de reservas y pagos con RN-35: conservar las condiciones
económicas aceptadas al iniciar el pago y exigir una nueva aceptación cuando
la tarifa o moneda cambien antes de iniciarlo, o cuando el presupuesto venza.

## Situación anterior y resultado

El sistema ya generaba presupuestos firmados, verificaba cambios de precio y
moneda, guardaba condiciones históricas en la reserva y comprobaba los pagos
contra el importe y moneda registrados.

Sin embargo, el presupuesto era opcional en la API de checkout. Para publicaciones
en ARS se podía iniciar el pago sin uno: el servidor utilizaba el precio actual,
sin poder compararlo con un presupuesto previamente mostrado al Inquilino.

Ahora el presupuesto es obligatorio tanto para ARS como para USD. Las solicitudes
sin presupuesto, con uno inválido o vencido se rechazan antes de crear una reserva
o una operación de pago. La pantalla existente ya enviaba el presupuesto; el cambio
cierra la excepción del servidor y refuerza el contrato del frontend.

## Regla aplicada

| Situación | Comportamiento |
| --- | --- |
| Consulta inicial de la publicación | El precio mostrado no fija las condiciones de una reserva. |
| Cambio de tarifa o moneda antes de iniciar el pago | Se rechaza el presupuesto anterior y se requiere generar y aceptar otro. Aplica a aumentos y disminuciones. |
| Presupuesto vencido | Se requiere generar y aceptar otro antes de pagar. |
| Cambio del dólar mientras el presupuesto sigue vigente | Se conserva la conversión del presupuesto si la tarifa y moneda de la publicación no cambiaron. |
| Inicio del pago con presupuesto válido | Se guardan las condiciones aceptadas y se bloquean las fechas según los controles existentes. |
| Cambio de la publicación después de iniciar el pago | No recalcula la operación pendiente durante su vigencia ni las reservas confirmadas. |
| Confirmación del pago | Se compara con el importe y moneda registrados para esa operación, sin usar el precio o dólar actuales. |

El presupuesto vence a los quince minutos de su emisión. Iniciar el checkout no
reinicia ese plazo: la reserva pendiente y la preferencia de pago conservan el
vencimiento del presupuesto.

## Cambios en el backend

### Presupuesto obligatorio en la solicitud

En `back/src/pagos/dto/crear-checkout.dto.ts`:

- Se eliminó `@IsOptional()` de `presupuesto_token`.
- Se agregó `@IsNotEmpty()` con un mensaje que indica cotizar y aceptar un presupuesto.
- El campo pasó de opcional a obligatorio en TypeScript.
- Se conservaron la validación de texto y el límite de 8192 caracteres.

### Validación antes de crear la reserva

En `back/src/pagos/service/pagos.service.ts`, `crearCheckout()` siempre llama a
`PresupuestosService.validar()`. Se eliminó la alternativa que continuaba sin
condiciones económicas validadas. Se mantienen los controles existentes de firma,
usuario, publicación, fechas y vencimiento del presupuesto.

### Reserva con condiciones obligatorias

En `back/src/reservas/service/reservas.service.ts`:

- `crearPendiente()` exige `CondicionesCobro` y rechaza su ausencia también en ejecución.
- Se eliminó la excepción que exigía presupuesto únicamente para USD.
- El importe del cobro se toma siempre del presupuesto validado.
- Se eliminaron los valores alternativos que calculaban el importe o el vencimiento sin presupuesto.
- La aceptación, emisión y vencimiento se registran siempre para las nuevas reservas.
- Se mantienen las comprobaciones de tarifa, moneda, disponibilidad y vencimiento dentro de la transacción del calendario.

## Condiciones históricas conservadas

Se reutilizan los campos y relaciones existentes; este ajuste no agrega columnas.

| Dato | Campo o registro existente |
| --- | --- |
| Tarifa diaria en la moneda original | `precio_unitario_contratado` |
| Moneda de la publicación al contratar | `moneda_origen` |
| Importe total en la moneda original | `importe_origen` |
| Importe del cobro aceptado | `importe_contratado` y `monto_pago` |
| Moneda del cobro | `moneda_contratada`, actualmente ARS |
| Fechas y cantidad de días | `fecha_inicio` y `fecha_fin`; la cantidad se obtiene incluyendo ambos extremos |
| Cotización utilizada, cuando corresponde | Relación `cotizacion_dolar` con un registro histórico inmutable |
| Valor, tipo, proveedor y fechas de la cotización | Datos del registro histórico de cotización |
| Momento de aceptación | `cotizacion_aceptada_en`; también se registra para presupuestos ARS |
| Emisión y vencimiento del presupuesto | `presupuesto_emitido_en` y `presupuesto_vence_en` |
| Vencimiento de la operación pendiente | `pago_vencimiento` |

Para publicaciones en USD se conserva la tarifa original y la referencia a la
cotización aceptada. El cobro se realiza en ARS conforme al presupuesto; no se
convierte nuevamente cuando Mercado Pago informa la aprobación.

## Cambio en el frontend

En `front/src/app/shared/services/reservation.service.ts`, el argumento de
`createCheckout()` ahora exige `presupuesto_token: string`.

La pantalla de detalle ya obtenía y enviaba ese token. También conservaba el
tratamiento del error de conflicto para descartar un presupuesto desactualizado
y permitir volver a cotizar. No fue necesario modificar su interfaz visual.

## Documentación y pruebas

Se actualizó `back/docs/cotizaciones-cobros.md` para eliminar la excepción de ARS,
documentar RN-35 e indicar cómo ejecutar las pruebas.

Se agregó `back/test/condiciones-economicas.test.cjs` y el comando
`test:condiciones-economicas` en `back/package.json`.

Desde la carpeta `back`:

```powershell
npm run test:condiciones-economicas
```

El comando compila el backend y ejecuta 22 pruebas automatizadas que cubren:

- Tokens ausentes, nulos, vacíos o de un tipo incorrecto.
- Imposibilidad de omitir el presupuesto en ARS y USD, incluso llamando a los servicios.
- Aumentos, disminuciones y cambios de moneda antes de iniciar el pago.
- Generación de un nuevo presupuesto para continuar después de esos cambios.
- Rechazo al alcanzar el vencimiento, en ambas monedas.
- Conservación de los datos históricos al aprobar el pago después de cambiar la publicación.
- Conservación de la conversión si cambia el dólar con un presupuesto vigente.
- Revalidación de precio, moneda y vencimiento después de esperar el bloqueo del calendario.
- Rechazo de pagos cuyo importe o moneda no coinciden con los registrados.

Las pruebas usan los servicios de la aplicación con repositorios y pasarela
simulados. No acceden a PostgreSQL ni generan cobros reales en Mercado Pago.

## Verificación realizada

- Backend: compilación correcta y 22 pruebas aprobadas.
- Backend: `npm run lint` sin errores.
- Frontend: `npm run build` correcto.
- Frontend: se mantienen las advertencias anteriores por el tamaño del paquete
  inicial y de los estilos de `publication-detail.component.scss`.
- `git diff --check` sin errores de espacios en los cambios revisados.

## Compatibilidad y alcance

- No se requieren migraciones de base de datos por este ajuste ni se modifican reservas anteriores.
- Los clientes que omitían el presupuesto deberán solicitarlo mediante
  `POST /pagos/presupuesto` y enviarlo a `POST /pagos/checkout`.
- No cambian las rutas de la API ni el proveedor o método de conversión existente.
- Este ajuste no incorpora nuevas reglas de conciliación de pagos tardíos,
  devoluciones ni liquidaciones; esos procesos conservan su tratamiento existente.
- La suite no reemplaza una prueba de integración con PostgreSQL y Mercado Pago.
