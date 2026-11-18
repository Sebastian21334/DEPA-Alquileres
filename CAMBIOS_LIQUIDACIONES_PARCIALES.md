# Liquidaciones parciales: el anunciante cobra lo que no se devolvió

**Fecha:** 18 de noviembre de 2026.
**Rama:** `fixes/liquidaciones_parciales_correctas`.

Esta entrega corrige el backend para que, cuando al inquilino no se le devuelve
todo lo que pagó, el resto se le pueda liquidar al anunciante. El frontend de esta
corrección queda para la siguiente entrega.

## Resumen

| Caso (pago de $1000) | Reembolsos (al inquilino) | Liquidaciones pendientes (al anunciante) | Antes |
| --- | --- | --- | --- |
| Reclamo sin devolución | — | $1000, con el código validado | Igual |
| Reclamo con devolución parcial de $400 | $400 | $600, después de pagar los $400 | No se podía pagar |
| Reclamo con devolución total | $1000 | No aparece | Igual |
| Cancelación con 100 % | $1000 | No aparece | Igual |
| Cancelación con 50 % | $500 | $500, después de pagar los $500 | Rechazado: «La reserva está cancelada» |
| Cancelación con 0 % | — | $1000 | Rechazado: «sin validar el código» |
| Anunciante bloqueado con importe pendiente | — | En revisión: se cierra y se paga, o se devuelve al inquilino con motivo | El resto de una devolución parcial no se frenaba |

## Reglas de negocio

1. **Lo que no se le devuelve al inquilino es del anunciante.** Importe a
   liquidar = lo pagado − lo devuelto. Se calcula desde el pago, en un solo lugar.
2. **Primero se le paga al inquilino y después al anunciante.** Mientras haya
   una devolución en curso (pendiente, en proceso o fallida), la reserva no
   aparece en Liquidaciones pendientes.
3. **Cuándo se le puede pagar al anunciante:** con el código de alojamiento
   validado, o si la reserva está cancelada (la estadía no va a ocurrir y lo
   retenido le corresponde por la política de cancelación). Sin código y sin
   cancelar, se espera (T36).
4. **Anunciante bloqueado:** todo lo que tenga pendiente de cobro queda en
   revisión. El administrador decide entre pagarle (cerrar la revisión y
   registrar el pago) o devolverle el resto al inquilino.
5. **«Devolver al inquilino» desde Liquidaciones exige un motivo.**

## Situación anterior

- `DEVUELTO_PARCIAL_INQUILINO` se trataba como liquidación cerrada: la reserva
  salía del listado y el pago al anunciante se rechazaba con «La liquidación de
  la reserva ya fue resuelta».
- El listado descartaba cualquier reserva con un reembolso **aprobado**, aunque
  ese importe ya estuviera descontado del pago.
- La cancelación al 0 % dejaba la liquidación `EN_REVISION`, y desde ahí no se
  podía pagar (exigía código validado y no aceptaba reservas canceladas).
- El panel mostraba como importe el total pagado, no el resto.
- La lista de estados «resueltos» estaba copiada en `usuarios.service.ts` y la de
  devoluciones en curso, en tres lugares.

## Decisión de diseño

No se modificó `esLiquidacionResuelta()`: la usan unos doce flujos del lado del
inquilino (reprogramar, cancelar, reportar, confirmar pagos repetidos), que tienen
que seguir viendo la devolución parcial como cerrada. En su lugar se agregó un
concepto explícito, **«pendiente para el anunciante»** (`PENDIENTE_PAGO_PROPIETARIO`
y `DEVUELTO_PARCIAL_INQUILINO`), que solo usan los flujos de pago al anunciante.

No se agregan estados, catálogos, columnas ni migraciones.

## Cambios en el backend

### `liquidaciones/service/liquidaciones.service.ts`

- Nuevos `estadosPendientesParaAnunciante()`, `estadosCerradosParaAnunciante()`,
  `admitePagoAlAnunciante(estado)` y `esLiquidacionCerradaParaAnunciante(estado)`.
- `esLiquidacionResuelta()` reutiliza la lista de cerrados (mismo resultado).
- `listarParaAdministracion()` incluye `DEVUELTO_PARCIAL_INQUILINO`.

### `reembolsos/service/reembolsos.service.ts`

