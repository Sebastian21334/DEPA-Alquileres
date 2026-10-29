# Cambios realizados en el proyecto

**Fecha:** 29/10/2026

**Alcance:** cambios de verificación de anunciantes, documentación de inmobiliarias y reorganización del código realizados durante esta revisión.

Este documento explica el estado final de los cambios, su motivo y las comprobaciones realizadas. Distingue las funcionalidades incorporadas de los movimientos de código que conservan el comportamiento existente.

## 1. Resumen

| Cambio | Motivo |
|---|---|
| Separar prueba de vida y aprobación de identidad | El sistema comprueba la captura; el administrador decide si corresponde con el DNI. |
| Incorporar documentación específica para inmobiliarias | Diferenciar la identidad del corredor responsable de los datos de la organización. |
| Crear `VerificacionAnuncianteModule` | Reunir el trámite documental, sus estados y sus evidencias en una funcionalidad propia. |
| Dividir Usuarios en dos servicios | Separar perfil y administración de contraseñas y tokens. |
| Crear `SeguridadModule` | Compartir JWT, Passport y autorización general sin depender del módulo completo de Auth. |
| Extraer `ReservaReprogramacionService` dentro de Reservas | Reunir el cambio de fechas y el reintento del aviso, conservando Notificaciones y Liquidaciones separadas. |
| Ubicar los guards de negocio en sus módulos | Mantener las reglas cerca de los servicios que las implementan. |
| Reubicar tipos y retirar la carpeta `domain` de reservas | Respetar la estructura usada por el equipo y facilitar la navegación. |
| Retirar archivos de pruebas del repositorio y desactivar su generación | Aplicar la organización acordada para este proyecto. Las verificaciones puntuales se ejecutaron fuera del repositorio. |

## 2. Verificación de identidad: sistema y administrador

La responsabilidad queda distribuida así:

1. El usuario informa sus datos y presenta la documentación requerida.
2. El navegador guía la captura y los gestos con MediaPipe.
3. El backend comprueba la prueba de vida y la continuidad de la persona entre las capturas.
4. La documentación pasa a revisión administrativa.
5. El administrador compara la persona con el DNI y aprueba o rechaza la solicitud.

Se retiró la comparación automática entre rostro y fotografía del DNI. Superar la prueba de vida **no habilita automáticamente al anunciante**.

Se conservaron TensorFlow/face-api y sus modelos porque siguen interviniendo en la prueba de vida del backend. Quitarlos por completo habría eliminado una comprobación que se mantiene en el flujo.

### Autorizaciones y trazabilidad

- El desafío dura diez minutos y se vincula al usuario, la solicitud y su revisión.
- Cambiar los gestos reemplaza el desafío anterior.
- Una prueba válida genera una autorización de cinco minutos ligada al hash de la captura final.
- La autorización se consume al confirmar la presentación documental; no permite sustituir libremente la foto validada ni presentar dos veces la misma evidencia.
- Los reenvíos abren una revisión nueva y requieren una prueba de vida nueva.
- Se registra el administrador autenticado que resuelve la solicitud.
- La aprobación, la habilitación del anunciante y el registro de la revisión se guardan en la misma transacción.

Las resoluciones administrativas exigen el número de revisión que el administrador consultó. Esto permite rechazar una decisión basada en documentación desactualizada.

Ejemplo del cuerpo para aprobar:

```json
{ "numero_revision": 1 }
```

Ejemplo del cuerpo para rechazar:

```json
{ "numero_revision": 1, "motivo": "El documento no se puede leer" }
```

El rechazo exige un motivo de entre 5 y 500 caracteres después de quitar espacios. El identificador del administrador se obtiene del JWT, no de un campo enviado por el cliente.

También se ajustaron mensajes del frontend, panel administrativo y correos para distinguir prueba de vida completada, solicitud pendiente e identidad aprobada.

## 3. Documentación de particulares e inmobiliarias

El particular presenta sus datos de contacto y CUIT/CUIL, las capturas del DNI y la prueba de vida.

Para la inmobiliaria se incorporaron:

- Nombre o razón social y CUIT.
- Matrícula del corredor responsable.
- Colegio profesional.
- Domicilio comercial.
- DNI del corredor responsable.
- Constancia de matrícula y constancia de CUIT, en PDF, JPG o PNG, de hasta 5 MB cada una.

En el flujo implementado, la persona titular de la cuenta actúa como corredor responsable y realiza la captura de su propio DNI y la prueba de vida. Los datos de la organización se presentan por separado.

Los campos y documentos institucionales pertenecen a la solicitud privada. Los archivos se almacenan en el contenedor privado y el administrador accede mediante enlaces firmados temporales.

Se pueden corregir datos en borrador o después de un rechazo. Una solicitud pendiente o aprobada no admite esa edición. El servidor vuelve a comprobar los requisitos al presentar y al aprobar.

La revisión de matrícula y constancias sigue siendo manual. No se incorporaron consultas automáticas a padrones profesionales ni a organismos tributarios.

## 4. Nuevo módulo de verificación del anunciante

Antes, `AnunciantesModule` contenía tanto operaciones del anunciante como documentación, solicitudes, revisión administrativa y prueba de vida.

Ahora el reparto es:

| Módulo / servicio | Responsabilidad |
|---|---|
| `AnunciantesModule` / `AnunciantesService` | Crear al anunciante pendiente y consultarlo. Conserva su entidad y repositorio. |
| `VerificacionAnuncianteModule` / `VerificacionAnuncianteService` | Coordinar solicitudes, documentación, revisión administrativa e historial. |
| `VerificacionAnuncianteModule` / `PruebaVidaService` | Gestionar desafíos, capturas y autorizaciones de prueba de vida. |

El módulo nuevo contiene su controlador, DTO, entidades de solicitud y revisión y repositorios. Los dos servicios son internos al módulo. El motor de análisis de imágenes conserva su implementación separada.

La separación responde a responsabilidades: la política documental puede cambiar sin modificar el análisis de gestos, y el análisis puede ajustarse sin mezclarlo con la resolución administrativa.

Las URLs siguen bajo `/anunciantes`, incluida `/anunciantes/verificacion-facial`. El movimiento de archivos conserva el esquema de datos y la transacción de aprobación.

## 5. Usuarios: perfil y credenciales

Se dividió el trabajo dentro del mismo `UsuariosModule`:

| Servicio | Operaciones |
|---|---|
| `UsuariosService` | Alta, consultas, datos personales, perfil, fotos, roles y bloqueos. |
| `UsuariosCredencialesService` | Hash y comparación de contraseñas, tokens de verificación de correo y recuperación, vigencia y consumo. |

Ambos utilizan el contrato existente de repositorio de usuarios. No se agregaron tablas ni repositorios duplicados.

El alta continúa en Usuarios y delega el hash de la contraseña al servicio de credenciales. Auth utiliza los servicios necesarios para coordinar registro, ingreso, verificación de correo y recuperación.

Esto permite localizar las reglas de acceso sin recorrer las operaciones de perfil, imágenes o administración. Se conservaron las reglas y respuestas de los flujos existentes.

## 6. Seguridad compartida y función de Auth

`SeguridadModule` reúne:

- Configuración de JWT y Passport.
- `JwtAuthGuard`.
- `RolesGuard`.
- El decorador `Roles`.

Los módulos que necesitan proteger endpoints o utilizar JWT importan Seguridad. Ya no necesitan importar todo `AuthModule` para acceder a esa infraestructura.

`AuthModule` conserva sus endpoints, el servicio que coordina los flujos de acceso y `JwtStrategy`. La estrategia sigue consultando la cuenta para comprobar si está bloqueada y obtener su rol actual. Permanece registrada una sola vez al iniciar la aplicación.

La dirección principal de dependencias queda así:

```text
Auth ──────────► Usuarios ──────────► Catálogos
  │                 │                    │
  └─────────────────┴────────────────────┴──► Seguridad
```

Seguridad no importa módulos de negocio. Se eliminó el ciclo previo entre Auth, Usuarios y Catálogos y se retiró el uso de `forwardRef`. La comprobación del grafo actual abarcó los 18 módulos y no encontró ciclos.

