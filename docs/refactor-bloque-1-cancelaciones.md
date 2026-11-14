# Refactor — Bloque 1: Cancelaciones como flujo piloto

**Rama:** `refactor/base-para-cancelaciones` · **Base:** `3bea3d6` (Prepara la base y el plan del refactor) · **Fecha:** 12/11/2026

Este documento lista todos los archivos tocados para implementar el bloque 1 de
`plan-refactorizacion-seminario-integrador.md` y cómo se verificó cada criterio
de aceptación.

## 1. Alcance

Se implementó **solo el bloque 1 (Cancelaciones)**. El plan indica que la
implementación se hace por bloques aprobados y que la primera revisión es este
bloque; los bloques 2 a 6 no se tocaron.

Qué quedó hecho:

- `back/src/cancelaciones/` es un módulo nuevo, dueño de la solicitud de
  cancelación, de la política de devolución y de la decisión administrativa.
- Reservas dejó de conocer las solicitudes. Expone una operación propia que
  cancela la estadía sin devolución y libera el calendario.
- Reembolsos puede registrar una devolución dentro de la transacción del
  servicio que coordina. La devolución de una solicitud tiene una identidad
  estable: `can:<idSolicitud>`.
- Rutas, permisos, DTO y respuestas son los mismos. No hay cambios de esquema,
  de migraciones, de seed ni de frontend.

## 2. Archivos tocados

Son 22 archivos: 5 nuevos, 3 movidos, 9 modificados en `back/src`, 2 de pruebas
y 3 de documentación.

### Nuevos (`back/src/cancelaciones/`)

| Archivo | Contenido |
|---|---|
| `cancelaciones.module.ts` | Único módulo de la carpeta. Importa Catálogos, Reservas, Reembolsos y Seguridad. El token del repositorio queda privado. |
| `controller/cancelaciones.controller.ts` | Las cuatro rutas de solicitudes, con el prefijo `/reservas` y los mismos guards. Solo delega en `CancelacionesService`. |
| `service/cancelaciones.service.ts` | `solicitar`, `consultarActiva`, `listarPendientes` y `resolver`. Contiene la política (100 % / 50 % / 0 %) que antes estaba en `ReservasService`. |
| `repository/cancelaciones.repository.interface.ts` | Interfaz y token `CANCELACIONES_REPOSITORY`. |
| `repository/cancelaciones.repository.ts` | Consultas y escrituras de solicitudes que estaban en `ReservaRepository`. `buscarParaResolver` bloquea la fila dentro de la transacción. |

### Movidos (con `git mv`, conservan historial)

| Antes | Ahora | Cambio |
|---|---|---|
| `back/src/reservas/entity/solicitud-cancelacion.entity.ts` | `back/src/cancelaciones/entity/solicitud-cancelacion.entity.ts` | Solo la ruta del import de `Reserva`. Misma tabla y mismas columnas. |
| `back/src/reservas/dto/solicitar-cancelacion.dto.ts` | `back/src/cancelaciones/dto/solicitar-cancelacion.dto.ts` | Sin cambios. |
| `back/src/reservas/dto/resolver-solicitud-cancelacion.dto.ts` | `back/src/cancelaciones/dto/resolver-solicitud-cancelacion.dto.ts` | Sin cambios. |

### Modificados en `back/src`

| Archivo | Cambio |
|---|---|
| `app.module.ts` | Registra `CancelacionesModule`. |
| `reservas/controller/reservas.controller.ts` | Se quitan las cuatro rutas de solicitudes y sus imports. `PATCH :id/cancelar` (reserva pendiente de pago) sigue acá. |
| `reservas/service/reservas.service.ts` | Se quitan `solicitarCancelacion`, `consultarSolicitudCancelacion`, `listarSolicitudesCancelacion`, `resolverSolicitudCancelacion` y la política. Se agrega `cancelarConRetencionTotal(idReserva, actor, motivo, transaccion)`. El constructor no cambia. |
| `reservas/repository/reserva.repository.interface.ts` | Se quitan los cinco métodos de solicitudes. Se agrega `enTransaccion(transaccion)`. |
| `reservas/repository/reserva.repository.ts` | Ídem. `conTransaccion` reutiliza `enTransaccion`. |
| `reservas/reservas.module.ts` | `SolicitudCancelacion` sale de `TypeOrmModule.forFeature`. |
| `reembolsos/service/reembolsos.service.ts` | `crearSolicitud` y `crearSolicitudConResultado` aceptan una `transaccion` opcional. El cuerpo de la transacción pasó sin cambios a `registrarSolicitud` (privado). Sin `transaccion` se comporta igual que antes. |
| `reembolsos/repository/reembolsos.repository.interface.ts` | Se agrega `enTransaccion(transaccion)`. |
| `reembolsos/repository/reembolsos.repository.ts` | Ídem. `conTransaccion` lo reutiliza. |

