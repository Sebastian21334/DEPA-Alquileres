# Informe de violaciones a principios de diseño OO — SIAlquileres

| | |
|---|---|
| **Fecha** | 27/10/2026 |
| **Base analizada** | rama `main`, commit `109b774` |
| **Alcance** | `back/` (NestJS) y `front/` (Angular) |
| **Referencia** | *Diseño de Software Orientado a Objetos — Principios de diseño*, Judith Meles (PDF 2026) |
| **Violaciones encontradas** | **39** (9 altas · 20 medias · 10 bajas) |
| **Estado** | **3 resueltas** (01, 06 y 07, rama `fix/principios-diseno-01-06-07`, commit `903f7d0`) · 36 pendientes |

## Cómo leer este informe

Cada violación tiene un **ID** (`01`, `02`, …) para que puedas pedirme cuáles resolver. Las violaciones están ordenadas por severidad:

- **Alta**: ya produce errores o inconsistencias visibles, o concentra mucho riesgo de cambio.
- **Media**: complica cada cambio en esa zona, aunque hoy funcione.
- **Baja**: es un problema de prolijidad o mantenimiento.

Cada entrada indica dónde está el problema (con enlaces a archivo y línea), qué ocurre, qué principio del PDF viola y una propuesta de solución breve. Si me pedís resolver alguna, podés indicarme otra forma de hacerlo.

Cada violación tiene además un **estado**:

- **Pendiente**: todavía no se trabajó.
- **Resuelto**: la causa se eliminó; la entrada explica cómo en "Cómo se resolvió".
- **Contenido**: se limitó el daño, pero queda parte del problema (la entrada dice qué falta).

Los enlaces de "Dónde" describen el código analizado (commit `109b774`); en las entradas resueltas, algunos de esos archivos o líneas ya cambiaron.

### Principios evaluados (tomados del PDF)

DRY · Separación de Intereses (SoC) · YAGNI · KISS · Ley de Demeter · Tell, don't ask · Programar hacia la interfaz · Composición sobre herencia · SRP · OCP / Encapsular lo que varía · LSP · ISP · DIP · Principios de implementación (CamelCase, métodos cortos 7±2, menor asombro, convenciones de código).

> No se encontraron violaciones de **LSP** ni de **Composición sobre herencia**: el proyecto casi no usa herencia (solo `JwtAuthGuard extends AuthGuard('jwt')` y `JwtStrategy extends PassportStrategy`, que respetan el contrato de la clase base).

### Metodología

1. **Lectura manual** de todos los servicios, repositorios, controladores, guards y entidades del back, y de los servicios, modelos y componentes principales del front.
2. **Escaneos automáticos** (scripts propios sobre el AST de TypeScript y búsquedas de patrones):

| Chequeo automático | Resultado |
|---|---|
| Métodos analizados (back + front, sin tests) | 802 |
| Métodos de más de 20 líneas | 111 |
| Métodos de más de 40 líneas | 30 (el mayor tiene 195) |
| Clases de más de 250 líneas o más de 20 métodos | 15 |
| Entidades TypeORM con al menos un método | **0 de 21** |
| Asignaciones directas a campos de entidades desde servicios | 85 |
| Pares de módulos con dependencia circular | 5 (`disponibilidad↔reservas`, `publicaciones↔reservas`, `imagenes↔publicaciones`, `auth↔usuarios`, `auth↔anunciantes`) |
| Métodos de repositorio declarados y nunca usados | 2 |
| Literales `'Administrador'` | 39 en 10 archivos |
| Propiedades `snake_case` / `camelCase` en entidades y DTOs | 83 / 31 |

El back ya tiene un test de arquitectura ([back/test/arquitectura.spec.ts](back/test/arquitectura.spec.ts)) que impide importar TypeORM, Azure y Mercado Pago desde servicios. Ese test no cubre `sharp` ni `bcrypt` (ver `15`).

---

## Resumen

| ID | Título | Principio(s) | Capa | Severidad | Estado |
|---|---|---|---|---|---|
| 01 | Los errores HTTP pierden el mensaje del back y el código 409 | SoC, DRY, Menor asombro | Front | Alta | **Resuelto** |
| 02 | Modelo de dominio anémico: 21 entidades sin comportamiento | Tell don't ask, SRP | Back | Alta | Pendiente |
| 03 | `ReservasService.crearPendiente`: 195 líneas, 7 responsabilidades | SRP, Métodos cortos, KISS | Back | Alta | Pendiente |
| 04 | `ReservasService.actualizarFechas`: 172 líneas, 6 responsabilidades | SRP, Métodos cortos | Back | Alta | Pendiente |
| 05 | Reglas de reserva duplicadas entre presupuesto y reserva | DRY | Back | Alta | Pendiente |
| 06 | La regla "admite reservas por fecha" está implementada 8 veces con criterios distintos | DRY, Encapsular lo que varía | Back + Front | Alta | **Resuelto** |
| 07 | Dos componentes de formulario de publicación con validaciones distintas | DRY, SRP | Front | Alta | **Resuelto** |
| 08 | Detalles de Mercado Pago dentro de la lógica de negocio | DIP, Encapsular lo que varía | Back | Alta | Pendiente |
| 09 | Componentes "dios" en el front | SRP, SoC | Front | Alta | Pendiente |
| 10 | Dependencias circulares entre módulos y repositorio concreto creado con `new` | DIP | Back | Media | Pendiente |
| 11 | Catálogos: cinco CRUD copiados y un repositorio de 30 métodos | DRY, ISP, SRP | Back | Media | Pendiente |
| 12 | `IMailService`: interfaz de 11 métodos que crece con cada notificación | ISP, OCP, SoC | Back | Media | Pendiente |
| 13 | El chequeo de "dueño de la publicación" se repite 11 veces | DRY, Tell don't ask | Back | Media | Pendiente |
| 14 | Cadenas de navegación entre objetos | Ley de Demeter | Back | Media | Pendiente |
| 15 | `sharp` y `bcrypt` se usan directamente en servicios de negocio | DIP, DRY | Back | Media | Pendiente |
| 16 | `UsuariosService` tiene cinco razones de cambio | SRP | Back | Media | Pendiente |
| 17 | `AnunciantesService` tiene varias razones de cambio | SRP | Back | Media | Pendiente |
| 18 | `CotizacionesService`: proveedor fijo, scheduler y reglas mezcladas | DIP, SRP, KISS | Back | Media | Pendiente |
| 19 | Las acciones de la prueba de vida se resuelven con `if`/ternarios en back y front | OCP, Polimorfismo, DRY | Back + Front | Media | Pendiente |
| 20 | Las categorías del catálogo usan una cadena de `if` y "Villa María" está fija en el código | OCP, Encapsular lo que varía | Back | Media | Pendiente |
| 21 | `DisponibilidadService` expone el repositorio transaccional en su API | SoC, Ley de Demeter | Back | Media | Pendiente |
| 22 | Lógica de fechas duplicada (cantidad de días, formato, mediodía) | DRY | Back + Front | Media | Pendiente |
| 23 | "Buscar o lanzar 404" copiado más de 19 veces | DRY | Back | Media | Pendiente |
| 24 | El envío de correo que no debe romper el flujo tiene el `try/catch` copiado 10 veces | DRY | Back | Media | Pendiente |
| 25 | Los roles se manejan como texto literal (`'Administrador'` ×39) | DRY, OCP | Back + Front | Media | Pendiente |
| 26 | Dos servicios y dos DTO para la misma API de publicaciones | DRY, SoC | Front | Media | Pendiente |
| 27 | Los estados de reserva y sus etiquetas se reimplementan en cada componente | DRY, SoC | Front | Media | Pendiente |
| 28 | Las entidades de base de datos se devuelven como respuesta HTTP | SoC | Back | Media | Pendiente |
| 29 | `PropietarioPublicacionGuard`: ubicación y comportamiento inesperados | SoC, Menor asombro | Back | Media | Pendiente |
| 30 | Números mágicos de negocio repetidos | Encapsular lo que varía, DRY | Back + Front | Baja | Pendiente |
| 31 | Armado del detalle de correos y `eliminarSeguro` duplicados | DRY | Back | Baja | Pendiente |
| 32 | Nombres que no corresponden con lo que hacen | Menor asombro | Back + Front | Baja | Pendiente |
| 33 | Código sin uso o especulativo | YAGNI | Back + Front | Baja | Pendiente |
| 34 | Formateo de moneda, fechas y nombres repetido en el front | DRY | Front | Baja | Pendiente |
| 35 | Modelos del front dispersos y duplicados | SoC, DRY | Front | Baja | Pendiente |
| 36 | `AdminComponent.reload`: cuatro suscripciones copiadas | KISS, DRY | Front | Baja | Pendiente |
| 37 | Lógica de negocio y DTO dentro de `CotizacionesController` | SoC, DRY | Back | Baja | Pendiente |
| 38 | Convenciones de nombres mezcladas | Convenciones, CamelCase | Back + Front | Baja | Pendiente |
| 39 | Scripts de migración con código repetido | DRY, KISS | Back | Baja | Pendiente |

