# Cambios en DEPA · 10 de noviembre de 2026

Este documento reúne los cambios de backend, frontend y base de datos realizados desde la revisión de la entidad `Anunciante` hasta la verificación de integración. El punto de partida fue el commit `fcd1aab` de `main`.

## Entidades y separación de responsabilidades

- Los decoradores de TypeORM declaran el nombre físico de las columnas con `name`. Por ejemplo, `Anunciante.idUsuario` se guarda en `anunciante.id_usuario`. Cada nombre se interpreta dentro de su tabla, así que varias tablas pueden tener una columna `id_usuario`.
- Las entidades declaran datos y relaciones. Las reglas de negocio pasaron a los servicios y las operaciones de base de datos a los repositorios. Los servicios de otros módulos se usan para pedir operaciones como habilitar un anunciante, actualizar un pago o liberar fechas.
- Las firmas de métodos, constructores y funciones declaradas se escribieron en una línea en el backend y el frontend. En las implementaciones, la llave de apertura quedó en la misma línea que la firma.

## Anunciantes, verificación y cuentas

- `AnunciantesService` prepara el alta pendiente, arma los datos de contacto y coordina la verificación. `AnunciantesRepository` consulta y persiste el anunciante. Al verificarlo, primero se actualiza la base dentro de la transacción y luego se asigna `verificado = true` al objeto que se está usando.
- La búsqueda de CUIT/CUIL compara solo los dígitos. La validación previa y la violación del índice único devuelven el mismo conflicto HTTP 409. La baja archiva el CUIT/CUIL y el correo anteriores y libera los valores vigentes para volver a registrarse.
- El alta guarda el anunciante y su borrador de verificación en una transacción. Si falla la segunda escritura, se revierte el alta completa. El bloqueo de la fila del usuario coordina solicitudes simultáneas de la misma cuenta y la baja de esa cuenta. El aviso se envía después de confirmar la transacción.
- La lógica de los desafíos de prueba de vida vive en `PruebaVidaService`. Face API y su interfaz de análisis quedaron en `verificacion-anunciante/proveedor/`. El repositorio de verificación guarda solicitudes, revisiones y la cola de eliminación. Las respuestas omiten los datos internos del desafío y del token de prueba de vida.
- La aprobación o el rechazo registra la decisión y programa el retiro de documentos en la misma transacción. El procesamiento de la cola elimina los archivos después de confirmar la decisión y permite reintentar si falla el almacenamiento.
- `UsuariosService` coordina la baja lógica, el bloqueo y la habilitación. Su repositorio consulta las operaciones pendientes como inquilino o anunciante. Las validaciones de baja consideran reservas, estadías, liquidaciones y pagos pendientes de conciliación.

Archivos principales [AnunciantesService](../back/src/anunciantes/service/anunciantes.service.ts), [AnunciantesRepository](../back/src/anunciantes/repository/anunciantes.repository.ts), [VerificacionAnuncianteService](../back/src/verificacion-anunciante/service/verificacion-anunciante.service.ts) y [UsuariosService](../back/src/usuarios/service/usuarios.service.ts).

## Autenticación y seguridad

- La estrategia JWT se movió de `auth` a `seguridad`. `SeguridadService` consulta el usuario y su rol vigente mediante `UsuariosConsultaService` y rechaza sesiones de cuentas bloqueadas o inactivas.
- Se quitó la carpeta `auth/validators/`. El registro, el cambio y el restablecimiento de contraseña usan decoradores de `class-validator` en sus DTO. La regla exige un mínimo de 12 caracteres y un máximo de 72 bytes en UTF-8, con letra, número y símbolo, sin espacios ni caracteres de control. `AuthService` compara la contraseña nueva con su confirmación. `UsuariosCredencialesService` gestiona el hash y los tokens de recuperación.
- Una cuenta con credenciales correctas y correo pendiente de verificar recibe HTTP 403 con el código `EMAIL_NO_VERIFICADO`. Angular conserva el mensaje que explica cómo verificar la cuenta y ofrece reenviar el correo. Una contraseña incorrecta sigue recibiendo HTTP 401.