Se mantienen `JWT_SECRET`, `JWT_EXPIRES_SEC`, `BCRYPT_COST`, los hashes existentes y los tokens almacenados. Los presupuestos firmados y la prueba de vida conservan sus validaciones y propósitos específicos.

## 7. Guards de negocio y contenido de common

Los guards que necesitan consultar reglas de una funcionalidad quedaron en esa funcionalidad:

| Guard | Ubicación |
|---|---|
| `AnuncianteGuard` | `anunciantes/guards`: comprueba que el anunciante esté verificado. |
| `PropietarioPublicacionGuard` | `disponibilidad/guards`: utiliza Disponibilidad para comprobar la propiedad del recurso. |
| `JwtAuthGuard` y `RolesGuard` | `seguridad/guards`: controles generales compartidos. |

Los guards de negocio siguen ejecutándose después de la autenticación y conservan sus comprobaciones.

`common` mantiene las utilidades de fechas e importes, el error de registro en uso y `AlmacenamientoModule`. Almacenamiento conserva su ubicación y encapsula el acceso a Azure. Se comprobó que esos archivos permanecieran iguales durante la reorganización de seguridad.

## 8. Tipos de datos y cálculo del estado de la estadía

Se retiraron las carpetas `interfaces` que contenían tipos auxiliares, manteniendo las definiciones necesarias cerca de su uso:

- Los datos internos de creación de usuario quedaron en su servicio.
- `CondicionesCobro` quedó junto a `ReservasService`.
- Los datos del webhook de pagos quedaron en `pagos/dto/webhook-pago.dto.ts`.
- Los tipos de solicitud autenticada y de anunciante quedaron junto a sus guards.
- Para los archivos recibidos se utiliza `Express.Multer.File`, de la dependencia existente.

**Las interfaces de los repositorios se conservan**, junto con sus tokens de inyección e implementaciones. La eliminación de las carpetas auxiliares no elimina esos contratos ni las validaciones de los DTO.

También se retiró el archivo independiente `reservas/domain/estado-estadia.ts`. El cálculo de `estado_estadia` pertenece ahora a la entidad `Reserva`, mediante `calcularEstadoEstadia()`, y los servicios consultan la propiedad derivada. Las utilidades de fecha compartidas permanecen en `common/utils/fechas.ts`.

Esto respeta la estructura utilizada por el proyecto: entidades, controladores, servicios y repositorios, sin una carpeta de dominio adicional para ese cálculo.

## 9. Archivos de pruebas y configuración

Por decisión de organización del proyecto se retiraron los archivos `.spec` y de pruebas de integración del backend y frontend, incluidos casos personalizados. Se limpiaron sus configuraciones, comandos y dependencias directas y se desactivó su generación automática en NestJS y Angular.

Las comprobaciones de estas refactorizaciones se ejecutaron con archivos externos al repositorio. Por lo tanto, los resultados informados describen una ejecución puntual; esos casos no quedaron como una suite versionada que se ejecute automáticamente en CI.

## 10. Base de datos y compatibilidad

Los cambios funcionales de verificación y documentación institucional incorporaron estas migraciones:

1. `back/migrations/20261028-verificacion-identidad.sql`.
2. `back/migrations/20261028-documentacion-inmobiliaria.sql`.

Ambas se aplicaron a la base configurada durante esta revisión, verificando las nuevas columnas y la relación con el administrador y conservando los registros existentes. Cada otro entorno debe comprobar su propio esquema antes de utilizar estas funcionalidades. Las instrucciones están en los documentos específicos de `back/docs` y en `back/migrations/README.md`.

La extracción de módulos y la división de servicios **no requieren migraciones adicionales**. Se conservaron entidades, tablas y contratos de persistencia en esas refactorizaciones.

Para integrar los cambios funcionales, backend y frontend deben ser compatibles con `numero_revision` y con los campos y archivos institucionales. En cambio, los movimientos posteriores de módulos conservaron las rutas y DTO de la versión funcional ya actualizada.

## 11. Comprobaciones realizadas

La comprobación final de Seguridad incluyó:

- Compilación del backend y revisión con oxlint.
- **45 pruebas de seguridad**, incluidas integración HTTP, contraseñas, registro, JWT, verificación de correo, recuperación, perfil, fotos y permisos.
- **45 pruebas de regresión de verificación de anunciante**, incluidas presentación documental, prueba de vida, reenvíos, revisión administrativa y habilitación para publicar.
- Comparación de controladores y guards con las versiones previas para conservar rutas, validaciones y comportamiento.
- Comprobación de que entidades y contratos/implementaciones de persistencia no cambiaran durante la división de Seguridad.
- Comprobación de ausencia de ciclos y referencias a ubicaciones retiradas.

**Resultado final: 90 pruebas aprobadas.** Se utilizaron servicios, JWT, bcrypt, validaciones e interceptores reales con persistencia y proveedores externos simulados. Esto no equivale a una prueba contra PostgreSQL, correo o pagos reales.

La extracción posterior de Reprogramación se verificó por separado con **42 pruebas aprobadas**, incluidas ocho comprobaciones de integración de módulos y rutas HTTP, además de compilación y oxlint. Se comprobaron permisos, fechas inválidas, disponibilidad, conservación de importes, solapamiento con días propios, repetición de solicitudes, reversión ante fallos y reintento del correo sin modificar el calendario. La concurrencia y las transacciones se ejercitaron con un repositorio en memoria que simula serialización y reversión; no se probaron bloqueos reales de PostgreSQL. Se comparó el método trasladado con su versión anterior y se verificó que Notificaciones, Liquidaciones, Mail, entidades y repositorios permanecieran iguales durante esta extracción.

En la extracción de verificación también se comprobó la carga real de TensorFlow/WASM y los tres modelos faciales, el rechazo de una imagen sin rostro y la construcción de metadatos de las 21 entidades. La compilación del frontend se había comprobado al incorporar los cambios funcionales de documentación y verificación; las refactorizaciones posteriores se concentraron en el backend.

Para repetir las comprobaciones disponibles en el repositorio:

```sh
cd back
npm run build
npm run lint
```

## 12. Reprogramación dentro de Reservas

Se creó `reservas/service/reserva-reprogramacion.service.ts` como servicio interno del módulo existente. El controlador delega allí el cambio de fechas y el reintento del aviso, manteniendo las mismas rutas, DTO y permisos.

La responsabilidad de cada servicio queda así:

| Servicio | Responsabilidad |
|---|---|
| `ReservasService` | Operaciones generales de reserva, consultas y comprobación de participantes. |
| `ReservaReprogramacionService` | Validar y coordinar el cambio de fechas y su historial; solicitar el aviso después de confirmar la transacción. |
| `ReservaNotificacionesService` | Registrar y enviar los avisos de reservas mediante Mail, y conservar su estado para reintentos. |
| `ReservaLiquidacionesService` | Código de ingreso, reportes y resolución de liquidaciones. |
| `MailService` | Preparar el contenido y delegar la entrega al proveedor de correo. Sigue en `MailModule`. |

El nuevo servicio reutiliza Disponibilidad y la transacción del calendario. Conserva la duración, tarifa, moneda e importe contratados. Un fallo del correo deja el aviso pendiente sin deshacer las fechas confirmadas. El reintento reutiliza la autorización de consulta de `ReservasService`; la dependencia va desde Reprogramación hacia Reservas, sin un ciclo entre ambos servicios.

No se crearon entidades, repositorios, módulos ni migraciones para esta separación. Las pruebas se ejecutaron fuera del repositorio, sin agregar archivos `.spec`.

## 13. Límites y próximas decisiones

- La eliminación general de documentación sensible por una política de retención sigue siendo una tarea separada. La limpieza implementada elimina archivos nuevos cuando falla una presentación en los casos previstos.
- La habilitación de una matrícula y la correspondencia entre la persona y su DNI requieren revisión administrativa.
- De las recomendaciones adicionales se aplicó la extracción de Reprogramación dentro de Reservas. Las demás propuestas de reorganización siguen pendientes de decisión.
- Este archivo documenta cambios de código y organización; la memoria académica debe mantenerse alineada con el funcionamiento final.

El criterio para continuar es mantener cada responsabilidad cerca de sus reglas, compartir infraestructura mediante módulos acotados y preservar rutas, permisos y transacciones al reorganizar.
