# Arquitectura — DEPA Alquileres

> Documento descriptivo de la arquitectura reconciliada del proyecto.
> Rama `reconciliacion/refactor-usuario`, base `origin/main` más el port.
> Revisión: 12/11/2026.
> No describe una arquitectura ideal: las desviaciones verificadas están en §9.

## 1. Propósito y alcance

El repositorio contiene dos aplicaciones:

- **Backend** (`back/`): NestJS, TypeORM y PostgreSQL. Expone la API REST, aplica las reglas de negocio, coordina transacciones y se integra con proveedores externos.
- **Frontend** (`front/`): Angular standalone con signals. Consume la API, presenta los flujos por feature y no replica reglas de negocio del backend.

Este documento cubre la organización por capas, el mapa real de módulos de `back/src`, los estados, las transacciones, los circuitos de bloqueo/reembolsos y liquidaciones, las integraciones y la deuda declarada. El detalle funcional de reservas vive en `back/docs/estados-estadia.md`, `back/docs/reprogramaciones.md` y `back/docs/cotizaciones-cobros.md`.

## 2. Principios y capas

Dirección única de dependencias:

```text
controller → service → repository → entity
```

| Capa | Responsabilidad | Límite |
| --- | --- | --- |
| `controller` | Routing, guards, pipes, DTOs y delegación | No accede a repositorios ni a TypeORM |
| `service` | Reglas, validaciones, estados, cálculos y orquestación | No conoce `Request`/`Response`; no abre transacciones con TypeORM |
| `repository` | Consultas y persistencia | No decide reglas ni lanza excepciones HTTP |
| `entity` | Columnas, relaciones y enums de tabla | Sin lógica de negocio, getters calculados ni `toJSON` |

Reglas aplicadas:

- **Controller delgado:** solo valida transporte y delega. La validación de negocio de archivos o permisos vive en el service.
- **Service dueño del caso de uso:** un método público equivale a un caso de uso. Puede inyectar su repositorio y services exportados por otros módulos.
- **Repositorio explícito:** cada repositorio tiene interface + token (`I<Nombre>Repository`, `<NOMBRE>_REPOSITORY`) e implementación TypeORM. El módulo registra `useExisting` y no exporta la implementación.
- **Entidad anémica:** solo decoradores, columnas y relaciones. Los estados derivados se calculan en services de consulta, no en la entidad.
- **DTOs:** todo body/query usa un DTO en `dto/` con `class-validator`. El `ValidationPipe` global de `main.ts` aplica `whitelist` y `forbidNonWhitelisted`.
- **Integraciones:** los proveedores nuevos viven en `<módulo>/proveedor/` con interface + token. Almacenamiento, mail y pasarela conservan sus carpetas de puerto/adaptador.
- **Módulos:** sin ciclos ni `forwardRef`. Los módulos publican servicios. Los repositorios quedan dentro del módulo que los utiliza.
- **Errores:** el repositorio propaga o traduce errores de integridad; el service decide la excepción de aplicación; el controller no hace `try/catch` de dominio.

Frontend:

- `core/`: autenticación, guards, interceptors y servicios globales.
- `shared/`: componentes presentacionales, modelos, servicios reutilizables y lógica pura en `shared/utils`.
- `features/`: un directorio por dominio, con componentes standalone y lazy loading mediante `loadComponent`.
- HTTP solo en services; estado local con signals, sin store global nuevo.

## 3. Mapa de módulos

`app.module.ts` registra la configuración global y los módulos de negocio. Algunos módulos llegan de forma transitiva: `CotizacionesModule` y `DisputasModule` por `PagosModule`; `AlmacenamientoModule` por imágenes, reclamos y verificación.

