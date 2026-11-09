# Bajas y bloqueos de cuentas — RN-36, RN-23 y CU6

Fecha: 04/11/2026.

Rama: `fixes/bajas_y_bloqueos`, creada desde `main` (`59b5bb3`). Commits:

- `37bb789` Valida bajas como Inquilino y diferencia baja y bloqueo.
- `e89de74` Evita que un checkout abandonado bloquee la baja para siempre.

## Objetivo

Completar el punto 5 de la revisión sobre bajas de cuenta:

1. Que la baja de cuenta también controle lo que el usuario tiene pendiente como Inquilino, no solo como Anunciante.
2. Que no se puedan enviar mensajes a una cuenta dada de baja.
3. Que el panel de administración distinga una cuenta bloqueada de una dada de baja.
4. Quitar el borrado físico de usuarios, que ya no se usaba.

Además, se corrigió un defecto encontrado durante la revisión: un checkout abandonado impedía para siempre la baja del Anunciante.

El historial y la atención de reclamos ya estaban resueltos y no cambian. La baja no borra reservas, pagos ni liquidaciones. El Administrador resuelve reclamos y liquidaciones desde su panel (`GET /reservas/liquidaciones/administracion` y `PATCH /reservas/:id/liquidacion`). Las publicaciones de una cuenta dada de baja no aceptan reservas, presupuestos ni favoritos porque esas operaciones controlan `publicacion.activa`.

## Situación anterior

| Tema | Antes | Problema |
| --- | --- | --- |
| Baja de cuenta | Solo se validaba si el usuario tenía publicaciones. | Un Inquilino podía darse de baja con una reserva sin pagar, una estadía futura o un reclamo abierto. |
| Pagos sin conciliar | Se contaba cualquier `Pago` en estado `pending`. | El `Pago` nace en `pending` y, si el checkout se abandona, queda así para siempre y sin `payment_id`. Un solo pago abandonado en una de sus publicaciones impedía para siempre la baja del Anunciante. |
| Mensajería | Se podía escribir a una cuenta dada de baja, y le llegaba el correo. | La cuenta ya no puede iniciar sesión ni responder. |
| Panel de usuarios | Una cuenta dada de baja aparecía como «Activo» y ofrecía «Bloquear». | No se distinguía la baja del bloqueo. Bloquear una cuenta dada de baja le enviaba un correo sin efecto. |
| Repositorio | `UsuariosRepository.eliminar()` hacía `repo.remove()`. | Nadie lo llamaba, pero dejaba disponible un borrado en cascada. |

## Regla aplicada

Un usuario sólo puede darse de baja si no tiene operaciones pendientes en ninguno de sus roles.

| Rol | Operaciones que impiden la baja |
| --- | --- |
| Inquilino (cualquier usuario) | Reserva pendiente de pago (incluso con el plazo vencido si todavía no se cerró). Pago en proceso en Mercado Pago. Reserva confirmada con estadía vigente o futura. Reserva con la liquidación en revisión (por un reclamo o por intentos de código fallidos). |
| Anunciante (si tiene publicaciones) | En las reservas de sus publicaciones: reserva pendiente de pago, estadía vigente o futura, pago sin conciliar o liquidación sin resolver. Sin cambios respecto de antes, salvo la corrección de los pagos sin conciliar. |

**Pago sin conciliar o en proceso.** Es un pago que Mercado Pago todavía puede aprobar:

- Con `payment_id` y sin estado final (`approved`, `rejected`, `cancelled`, `refunded` o `charged_back`): bloquea siempre, hasta que llegue el resultado.
- Sin `payment_id` (el checkout se creó, pero no se inició un pago): bloquea solo durante 24 horas desde su creación. La preferencia de Mercado Pago vence a los 15 minutos, junto con el presupuesto, y el resto del plazo es margen para notificaciones demoradas. El plazo se cambia en la constante `MARGEN_CHECKOUT_SIN_PAGO_MS`.

Si hay operaciones pendientes, la baja se rechaza con un mensaje que las separa por rol. Por ejemplo:

> No se puede dar de baja la cuenta porque tiene operaciones sin resolver (como Anunciante: 1 reserva(s) pendiente(s) de pago; como Inquilino: 1 reclamo(s) en revisión). Primero resolvé las reservas, los pagos, las liquidaciones y los reclamos pendientes.

Las estadías terminadas, canceladas o reembolsadas quedan como historial y no impiden la baja. La misma validación se aplica a la baja propia (`DELETE /usuarios/me`) y a la baja desde el panel (`DELETE /usuarios/:id`).

## Cambios en el backend

### Baja de cuenta — `back/src/usuarios/service/usuarios.service.ts`