Archivos principales [SeguridadModule](../back/src/seguridad/seguridad.module.ts), [DTO de contraseña](../back/src/auth/dto/contrasenia-segura.dto.ts), [AuthService](../back/src/auth/service/auth.service.ts) y [pantalla de ingreso](../front/src/app/features/auth/login/login.component.ts).

## Estados por ámbito, migraciones y carga inicial

- `catalogos` incorpora las entidades `Estado` y `Ambito`. La combinación de ámbito y código es única. Así, `PENDIENTE` puede existir en el ámbito de pagos y también en el de cancelaciones.
- Se migraron los estados persistidos de pago de reserva, liquidación, solicitud de cancelación, reembolso, reclamo, verificación de anunciante y disputa. Las claves foráneas y las restricciones de la base protegen el ámbito de cada campo. La API sigue devolviendo códigos de estado como texto.
- La migración general admite bases que todavía tienen el enum de disputas y bases que ya usaban `estado_disputa`. Conserva los códigos históricos y, cuando existe el catálogo previo, sus nombres. El comando `db:cancelaciones-devoluciones` aplica las migraciones correspondientes dentro de una transacción y admite nuevas ejecuciones.
- `estado_estadia` se calcula a partir del pago, la cancelación, el ingreso y las fechas. `ReservaRespuestaDto` describe sus valores posibles en TypeScript. El actor de cancelación se define en su propio archivo mediante un objeto de constantes y su tipo.
- `npm run db:seed` carga roles, ámbitos, estados, modalidades, monedas, tipos de anunciante y de propiedad, provincias y localidades de la copia local de GeoRef. Inserta lo que falta y conserva los registros existentes. En una base descartable cargó 24 provincias y 3.923 localidades. Una segunda ejecución agregó cero filas.
- El backend verifica los roles y estados obligatorios al arrancar. `Administrador` e `Inquilino` conservan sus nombres y no se pueden eliminar desde la API. Sus descripciones se pueden editar.

Archivos principales [Estado](../back/src/catalogos/entity/estado.entity.ts), [Ambito](../back/src/catalogos/entity/ambito.entity.ts), [códigos de estado](../back/src/catalogos/estados.ts), [migración](../back/migrations/20261110-estados-por-ambito.sql) y [seed](../back/scripts/seed.cjs).

## Cambios por módulo

