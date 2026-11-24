# DEPA — Estado actual del proyecto para memoria de Claude

Actualizado: 18 de octubre de 2026, zona horaria Argentina.

Este documento sirve como contexto para continuar el desarrollo. Describe funcionalidades presentes en el código, decisiones confirmadas por el usuario y verificaciones realizadas. La presencia de una integración en el código no implica que se haya validado contra servicios reales o que esté desplegada.

## 1. Resumen del proyecto

DEPA es una aplicación de alquileres de propiedades desarrollada para el seminario integrador. Permite explorar inmuebles, registrarse, solicitar el alta como anunciante, publicar propiedades, gestionar disponibilidad, reservar alojamientos temporales mediante Mercado Pago y comunicarse entre usuarios.

Los contextos principales de uso son:

- Visitante: consulta el catálogo y los detalles públicos.
- Usuario autenticado/inquilino: administra su perfil, favoritos, mensajes y reservas.
- Anunciante verificado: publica propiedades y administra sus publicaciones, imágenes, disponibilidad y reservas recibidas.
- Administrador: gestiona usuarios, solicitudes de anunciantes, publicaciones, catálogos, ubicaciones y liquidaciones manuales.

El rol administrativo se llama exactamente `Administrador`. La condición de anunciante se comprueba además mediante el perfil de anunciante y su verificación; no debe confundirse con tener solamente un nombre de rol en el token.

## 2. Repositorio y tecnologías

Directorio local de referencia:

```text
C:\Users\sebas\OneDrive\Desktop\Proyectos\seminario_integrador
```

Estructura:

```text
front/                 Aplicación Angular
back/                  API NestJS
back/src/              Módulos del backend
back/test/             Pruebas de contratos, arquitectura, módulos y baja administrativa
back/migrations/       SQL e instrucciones de migración
back/scripts/          Scripts de mantenimiento e importación
front/src/app/         Funcionalidades, servicios, modelos y componentes compartidos
front/public/          Recursos de interfaz y modelos utilizados en el navegador
```

Tecnologías declaradas en los manifiestos:

| Capa | Tecnologías |
| --- | --- |
| Frontend | Angular 22.1, TypeScript 6, componentes standalone, signals, RxJS, Forms y Router |
| Interfaz | CSS/SCSS, Tailwind CSS 4, iconos Lucide |
| Mapas | Leaflet y servicio de búsqueda de direcciones |
| Backend | NestJS 12, TypeScript 6, Passport/JWT, class-validator y class-transformer |
| Persistencia | PostgreSQL y TypeORM |
| Archivos | Azure Blob Storage, Multer y Sharp |
| Correo | Azure Communication Services Email |
| Pagos | Mercado Pago Checkout Pro |
| Identidad | MediaPipe en el navegador; face-api/TensorFlow y adaptadores de análisis en el backend |
| Pruebas | Jest, ts-jest y Supertest en backend; configuración Angular/Vitest en frontend |

Aunque hay dependencias relacionadas con SSR, la configuración actual de compilación del frontend genera una aplicación de navegador. No asumir que SSR está habilitado.

## 3. Arquitectura y criterios existentes

- Backend dividido en controladores, servicios de negocio y repositorios.
- Los controladores delegan en los servicios; las consultas de persistencia quedan en repositorios.
- Los proveedores externos se encapsulan en adaptadores, por ejemplo correo, almacenamiento y Mercado Pago.
- Se utilizan contratos y tokens de inyección como `PUBLICACIONES_REPOSITORY`, `MAIL_SERVICE` y `PASARELA_PAGOS`.
- Hay pruebas que verifican los límites de esta arquitectura y la composición de los módulos.
- La API aplica validación global: elimina/rechaza propiedades ajenas a los DTO mediante `whitelist` y `forbidNonWhitelisted`.
- Las operaciones privadas usan JWT; las administrativas agregan `RolesGuard` y `@Roles('Administrador')`.
- Las operaciones de dueño validan la propiedad en el servidor. Los guards del frontend no reemplazan esa autorización.

## 4. Funcionalidades integradas

### 4.1. Cuentas, acceso y perfil