### Pruebas (`back/test/`)

| Archivo | Cambio |
|---|---|
| `cancelaciones-devoluciones.test.cjs` | Usa `CancelacionesService` en lugar de los métodos de `ReservasService`. Suma 6 pruebas (ver §4) y amplía la prueba de API con permisos y contrato de las rutas. |
| `respuestas-modulos.test.cjs` | La consulta de la solicitud activa se prueba contra `CancelacionesService` y agrega el caso de un usuario ajeno (403). |

### Documentación

| Archivo | Cambio |
|---|---|
| `docs/arquitectura.md` | Fila `cancelaciones` en el mapa de módulos, transacción compartida en §5 y cifra de pruebas en §10. |
| `back/docs/cancelaciones-devoluciones.md` | Sección "Módulo de cancelaciones". |
| `docs/refactor-bloque-1-cancelaciones.md` | Este documento. |

## 3. Contrato HTTP (sin cambios)

| Ruta | Acceso | Antes | Ahora |
|---|---|---|---|
| `GET /reservas/cancelaciones/administracion` | Administrador | `ReservasController` | `CancelacionesController` |
| `POST /reservas/:id/cancelacion` | Inquilino o Anunciante de la reserva | `ReservasController` | `CancelacionesController` |
| `GET /reservas/:id/cancelacion` | Inquilino o Anunciante de la reserva | `ReservasController` | `CancelacionesController` |
| `PATCH /reservas/:id/cancelacion/:idSolicitud` | Administrador | `ReservasController` | `CancelacionesController` |
| `PATCH /reservas/:id/cancelar` | Inquilino o Anunciante de la reserva | `ReservasController` | Sin cambios |

Los dos controladores comparten el prefijo `/reservas`. Ninguna ruta de uno
coincide con una del otro, así que el orden de registro no influye.

## 4. Criterios de aceptación del plan

| Criterio | Cómo se cumple | Prueba |
|---|---|---|
| Permisos, rutas y respuestas actuales | Mismas rutas y guards. El permiso de participante lo sigue decidiendo `ReservasService.buscarPorId`. La respuesta conserva `reserva.estado_estadia`. | "la API integra módulos, permisos, cancelación y devolución manual": 401 sin sesión, 403 para un usuario ajeno y para un no administrador, 400 con DTO inválido, 409 al resolver dos veces. |
| Dos resoluciones simultáneas producen una sola devolución | `resolver` bloquea la solicitud (`FOR UPDATE`) antes de leer el estado y decide en la misma transacción. Además, la devolución usa la clave `can:<idSolicitud>`. | "resolver dos veces la misma solicitud deja una sola devolución" y "la resolución bloquea la solicitud antes de leer su estado y decide en la misma transacción". |
| Si falla la liberación de fechas se revierte la aprobación y los demás efectos locales | Aprobación, cancelación de la estadía, liquidación y calendario comparten una transacción. | "si falla la liberación de fechas se revierte la aprobación y se puede reintentar". |
| Identidad estable basada en el ID de la cancelación | `idempotency_key = can:<idSolicitud>`. El reembolso se registra en la transacción de la decisión. | "la devolución de una cancelación queda identificada por su solicitud" y "si falla la aprobación no queda una devolución sin decisión". |

La prueba "rechazar o dejar vencer una solicitud no cancela la reserva ni crea
devoluciones" cubre los caminos que no mueven dinero.

## 5. Verificación ejecutada

Desde `back/`, con la base de pruebas del proyecto (PGlite, `test/soporte/postgres-pruebas.cjs`):