| Grupo | Módulo | Responsabilidad | API exportada |
| --- | --- | --- | --- |
| Identidad y acceso | `auth` | Registro, login, verificación de correo y recuperación de contraseña. | — |
| Identidad y acceso | `seguridad` | JWT, estrategia, guards de sesión y roles. | `JwtModule`, `PassportModule`, `JwtAuthGuard`, `RolesGuard` |
| Identidad y acceso | `usuarios` | Perfil, baja lógica, bloqueo/habilitación y credenciales. | `UsuariosService`, `UsuariosCredencialesService` |
| Identidad y acceso | `usuarios-consulta` | Lecturas de usuario y rol para seguridad y otros dominios. | `UsuariosConsultaService`, `USUARIOS_REPOSITORY` |
| Anunciantes | `anunciantes` | Alta, datos de contacto, CUIT y verificación del anunciante. | `AnunciantesService`, `AnuncianteGuard` |
| Anunciantes | `verificacion-anunciante` | Solicitudes, prueba de vida, análisis facial y eliminación de documentos. | — |
| Catálogo | `publicaciones` | Publicaciones, visibilidad, propiedad y activación. | `PublicacionesService` |
| Catálogo | `ubicacion` | Provincias, ciudades y geocodificación. | `UbicacionService` |
| Catálogo | `imagenes` | Galería, orden y almacenamiento de imágenes. | — |
| Catálogo | `catalogos` | Roles, tipos, modalidades, monedas, ámbitos y estados. | `CatalogosService` |
| Catálogo | `favoritos` | Favoritos del inquilino. | — |
| Catálogo | `mensajes` | Mensajería asociada a publicaciones y reservas. | — |
| Reservas | `disponibilidad` | Calendario, ocupación, liberación y reprogramación de fechas. | `DisponibilidadService` |
| Reservas | `reservas` | Ciclo de vida, cancelación de la estadía, código, coordinación de liquidaciones, bloqueo y reembolsos aplicados. | `ReservasService`, `ReservaCicloVidaService`, `ReservaDecisionService`, `ReservaBloqueoAnuncianteService`, `ReservaReembolsoAplicacionService` |
| Reservas | `cancelaciones` | Solicitud de cancelación de una reserva pagada, su política de devolución y su decisión administrativa. Pide los efectos a Reservas y Reembolsos. | — |
| Liquidaciones | `liquidaciones` | Registro de liquidaciones y sus estados. | `LiquidacionesService` |
| Reservas | `reservas-consulta` | Proyección compartida de reservas y cálculo de `estado_estadia`. | `ReservaEstadoService` |
| Reservas | `bloqueo-anunciante` | Bloqueo administrativo de cuentas y resolución de reservas afectadas. | `IBloqueoAnuncianteRepository` |
| Dinero | `cotizaciones` | Cotización blue, historial y consultas. | `CotizacionesService` |
| Dinero | `pagos` | Checkout, webhook, conciliación y presupuestos. | — |
| Dinero | `pagos-persistencia` / `pagos-registro` | Persistencia de pagos y registro de reembolsos/contracargos. | `PAGOS_REPOSITORY`, `PagosRegistroService` |
| Dinero | `pasarela` | Adaptador Mercado Pago compartido por pagos y reembolsos. | `PASARELA_PAGOS`, `PASARELA_REEMBOLSOS` |
| Dinero | `reembolsos` | Registro, saldo, ejecución manual/automática, webhook y compensación. | `ReembolsosService` |
| Dinero | `reembolsos-aplicacion` | Conciliación periódica de aprobados y aplicación a la reserva. | — |
| Dinero | `disputas` | Contracargos y resolución administrativa. | `DisputasService` |
| Dinero | `reclamos` | Reclamos posteriores al ingreso, evidencia y resolución. | `ReclamosService` |
| Infraestructura | `mail` | Envío de correos por Azure Communication Services. | `MAIL_SERVICE` |
| Infraestructura | `almacenamiento` | Subida, firma y eliminación de archivos en Azure Blob. | `AlmacenamientoService` |
| Infraestructura | `proveedor/` | Adaptadores de dólar, Nominatim y Face API; no es un módulo Nest. | Interfaces y tokens de cada proveedor |

## 4. Estados