- Registro con normalización del email y contraseña almacenada con bcrypt.
- Verificación de correo y reenvío del enlace de verificación.
- Inicio de sesión con JWT; requiere cuenta con email verificado y no bloqueada.
- Recuperación y restablecimiento de contraseña mediante token.
- Consulta y edición del perfil personal.
- Carga y eliminación de foto de perfil.
- Administración de usuarios: listado, cambio de rol, bloqueo y habilitación.
- Aviso por correo ante cambios de bloqueo.
- La estrategia JWT consulta el usuario actual en la base: bloqueos y cambios de rol se reflejan en las solicitudes protegidas, sin depender únicamente del rol antiguo del token.

Referencias: `back/src/auth/`, `back/src/usuarios/`, `front/src/app/core/` y las pantallas de autenticación/perfil.

### 4.2. Alta y verificación de anunciantes

- Solicitud de alta con datos del anunciante.
- Captura/carga de documentación: DNI frente, DNI dorso y rostro.
- Desafíos de prueba de vida y comparación facial con el documento.
- Consulta del estado de la solicitud y su historial de revisiones.
- Reenvío de documentación para revisión.
- Panel administrativo para aprobar o rechazar solicitudes con motivo.
- Correos de recepción, envío a revisión y resultado de verificación.
- Los documentos de verificación se entregan mediante URLs firmadas temporales del almacenamiento.

Referencias: `back/src/anunciantes/` y `front/src/app/features/solicitud-anunciante/`.

### 4.3. Catálogo y publicaciones

- Inicio y exploración del catálogo.
- Detalle de publicación y perfil público del anunciante.
- Creación y edición de publicaciones por el anunciante propietario.
- Título, descripción, precio, moneda, modalidad, tipo de propiedad, dirección, provincia, ciudad, coordenadas, ambientes y superficie.
- Gestión de imágenes, portada según orden de carga y almacenamiento en Azure.
- Las publicaciones nuevas nacen inactivas y se activan al guardar su primera imagen, salvo que tengan una baja administrativa.
- El catálogo público exige publicaciones activas y con imágenes.
- Búsqueda por palabras sobre información del inmueble y anunciante, con normalización de acentos.
- Filtros por ubicación, tipo de propiedad, moneda, precio, superficie y ambientes.
- Orden por fecha, precio y título; categorías de inicio, incluidas temporales, largo plazo, Villa María y reservadas.
- Paginación del catálogo resuelta en la base, con límite máximo de 50 por página.
- Registro de visualizaciones y presentación de métricas en el panel del anunciante.
- Se mantiene la eliminación propia del anunciante en su circuito existente. La moderación administrativa utiliza una baja lógica diferente.

Referencias: `back/src/publicaciones/`, `back/src/imagenes/`, `front/src/app/features/explorar-publicaciones/`, `publication-detail/`, `crear-publicacion/`, `publication-form/`, `mis-publicaciones/` y `dashboard/`.

### 4.4. Baja administrativa de publicaciones: última integración

**Requisito definitivo del usuario:** cualquier administrador puede dar de baja una publicación de cualquier persona, sin eliminarla. Debe indicar un motivo, informar al dueño por correo y mostrar en Mis publicaciones que fue desactivada por un administrador junto con la razón.

Comportamiento implementado:

1. El panel administrativo incluye una sección Publicaciones con registros activos e inactivos de todos los anunciantes.
2. Permite buscar por título, ID, nombre/apellido o email del anunciante.
3. La acción Dar de baja abre un formulario con motivo obligatorio de hasta 500 caracteres.
4. Al confirmar, el backend guarda `activa = false` y `motivo_baja_admin`.
5. La publicación se conserva en la base y desaparece del catálogo público por quedar inactiva.
6. Se intenta enviar al email registrado del dueño un correo con el título, motivo y enlace a Mis publicaciones.
7. En Mis publicaciones se muestra **Desactivada por un administrador** y **Motivo de la baja**.
8. Se impide la reactivación por edición con `activa: true` y por carga de imágenes.
9. Si falla el correo, la baja se conserva; el panel informa el fallo y permite repetir la baja para reintentar el aviso.
10. La opción Actualizar baja / reenviar aviso permite cambiar el motivo y enviar otra notificación.

Contrato de la API:

```http
GET /publicaciones/administracion
Authorization: Bearer <token de administrador>
```

Devuelve todas las publicaciones para el panel. Actualmente este listado administrativo no tiene paginación.