| Control | Resultado |
|---|---|
| `npm run build` | Sin errores. |
| `npx oxlint src/` | Sin advertencias. |
| `npx tsc --noEmit -p tsconfig.json` | Sin errores en `src/`. Los de `test/jest` por tipos de Jest ya existían. |
| `node --test test/*.test.cjs` | 181/181 (antes del cambio: 175/175). |
| `npm run test:jest` | 34/34. |

### Lo que no se pudo verificar

- **Concurrencia real.** PGlite usa una sola sesión: dos transacciones en
  paralelo no se bloquean entre sí. Por eso las pruebas comprueban el orden del
  bloqueo y la idempotencia de forma determinista, pero no se ejecutaron dos
  resoluciones realmente simultáneas contra PostgreSQL.
- **Frontend.** No se probó en el navegador. Las rutas y las respuestas no
  cambian, y `front/` no se modificó.

## 6. Decisiones y pendientes

### Del plan, para confirmar antes de seguir

- **Política persistida (§5 del plan, decisión 1).** La política sigue en
  código, ahora dentro de `CancelacionesService`. Persistir tramos, porcentajes
  y vigencia necesita una tabla, una migración y definir qué versión se asigna a
  las reservas existentes.
- **Vínculo de las solicitudes históricas.** Las devoluciones anteriores tienen
  una clave aleatoria, así que no se pueden vincular por clave. No se agregó
  ninguna relación obligatoria. Se pueden vincular por reserva y origen
  `CANCELACION`, excluyendo las claves `blq:` del bloqueo de anunciantes, que
  usa el mismo origen. Esta consulta de solo lectura lista las reservas donde
  ese vínculo sería ambiguo (validada sobre el esquema de pruebas):

  ```sql
  SELECT s.id_reserva,
         count(DISTINCT s.id_solicitud_cancelacion) AS solicitudes_aprobadas,
         count(DISTINCT r.id_reembolso) AS devoluciones_sin_vinculo
  FROM solicitud_cancelacion s
  LEFT JOIN reembolso r
    ON r.id_reserva = s.id_reserva
   AND r.origen = 'CANCELACION'
   AND r.idempotency_key NOT LIKE 'can:%'
   AND r.idempotency_key NOT LIKE 'blq:%'
  WHERE s.estado = 'APROBADA'
  GROUP BY s.id_reserva
  HAVING count(DISTINCT s.id_solicitud_cancelacion) > 1
      OR count(DISTINCT r.id_reembolso) > 1;
  ```

### Comportamientos previos que no se cambiaron

Se conservaron tal cual para no mezclar reglas nuevas con el refactor:

1. Una solicitud pendiente se puede aprobar aunque la reserva ya haya sido
   cancelada por otro circuito (por ejemplo, el bloqueo del anunciante). En el
   camino sin devolución, eso reescribe el estado de la liquidación.
2. Mientras la devolución de una solicitud aprobada espera confirmación, el
   usuario puede crear otra solicitud para la misma reserva. La segunda
   devolución solo se frena por el saldo del pago.
3. Dos `POST /reservas/:id/cancelacion` simultáneos: el segundo choca con el
   índice único de solicitudes pendientes y responde 500 en lugar de devolver la
   solicitud activa.
4. La clave `can:<idSolicitud>` también viaja a Mercado Pago como clave de
   idempotencia, igual que `liq:` y `blq:`. Si dos entornos comparten
   credenciales de Mercado Pago, los IDs pueden coincidir.

## 7. Cómo revisar

1. `git show --stat HEAD` para ver el conjunto.
2. `back/src/cancelaciones/service/cancelaciones.service.ts`: es el archivo con
   la lógica. `solicitar` y la política son el código que estaba en
   `ReservasService`; `resolver` es el mismo flujo dentro de una transacción.
3. `git show HEAD -- back/src/reservas/service/reservas.service.ts`: casi todo
   son líneas quitadas; lo nuevo es `cancelarConRetencionTotal`.
4. `git show HEAD -- back/src/reembolsos/service/reembolsos.service.ts`: el
   bloque grande es el cuerpo de la transacción movido a `registrarSolicitud`.