- `validarOperacionesResueltas()` se ejecuta siempre, dentro de la transacción que bloquea la cuenta y sus publicaciones. Recibe si el usuario tiene publicaciones y combina los dos controles.
- Nuevo `pendientesComoInquilino()`: consulta las reservas del usuario (`reserva.id_usuario`).
- `pendientesComoAnunciante()` es la validación anterior. Ahora devuelve los motivos en lugar de lanzar la excepción.
- Nuevo `contarPagosSinConciliar()`: un único control de pagos para los dos roles, con la regla de las 24 horas.
- `cambiarBloqueo()` rechaza con 409 el bloqueo o la habilitación de una cuenta dada de baja.

### Mensajería — `back/src/mensajes/service/mensajes.service.ts`

- `enviar()` busca al destinatario antes de guardar el mensaje:
  - si no existe, responde 404 («El destinatario no existe»);
  - si está dado de baja, responde 409 («No podés enviarle mensajes a esta cuenta porque fue dada de baja»). No se guarda el mensaje ni se envía el correo.
- La condición depende de la cuenta del destinatario y **no** de `publicacion.activa`. Un Anunciante activo puede pausar una publicación y los Inquilinos deben poder seguir escribiéndole, por ejemplo, si tienen una reserva.
- La restricción vale en los dos sentidos: el Anunciante tampoco puede escribirle a un Inquilino dado de baja.

### Repositorio — `back/src/usuarios/repository/`

- Se quitó `eliminar()` de `usuarios.repository.ts` y de `usuarios.repository.interface.ts`. El sistema ya no tiene borrado físico de cuentas: solo baja lógica y bloqueo. `UsuariosService.eliminar()` se mantiene porque es la baja lógica que usa el panel.

## Cambios en el frontend

- `features/admin/admin.service.ts`: la interfaz `AdminUser` incorpora `activa` y `fecha_baja`, que el backend ya enviaba.
- `features/admin/admin.component.html` y `.scss`: la columna «Estado» muestra tres estados.

  | Estado | Cuándo | Acción disponible |
  | --- | --- | --- |
  | Activa | `activa` y no `bloqueado` | Bloquear |
  | Bloqueada | `activa` y `bloqueado` | Habilitar |
  | Dada de baja (con fecha `dd/MM/yyyy`) | `!activa` | Ninguna |

  La verificación del correo se sigue mostrando aparte, debajo del nombre.
- `features/mi-perfil/mi-perfil.component.html`: la confirmación de baja aclara que también cuentan los reclamos y las operaciones como inquilino.

## Pruebas

Se agregó `back/test/bajas-y-bloqueos.test.cjs` y el comando `test:bajas-y-bloqueos` en `back/package.json`.

Desde la carpeta `back`:

```powershell
npm run test:bajas-y-bloqueos
```

El comando compila el backend y ejecuta 14 pruebas que cubren:

- Rechazo de la baja de un Inquilino sin publicaciones con una reserva pendiente de pago, una estadía futura o un reclamo en revisión.
- Pago iniciado en Mercado Pago, que bloquea; checkout abandonado hace más de 24 horas, que no bloquea; checkout reciente, que bloquea.
- Lo mismo para el Anunciante: un checkout abandonado deja de bloquear pasado el margen, y un pago iniciado bloquea aunque sea viejo.
- Historial cerrado (finalizadas, canceladas, reembolsadas y estadías pasadas) que no impide la baja.
- Mensaje con los motivos separados por rol, y publicaciones que siguen activas si se rechaza la baja.
- Rechazo de bloquear o habilitar una cuenta dada de baja, sin guardar ni enviar correo.
- Mensajería: rechazo a una cuenta dada de baja en los dos sentidos, publicación pausada que sigue admitiendo mensajes y destinatario inexistente.

Las consultas de la baja se ejecutan sobre una base SQLite en memoria (`node:sqlite`), con el mismo SQL que arma el servicio. No acceden a PostgreSQL ni a Mercado Pago.

## Verificación realizada

- Backend: `tsc --noEmit` correcto, `oxlint` sin errores y 51 pruebas aprobadas (`node --test test/*.test.cjs`), 14 de ellas nuevas.
- Frontend: `ng build --configuration development` correcto. El frontend ya no tiene pruebas unitarias.
- `git diff --check` sin errores de espacios en los cambios de la rama.
- **No verificado:** el panel en el navegador con datos reales, porque no había PostgreSQL disponible.

## Cambios necesarios en el documento

El documento todavía describe la baja como una restricción **solo del Anunciante** y no menciona la mensajería ni los estados de la cuenta. Estos textos tienen que actualizarse para que coincidan con el código.