```http
PATCH /publicaciones/administracion/:id/baja
Authorization: Bearer <token de administrador>
Content-Type: application/json

{ "motivo": "Razón de la desactivación" }
```

Respuesta de éxito:

```json
{
  "publicacion": {
    "id": 10,
    "activa": false,
    "motivo_baja_admin": "Razón de la desactivación"
  },
  "correoEnviado": true
}
```

La respuesta real de `publicacion` también incluye los demás datos y relaciones cargados. `correoEnviado: false` indica que la baja se guardó pero el envío falló; no significa que se haya revertido la operación.

Detalles que deben conservarse al continuar:

- Ambas rutas están restringidas mediante `JwtAuthGuard`, `RolesGuard` y el rol `Administrador`.
- No exigen que el administrador sea anunciante ni propietario.
- `motivo_baja_admin` es una columna nullable de tipo varchar(500), añadida a `Publicacion` y reflejada en el modelo Angular.
- El motivo no vacío es el indicador persistente de una baja administrativa. No hay un booleano separado para este estado.
- El repositorio actualiza directamente las columnas de baja, sin eliminar registros ni sincronizar relaciones de imágenes.
- La activación por imagen incluye una condición SQL que exige que `motivo_baja_admin` sea nulo.
- El método de correo es `IMailService.enviarBajaPublicacion(destinatario, titulo, motivo)`; el contenido dinámico se escapa antes de insertarse en HTML.
- No se agregó una ruta administrativa de eliminación definitiva.
- No se implementó rehabilitación administrativa, historial de motivos, fecha de baja ni identificación del administrador que la efectuó. Se conserva el motivo actual, que puede sobrescribirse.
- La baja no cancela automáticamente reservas anteriores ni ejecuta devoluciones.
- El endpoint público existente `GET /publicaciones/:id` no agrega una restricción especial por baja administrativa; la exclusión está implementada en el catálogo. No afirmar que se bloqueó todo acceso al detalle mediante URL directa.

Archivos principales de esta integración:

```text
back/src/publicaciones/entity/publicacion.entity.ts
back/src/publicaciones/dto/baja-publicacion.dto.ts
back/src/publicaciones/controller/publicaciones.controller.ts
back/src/publicaciones/service/publicaciones.service.ts
back/src/publicaciones/repository/publicaciones.repository.ts
back/src/publicaciones/repository/publicaciones.repository.interface.ts
back/src/publicaciones/publicaciones.module.ts
back/src/mail/mail.interface.ts
back/src/mail/service/mail.service.ts
front/src/app/features/admin/admin.service.ts
front/src/app/features/admin/admin.component.ts
front/src/app/features/admin/admin.component.html
front/src/app/shared/models/publicacion.model.ts
front/src/app/features/mis-publicaciones/mis-publicaciones.component.ts
front/src/app/features/mis-publicaciones/mis-publicaciones.component.html
back/test/baja-publicaciones.spec.ts
back/src/mail/service/mail.service.spec.ts
```

### 4.5. Disponibilidad, reservas y pagos

- Gestión de disponibilidad por publicación y autorización por propietario.
- Reservas por fechas para modalidades temporales o de alquiler diario.
- Validación de publicación activa, rango disponible, fechas no anteriores a hoy y prohibición de reservar la propia publicación.
- Cálculo del importe en el servidor según precio diario y cantidad de días, incluyendo inicio y fin.
- Reserva pendiente y bloqueo de fechas durante el pago, con vencimiento a los 15 minutos.
- Liberación de pendientes vencidas en el flujo de creación de reservas.
- Checkout Pro con preferencia, referencia externa e idempotency key.
- Webhook y reconciliación al regresar del checkout.
- Antes de confirmar, el servidor consulta el pago a Mercado Pago y valida importe, moneda y referencia; no toma el resultado del navegador como confirmación suficiente.
- Historial del inquilino, reservas recibidas por el anunciante y resumen de reserva/pago.
- Operaciones existentes de finalización, cancelación y modificación de fechas, sujetas a sus validaciones de negocio.
- Código de alojamiento generado al confirmar el pago, acceso protegido para el inquilino y validación por el anunciante.
- Reporte de problemas y revisión administrativa.
- Copias de datos del inquilino y período en la reserva para conservar historial si se elimina la cuenta.

Estados de pago: `PENDIENTE`, `APROBADO`, `RECHAZADO`, `CANCELADO`, `REEMBOLSADO`.

