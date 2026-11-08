# CUIT/CUIL y email únicos entre cuentas vigentes — RN-37

Fecha: 04/11/2026.

Rama: `fixes/solucion_cuit_cuil_unico`, creada desde `main` (`8d3a7af`).

## Objetivo

Resolver el punto 6 de la revisión: qué pasa cuando una persona dada de baja intenta registrarse de nuevo y cómo se tratan los CUIT/CUIL ya registrados.

- La baja es irreversible: no se reactiva la cuenta original.
- Al dar de baja una cuenta, su email y su CUIT/CUIL quedan libres para que la persona pueda crear una cuenta nueva.
- Los valores originales se conservan en columnas históricas: quien consulte la base o el historial de una reserva sigue identificando a la persona. Nunca se inventa ni se modifica un CUIT/CUIL.
- El CUIT/CUIL es único entre las cuentas vigentes, también para inmobiliarias.
- La cuenta vieja y la nueva quedan relacionadas por el CUIT/CUIL: el Administrador puede buscarlo y ver las dos. La cuenta nueva pasa otra vez por toda la verificación de identidad.

## Regla aplicada

| Dato | Cuenta vigente | Cuenta dada de baja |
| --- | --- | --- |
| Email | `usuario.email`, único | `usuario.email` en null; el original en `usuario.email_historico` |
| CUIT/CUIL | `anunciante.cuit_cuil`, único entre vigentes (se comparan solo los dígitos) | `anunciante.cuit_cuil` en null; el original en `anunciante.cuit_cuil_historico` |

## Base de datos

Migración `back/migrations/20261104-cuit-email-historicos.sql`, aplicada con `back/scripts/cuit-email-historicos.cjs`:

- Agrega `anunciante.cuit_cuil_historico` y `usuario.email_historico`, y permite `usuario.email` en null.
- Mueve al histórico el email y el CUIT/CUIL de las cuentas que ya estaban dadas de baja.
- Crea el índice único `uq_anunciante_cuit_cuil_digitos`, que compara solo los dígitos (`20-12345678-9` = `20123456789`).
- Si hay CUIT/CUIL repetidos entre cuentas vigentes, se revierte y los lista. Nunca fusiona ni modifica datos.
- Es repetible.

Con el back detenido, desde `back`:

```sh
node scripts/cuit-email-historicos.cjs        # informa qué se movería y si hay repetidos
npm run db:cuit-email-historicos              # aplica la migración
```

## Cambios en el backend

- `usuarios/entity/usuario.entity.ts`: `email` admite null, nueva columna `email_historico`. `darDeBaja()` mueve el email al histórico. Nuevo `emailParaHistorial()`.
- `anunciantes/entity/anunciante.entity.ts`: nueva columna `cuit_cuil_historico`, `cuitParaHistorial()` y `digitosCuit()`.
- `usuarios/service/usuarios.service.ts`: la baja mueve el CUIT/CUIL al histórico dentro de la misma transacción. El listado del panel devuelve `email_historico`, `cuit_cuil` y `cuit_cuil_historico`.
- `usuarios/repository/usuarios.repository.ts`: la búsqueda del panel también encuentra por email histórico y por CUIT/CUIL vigente o histórico, con o sin guiones.
- `anunciantes/service/anunciantes.service.ts`: `crearPendiente()` rechaza con 409 un CUIT/CUIL de otra cuenta vigente. Si dos solicitudes llegan a la vez, el índice único decide y la segunda también recibe 409.
- `anunciantes/repository/`: nuevo `existeCuitVigente()`; `guardar()` traduce la violación del índice.
- `common/persistence/valor-duplicado.error.ts`: traducción de la violación de unicidad de PostgreSQL (23505) en la capa de datos.
- Correos: como una cuenta dada de baja ya no tiene email, los envíos comprueban que exista (`auth.service`, `usuarios.service`, `mensajes.service`, `verificacion-anunciante.service`).
- El registro no cambia: una persona dada de baja puede registrarse otra vez con el mismo email, porque la cuenta vieja ya no lo tiene.

## Cambios en el frontend