`catalogos` contiene las entidades `Ambito` y `Estado`. La clave primaria del ámbito es `codigo`; `Estado` tiene `codigo_ambito`, `codigo` y `nombre`, con unicidad `(codigo_ambito, codigo)`. Las tablas que usan estados declaran una FK compuesta al par ámbito/código y un `CHECK` que fija el ámbito permitido.

El catálogo abarca `PAGO_RESERVA`, `LIQUIDACION_RESERVA`, `SOLICITUD_CANCELACION`, `REEMBOLSO`, `RECLAMO`, `VERIFICACION_ANUNCIANTE` y `DISPUTA`. `npm run db:seed` carga el catálogo inicial en las tablas de ámbitos y estados. Al iniciar, `CatalogosService` carga las entidades persistidas y las pone a disposición de los demás servicios. Las columnas existentes y la API usan el código de cada estado como texto.

`estado_estadia` no es una columna: se calcula en `reservas-consulta/service/reserva-estado.service.ts` al preparar cada respuesta. Sus valores incluyen `CONFIRMADA`, `PENDIENTE_INGRESO`, `EN_CURSO`, `FINALIZADA`, `INGRESO_NO_VERIFICADO`, `FECHAS_A_REVISAR`, `EN_DISPUTA`, `CANCELADA`, `REEMBOLSADA`, `PAGO_RECHAZADO` y `PENDIENTE_PAGO`.

Migración y carga:

- `migrations/20261110-estados-por-ambito.sql` crea `ambito` y `estado`, migra los estados persistidos y conserva los códigos históricos. Es repetible.
- `migrations/20261110-estados-disputa.sql` es la transición del catálogo previo de disputas; la migración general admite ambos esquemas.
- `npm run db:seed` carga roles, ámbitos, estados, modalidades, monedas, tipos y ubicaciones desde `catalogos-iniciales.json` y `estados-iniciales.json`. Usa `ON CONFLICT DO NOTHING`: se puede repetir y conserva lo existente.
- El esquema se aplica solo con migraciones (`synchronize: false`).

## 5. Transacciones

Los repositorios que coordinan escrituras exponen `conTransaccion`:

- `ReservaRepository.conTransaccion` abre `READ COMMITTED` y entrega un repositorio transaccional más el `EntityManager`.
- `FechaRepository.conTransaccion` hace lo mismo y además ofrece `enTransaccion(manager)` para reutilizar el calendario dentro de una transacción ajena.
- `ReembolsosRepository.conTransaccion` entrega el repositorio de reembolsos y el manager para pagos.
- `CancelacionesRepository.conTransaccion` abre `READ COMMITTED` para resolver una solicitud y bloquea su fila antes de leer el estado.

Cuando un servicio coordina una operación con otros módulos, abre la transacción con su repositorio y la comparte: `ReservaRepository` y `ReembolsosRepository` ofrecen `enTransaccion(manager)` para participar de ella. Así, `CancelacionesService.resolver` confirma en una sola transacción la decisión, el reembolso (`ReembolsosService.crearSolicitud`) o la cancelación de la estadía con su liberación de fechas (`ReservasService.cancelarConRetencionTotal`). La devolución de una solicitud usa la clave de idempotencia `can:<idSolicitud>`.

El service nunca abre la transacción: decide el caso de uso y llama a `conTransaccion`. El repositorio es el único que conoce TypeORM. Las operaciones que cruzan módulos pasan el `EntityManager` por parámetro a services como `DisponibilidadService` o `PagosRegistroService`.

**Desviación verificada:** no existe hoy un alias opaco `Transaccion`. El contrato expone `EntityManager` de TypeORM en las interfaces y cinco services lo importan como tipo: `anunciantes`, `pagos`, `usuarios`, `disponibilidad` y `publicaciones`. Se declara en §9.

## 6. Bloqueo de anunciante y reembolsos

Flujo de composición:

1. `BloqueoAnuncianteController` conserva las rutas `PATCH /usuarios/:id/bloquear` y `/habilitar`.
2. `BloqueoAnuncianteService` delega el cambio de cuenta en `UsuariosService`. Si la cuenta es `Anunciante` y queda bloqueada, llama a `ReservaBloqueoAnuncianteService`.
3. `ReservaBloqueoAnuncianteService` recorre las reservas del anunciante y decide: cancelar pendientes, devolver y cancelar, congelar en revisión o no actuar. Devuelve un resumen con canceladas, devueltas, en revisión, sin acción y fallidas.
4. `ReservaBloqueoDevolucionService` calcula la cobertura del pago y crea el reembolso faltante. `ReservaReembolsoAplicacionService` aplica a la reserva un reembolso ya aprobado.

Idempotencia y compensación:

- La clave base es `blq:<idAnunciante>:<idReserva>`; las coberturas parciales agregan `:c1`, `:c2`, y los reintentos `:r1:<sello>`.
- `crearSolicitudConResultado` busca la clave antes y dentro de la transacción. Si dos solicitudes compiten, devuelve el registro ganador.
- Si la reserva no se cancela después de crear el reembolso, se llama a `ReembolsosService.compensar`. Solo se compensan `PENDIENTE` o `FALLIDO`; un `FALLIDO` se consulta en Mercado Pago antes de rechazarlo. Nunca se toca un `APROBADO`.
- La reserva se cancela y libera en una transacción propia. Los avisos y la ejecución de la pasarela quedan fuera de esa transacción.

En `ReservasModule`, `ReembolsosReconciliacionService` consulta a `ReembolsosService` al iniciar y cada 60 segundos. Concilia pendientes con Mercado Pago y delega la aplicación de los aprobados al servicio de reservas correspondiente. Los errores se registran por reembolso y el lote continúa.

Ejecución manual vs automática:

- `MP_REFUNDS_ENABLED=false` (por defecto): la devolución se registra manualmente con referencia o comprobante obligatorio.
- `MP_REFUNDS_ENABLED=true`: se ejecuta por la API de Mercado Pago. Si falla, el reembolso queda `FALLIDO` y puede reintentarse o registrarse manualmente.
- En ningún modo se marca `APROBADO` sin referencia o confirmación.

## 7. Liquidaciones

Ciclo principal:

- Al aprobarse el pago se genera el código de alojamiento y la liquidación queda `RETENIDO`.
- El inquilino consulta el código; el anunciante lo valida durante la estadía y una sola vez. La comparación usa `timingSafeEqual`.
- Un código correcto pasa la liquidación a `PENDIENTE_PAGO_PROPIETARIO`. Cinco intentos incorrectos la dejan en `EN_REVISION`.
- El inquilino puede reportar un problema dentro del período; eso congela la liquidación en `EN_REVISION`.
- El administrador resuelve entre `RETENIDO`, `PENDIENTE_PAGO_PROPIETARIO`, `EN_REVISION`, `PAGADO_PROPIETARIO`, `DEVUELTO_INQUILINO` y `DEVUELTO_PARCIAL_INQUILINO`. El pago al propietario es un registro manual con referencia; no hay transferencia automática.

Guards de resolución:

- Solo se liquida una reserva con pago `APROBADO`.
- `liquidacionResuelta` bloquea una segunda resolución sobre `PAGADO_PROPIETARIO`, `DEVUELTO_INQUILINO` o `DEVUELTO_PARCIAL_INQUILINO`. Se valida antes y otra vez dentro de la transacción.
- `PAGADO_PROPIETARIO` exige código validado, liquidación no revisada y ausencia de reembolsos activos.
- Una devolución exige pago registrado, importe positivo dentro del saldo reembolsable y referencia cuando la ejecución automática está deshabilitada.
- La devolución se ejecuta antes de modificar la reserva. Si no queda `APROBADO`, la reserva no cambia.
- La devolución total cancela la reserva y libera fechas futuras sin código validado; la parcial conserva el pago aprobado y registra `DEVUELTO_PARCIAL_INQUILINO`.
- La clave de idempotencia de una devolución administrativa es `liq:<idReserva>:<t|p>:<importeEnCentavos>`.