Estados de liquidación: `NO_APLICA`, `RETENIDO`, `PENDIENTE_PAGO_PROPIETARIO`, `EN_REVISION`, `PAGADO_PROPIETARIO`, `DEVUELTO_INQUILINO`.

**Distinción importante:** el checkout está integrado con Mercado Pago. Las acciones del panel para registrar pago al propietario o devolución al inquilino son un registro manual académico; esas acciones no ejecutan transferencias ni devoluciones reales de dinero.

El catálogo propio de métodos de pago fue retirado del modelo. El medio confirmado se conserva en `pago.payment_method_id`. Existe una migración específica y un runner con respaldo; consultar `back/migrations/README.md` antes de operar sobre una base antigua.

Referencias: `back/src/disponibilidad/`, `back/src/reservas/`, `back/src/pagos/`, `front/src/app/features/mis-reservas/` y `reserva-resultado/`.

### 4.6. Mensajería y favoritos

- Conversaciones asociadas a una publicación y dos participantes.
- Bandeja/listado de conversaciones, mensajes leídos/no leídos y marcado de lectura.
- Aviso por correo de nuevos mensajes.
- El inquilino puede contactar al anunciante. El anunciante puede iniciar contacto con un huésped con reserva aprobada o continuar una conversación ya existente, según validación del servicio.
- Chat compartido en el frontend.
- Alta, baja y listado de favoritos por usuario; el listado filtra publicaciones inactivas o sin imágenes.

### 4.7. Administración y catálogos

El panel integra:

- Gestión de usuarios, roles y bloqueo/habilitación.
- Revisión de documentación de anunciantes.
- Baja de publicaciones con motivo y correo.
- Liquidaciones manuales y resolución de reclamos.
- CRUD de roles, tipos de anunciante, tipos de propiedad, modalidades y monedas.
- CRUD de provincias y ciudades.

## 5. Correo: aclaración sobre Gmail

El usuario pidió informar al dueño “vía Gmail”. La implementación envía al **email registrado del dueño**, que puede ser Gmail u otro proveedor, mediante **Azure Communication Services**.

No se integró Gmail API, OAuth de Google ni SMTP de Gmail. No reemplazar el proveedor existente sin un pedido explícito. El remitente depende de la configuración de Azure del proyecto.

El adaptador de correo verifica que el proveedor termine con estado `Succeeded` y contempla un reintento ante fallos. En la baja administrativa, el error se registra y se devuelve `correoEnviado: false` al panel.

## 6. Configuración y ejecución

No copiar secretos al documento ni a la memoria. Las credenciales del backend se cargan desde `.env`.

Variables utilizadas por los módulos revisados:

| Integración | Variables |
| --- | --- |
| Base y acceso | `DATABASE_URL`, `JWT_SECRET`, `BCRYPT_COST` |
| Aplicación | `FRONTEND_URLS`, `PORT` |
| Correo Azure | `ACS_CONNECTION_STRING`, `ACS_SENDER_ADDRESS` |
| Archivos Azure | `AZURE_STORAGE_CONNECTION_STRING`, `AZURE_STORAGE_CONTAINER`, `AZURE_VERIFICACION_CONTAINER` |
| Mercado Pago | `MP_ACCESS_TOKEN`, `MP_SUCCESS_URL`, `MP_FAILURE_URL`, `MP_PENDING_URL`, `MP_WEBHOOK_URL`, `MP_WEBHOOK_SECRET`, `MP_CURRENCY_ID` |

Backend, desde `back/`:

```sh
npm ci
npm run start:dev
```

Frontend, desde `front/`:

```sh
npm ci
npm start
```

La configuración local del frontend apunta a `http://localhost:3000`; la interfaz se sirve normalmente en `http://localhost:4200`. Producción utiliza `front/src/environments/environment.prod.ts` y hay configuración de rutas/publicación en `front/vercel.json`.

**Base de datos:** `back/src/app.module.ts` mantiene `synchronize: true`. No hay confirmación en esta sesión de haber aplicado la nueva columna de baja a una base real. La entidad está preparada para que se sincronice al iniciar el backend con su configuración actual. Para una base antigua, revisar primero la migración de retiro de métodos de pago, cuyo README advierte sobre el orden de aplicación y el respaldo.

## 7. Verificaciones realizadas