- Nuevo `estadosEnCurso` (pendiente, en proceso y fallido); `estadosActivos`
  pasa a ser «en curso + aprobado». Reemplaza las listas repetidas de
  `registrarSolicitud()` y `actividadInquilino()`.
- `listarActivosPorReservas()` pasa a `listarEnCursoPorReservas()` (un solo
  llamador).
- Nuevo `tieneDevolucionEnCurso(idReserva, transaccion)`.

### `pagos/` (servicio, repositorio e interfaz)

- Nuevo `listarPorReservas(ids)` / `buscarPorReservas(ids)`: trae en una sola
  consulta los pagos del listado de liquidaciones.

### `reservas/service/reservas.service.ts`

- Nuevo `anuncianteHabilitadoParaCobrar(reserva)`: pago aprobado, liquidación
  pendiente para el anunciante y código validado o reserva cancelada.
- Nuevo `liquidacionCerradaParaAnunciante(reserva)`.
- `cancelarConRetencionTotal()` deja la liquidación en `PENDIENTE_PAGO_PROPIETARIO`
  («Cancelación sin devolución: el importe corresponde al anunciante»).
- `conReservaBloqueada()` declara el tipo que ya devolvía (`ReservaRespuestaDto`).

### `operaciones-reserva/service/operaciones-liquidacion.service.ts`

- **Listado:** solo descarta reservas con devoluciones en curso y agrega, por
  reserva, `importe_a_liquidar`, `moneda_liquidacion` y `habilitada_para_pago`.
- **Registrar pago:** usa `anuncianteHabilitadoParaCobrar`, acepta reservas
  canceladas, registra el resto (no el total) y rechaza si no queda importe.
- **Cerrar revisión:** en una reserva cancelada solo se permite hacia
  `PENDIENTE_PAGO_PROPIETARIO`; nunca vuelve a `RETENIDO`.
- **Devolver al inquilino:** el motivo es obligatorio. Desde
  `DEVUELTO_PARCIAL_INQUILINO` se permite y devuelve el resto. Una devolución
  administrativa ya aprobada no se toma como reintento de la nueva.
- `asegurarSinDevoluciones()` usa `tieneDevolucionEnCurso()` (se quitó la lista
  copiada).
- Métodos privados reutilizados: `importeParaAnunciante()`, `monedaLiquidacion()`,
  `conDatosDeLiquidacion()` y `esDevolucion()`.
- El PATCH devuelve los mismos datos que el listado.

### Nuevo `operaciones-reserva/dto/liquidacion-pendiente.dto.ts`

Extiende `ReservaRespuestaDto` con los tres campos derivados del listado.

### `reservas/service/reserva-bloqueo-anunciante.service.ts`

Donde el bloqueo preguntaba «¿la liquidación está resuelta?» para no hacer nada,
ahora pregunta «¿está cerrada para el anunciante?». Así el resto de una
devolución parcial y lo retenido de una cancelación se congelan en revisión, igual
que cualquier liquidación pendiente.

### `usuarios/service/usuarios.service.ts` y `usuarios.module.ts`

La baja de cuenta usa `estadosCerradosParaAnunciante()` en lugar de su lista
copiada. Un anunciante con un resto pendiente ya no puede darse de baja.

## Contrato HTTP

| Endpoint | Cambio |
| --- | --- |
| `GET /reservas/liquidaciones/administracion` | Incluye `DEVUELTO_PARCIAL_INQUILINO` y reservas con reembolsos aprobados. Agrega `importe_a_liquidar`, `moneda_liquidacion` y `habilitada_para_pago`. |
| `PATCH /reservas/:id/liquidacion` | `DEVUELTO_*` sin `observacion` → 400. `PAGADO_PROPIETARIO` permitido en canceladas y desde `DEVUELTO_PARCIAL_INQUILINO`. Sin importe restante → 409. La respuesta incluye los tres campos nuevos. |

Los permisos no cambian: los dos endpoints siguen siendo solo para el administrador.

## Pruebas

En `back/test/cancelaciones-devoluciones.test.cjs`:

- Reclamo con devolución parcial y código validado: no aparece mientras el
  reembolso está pendiente; después aparece con $60 de $100, se paga y el
  historial registra $60. Un segundo pago se rechaza.