- `solicitud-anunciante`: si el CUIT/CUIL ya está registrado, muestra el error debajo del campo y un toast.
- `auth/register`: si el email ya está registrado, muestra el error debajo del campo y un toast.
- `reserva-resultado` (detalle de Mis reservas): el Inquilino ve el CUIT/CUIL del anunciante en los datos del pago; si el anunciante se dio de baja, el histórico. El email de contacto también usa el histórico.
- `admin`: la columna «Contacto» muestra el email histórico de las cuentas dadas de baja y el CUIT/CUIL (con «histórico» cuando corresponde). La búsqueda acepta CUIT/CUIL.
- Modelos `Usuario`, `Anunciante` y `AdminUser` con los campos nuevos.

## Pruebas

`back/test/cuit-email-historicos.test.cjs`, con 13 pruebas. Desde `back`:

```sh
npm run test:cuit-email-historicos
```

Cubren la baja que mueve email y CUIT/CUIL al histórico (con el SQL real de TypeORM sobre SQLite), la comparación por dígitos, el CUIT/CUIL liberado tras la baja, el rechazo con 409 (también en una carrera), la búsqueda del panel por CUIT/CUIL y email histórico y los datos que recibe el panel.

Se ajustó el mock de `bajas-y-bloqueos.test.cjs` para la nueva actualización del CUIT/CUIL.

## Verificación realizada

- Backend: `tsc --noEmit` correcto, `oxlint` sin errores y 64 pruebas aprobadas (`node --test test/*.test.cjs`), 13 nuevas.
- Migración probada sobre PostgreSQL (PGlite) con el esquema inicial: mueve los valores de las bajas, es repetible, rechaza un CUIT/CUIL repetido con o sin guiones, permite reutilizar el email de una baja y se revierte si hay repetidos vigentes.
- También sobre PostgreSQL: el `UPDATE` de la baja, la consulta de `existeCuitVigente()` y la búsqueda del panel por CUIT/CUIL histórico.
- Frontend: `ng build --configuration development` correcto.
- **No verificado:** las pantallas en el navegador con datos reales.

## Documento (ya actualizado)

| Sección | Cambio |
| --- | --- |
| RN-37 (nueva) | Baja irreversible; email y CUIT/CUIL liberados y conservados como históricos; unicidad entre cuentas vigentes, también inmobiliarias, comparando dígitos; rechazo con motivo; relación por CUIT/CUIL y nueva verificación de identidad; las cuentas bloqueadas conservan sus datos. |
| Glosario, «Baja de cuenta» | El email y el CUIT/CUIL quedan libres y se conservan como datos históricos (RN-37). |
| RF1 | El email debe ser único entre las cuentas vigentes (RN-37). |
| RF6 | El CUIT/CUIL informado debe ser único entre las cuentas vigentes (RN-37). |
| CU1 | El email debe ser único entre las cuentas vigentes; el de una cuenta dada de baja puede volver a usarse. El flujo alternativo A1 habla de «otra cuenta vigente». |
| CU21 | Incluye el CUIT/CUIL del Anunciante, vigente o histórico. |
| CU23 | El panel busca por email o CUIT/CUIL, vigente o histórico, para relacionar cuentas. |
| CU24 | El CUIT/CUIL debe ser único entre las cuentas vigentes. |
| Tabla de estados, «Dada de baja» | El email y el CUIT/CUIL quedan libres y se conservan como históricos. |
| Checklist, punto 6 | Estado agregado: reactivación descartada, solución aplicada y pendientes. |

Pendiente en el documento: agregar `cuit_cuil_historico` y `email_historico` al DER y al diagrama de clases.

## Compatibilidad y alcance

- Requiere aplicar la migración antes de iniciar el backend (`synchronize: false`).
- Rutas sin cambios. `POST /anunciantes/solicitar` puede devolver 409 por CUIT/CUIL repetido.
- Una persona dada de baja que intenta iniciar sesión con su email anterior recibe «Credenciales inválidas»: la cuenta ya no tiene ese email.
- Un CUIT/CUIL que otra persona cargó indebidamente bloquea al titular hasta que el Administrador da de baja esa cuenta: la baja lo libera.
- Las cuentas bloqueadas conservan su email y su CUIT/CUIL: el bloqueo es reversible.