---

## Severidad alta

### 01 — Los errores HTTP pierden el mensaje del back y el código 409

**Principios:** SoC · DRY · Menor asombro — **Capa:** Front — **Severidad:** Alta — **Estado:** Resuelto

**Dónde:**
- [error.interceptor.ts:8-18](front/src/app/core/interceptors/error.interceptor.ts#L8) convierte toda respuesta de error en `new Error(mensaje)`.
- 13 handlers vuelven a leer `err?.error?.message` en 7 archivos: [mis-reservas.component.ts:101](front/src/app/features/mis-reservas/mis-reservas.component.ts#L101) (5 veces), [publication-detail.component.ts:389](front/src/app/features/publication-detail/publication-detail.component.ts#L389), [publication-form.component.ts](front/src/app/features/publication-form/publication-form.component.ts) (2), [dashboard.component.ts](front/src/app/features/dashboard/dashboard.component.ts), [reserva-resultado.component.ts](front/src/app/features/reserva-resultado/reserva-resultado.component.ts), [cotizaciones-admin.component.ts](front/src/app/features/admin/cotizaciones-admin.component.ts), [location-picker.component.ts](front/src/app/shared/components/location-picker/location-picker.component.ts).
- Hay dos chequeos de `err.status === 409`: [mis-reservas.component.ts:195](front/src/app/features/mis-reservas/mis-reservas.component.ts#L195) y [publication-detail.component.ts:384](front/src/app/features/publication-detail/publication-detail.component.ts#L384).

**Qué pasa:** el interceptor ya extrajo el mensaje, pero los componentes vuelven a buscarlo con la forma original de `HttpErrorResponse`. Como reciben un `Error` plano, `err.error` y `err.status` siempre son `undefined`. Por eso:
- el usuario siempre ve el mensaje genérico ("No se pudo reprogramar la reserva") en lugar del motivo real del back ("El nuevo rango de fechas no está disponible");
- el 409 nunca se detecta: al reprogramar no se recarga el calendario, y en el checkout no se descarta el presupuesto vencido.

**Por qué viola el principio:** la responsabilidad de interpretar el error quedó repartida entre el interceptor y cada componente (SoC y DRY). Además, el interceptor cambia el tipo del error sin que los consumidores lo esperen (menor asombro).

**Propuesta:** que el interceptor lance un error tipado (por ejemplo `ApiError { status, mensaje }`) y que los componentes usen solo `err.message` y `err.status`.

**Cómo se resolvió** (commit `903f7d0`):
- El interceptor lanza [`ApiError`](front/src/app/core/interceptors/api-error.ts) con `status` y `message`. Es el único lugar que interpreta la respuesta del back. Si no hubo respuesta del servidor (`status 0`), arma un mensaje legible en lugar del texto técnico de Angular.
- Los 13 handlers leen solo `err.message`. También se corrigieron 3 handlers más de `mis-reservas` que tenían un texto de respaldo que nunca se usaba. Los dos chequeos de `409` usan `err.status` y ahora sí se ejecutan: al reprogramar se recarga el calendario, y en el checkout se descarta el presupuesto.
- **Tests:** se agregó [error.interceptor.spec.ts](front/src/app/core/interceptors/error.interceptor.spec.ts). Los tests de `mis-reservas`, del detalle y de cotizaciones simulaban el error con la forma de `HttpErrorResponse`, por eso el defecto no se detectaba. Ahora usan `ApiError`.

---

### 02 — Modelo de dominio anémico: 21 entidades sin comportamiento

**Principios:** Tell, don't ask · SRP (distribución de responsabilidades) — **Capa:** Back — **Severidad:** Alta

**Dónde:** todas las entidades en `back/src/*/entity/` tienen cero métodos. Los servicios preguntan por el estado y lo modifican campo por campo (85 asignaciones). Algunos ejemplos:
- Confirmar un pago asigna 8 campos: [reservas.service.ts:259-267](back/src/reservas/service/reservas.service.ts#L259).
- Las mismas transiciones de estado aparecen en [reserva-liquidaciones.service.ts:119-135](back/src/reservas/service/reserva-liquidaciones.service.ts#L119) y [reserva-liquidaciones.service.ts:229-250](back/src/reservas/service/reserva-liquidaciones.service.ts#L229).
- `estado_pago !== APROBADO || cancelada` se pregunta en 4 lugares de [reserva-liquidaciones.service.ts](back/src/reservas/service/reserva-liquidaciones.service.ts).
- La solicitud de verificación se aprueba, rechaza y reenvía campo por campo en [anunciantes.service.ts:175-179](back/src/anunciantes/service/anunciantes.service.ts#L175), [:231-235](back/src/anunciantes/service/anunciantes.service.ts#L231) y [:277-279](back/src/anunciantes/service/anunciantes.service.ts#L277).
- Ocupar o liberar una fecha (`fecha.disponible = …; fecha.reserva = …`): [disponibilidad.service.ts:272-275](back/src/disponibilidad/service/disponibilidad.service.ts#L272), [:286-289](back/src/disponibilidad/service/disponibilidad.service.ts#L286) y [:318-327](back/src/disponibilidad/service/disponibilidad.service.ts#L318).

**Por qué viola el principio:** el PDF pide "decirle a los objetos que hagan cosas" y definir un objeto por su comportamiento. Acá las reglas de cada estado (qué transición es válida, qué campos cambian juntos) están dispersas en los servicios, así que una regla nueva obliga a encontrar todos los lugares donde se modifica el estado.

**Propuesta:** mover las transiciones a las entidades. Por ejemplo `reserva.confirmarPago(fecha)`, `reserva.cancelar()`, `reserva.estaConfirmada()`, `reserva.registrarIntentoCodigo(codigo)`, `solicitud.aprobar()`, `solicitud.rechazar(motivo)`, `fecha.ocuparPor(idReserva)` y `fecha.liberar()`.

---

### 03 — `ReservasService.crearPendiente`: 195 líneas, 7 responsabilidades

**Principios:** SRP · Métodos cortos (7±2) · KISS — **Capa:** Back — **Severidad:** Alta

**Dónde:** [reservas.service.ts:52-246](back/src/reservas/service/reservas.service.ts#L52)

**Qué pasa:** un solo método hace todo esto:
1. valida el rango de fechas;
2. valida la publicación (activa, no propia, modalidad);
3. calcula el precio con aritmética `BigInt`;
4. valida la configuración de moneda de Mercado Pago;
5. compara las condiciones del presupuesto firmado;
6. libera las reservas vencidas;
7. dentro de la transacción, vuelve a validar el precio y la moneda, verifica la disponibilidad, construye una entidad de 35 campos y marca las fechas.

**Por qué viola el principio:** tiene muchas razones para cambiar y es el método más largo del proyecto, lejos de la pauta de 7±2 sentencias.

**Propuesta:** extraer `validarSolicitud()`, `calcularImporte()` (compartido con `05`), `verificarCondicionesVigentes()` y una fábrica `Reserva.crearPendiente(...)`. Así el método queda como una orquestación de unas 10 líneas.

---

### 04 — `ReservasService.actualizarFechas`: 172 líneas, 6 responsabilidades

**Principios:** SRP · Métodos cortos — **Capa:** Back — **Severidad:** Alta

**Dónde:** [reservas.service.ts:433-604](back/src/reservas/service/reservas.service.ts#L433)

**Qué pasa:** el método hace todo esto:
- autoriza al usuario;
- valida el estado de la reserva y la consistencia del importe;
- valida el formato de fecha con expresiones regulares;
- calcula los días con dos fórmulas;
- resuelve la idempotencia buscando en `reprogramaciones`;
- reasigna el calendario;
- arma el detalle completo del correo (conversión, nombres, montos);
- persiste el cambio y notifica.

**Por qué viola el principio:** igual que `03`. Además, armar el contenido del correo es una tarea de presentación, que no le corresponde al servicio de reservas.

**Propuesta:** separar `reserva.puedeReprogramarse()` (ver `02`), `RangoFechas.desde(dto)` (ver `22`) y un `DetalleReprogramacionFactory` reutilizable desde las notificaciones (ver `31`).

---

### 05 — Reglas de reserva duplicadas entre presupuesto y reserva

**Principios:** DRY ("cada requerimiento en un único lugar") — **Capa:** Back — **Severidad:** Alta

**Dónde:** [presupuestos.service.ts:45-89](back/src/pagos/service/presupuestos.service.ts#L45) y [reservas.service.ts:59-126](back/src/reservas/service/reservas.service.ts#L59).

**Qué pasa:** los dos métodos repiten estas reglas:
- el chequeo de `MP_CURRENCY_ID` ([:46](back/src/pagos/service/presupuestos.service.ts#L46) y [:107](back/src/reservas/service/reservas.service.ts#L107));
- "No podés reservar tu propia publicación" ([:76](back/src/pagos/service/presupuestos.service.ts#L76) y [:77](back/src/reservas/service/reservas.service.ts#L77));
- que la publicación esté activa y admita reservas por fecha;
- la cantidad de días;
- `decimalEntero(precio) * días` con su `try/catch`.

Además ya divergieron: el presupuesto rechaza fechas pasadas con validación de formato estricta y la reserva usa `new Date()` sin validar el formato.

**Por qué viola el principio:** la misma regla de negocio vive en dos lugares, que ya evolucionan por separado.

**Propuesta:** crear un objeto o servicio de dominio `ReglasReserva` / `CotizadorReserva` con `validar(publicacion, rango, idUsuario)` y `calcularImporte(publicacion, rango)`, y usarlo desde los dos servicios.

---

### 06 — La regla "admite reservas por fecha" está implementada 8 veces con criterios distintos

**Principios:** DRY · Encapsular lo que varía — **Capa:** Back + Front — **Severidad:** Alta — **Estado:** Resuelto

**Dónde:**
- **Back:** [modalidad.utils.ts:4-9](back/src/catalogos/service/modalidad.utils.ts#L4) usa el flag `permite_reservas_por_fecha` y, si no existe, la expresión `/tempor|diari/`. [publicaciones.repository.ts:244-251](back/src/publicaciones/repository/publicaciones.repository.ts#L244) usa `LIKE '%tempor%'`.
- **Front:** [crear-publicacion.component.ts:67](front/src/app/features/crear-publicacion/crear-publicacion.component.ts#L67) y [listing-card.component.ts:63](front/src/app/shared/components/listing-card/listing-card.component.ts#L63) usan solo `'tempor'`. [hero-search.component.ts:30](front/src/app/features/home/components/hero-search/hero-search.component.ts#L30) y [explorar-publicaciones.component.ts:191](front/src/app/features/explorar-publicaciones/explorar-publicaciones.component.ts#L191) usan `'tempor'` sobre el nombre. [publication-form.component.ts:71](front/src/app/features/publication-form/publication-form.component.ts#L71) y [publication-detail.component.ts:109](front/src/app/features/publication-detail/publication-detail.component.ts#L109) usan el flag con fallback a `'tempor'`.

**Qué pasa:** con una modalidad "Alquiler diario" que tiene `permite_reservas_por_fecha = true`:
- el detalle muestra el calendario de reserva;
- el formulario de alta no pide los días disponibles, así que la publicación queda sin fechas y no se puede reservar;
- la tarjeta no se marca como temporal;
- el filtro "Temporales" del catálogo no la incluye.

**Por qué viola el principio:** el criterio que varía (qué modalidad es "por fecha") no está encapsulado en un único lugar.

**Propuesta:** que el back siempre devuelva el campo calculado `admite_reservas_por_fecha` en `Modalidad` (usando `admiteReservaPorFecha`), que el repositorio filtre por ese criterio y que el front use una única función o pipe que lea ese campo.

**Cómo se resolvió** (commit `903f7d0`):
- La regla vive solo en [modalidad.entity.ts](back/src/catalogos/entity/modalidad.entity.ts), en dos versiones: `admiteReservaPorFecha()` (TypeScript) y `sqlAdmiteReservaPorFecha()` (la misma regla en SQL). Las dos usan el mismo patrón de respaldo para las filas sin configurar. Se eliminó `modalidad.utils.ts`, porque el test de arquitectura no permite que un repositorio importe desde `service/`.
- `Modalidad` calcula `admite_reservas_por_fecha` con `@AfterLoad`, `@AfterInsert` y `@AfterUpdate`. Así, toda respuesta que incluye una modalidad (catálogo, publicaciones, favoritos) trae el campo.
- `aplicarCategoria` filtra "temporales" y "largo plazo" con `sqlAdmiteReservaPorFecha` en lugar de `LIKE '%tempor%'`.
- En el front hay una única función, `admiteReservasPorFecha()` en [catalogo.model.ts](front/src/app/shared/models/catalogo.model.ts), que solo lee el campo. La usan la tarjeta, el buscador de la home, el catálogo, el detalle y el formulario compartido (ver `07`).
- **Tests:** se agregó [modalidad.entity.spec.ts](back/src/catalogos/entity/modalidad.entity.spec.ts), que cubre el caso "Alquiler diario". Se revisó el SQL que genera TypeORM, pero **no se ejecutó contra PostgreSQL**: la suite `reservas-concurrencia.postgres.spec.ts` necesita `TEST_POSTGRES_URL` y en esta PC no hay una base local.

---

### 07 — Dos componentes de formulario de publicación con validaciones distintas

**Principios:** DRY · SRP — **Capa:** Front — **Severidad:** Alta — **Estado:** Resuelto

**Dónde:** [crear-publicacion.component.ts](front/src/app/features/crear-publicacion/crear-publicacion.component.ts) (327 líneas, alta) y [publication-form.component.ts](front/src/app/features/publication-form/publication-form.component.ts) (289 líneas, edición).

**Qué pasa:** los dos componentes repiten la definición del formulario, la carga de catálogos con `forkJoin`, el cableado provincia → ciudad → mapa, la confirmación de ubicación y el armado del payload. Ya divergieron:
- `descripcion` tiene `maxLength(255)` solo en el alta ([crear-publicacion.component.ts:83](front/src/app/features/crear-publicacion/crear-publicacion.component.ts#L83)). El back exige ese máximo, así que al editar se puede escribir más y el back rechaza el guardado.
- La regla "temporal" es distinta en cada uno (ver `06`).
- La edición vuelve a chequear `isAuthenticated` ([publication-form.component.ts:94](front/src/app/features/publication-form/publication-form.component.ts#L94)), aunque la ruta ya tiene `anuncianteGuard`.

**Por qué viola el principio:** el mismo requerimiento (el formulario de una publicación) está implementado dos veces.

**Propuesta:** un único `PublicacionFormComponent` reutilizable (o un `PublicacionFormBuilder` compartido), con modo alta y modo edición.

**Cómo se resolvió** (commit `903f7d0`), con la variante del formulario compartido:
- Se creó [`PublicacionFormulario`](front/src/app/shared/forms/publicacion-formulario.ts), que cada pantalla declara en sus `providers`. Contiene:
  - la definición del formulario, con las mismas validaciones que los DTO del back (incluido el máximo de 255 caracteres en `descripcion`);
  - la carga de catálogos;
  - el cableado provincia → ciudad → mapa y la confirmación de la ubicación;
  - la regla "temporal" (ver `06`);
  - la carga de una publicación para editarla y el armado del payload.
- `CrearPublicacionComponent` (alta) y `PublicationFormComponent` (edición) usan ese formulario. Cada uno conserva solo lo propio de su pantalla: las fotos y el período inicial en el alta, y la administración de los días cargados en la edición.
- Se quitó de la edición el chequeo de `isAuthenticated` (ya lo cubre `anuncianteGuard`) y la rama de alta que nunca se ejecutaba, junto con `ListingService.create`. `CrearPublicacionDto` se reemplazó por el `PublicacionPayload` compartido.
- Las plantillas siguen siendo dos, porque las pantallas tienen diseños distintos. Pero ya no contienen reglas: las validaciones y el payload salen de un único lugar. La edición también tiene ahora `maxlength="255"` en los campos de texto.

---

### 08 — Detalles de Mercado Pago dentro de la lógica de negocio

**Principios:** DIP ("las abstracciones no deben depender de los detalles") · Encapsular lo que varía · Programar hacia la interfaz — **Capa:** Back — **Severidad:** Alta

**Dónde:**
- [pagos.service.ts:183-196](back/src/pagos/service/pagos.service.ts#L183) y [:245-250](back/src/pagos/service/pagos.service.ts#L245) interpretan los estados propios de Mercado Pago (`'approved'`, `'rejected'`, `'charged_back'`, …).
- El prefijo `'reserva:'` se arma y se parsea en [pagos.service.ts:47](back/src/pagos/service/pagos.service.ts#L47), [:118-122](back/src/pagos/service/pagos.service.ts#L118) y [:150](back/src/pagos/service/pagos.service.ts#L150).
- La abstracción [pasarela-pagos.interface.ts](back/src/pagos/repository/pasarela-pagos.interface.ts) (`PagoExterno`) copia los nombres de campo del SDK (`transaction_amount`, `currency_id`, `date_approved`).
- `ReservasService` y `PresupuestosService` leen `MP_CURRENCY_ID` ([reservas.service.ts:107](back/src/reservas/service/reservas.service.ts#L107)).
- Hay mensajes de negocio que nombran al proveedor ([reservas.service.ts:416](back/src/reservas/service/reservas.service.ts#L416) y [pagos.service.ts:91](back/src/pagos/service/pagos.service.ts#L91)).

**Por qué viola el principio:** cambiar de pasarela obligaría a modificar `PagosService`, `ReservasService` y `PresupuestosService`, aunque ya existe la interfaz `IPasarelaPagos`.

**Propuesta:** que el adaptador traduzca a un modelo propio (`ResultadoPago { referencia, estado: EstadoPagoReserva, importe, moneda, aprobadoEn }`) y encapsule el formato de la referencia externa. La moneda de cobro debería salir de una configuración de dominio y no de una variable de Mercado Pago.

---

### 09 — Componentes "dios" en el front

**Principios:** SRP · SoC — **Capa:** Front — **Severidad:** Alta

**Dónde:**

| Componente | Líneas | Métodos | Dependencias | Responsabilidades mezcladas |
|---|---|---|---|---|---|
| [captura-identidad.component.ts](front/src/app/features/solicitud-anunciante/captura-identidad/captura-identidad.component.ts) | 602 | 32 | — | cámara y selección de lente, MediaPipe, cálculo de pose, detección de gestos, dibujo en canvas, captura de fotos, máquina de estados y HTTP |
| [admin.component.ts](front/src/app/features/admin/admin.component.ts) | 463 | 32 | 2 | usuarios, publicaciones, solicitudes de verificación, liquidaciones, 5 catálogos, provincias y ciudades |
| [publication-detail.component.ts](front/src/app/features/publication-detail/publication-detail.component.ts) | 404 | 27 | 10 | galería, favoritos, chat, WhatsApp, mapa, calendario, cotización, checkout y contador de vistas |
| [mis-reservas.component.ts](front/src/app/features/mis-reservas/mis-reservas.component.ts) | 360 | 24 | 5 | listado, reprogramación, cancelación, código de alojamiento, reclamos y etiquetas de estado |

**Por qué viola el principio:** cada componente tiene muchas razones de cambio y no se puede probar ni reutilizar por partes.

**Propuesta:**
- **Captura de identidad:** extraer `CamaraService`, `DetectorVitalidad` (pose y gestos) y `OverlayRenderer` (canvas).
- **Admin:** dividirlo en subcomponentes por pestaña (`AdminUsuarios`, `AdminPublicaciones`, `AdminVerificaciones`, `AdminLiquidaciones`, `AdminCatalogos`).
- **Detalle:** extraer `GaleriaComponent` y `ReservaCheckoutComponent`.

---

## Severidad media

### 10 — Dependencias circulares entre módulos y repositorio concreto creado con `new`

**Principios:** DIP · Bajo acoplamiento — **Capa:** Back — **Severidad:** Media

**Dónde:**
- [transaccion-calendario.ts:7,22-23](back/src/disponibilidad/repository/transaccion-calendario.ts#L22): el módulo **disponibilidad** importa e instancia con `new` la clase concreta `ReservaRepository` del módulo **reservas**, y reservas a su vez depende de `DisponibilidadService`.
- `auth ↔ usuarios ↔ catalogos` solo funciona con `forwardRef` ([auth.module.ts:16](back/src/auth/auth.module.ts#L16), [usuarios.module.ts:31-32](back/src/usuarios/usuarios.module.ts#L31), [catalogos.module.ts:24](back/src/catalogos/catalogos.module.ts#L24)).
- También hay ciclos `publicaciones ↔ reservas` (el repositorio de publicaciones consulta la tabla `reserva`) e `imagenes ↔ publicaciones`.

**Por qué viola el principio:** un módulo de alto nivel depende de un detalle concreto de otro módulo, y los ciclos muestran que las responsabilidades no tienen un único dueño.

**Propuesta:** mover la unidad de trabajo transaccional a `common/persistence` con una fábrica de repositorios inyectada, y quitar la dependencia de `CatalogosModule` hacia `AuthModule` (por ejemplo, con guards que no dependan de `UsuariosService`).

---

### 11 — Catálogos: cinco CRUD copiados y un repositorio de 30 métodos

**Principios:** DRY · ISP · SRP — **Capa:** Back — **Severidad:** Media

**Dónde:** [catalogos.service.ts](back/src/catalogos/service/catalogos.service.ts) (26 métodos) e [ICatalogosRepository](back/src/catalogos/repository/catalogos.repository.interface.ts) (30 métodos).

**Qué pasa:** roles, tipos de anunciante, tipos de propiedad, modalidades y monedas repiten la misma secuencia: buscar o 404, verificar nombre duplicado, actualizar o 404, borrar con `eliminarSeguro`. Lo único que cambia es la entidad y el texto. Cualquier consumidor que necesita una sola moneda depende de los 30 métodos.

**Por qué viola el principio:** hay cinco copias de la misma lógica (DRY) y un contrato gordo que obliga a depender de métodos que no se usan (ISP).

**Propuesta:** un `CatalogoGenericoService<T>` / `RepositorioCatalogo<T>` parametrizado por entidad y nombre visible, con un proveedor por catálogo. Los textos se pueden generar a partir del nombre ("el rol", "la modalidad").

---

### 12 — `IMailService`: interfaz de 11 métodos que crece con cada notificación

**Principios:** ISP · OCP · SoC — **Capa:** Back — **Severidad:** Media

**Dónde:** [mail.interface.ts:40-83](back/src/mail/mail.interface.ts#L40) y [mail.service.ts](back/src/mail/service/mail.service.ts).

**Qué pasa:**
- Cada cliente usa entre 1 y 3 de los 11 métodos (por ejemplo, `PublicacionesService` solo usa `enviarBajaPublicacion`).
- Agregar una notificación obliga a modificar la interfaz y la implementación.
- El HTML está escrito dentro del servicio, aunque existe `MailPlantilla`.
- [`enviarResultadoVerificacion(…, aprobada: boolean)`](back/src/mail/service/mail.service.ts#L77) y [`enviarCambioBloqueo(…, bloqueado: boolean)`](back/src/mail/service/mail.service.ts#L189) usan un parámetro booleano para hacer dos cosas distintas.

**Por qué viola el principio:** la interfaz obliga a depender de métodos que no se usan (ISP) y no está cerrada a modificaciones (OCP).

**Propuesta:** un método genérico `enviar(destinatario, notificacion: Notificacion)` donde cada notificación es una clase que construye su asunto y su cuerpo (por ejemplo `ReservaConfirmadaMail` o `VerificacionAprobadaMail`). Así, una notificación nueva es una clase nueva y no hay que modificar las existentes.

---

### 13 — El chequeo de "dueño de la publicación" se repite 11 veces

**Principios:** DRY · Tell, don't ask — **Capa:** Back — **Severidad:** Media

**Dónde:** `publicacion.anunciante.idUsuario !== idUsuario` aparece en:
- [disponibilidad.service.ts:50](back/src/disponibilidad/service/disponibilidad.service.ts#L50)
- [imagenes.service.ts:37](back/src/imagenes/service/imagenes.service.ts#L37) y [:79](back/src/imagenes/service/imagenes.service.ts#L79)
- [publicaciones.service.ts:172](back/src/publicaciones/service/publicaciones.service.ts#L172) y [:253](back/src/publicaciones/service/publicaciones.service.ts#L253)
- [reservas.service.ts:76](back/src/reservas/service/reservas.service.ts#L76), [:323](back/src/reservas/service/reservas.service.ts#L323), [:376](back/src/reservas/service/reservas.service.ts#L376) y [:623](back/src/reservas/service/reservas.service.ts#L623)
- [reserva-liquidaciones.service.ts:83](back/src/reservas/service/reserva-liquidaciones.service.ts#L83)
- [presupuestos.service.ts:75](back/src/pagos/service/presupuestos.service.ts#L75)

**Propuesta:** `publicacion.perteneceA(idUsuario)` en la entidad (ver `02`) y un único `PublicacionesService.obtenerPropia(id, idUsuario)` que lance el 403.

---

### 14 — Cadenas de navegación entre objetos

**Principios:** Ley de Demeter ("hablá solo con tus amigos inmediatos") — **Capa:** Back — **Severidad:** Media

**Dónde:** hay 13 cadenas de tres o más saltos. Por ejemplo:
- `reserva.publicacion?.anunciante?.idUsuario` ([reservas.service.ts:376](back/src/reservas/service/reservas.service.ts#L376))
- `reserva.publicacion.anunciante?.usuario` ([:551](back/src/reservas/service/reservas.service.ts#L551))
- `solicitud.anunciante.usuario.nombre` ([anunciantes.service.ts:187](back/src/anunciantes/service/anunciantes.service.ts#L187))
- `publicacion.anunciante.usuario.email` ([publicaciones.service.ts:239](back/src/publicaciones/service/publicaciones.service.ts#L239))
- `imagen.publicacion.anunciante.idUsuario` ([imagenes.service.ts:79](back/src/imagenes/service/imagenes.service.ts#L79))
- `publicacion.anunciante.usuario.id` ([mensajes.service.ts:61](back/src/mensajes/service/mensajes.service.ts#L61))
- `reserva.publicacion?.anunciante?.usuario?.…` ([reserva-notificaciones.service.ts:79-108](back/src/reservas/service/reserva-notificaciones.service.ts#L79))

**Por qué viola el principio:** los servicios conocen la estructura interna del grafo de entidades, así que cualquier cambio en las relaciones rompe código alejado.

**Propuesta:** exponer métodos que respondan la pregunta directamente, como `reserva.esDelAnunciante(id)`, `publicacion.emailDelAnunciante()` o `solicitud.nombreSolicitante()` (va junto con `02` y `13`).

---

### 15 — `sharp` y `bcrypt` se usan directamente en servicios de negocio

**Principios:** DIP · DRY — **Capa:** Back — **Severidad:** Media

**Dónde:**
- `sharp`: [anunciantes.service.ts:12](back/src/anunciantes/service/anunciantes.service.ts#L12), [imagenes.service.ts:11](back/src/imagenes/service/imagenes.service.ts#L11) y [usuarios.service.ts:21](back/src/usuarios/service/usuarios.service.ts#L21). El pipeline de procesamiento de imágenes está copiado 3 veces con parámetros distintos.
- `bcrypt`: [auth.service.ts:10](back/src/auth/service/auth.service.ts#L10) y [usuarios.service.ts:18](back/src/usuarios/service/usuarios.service.ts#L18). El cálculo de `BCRYPT_COST` está duplicado en [usuarios.service.ts:252](back/src/usuarios/service/usuarios.service.ts#L252) y [:363](back/src/usuarios/service/usuarios.service.ts#L363).

**Por qué viola el principio:** la lógica de negocio depende de librerías concretas, mientras que el mismo proyecto abstrae Azure, Mercado Pago y face-api detrás de interfaces. El test de arquitectura no lo detecta porque su regex no incluye `sharp` ni `bcrypt`.

**Propuesta:** crear `IProcesadorImagenes` (con `avatar()`, `fotoPublicacion()` y `documento()`) e `IHasherContrasenias` (con `hashear()` y `comparar()`), y agregar `sharp|bcrypt` al test de arquitectura.

---

### 16 — `UsuariosService` tiene cinco razones de cambio

**Principios:** SRP — **Capa:** Back — **Severidad:** Media

**Dónde:** [usuarios.service.ts](back/src/usuarios/service/usuarios.service.ts) (343 líneas, 19 métodos).

**Qué pasa:** el servicio mezcla cinco responsabilidades:
1. el perfil propio;
2. la administración (bloqueo, eliminación, cambio de rol);
3. la foto de perfil (procesamiento y almacenamiento);
4. las credenciales (hash, tokens de verificación y de recuperación);
5. la consulta de administradores para notificaciones, que trae todos los usuarios y filtra en memoria.

**Propuesta:** separarlo en `PerfilService`, `AdministracionUsuariosService` y `CredencialesService`. La foto de perfil puede delegarse al procesador de imágenes de `15`.

---

### 17 — `AnunciantesService` tiene varias razones de cambio

**Principios:** SRP — **Capa:** Back — **Severidad:** Media

**Dónde:** [anunciantes.service.ts](back/src/anunciantes/service/anunciantes.service.ts) (370 líneas, 7 dependencias).

**Qué pasa:** el servicio hace el alta de anunciante, la carga y validación de documentos (MIME, tamaño, compresión), la verificación facial, la aprobación y el rechazo con auditoría, la firma de URLs de documentos y cuatro notificaciones por correo. `subirDocumentos` solo tiene 100 líneas ([:98](back/src/anunciantes/service/anunciantes.service.ts#L98)).

**Propuesta:** separar `SolicitudVerificacionService` (documentos y estado) de `RevisionVerificacionService` (aprobar, rechazar y auditar), y mover el procesamiento de archivos al procesador de imágenes (`15`).

---

### 18 — `CotizacionesService`: proveedor fijo, scheduler y reglas mezcladas

**Principios:** DIP · SRP · KISS — **Capa:** Back — **Severidad:** Media

**Dónde:** [cotizaciones.service.ts](back/src/cotizaciones/service/cotizaciones.service.ts)

**Qué pasa:**
- El servicio guarda `proveedor: 'DolarApi / DolarHoy'` y `tipo: 'blue'` fijos ([:120-121](back/src/cotizaciones/service/cotizaciones.service.ts#L120)), aunque existe la abstracción `IProveedorDolar`: si cambia el proveedor, el registro queda mal.
- El mismo servicio programa el `setInterval` ([:55](back/src/cotizaciones/service/cotizaciones.service.ts#L55)), decide la vigencia y arma el reporte de administración.
- `obtenerVigente` tiene una condición de 5 cláusulas con `Date.now() - new Date(...).getTime()` repetido 3 veces ([:149-161](back/src/cotizaciones/service/cotizaciones.service.ts#L149)).

**Propuesta:** que `IProveedorDolar` informe su nombre y el tipo de cotización, extraer una `PoliticaVigenciaCotizacion` (con `estaVigente()` y `edad()`) y mover el scheduler a una clase aparte.

---

### 19 — Las acciones de la prueba de vida se resuelven con `if`/ternarios en back y front

**Principios:** OCP · Polimorfismo · DRY — **Capa:** Back + Front — **Severidad:** Media

**Dónde:**
- Back: [verificacion-facial.service.ts:207-232](back/src/anunciantes/service/verificacion-facial.service.ts#L207) usa un ternario anidado por tipo de acción.
- Front: [captura-identidad.component.ts:523-531](front/src/app/features/solicitud-anunciante/captura-identidad/captura-identidad.component.ts#L523) (`isActionDetected`) y [:593-608](front/src/app/features/solicitud-anunciante/captura-identidad/captura-identidad.component.ts#L593) (`drawActionArrow`).

**Qué pasa:** agregar un gesto obliga a modificar al menos 4 lugares. Además, los umbrales ya no coinciden: para girar, el front pide 0.07 y el back 0.06; para inclinar, el front pide 0.18 y el back 0.15; para la boca se usan métricas distintas.

**Propuesta:** un mapa o estrategia por acción (`{ TURN_LEFT: { detectar, dibujar, etiqueta } }`) en cada capa, con los umbrales definidos en un único lugar.

---

### 20 — Las categorías del catálogo usan una cadena de `if` y "Villa María" está fija en el código

**Principios:** OCP · Encapsular lo que varía — **Capa:** Back — **Severidad:** Media

**Dónde:** [publicaciones.repository.ts:240-261](back/src/publicaciones/repository/publicaciones.repository.ts#L240) (`aplicarCategoria`) y el tipo `CategoriaInicio` en [publicaciones.repository.interface.ts:3-4](back/src/publicaciones/repository/publicaciones.repository.interface.ts#L3).

**Qué pasa:** cada categoría nueva obliga a modificar el tipo, la cadena de `if` y el orden especial de `'reservadas'` ([:178-185](back/src/publicaciones/repository/publicaciones.repository.ts#L178)). Además, la categoría `'villa-maria'` filtra por los textos `['villa maria', 'villa maría']`: es un dato de negocio escrito dentro del repositorio.

**Propuesta:** un registro de categorías (`Record<CategoriaInicio, (qb) => void>`), con la ciudad destacada como dato configurable (en un catálogo o en el entorno).

---

### 21 — `DisponibilidadService` expone el repositorio transaccional en su API

**Principios:** SoC · Ley de Demeter · Métodos con muchos parámetros — **Capa:** Back — **Severidad:** Media

**Dónde:** `verificarDisponibilidad(…, fechaRepository)`, `marcarComoReservadas(…, fechaRepository)`, `liberarReserva(…, fechaRepository)` y `reprogramarReserva(…, fechaRepository)` en [disponibilidad.service.ts:212-330](back/src/disponibilidad/service/disponibilidad.service.ts#L212). Dos de esos métodos tienen 5 parámetros.

**Qué pasa:** los servicios de reservas tienen que abrir la transacción, sacar el repositorio de fechas y pasárselo a otro servicio. La API de negocio queda atada a un detalle de persistencia.

**Propuesta:** que la unidad de trabajo se propague de forma implícita (por ejemplo con `AsyncLocalStorage` o un `EntityManager` por request), o que `DisponibilidadService` exponga operaciones que reciban un contexto opaco.

---

### 22 — Lógica de fechas duplicada (cantidad de días, formato, mediodía)

**Principios:** DRY — **Capa:** Back + Front — **Severidad:** Media

**Dónde:**
- **Cantidad de días:** está calculada 8 veces en el back, con tres constantes distintas (`1000*60*60*24`, `86400000` y `86_400_000`): [reservas.service.ts:92](back/src/reservas/service/reservas.service.ts#L92), [:507](back/src/reservas/service/reservas.service.ts#L507), [:510](back/src/reservas/service/reservas.service.ts#L510), [presupuestos.service.ts:77](back/src/pagos/service/presupuestos.service.ts#L77), [disponibilidad.service.ts:228](back/src/disponibilidad/service/disponibilidad.service.ts#L228), [:308](back/src/disponibilidad/service/disponibilidad.service.ts#L308), [reserva-notificaciones.service.ts:67](back/src/reservas/service/reserva-notificaciones.service.ts#L67) y [cotizaciones.controller.ts:56](back/src/cotizaciones/controller/cotizaciones.controller.ts#L56). En el front hay 3 cálculos más.
- **Validación `YYYY-MM-DD` y `hoyTexto`:** está copiada línea por línea en [presupuestos.service.ts:54-69](back/src/pagos/service/presupuestos.service.ts#L54) y [reservas.service.ts:484-502](back/src/reservas/service/reservas.service.ts#L484).
- **El truco `T12:00:00`** para evitar el corrimiento de zona horaria se repite en 7 archivos (6 del front y 1 del back).

**Propuesta:** un value object `RangoFechas` en el back (con `desde(dto)`, `cantidadDias()` y `esFuturo()`) y usar en todo el front el `rental-dates.ts` que ya existe.

---

### 23 — "Buscar o lanzar 404" copiado más de 19 veces

**Principios:** DRY — **Capa:** Back — **Severidad:** Media

**Dónde:**
- `if (!reserva) throw new NotFoundException('No se encontró la reserva …')` aparece 12 veces en `reservas.service.ts` y `reserva-liquidaciones.service.ts`.
- `'Usuario no encontrado'` aparece 7 veces en [usuarios.service.ts](back/src/usuarios/service/usuarios.service.ts).
- En los catálogos hay 13 variantes más (ver `11`).

**Propuesta:** métodos privados `obtenerReserva(repo, id)` y `obtenerUsuario(id)`, o un helper genérico `encontrarOFallar(promesa, mensaje)`.

---

### 24 — El envío de correo que no debe romper el flujo tiene el `try/catch` copiado 10 veces

**Principios:** DRY — **Capa:** Back — **Severidad:** Media

**Dónde:** el mismo bloque `try { await this.mailService.X(...) } catch (error) { this.logger.error(...) }` está en:
- [anunciantes.service.ts](back/src/anunciantes/service/anunciantes.service.ts) (4 veces)
- [auth.service.ts](back/src/auth/service/auth.service.ts) (3)
- [usuarios.service.ts](back/src/usuarios/service/usuarios.service.ts) (1)
- [publicaciones.service.ts](back/src/publicaciones/service/publicaciones.service.ts) (1)
- [mensajes.service.ts](back/src/mensajes/service/mensajes.service.ts) (1)

**Propuesta:** un método `notificarSinFallar(fn, contexto)` en un `NotificadorService`, o un decorador sobre `IMailService` que registre el error en el log en lugar de propagarlo.

---

### 25 — Los roles se manejan como texto literal (`'Administrador'` ×39)

**Principios:** DRY · OCP · Encapsular lo que varía — **Capa:** Back + Front — **Severidad:** Media

**Dónde:** 39 literales en 10 archivos:
- `@Roles('Administrador')` en 8 controladores;
- la lógica de [usuarios.service.ts:60](back/src/usuarios/service/usuarios.service.ts#L60), [:224](back/src/usuarios/service/usuarios.service.ts#L224) y [:261](back/src/usuarios/service/usuarios.service.ts#L261);
- `isAdmin` en [auth.service.ts:66](front/src/app/core/services/auth.service.ts#L66) del front.

Renombrar el rol en el panel de catálogos (que lo permite) dejaría a todos sin permisos de administración.

**Propuesta:** un `enum Rol` compartido, o una constante `ROL_ADMINISTRADOR`, más una regla que impida renombrar o borrar los roles del sistema.

---

### 26 — Dos servicios y dos DTO para la misma API de publicaciones

**Principios:** DRY · SoC — **Capa:** Front — **Severidad:** Media

**Dónde:**
- `POST /publicaciones` se llama desde [listing.service.ts:75](front/src/app/features/home/listing.service.ts#L75) y desde [gestion-publicaciones.service.ts:38](front/src/app/shared/services/gestion-publicaciones.service.ts#L38).
- `CrearPublicacionDto` (en el servicio) y `PublicacionPayload` (en [publicacion.model.ts:39](front/src/app/shared/models/publicacion.model.ts#L39)) son idénticos.
- `ListingService` vive en `features/home` pero lo usan 5 features distintas.

**Propuesta:** un único `PublicacionesApiService` en `shared/services`, con un solo DTO en `shared/models`.

**Avance parcial** (al resolver `07`): `POST /publicaciones` ya solo se llama desde `GestionPublicacionesService`, y `CrearPublicacionDto` se eliminó en favor de `PublicacionPayload`. Siguen existiendo dos servicios para la misma API, así que el estado sigue en Pendiente.

---

### 27 — Los estados de reserva y sus etiquetas se reimplementan en cada componente

**Principios:** DRY · SoC — **Capa:** Front — **Severidad:** Media

**Dónde:**
- Hay 38 literales de estado (`'APROBADO'`, `'RETENIDO'`, …) en 7 archivos.
- Hay tres traducciones distintas de `estado_pago` a texto: [mis-reservas.component.ts:312](front/src/app/features/mis-reservas/mis-reservas.component.ts#L312), [reserva-resultado.component.ts:197](front/src/app/features/reserva-resultado/reserva-resultado.component.ts#L197) y [admin.component.ts](front/src/app/features/admin/admin.component.ts).
- La regla "reserva activa = aprobada, no cancelada y no finalizada" también se repite.

**Propuesta:** un `enum` o tipo en `shared/models/reserva.model.ts`, un `EstadoReservaPipe` y funciones puras como `estaConfirmada(reserva)`. Idealmente, que el back devuelva campos calculados (`puede_cancelar`, `puede_reprogramar`).

---

### 28 — Las entidades de base de datos se devuelven como respuesta HTTP

**Principios:** SoC (separar persistencia de presentación) — **Capa:** Back — **Severidad:** Media

**Dónde:** los controladores devuelven entidades TypeORM tal cual. Por ejemplo, el endpoint público `GET /publicaciones/:id` ([publicaciones.repository.ts:43-58](back/src/publicaciones/repository/publicaciones.repository.ts#L43)) carga `anunciante.usuario` completo, y la respuesta incluye `email`, `telefono`, `bloqueado` y `email_verificado` del anunciante para cualquier visitante. Solo los secretos están protegidos con `select: false`. Lo mismo ocurre con `Reserva` y `Mensaje`.

**Por qué viola el principio:** el modelo de persistencia es a la vez el contrato de la API. Cualquier columna nueva queda expuesta automáticamente.

**Propuesta:** DTO o mappers de salida por caso de uso (por ejemplo `PublicacionPublicaDto` o `ReservaDetalleDto`). Ya hay un ejemplo del enfoque en `usuarioSinSecretos` y en los DTO de disponibilidad.

---

### 29 — `PropietarioPublicacionGuard`: ubicación y comportamiento inesperados

**Principios:** SoC · Menor asombro — **Capa:** Back — **Severidad:** Media

**Dónde:** [propietario-publicacion.guard.ts:20-35](back/src/common/guards/propietario-publicacion.guard.ts#L20)

**Qué pasa:**
- Es un guard "común" llamado *PropietarioPublicacion*, pero depende de `DisponibilidadService`, y la regla de propiedad vive en [`DisponibilidadService.validarPropiedad`](back/src/disponibilidad/service/disponibilidad.service.ts#L32) en lugar de en Publicaciones.
- Interpreta `req.params.id` siempre como id de **Fecha** ([:30](back/src/common/guards/propietario-publicacion.guard.ts#L30)). Si se reutiliza en una ruta `/publicaciones/:id`, validaría contra una fecha con ese id.

**Propuesta:** mover la validación de propiedad a `PublicacionesService` y que el guard reciba por metadata qué parámetro leer y de qué tipo es (`@RecursoPropio('fecha', 'id')`), o que cada módulo tenga su propio guard.

---

## Severidad baja

### 30 — Números mágicos de negocio repetidos

**Principios:** Encapsular lo que varía · DRY — **Capa:** Back + Front — **Severidad:** Baja

**Dónde:**
- **Límite de intentos de código:** `5` aparece 3 veces en [reserva-liquidaciones.service.ts:107-127](back/src/reservas/service/reserva-liquidaciones.service.ts#L107).
- **Vencimiento de la reserva pendiente:** `15 * 60 * 1000` en [reservas.service.ts:220](back/src/reservas/service/reservas.service.ts#L220), y `900` dos veces en [presupuestos.service.ts:116](back/src/pagos/service/presupuestos.service.ts#L116) y [:135](back/src/pagos/service/presupuestos.service.ts#L135).
- **Tamaño máximo de archivo:** `5 * 1024 * 1024` aparece 4 veces ([anunciantes.controller.ts:42](back/src/anunciantes/controller/anunciantes.controller.ts#L42), [:65](back/src/anunciantes/controller/anunciantes.controller.ts#L65), [anunciantes.service.ts:380](back/src/anunciantes/service/anunciantes.service.ts#L380) y [usuarios.controller.ts:58](back/src/usuarios/controller/usuarios.controller.ts#L58)).
- **Tolerancia de importes:** `0.009` aparece 2 veces ([pagos.service.ts:160](back/src/pagos/service/pagos.service.ts#L160) y [reservas.service.ts:475](back/src/reservas/service/reservas.service.ts#L475)).
- **Cotizaciones:** `-300000`, `60000`, `100000000` y `3600000` en [cotizaciones.service.ts](back/src/cotizaciones/service/cotizaciones.service.ts).
- **Tipo de moneda:** el literal `'ARS' | 'USD'` se repite en varios archivos.

**Propuesta:** constantes con nombre en un archivo de reglas por módulo (por ejemplo `reservas.constantes.ts`), y un tipo `Moneda` compartido.

---

### 31 — Armado del detalle de correos y `eliminarSeguro` duplicados

**Principios:** DRY — **Capa:** Back — **Severidad:** Baja

**Dónde:**
- El bloque `conversion: { importeOrigen, monedaOrigen, cotizacionVenta, fechaFuente, proveedor }` es idéntico en [reservas.service.ts:561-574](back/src/reservas/service/reservas.service.ts#L561) y [reserva-notificaciones.service.ts:85-98](back/src/reservas/service/reserva-notificaciones.service.ts#L85). El armado de "nombre completo o valor por defecto" también se repite.
- `eliminarSeguro` está copiado en [catalogos.service.ts:288](back/src/catalogos/service/catalogos.service.ts#L288) y [ubicacion.service.ts:128](back/src/ubicacion/service/ubicacion.service.ts#L128).
- Las relaciones de la publicación (`relations: {…}`) se repiten 4 veces en [publicaciones.repository.ts](back/src/publicaciones/repository/publicaciones.repository.ts#L47).

**Propuesta:** `detalleConversion(reserva)` en un helper o en la entidad; mover `eliminarSeguro` a `common/persistence`; y una constante `RELACIONES_PUBLICACION`.

---

### 32 — Nombres que no corresponden con lo que hacen

**Principios:** Menor asombro ("el nombre del método debería corresponder con lo que hace") — **Capa:** Back + Front — **Severidad:** Baja

**Dónde:**
- [`@Delete(':id/rechazar')`](back/src/anunciantes/controller/anunciantes.controller.ts#L188) no borra nada: el propio servicio aclara que "rechazar ya no elimina al anunciante".
- [`IReservaRepository.buscarCondicionesPublicacion`](back/src/reservas/repository/reserva.repository.ts#L25): un repositorio de reservas que consulta publicaciones.
- `FaceApiAnalisisRepository` / `IAnalisisFacialRepository` se llaman *Repository*, pero son un motor de inferencia y no persisten nada.
- [`etiquetaRol`](front/src/app/shared/models/perfil.model.ts) traduce `'Usuario'` a `'Inquilino'` y su comentario dice que el back asigna "Usuario", pero el back asigna `'Inquilino'` ([usuarios.service.ts:261](back/src/usuarios/service/usuarios.service.ts#L261)).
- Hay comentarios de ruta desactualizados: `// mensajes/servicio/...`, `// reservas/repositorio/...` y `// reservas/controlador/...`.

**Propuesta:** usar `PATCH /anunciantes/:id/rechazo`; mover la consulta a `PublicacionesRepository`; renombrar a `IAnalizadorFacial` / `FaceApiAnalizador`; eliminar la traducción obsoleta y los comentarios viejos.

---

### 33 — Código sin uso o especulativo

**Principios:** YAGNI — **Capa:** Back + Front — **Severidad:** Baja

**Dónde:**
- [`IPublicacionesRepository.buscarTodasActivas`](back/src/publicaciones/repository/publicaciones.repository.interface.ts#L39) y su implementación no se usan en ningún lugar.
- [`ReservaRepository.guardarVarias`](back/src/reservas/repository/reserva.repository.ts#L79) no se usa.
- [`AppService.getHello`](back/src/app.service.ts#L6) devuelve "Hello World!" (resto del starter de NestJS).
- `PublicationFormComponent` tiene una rama de **alta** (`listings.create` y las condiciones `!this.editing`, en [publication-form.component.ts:180-220](front/src/app/features/publication-form/publication-form.component.ts#L180)) que nunca se ejecuta, porque la ruta solo lo usa para editar. Por la misma razón, `ListingService.create` queda sin uso.
- [`AdminComponent.esVideo`](front/src/app/features/admin/admin.component.ts#L314) contempla videos, pero el back solo acepta JPEG para `rostro`.

**Propuesta:** eliminar todo esto. Si hace falta un health check, reemplazar el "Hello World" por un `/health` explícito.

**Avance parcial** (al resolver `07`): ya se eliminaron la rama de alta de `PublicationFormComponent` y `ListingService.create`. Quedan los otros puntos.

---

### 34 — Formateo de moneda, fechas y nombres repetido en el front

**Principios:** DRY — **Capa:** Front — **Severidad:** Baja

**Dónde:**
- `toLocaleString`, `toLocaleDateString` o `Intl.*` se usan en 12 archivos. Solo [publication-detail.component.ts](front/src/app/features/publication-detail/publication-detail.component.ts) tiene tres formateadores de importe (`price`, `formatCurrency` y `formatAmount`).
- `${nombre} ${apellido}` se arma a mano 9 veces en 7 archivos.

**Propuesta:** crear los pipes `importe`, `fechaCorta` y `nombreCompleto` en `shared/pipes` (ya existe `relative-time.pipe.ts` como ejemplo).

---

### 35 — Modelos del front dispersos y duplicados

**Principios:** SoC · DRY — **Capa:** Front — **Severidad:** Baja

**Dónde:**
- Hay 38 interfaces o tipos exportados desde servicios y componentes en lugar de `shared/models`. Por ejemplo, `Reserva` y 8 tipos más viven en [reservation.service.ts](front/src/app/shared/services/reservation.service.ts).
- Hay duplicados: `AdminUser` ([admin.service.ts](front/src/app/features/admin/admin.service.ts)) ≅ `PerfilUsuario` ([perfil.model.ts](front/src/app/shared/models/perfil.model.ts)), y `CrearPublicacionDto` ≅ `PublicacionPayload` (ver `26`).

**Propuesta:** mover los modelos de dominio a `shared/models` y dejar en cada servicio solo los tipos propios de la petición.

---

### 36 — `AdminComponent.reload`: cuatro suscripciones copiadas

**Principios:** KISS · DRY — **Capa:** Front — **Severidad:** Baja

**Dónde:** [admin.component.ts:106-153](front/src/app/features/admin/admin.component.ts#L106)

**Qué pasa:** hay cuatro bloques `subscribe({ next, error })` idénticos con un contador manual `pending`. El mismo archivo ya usa `forkJoin` para los catálogos. Además, el helper `run` recibe `request: () => any` ([:317](front/src/app/features/admin/admin.component.ts#L317)).

**Propuesta:** usar `forkJoin` (o `combineLatest`) con `finalize` y tipar `run<T>(request: () => Observable<T>, …)`.

---

### 37 — Lógica de negocio y DTO dentro de `CotizacionesController`

**Principios:** SoC · DRY — **Capa:** Back — **Severidad:** Baja

**Dónde:** [cotizaciones.controller.ts:24-58](back/src/cotizaciones/controller/cotizaciones.controller.ts#L24)

**Qué pasa:**
- El DTO está declarado dentro del controlador.
- El controlador valida que `desde <= hasta` y convierte la zona horaria con `-03:00` fijo y `+ 86400000`.
- `new ValidationPipe({ transform, whitelist, forbidNonWhitelisted })` se vuelve a declarar en 3 lugares porque el pipe global de [main.ts:14](back/src/main.ts#L14) no tiene `transform: true`.

**Propuesta:** mover el DTO a `dto/`, la conversión al servicio (o a `RangoFechas`, ver `22`) y activar `transform` en el pipe global.

---

### 38 — Convenciones de nombres mezcladas

**Principios:** Convenciones de código · Notación CamelCase — **Capa:** Back + Front — **Severidad:** Baja

**Dónde:**
- **snake_case y camelCase:** las entidades y DTO tienen 83 propiedades en `snake_case` y 31 en `camelCase`, incluso dentro de la misma clase. Por ejemplo, `Publicacion` tiene `fecha_publicacion` y `tipoMoneda`, y `Anunciante` tiene `idUsuario` y `numero_contacto`.
- **Español e inglés:**
  - las carpetas de features mezclan idiomas (`publication-detail`, `advertiser-profile` y `favorites` junto a `mis-reservas` y `crear-publicacion`);
  - las señales de un mismo componente también (`selectedProvince` junto a `nombresUbicacion`);
  - la API de verificación usa `challengeToken`, `livePhoto`, `instructions` y `valid` en un back escrito en español.

**Propuesta:** definir una convención (por ejemplo, propiedades TypeScript en camelCase con `@Column({ name: 'snake_case' })`, y español como idioma del dominio) y aplicarla de forma gradual, empezando por los módulos que se toquen.

---

### 39 — Scripts de migración con código repetido

**Principios:** DRY · KISS — **Capa:** Back — **Severidad:** Baja

**Dónde:** los 5 archivos de [back/scripts/](back/scripts) repiten la conexión `pg`, el flag `--aplicar` y la lectura del `.sql` (por ejemplo [calendario-unico.cjs](back/scripts/calendario-unico.cjs) y [reprogramacion-reservas.cjs](back/scripts/reprogramacion-reservas.cjs)), aunque TypeORM ya tiene un mecanismo de migraciones versionadas.

**Propuesta:** usar migraciones de TypeORM, o al menos un `scripts/_migrar.cjs` común que reciba el archivo `.sql`.

---

## Próximo paso

Decime qué IDs querés que resuelva (por ejemplo "01, 06 y 07") y, si querés, cómo. Si no me indicás un enfoque, uso la propuesta de cada entrada.

**01**, **06** y **07**, que producían fallas visibles, ya están resueltas en la rama `fix/principios-diseno-01-06-07`. Sugerencia para seguir: **02** + **13** + **14**, porque se resuelven juntos al darles comportamiento a las entidades. `Modalidad` ya tiene un primer método (ver `06`).