- Reclamo con devolución parcial sin código: aparece, pero no se puede pagar.
- Cancelación con 50 %: después de pagarle al inquilino se liquidan $50.
- Cancelación con 0 %: se liquidan $100.
- Cancelada en revisión: no se paga ni vuelve a `RETENIDO`; se cierra la revisión
  y se paga.
- Devolver al inquilino exige motivo (también rechaza solo espacios) y deriva el
  resto ($60) a Reembolsos.
- Por el endpoint HTTP: listado con los campos nuevos, devolución sin motivo
  (400), pago sin ingreso acreditado (409) y pago de una cancelada (200).

En `bloqueo-anunciante.test.cjs`: el resto de una devolución parcial y lo retenido
de una cancelación pasan a revisión al bloquear al anunciante, sin devolver.

En `bajas-y-bloqueos.test.cjs`: el resto pendiente impide la baja del anunciante.

Tests ajustados por los cambios de reglas: la cancelación al 0 % espera
`PENDIENTE_PAGO_PROPIETARIO`; las devoluciones de `liquidaciones.test.cjs` envían
motivo; los tests y la app de Jest que construyen `UsuariosService` reciben el
servicio de liquidaciones.

## Verificación realizada

- `npx tsc --noEmit -p tsconfig.json`: sin errores en el código. Los errores de
  tipos de `test/jest/` (falta de `@types/jest`) ya existían.
- `npx oxlint` sobre los módulos tocados: sin advertencias.
- `npm run build` y `node --test test/*.test.cjs`: 222 de 225. Los 3 que fallan
  ya fallaban en `main` (verificado sobre una copia limpia):
  - «un pago aprobado después de bloquear al anunciante no confirma la reserva»;
  - «el CUIT/CUIL se compara por dígitos, con o sin guiones»;
  - «el CUIT/CUIL de una cuenta dada de baja queda libre para una cuenta nueva».
- `npm run test:jest`: 65 de 65.
- No se probó en la app real porque no hay base local.

## Compatibilidad y alcance

- Sin cambios de esquema ni migraciones.
- Las liquidaciones existentes en `DEVUELTO_PARCIAL_INQUILINO` aparecen en el
  listado con su resto pendiente.
- Las cancelaciones al 0 % anteriores que quedaron `EN_REVISION` no se migran:
  se pueden resolver desde el panel cerrando la revisión.
- **Pendiente (frontend, próxima entrega):** mostrar `importe_a_liquidar`,
  habilitar «Registrar pago» con `habilitada_para_pago`, «Cerrar revisión» en
  canceladas, motivo obligatorio al devolver y etiquetas de liquidación en Mis
  reservas.
- **Pendiente (acordado para el final):** después de pagarle al anunciante, una
  cancelación con 50 % deja de mostrarle al inquilino «Reembolsada parcialmente».
- **Fuera de alcance:** devolución parcial sin código validado (T36), liquidación
  desde el día 5 (T35), historial de liquidaciones (T55) y CBU/PDF en el diálogo de
  pago (T56).

## Coordinación con otros paquetes

- **Paquete 1 (Seba):** `reserva-bloqueo-anunciante.service.ts` (T15), listado y
  validación de liquidaciones (T35 y T36) y baja de cuentas (T08 y T09).
- **Paquete 2 (Santi):** `cancelarConRetencionTotal()` (T38) y los estados en
  curso de `reembolsos.service.ts` (T41, T45 y T54).

Conviene integrar esta rama en `main` antes de que avancen esas tareas.

## Texto propuesto para el documento

> **RN — Liquidación del importe no devuelto.** El importe que no se le devuelve
> al inquilino, ya sea por una cancelación con devolución parcial o sin
> devolución, o por un reclamo resuelto con devolución parcial o sin devolución,
> corresponde al anunciante. El administrador primero gestiona la devolución al
> inquilino y, una vez acreditada, liquida al anunciante la diferencia entre lo
> pagado y lo devuelto. En una reserva cancelada la liquidación no requiere la
> validación del código de alojamiento; en una estadía, sí.
>
> **RN — Liquidaciones de un anunciante bloqueado.** Al bloquear a un anunciante,
> sus liquidaciones pendientes quedan en revisión. El administrador decide
> pagarle lo que corresponde o, indicando el motivo, devolvérselo al inquilino.