| Módulo | Cambios |
| --- | --- |
| `reservas` y `reservas-consulta` | Se separó la consulta y preparación de respuestas en `src/reservas-consulta`. Los servicios de reservas concentran las reglas de cancelación, reprogramación, ingreso con código, cierre de estadía, liquidación y avisos. Los módulos que devuelven reservas reutilizan el cálculo de `estado_estadia` y la preparación de la modalidad. |
| `disponibilidad` | Se consolidó la persistencia y la gestión de transacciones en `FechaRepository`. El servicio decide si se puede modificar, ocupar o liberar una fecha y coordina el bloqueo de la publicación con las operaciones de calendario. |
| `disputas` | Se creó el repositorio y su interfaz. `DisputasService` coordina las operaciones de contracargos con los servicios de pagos, reservas, reembolsos y catálogos. Las respuestas administrativas exponen el código del estado de la disputa. |
| `pagos` y `reembolsos` | `PagosPersistenciaModule` reúne la persistencia de pagos y `PagosRegistroService` ofrece operaciones para saldo reembolsable, devoluciones y contracargos. El servicio de reembolsos coordina esos cambios sin acceder directamente al repositorio de pagos. |
| `reclamos` | Se agregó un repositorio con interfaz para reclamos, mensajes y evidencias. El servicio controla permisos, resolución y acceso a las notas internas, y pide las operaciones de archivos y devoluciones a los servicios correspondientes. |
| `publicaciones` | El servicio concentra las reglas de propiedad, visibilidad y activación. Los repositorios aplican los filtros de catálogo y administración. Las respuestas conservan `admite_reservas_por_fecha` para la modalidad. Alta y edición validan títulos de 5 a 255 caracteres y rechazan títulos vacíos, emojis y símbolos fuera del formato admitido. |
| `imagenes` | El servicio valida la propiedad de la publicación y organiza la galería. El repositorio escribe el orden dentro de una transacción y se rechazan galerías desactualizadas. La primera imagen habilita la activación de la publicación. |
| `favoritos` y `mensajes` | Favoritos consulta la visibilidad mediante `PublicacionesService`. Mensajes usa los servicios de publicaciones, usuarios y reservas para resolver permisos y preparar respuestas. Se comprobó que el bloqueo y la baja de cuentas se respetan en ambos circuitos. |
| `cotizaciones` | El historial tiene un DTO propio con validación de fechas y paginación. `DolarApiAdapter` y su interfaz viven en `proveedor/`. El adaptador limita la respuesta a 16 KiB y el servicio valida los importes y la vigencia antes de usarlos. |
| `ubicacion` | `repository/` gestiona provincias y ciudades. Nominatim y su interfaz pasaron a `proveedor/`. El adaptador encapsula la consulta externa y su caché. |
| `common` y `almacenamiento` | `almacenamiento` es un módulo de `src/` que exporta un servicio para subir, firmar y eliminar archivos en Azure. `common` reúne utilidades compartidas de persistencia, paginación, nombres, fechas e importes. |
| Frontend | Se ajustaron las validaciones de contraseña y título, los avisos en los formularios de publicación y el manejo del error de correo sin verificar. También se unificó el formato de las firmas. |

## Verificación

| Comprobación | Resultado |
| --- | --- |
| Suite Node del backend | 130 pruebas aprobadas |
| Suite Jest del backend | 28 pruebas aprobadas, incluidos CP-06, CP-07 y CP-08 |
| Suite Node del frontend | 19 pruebas aprobadas |
| Compilación y lint | Compilaron el backend y el frontend. Pasó el lint del backend. Angular conservó dos avisos de tamaño, uno del paquete inicial y otro de los estilos del detalle de publicación. |
| PostgreSQL 18 descartable | Arranque del backend, columnas mapeadas de 30 entidades, migración repetible y seed idempotente. Se comprobó la reversión del alta de anunciante y que dos altas simultáneas de una cuenta devuelvan un 201 y un 409. |
| Chrome y API local | Registro, reenvío y verificación del correo, ingreso y perfil, permisos, geocodificación, alta y aprobación de anunciante, publicación e imagen, favorito, disponibilidad, reserva, conciliación y devolución manual. |

Las pruebas de integración usaron datos sintéticos. Se cargaron los modelos faciales y se simuló la evidencia usada para aprobar al anunciante. Los servicios externos se simularon. La preparación de la base de producción queda pendiente de verificación.

Para repetir las suites del backend desde `back/`:

```sh
npm run build
npm run lint
node --test test/*.test.cjs
npm run test:jest -- --runInBand
```

Para repetir las comprobaciones del frontend desde `front/`:

```sh
npm run build
node --test test/*.test.cjs
```

## Publicación y despliegue

El push a `main` dispara el flujo de GitHub Actions que despliega el backend a Azure. Este commit lleva `[skip ci]` para publicar el código con el despliegue de ese flujo diferido. El flujo también admite ejecución manual. [Workflow del backend](../.github/workflows/main_depa-alquileres.yml), [Documentación de GitHub](https://docs.github.com/en/actions/how-tos/manage-workflow-runs/skip-workflow-runs).

Para desplegar esta versión, verificar el esquema del entorno, aplicar las migraciones pendientes y ejecutar `npm run db:seed` antes de arrancar el backend nuevo. Para una base existente corresponde seguir la guía de migraciones incrementales. [Guía de migraciones y seed](../back/migrations/README.md).