### Registro auditable

`back/src/liquidaciones/entity/liquidacion.entity.ts` define `Liquidacion` (tabla `public.liquidacion`), el registro completo y auditable de la liquidación de una reserva. Tiene una fila por reserva (`uq_liquidacion_reserva`) y estos campos: `id_liquidacion` (PK), `id_reserva` (FK `ON DELETE CASCADE`), `estado` (varchar 40, por defecto `NO_APLICA`), `ambito_estado` fijo en `LIQUIDACION_RESERVA` y validado por FK compuesta a `estado` más `CHECK`, `importe` (`numeric(10,2)`), `moneda`, `referencia`, `observacion`, `id_admin_resolucion` (FK a `usuario`, `ON DELETE SET NULL`), `fecha_resolucion`, `fecha_pago_propietario` y `creado_en`/`actualizado_en`. El índice `IX_liquidacion_estado` cubre las consultas administrativas por estado.

La migración `back/migrations/20261112-liquidaciones.sql` crea el ámbito `LIQUIDACION_RESERVA`, sus siete estados y la tabla con las restricciones anteriores. El backfill inserta una fila por reserva copiando `estado_liquidacion`, `referencia_liquidacion`, `observacion_liquidacion` y `fecha_resolucion_liquidacion`; copia el importe solo si la liquidación ya está resuelta y `fecha_pago_propietario` solo para `PAGADO_PROPIETARIO`. Usa `ON CONFLICT (id_reserva) DO NOTHING`, por lo que es repetible y no modifica ni elimina columnas de `reserva`. El runner `back/scripts/liquidaciones.cjs` (`npm run db:liquidaciones`) informa el estado sin `--aplicar`; con `--aplicar` abre una transacción con `lock_timeout` de 10 s y un advisory lock `depa:liquidaciones`, y aplica antes las migraciones de catálogo si faltan.

Las columnas de liquidación en la reserva conservan el contrato de la API. ReservaDecisionService concentra las consultas de negocio y ReservaCicloVidaService concentra las transiciones de la reserva. ReservaReembolsoAplicacionService aplica los reembolsos confirmados y comparte la transacción con la reserva, su liquidación y la liberación de fechas cuando corresponde. LiquidacionesService registra el resultado en la entidad Liquidacion mediante ILiquidacionRepository. La consulta administrativa conserva la proyección de reservas que consume la API.

Verificación específica: `npm run test:liquidaciones` (5/5) y `npm run test:liquidaciones-entidad` (9/9). Al cierre de la fase 2, el 12/11/2026, pasan las suites completas: 173/173 pruebas `node:test` y 34/34 Jest (este último requiere Node 24.9 o superior).

## 8. Integraciones externas

| Integración | Ubicación | Contrato y comportamiento |
| --- | --- | --- |
| Dólar blue | `cotizaciones/proveedor/` | `IProveedorDolar`; `DolarApiAdapter` valida moneda/casa, limita la respuesta a 16 KiB y usa timeout de 5 s. |
| Geocodificación | `ubicacion/proveedor/` | `IGeocodificacion`; `NominatimAdapter` encapsula la consulta, la caché y la cola con timeout de 8 s. |
| Análisis facial | `verificacion-anunciante/proveedor/` | `IAnalisisFacial`; `FaceApiAdapter` carga modelos WASM desde `dist/models` y analiza la evidencia. |
| Archivos | `almacenamiento/` | `ARCHIVO_REPOSITORY` + `AlmacenamientoService`; Azure Blob, contenedores privados y URLs firmadas. |
| Correo | `mail/` | `MAIL_SERVICE` + `CORREO_REPOSITORY`; Azure Communication Services. |
| Pagos | `pagos/pasarela.module.ts` | `PASARELA_PAGOS` y `PASARELA_REEMBOLSOS`; `MercadoPagoAdapter` implementa ambos puertos. |

Regla: los consumidores importan la interface o el token, nunca el adaptador concreto. Los adaptadores de `proveedor/` no deben exponer HTTP ni decidir reglas de dominio; el service traduce sus errores.