### Glosario — «Baja de cuenta»

**Dice:** «… Si es Anunciante, sólo puede darse de baja sin operaciones pendientes, y sus publicaciones quedan inactivas (RN-36). …»

**Propuesta:**

> La cuenta deja de funcionar pero no se borra (baja lógica): se conservan sus publicaciones, reservas, pagos y liquidaciones. Cualquier usuario sólo puede darse de baja si no tiene operaciones pendientes como Inquilino ni como Anunciante; si es Anunciante, sus publicaciones quedan inactivas (RN-36). No es reversible y no produce cancelaciones ni devoluciones. Es distinta del bloqueo: una cuenta dada de baja no puede bloquearse ni habilitarse. El sistema no elimina cuentas en forma definitiva.

### RN-36

**Dice:** «Un Anunciante sólo podrá dar de baja su cuenta cuando no tenga … asociados a sus publicaciones.»

**Propuesta:**

> Un usuario sólo podrá dar de baja su cuenta cuando no tenga operaciones pendientes en ninguno de sus roles. Como Inquilino: reservas pendientes de pago, pagos en proceso en Mercado Pago, reservas confirmadas con estadías vigentes o futuras ni reservas con la liquidación en revisión (por un reclamo o por intentos de código fallidos). Como Anunciante, en las reservas de sus publicaciones: reservas pendientes de pago, reservas confirmadas con estadías vigentes o futuras, pagos sin conciliar ni liquidaciones pendientes de resolución. Se considera pago sin conciliar o en proceso al que Mercado Pago todavía puede aprobar: uno ya iniciado sin resultado final, o un checkout sin pago iniciado durante las 24 horas posteriores a su creación. Si existe alguna de estas operaciones, el sistema deberá rechazar la solicitud de baja e informar el motivo, separado por rol, manteniendo activas la cuenta y sus publicaciones hasta que se regularicen los compromisos pendientes. Una vez cumplida esta condición, la baja se realizará de forma lógica: la cuenta y todas sus publicaciones pasarán al estado inactivo, sin eliminar ni alterar el historial de reservas, pagos y liquidaciones. La baja no deberá provocar cancelaciones ni reembolsos automáticos. La baja desde el panel de administración debe aplicar las mismas validaciones. Una cuenta dada de baja no puede bloquearse ni habilitarse y no recibe mensajes de la mensajería interna. Si el Anunciante pierde el acceso por un bloqueo, el Administrador atiende los reclamos y resuelve las liquidaciones de sus reservas.

### CU6 — Dar de baja usuario

**Dice:** «Dar de baja la cuenta (baja lógica). Si es Anunciante, y cuenta con reservas pendientes, … lla baja de la cuenta se impide … (RN -36)»

**Propuesta** (también corrige «lla» y «RN -36»):

> Dar de baja la cuenta (baja lógica). Si el usuario tiene operaciones pendientes como Inquilino (reservas pendientes de pago, pagos en proceso, estadías confirmadas vigentes o futuras o reclamos en revisión) o como Anunciante (reservas pendientes de pago, confirmadas con estadías vigentes o futuras, pagos sin conciliar asociados a sus publicaciones o liquidaciones pendientes), la baja se impide hasta solucionar todas las operaciones pendientes (RN-36).

### RN-23 — Contacto con el Anunciante

Agregar al final:

> No se pueden enviar mensajes por la mensajería interna a una cuenta dada de baja, en ninguno de los dos sentidos. La restricción depende de la cuenta del destinatario y no del estado de la publicación: si un Anunciante activo pausa una publicación, los Inquilinos pueden seguir escribiéndole.

### CU18 — Contactar con el anunciante

Agregar a la descripción: «La mensajería interna no admite mensajes a cuentas dadas de baja (RN-23).»

### CU23 — Gestionar usuarios del sistema

**Dice:** «Bloquear, reactivar o dar de baja cuentas para mantener el orden y la seguridad.»

**Propuesta:**

> Bloquear, reactivar o dar de baja cuentas para mantener el orden y la seguridad. El panel distingue tres estados de cuenta: Activa, Bloqueada y Dada de baja (con su fecha). Una cuenta dada de baja no puede bloquearse ni habilitarse, y su baja aplica las validaciones de RN-36.

### Tabla de estados del sistema

Cambiar la introducción a «Estados que maneja el sistema para la cuenta, la reserva, el pago y la liquidación:» y agregar el grupo **Cuenta**:

| Grupo | Estado | Qué significa |
| --- | --- | --- |
| Cuenta | Activa | Puede iniciar sesión y operar según su rol. |
| Cuenta | Bloqueada | El Administrador le quitó el acceso; puede habilitarla nuevamente. |
| Cuenta | Dada de baja | Baja lógica con fecha. No puede iniciar sesión ni recuperar la contraseña, no recibe mensajes y no puede bloquearse ni habilitarse. Sus publicaciones quedan inactivas. |

La verificación del correo es independiente de estos tres estados.

### Checklist del documento

Siguiendo la convención del checklist, agregar al final de cada ítem:

- «Revisar la baja de cuenta tanto para anunciantes como para inquilinos con reservas, pagos, reclamos o liquidaciones pendientes.» → «Código actualizado en la rama `fixes/bajas_y_bloqueos`. Pendiente en la documentación: RN-36, CU6 y glosario.»
- «Revisar los estados de acceso de las cuentas, manteniendo diferenciados el correo sin verificar, el bloqueo administrativo y la baja.» → «El panel ya distingue Activa, Bloqueada y Dada de baja, con el correo sin verificar aparte. Pendiente en el código: el historial de bloqueos, desbloqueos y bajas.»
- «Conservar las relaciones y operaciones ante la baja de una cuenta» (punto 3 de «Cosas que acomodar») → «Ya no existe la eliminación definitiva de cuentas en el código: solo baja lógica y bloqueo.»

## Actualización 09/11/2026 — bloqueo de Anunciante con reservas

El bloqueo de un Anunciante ya no se limita a ocultar publicaciones y rechazar nuevas reservas. Al bloquear, el sistema resuelve las reservas de sus publicaciones:

- **Pendientes de pago:** se cancelan y liberan sus fechas, sin devolución.
- **Pagadas sin código de alojamiento validado:** se cancelan, liberan sus fechas y generan una devolución del 100 % del saldo cobrado no devuelto. Se considera que el Inquilino no ingresó. Si ya existe una devolución parcial, se completa el saldo faltante con un complemento.
- **Pendientes de pago canceladas por bloqueo:** aparecen en la lista administrativa de liquidaciones como `NO_APLICA`, sin devolución, para que el Administrador vea la incidencia.
- **Con código validado (en curso o finalizadas):** no se cancelan ni devuelven automáticamente. La liquidación queda en revisión para que el Administrador resuelva el pago, la retención o el recupero.
- **Con reclamo, contracargo o liquidación en revisión:** pasan al circuito administrativo, sin cancelación ni devolución automática.

La baja de cuenta mantiene su regla: no produce cancelaciones ni devoluciones automáticas. La diferencia es deliberada: la baja exige que no haya operaciones pendientes; el bloqueo es una medida administrativa que puede ocurrir con reservas ya contratadas.

La devolución usa `OrigenReembolso.CANCELACION` y el motivo del bloqueo. La decisión es automática; la ejecución del dinero depende de `MP_REFUNDS_ENABLED`: con `true` puede ejecutarse por Mercado Pago y con `false` el Administrador la registra manualmente. El desbloqueo no restaura reservas ni revierte devoluciones.

Código: `back/src/bloqueo-anunciante/` (módulo de composición), `ReservaBloqueoAnuncianteService.cancelarReservasPorBloqueoAnunciante`, `ReservaReembolsoAplicacionService` y la guarda de `ReservasService.confirmarPago` para pagos tardíos. La creación y confirmación de reembolsos usa `DevolucionesUnitOfWork` con lock de `Pago` y `Reembolso`.

## Compatibilidad y alcance

- No se requieren migraciones: `activa` y `fecha_baja` ya existían en `usuario`.
- No cambian las rutas de la API. Hay dos respuestas nuevas: `POST /mensajes` puede devolver 404 o 409, y `PATCH /usuarios/:id/bloquear` y `PATCH /usuarios/:id/habilitar` devuelven 409 para una cuenta dada de baja.
- **Reservas vencidas:** en `main`, una reserva pendiente con el plazo vencido se cierra recién cuando alguien crea otra reserva. Mientras tanto sigue impidiendo la baja. La rama `fix/checklist-11-reservas` (sin mergear) agrega el cierre automático cada minuto, que resuelve esto.
- **Concurrencia:** la baja bloquea la fila del usuario, pero la creación de reservas no la consulta. Queda una carrera muy improbable: que el mismo usuario reserve y se dé de baja en el mismo instante. No se cerró para no tocar `reservas.service.ts`, que también modifica la rama `fix/checklist-11-reservas`.
- **Fuera de alcance:**
  - el historial de bloqueos y bajas;
  - la recuperación de una cuenta dada de baja al registrarse otra vez.
- En el panel, el selector de rol sigue habilitado para las cuentas dadas de baja.