Durante la integración de baja administrativa del 18/10/2026 se ejecutó:

| Verificación | Resultado |
| --- | --- |
| `npm test -- --runInBand`, desde `back/` | 12 suites, 49 pruebas aprobadas |
| `npm run build`, desde `back/` | Correcto |
| `npm run build -- --configuration development`, desde `front/` | Correcto |
| `git diff --check` sobre los cambios de la integración | Sin errores de espacios |

La primera compilación del frontend falló por restricciones de lectura del entorno. Al repetirla con los permisos necesarios, completó correctamente. No fue un error de TypeScript o de las plantillas de esta integración.

Las pruebas nuevas verifican:

- Baja de una publicación ajena por un administrador sin perfil anunciante.
- Conservación del registro y almacenamiento del motivo.
- Destinatario, título y motivo del correo.
- Rechazo de usuarios sin rol administrativo y de solicitudes sin autenticación.
- Validación de motivo vacío, espacios, longitud excesiva y campos adicionales.
- Respuesta 404 ante publicación inexistente.
- Persistencia de la baja aunque falle el correo.
- Listado administrativo de publicaciones inactivas.
- Bloqueo de reactivación por edición o carga de imágenes.
- Escape de HTML en el contenido del correo.

No se verificó en esa integración:

- Entrega real de un correo de baja a una casilla Gmail.
- Flujo completo con navegador, cuentas reales y base de datos real.
- Cobro real de Mercado Pago, transferencia o devolución real.
- Compilación de producción del frontend; la compilación verificada fue de desarrollo.
- Ejecución completa de las pruebas del frontend.
- Despliegue actualizado de frontend o backend.

## 8. Pendientes y límites a tener presentes

No convertir esta lista automáticamente en requisitos aprobados: son verificaciones pendientes o límites observados del estado actual.

1. Comprobar la nueva columna en la base de destino y reiniciar/publicar el backend correspondiente.
2. Probar una baja de punta a punta con dos cuentas, verificando catálogo, Mis publicaciones y recepción real del correo.
3. Confirmar configuración y conectividad de Azure y Mercado Pago en cada entorno.
4. Si se solicita rehabilitar publicaciones, diseñar un flujo administrativo explícito; actualmente no existe.
5. Si se solicita auditoría de moderación, agregar operador, fecha e historial; hoy se conserva únicamente el motivo vigente.
6. Si se necesita bloquear también el detalle público por URL directa, ampliar la autorización/visibilidad de esa ruta, preservando el acceso del dueño y los usos internos necesarios.
7. Revisar paginación del listado administrativo si aumenta el volumen.

## 9. Estado de Git al preparar este documento

- Rama observada: `main`.
- Último commit observado: `bed1cf6` — `Administrador puede modificar publicaciones`.
- Los archivos de la integración de baja ya estaban en el código del checkout y el árbol de trabajo estaba limpio antes de crear este documento.
- No se creó un commit, push ni despliegue durante la preparación de esta memoria. El documento nuevo debe guardarse/versionarse según el flujo del usuario.
- El título del commit no implica permiso administrativo de edición general: el código revisado mantiene la edición ordinaria restringida al propietario y agrega el endpoint específico de baja administrativa.

## 10. Contexto breve para retomar

DEPA tiene frontend Angular y backend NestJS/PostgreSQL, con arquitectura por controladores, servicios y repositorios. Ya integra cuentas con verificación, alta de anunciantes con documentación y prueba facial, publicaciones e imágenes, búsqueda avanzada y mapas, disponibilidad, reservas temporales con Mercado Pago, código de alojamiento, liquidación manual académica, mensajes, favoritos y panel administrativo.

La última decisión confirmada es moderar publicaciones mediante baja lógica con motivo obligatorio y aviso al email del dueño. Cualquier administrador puede hacerlo sin ser anunciante ni dueño. El motivo se persiste en `motivo_baja_admin`; la publicación queda inactiva y en Mis publicaciones se identifica la baja administrativa con su razón. No permitir reactivarla por edición o carga de imágenes. El correo usa Azure, no Gmail API. La baja no borra registros, no cancela reservas anteriores y no tiene rehabilitación implementada. La última validación ejecutada aprobó 49 pruebas del backend y las compilaciones de backend y frontend en desarrollo; falta una prueba real de correo y del flujo completo en el entorno de destino.