**Desviación verificada:** `MercadoPagoAdapter` lanza `UnauthorizedException` y `ServiceUnavailableException`, y `FaceApiAdapter` lanza `BadRequestException` y `UnprocessableEntityException`. Dólar y Nominatim sí lanzan `Error` genérico y el service lo traduce. Se declara en §9.

## 9. Deuda declarada

La arquitectura real conserva estas desviaciones; no se presentan como patrón recomendado:

- **Acceso cruzado desde `UsuariosRepository`:** consulta `Reserva` y `Pago` para calcular operaciones pendientes de una cuenta. Es una lectura de tablas de otros módulos desde un repositorio.
- **Acceso cruzado desde `PublicacionesRepository`:** importa `Reserva` y la registra en `TypeOrmModule.forFeature` para calcular `cantidad_reservas`. La relación no está declarada en la entidad `Publicacion`.
- **Composición de pagos y reembolsos:** `PagosModule` importa `PagosPersistenciaModule`, `PasarelaModule`, `ReembolsosModule` y `DisputasModule`; `ReembolsosModule` importa `PagosPersistenciaModule`, `PasarelaModule` y `ReservasConsultaModule`. `PagosPersistenciaModule` exporta `PagosRegistroService` y conserva el repositorio como proveedor privado.
- **`UsuariosConsultaModule` exporta `USUARIOS_REPOSITORY`,** aunque sus consumidores actuales usan `UsuariosConsultaService` o el token dentro del mismo dominio. Es una API más amplia que la necesaria.
- **`EntityManager` en services:** `anunciantes`, `pagos`, `usuarios`, `disponibilidad` y `publicaciones` importan el tipo de TypeORM. El diseño buscaba un tipo opaco `Transaccion`, que todavía no existe.
- **Excepciones HTTP en adaptadores:** Mercado Pago y Face API lanzan excepciones de Nest desde la capa de integración, en lugar de errores de infraestructura traducidos por el service.
- **`as never`:** `grep -RIn "as never" back/src` no devuelve coincidencias. La sustitución por referencias tipadas (`referenciaUsuario`) ya está aplicada.

## 10. Verificación

Backend, desde `Proyect/back`:

```sh
npm run build
npm run lint
node --test test/*.test.cjs
npm run test:liquidaciones
npm run test:liquidaciones-entidad
node --test test/bloqueo-anunciante.test.cjs
npm run test:jest          # requiere Node 24.9 o superior
```

`package.json` define `test:bloqueo-anunciante` y `test:liquidaciones-entidad`, que compilan y luego ejecutan su archivo con `node --test`, igual que los demás scripts `test:*`.

Resultado al 12/11/2026, con el módulo de cancelaciones: 181/181 pruebas `node:test` y 34/34 pruebas Jest.

Frontend, desde `Proyect/front`:

```sh
npm run build
npm run test:imagenes-inicio
npm run test:vitalidad
node --test test/*.test.cjs
```

La compilación del frontend puede fallar sin red por Google Fonts; en ese caso se reintenta o se usa la configuración de desarrollo.

## 11. Skills

Las skills del proyecto están en `.agents/skills/`. Para cambios de código, `implementacion-segura` ordena el trabajo así:

1. `verificar-arquitectura-backend`: respetar capas, dependencias y contratos.
2. `reutilizar-capas-backend`: revisar controladores, services y repositorios existentes antes de crear archivos.
3. `organizar-dto`: ubicar y validar el contrato de entrada.
4. `decidir-enum-o-entidad`: consultar catálogos antes de modelar estados o categorías.
5. `verificar-seguridad-del-cambio`: revisar entradas externas, permisos, datos sensibles e integraciones.

La skill `implementacion-segura` también exige verificar el cambio completo, probar migraciones y seed en una base descartable cuando corresponda, y preservar el alcance. Este documento es solo de arquitectura; no reemplaza los documentos funcionales de `back/docs/`.
