# Informe actualizado de pendientes del proyecto DEPA

Fecha de revisión: 29 de septiembre de 2026

Proyecto: Plataforma de gestión y centralización de propiedades en alquiler
Alcance de la revisión: documentación funcional, inspección del diagrama de casos de uso y código actual de frontend y backend.

## 1. Objetivo del informe

Este documento reúne lo que falta completar o corregir antes de considerar el proyecto terminado. La revisión compara:

- `Proyecto Seminario Integrador - 2026.pdf`.
- `Inspecciòn - Diagrama de casos de uso.pdf`.
- Backend NestJS y TypeORM.
- Frontend Angular.
- Despliegue actual en Vercel y Render.

Los puntos están clasificados como:

- **Resuelto:** ya existe una implementación funcional en el código actual.
- **Parcial:** existe una primera implementación, pero no cubre todo lo definido.
- **Pendiente:** no está implementado o no está documentado correctamente.

## 2. Resumen ejecutivo

El sistema ya cubre el núcleo del proyecto: registro y autenticación, verificación de correo, recuperación de contraseña, administración de usuarios, alta y verificación de anunciantes, publicaciones, imágenes, filtros, favoritos, disponibilidad, reservas, chat, panel del anunciante y una integración de prueba con Mercado Pago.

Los mayores pendientes no están en las pantallas principales, sino en la consistencia entre la documentación y el sistema, el cierre completo del ciclo de pagos, la concurrencia de reservas, la seguridad de producción y una etapa de testing real.

### Prioridad inmediata

| Prioridad | Tema | Estado | Motivo |
|---|---|---|---|
| P0 | Actualizar documentación académica | Pendiente | Las secciones de implementación, testing, gestión, conclusión y bibliografía están incompletas. |
| P0 | Definir el alcance real del pago al anunciante | Pendiente | La inspección exige retener el dinero hasta validar un código de alojamiento, pero el flujo actual cobra directamente en una sola cuenta. |
| P0 | Transacciones y concurrencia en reservas | Pendiente | La reserva y el bloqueo de fechas se guardan en operaciones separadas. |
| P0 | Pruebas del flujo principal | Pendiente | No existen pruebas de reservas, pagos, webhooks, concurrencia ni permisos. |
| P1 | Reembolsos y cancelaciones pagadas | Pendiente | Las reservas aprobadas no pueden cancelarse hasta implementar la devolución. |
| P1 | Expiración automática de reservas pendientes | Parcial | Se liberan al intentar otra reserva, no mediante una tarea automática. |
| P1 | Seguridad de autenticación | Parcial | Falta refresh token, rate limiting y configuración obligatoria de secretos. |
| P1 | Migraciones de base de datos | Pendiente | Se usa `synchronize: true`, incluso en el despliegue. |
| P2 | Calificaciones de anunciantes | Pendiente | Figura como próximo paso en la documentación, pero no existe en el código. |
| P2 | Permisos granulares de anunciantes | Pendiente | Solo existen roles y bloqueo general, no restricciones por funcionalidad. |

## 3. Aspectos que ya fueron resueltos

### 3.1 Usuarios y seguridad básica

- Registro de usuarios.
- Hash de contraseñas con bcrypt.
- Inicio de sesión mediante JWT.
- Verificación de correo electrónico.
- Recuperación y restablecimiento de contraseña.
- Bloqueo y habilitación de usuarios por un administrador.
- Guards de autenticación, anunciante y administrador.
- CORS configurable mediante `FRONTEND_URLS`.
- Validación de DTOs con `class-validator`.

### 3.2 Anunciantes y verificación de identidad

- Conversión de un usuario registrado en solicitante a anunciante.
- Captura del frente y dorso del DNI desde la cámara.
- Prueba de vitalidad facial mediante desafíos.
- Comparación entre el rostro capturado y el DNI.
- Almacenamiento privado de documentación.
- URLs temporales de lectura para revisión administrativa.
- Aprobación, rechazo, motivo y reenvío de solicitudes.
- Historial de revisiones.
- Avisos por correo al solicitante y a administradores.

### 3.3 Publicaciones y navegación

- Creación, modificación y eliminación de publicaciones.
- Restricción para que solo anunciantes verificados puedan publicar.
- Obligatoriedad de al menos una imagen para activar la publicación.
- Listado paginado y búsqueda libre.
- Filtros por ubicación, tipo, moneda, precio y ambientes.
- Visualización pública de publicaciones para visitantes.
- Detalle, galería, ubicación y acceso a Google Maps.
- Favoritos para usuarios autenticados.
- Contacto por WhatsApp para visitantes y usuarios.
- Chat interno para usuarios autenticados.

### 3.4 Reservas y disponibilidad

- Calendario de disponibilidad para alquileres temporarios.
- Validación de rango completo.
- Cálculo del importe en el backend.
- Impedimento para reservar una publicación propia.
- Bloqueo temporal de fechas durante el checkout.
- Historial de reservas realizadas y recibidas.
- Finalización de estadías por el anunciante.
- Estados de pago asociados a la reserva.

### 3.5 Mercado Pago

- Checkout Pro mediante el SDK oficial.
- Preferencia de pago creada desde el backend.
- Redirección segura al checkout de Mercado Pago.
- Webhook público.
- Validación de firma cuando se configura `MP_WEBHOOK_SECRET`.
- Consulta del pago directamente a Mercado Pago.
- Validación de referencia, importe y moneda.
- Registro separado de datos del pago.
- Confirmación de reserva únicamente después del pago aprobado.
- Liberación de fechas ante rechazo o cancelación del pago.
- Credenciales fuera del repositorio.

### 3.6 Observaciones de la inspección ya cubiertas

- El visitante puede consultar publicaciones sin iniciar sesión.
- El visitante puede contactar por WhatsApp.
- El chat interno requiere una cuenta autenticada.
- Se implementaron favoritos.
- El administrador puede bloquear usuarios.
- Cualquier persona puede consultar publicaciones públicas.
- El anunciante puede responder conversaciones relacionadas con sus publicaciones.

## 4. Pendientes funcionales

### 4.1 Código de alojamiento y liberación del dinero

**Estado: pendiente crítico.**

La inspección propone generar un código único para el inquilino y liberar el dinero al anunciante cuando este código sea ingresado al comenzar la estadía. Ese proceso no está implementado.

La integración actual utiliza una única cuenta de Mercado Pago. El cobro se acredita según las reglas normales de Mercado Pago; DEPA no actúa como escrow ni retiene fondos hasta el check-in.

Se debe tomar una decisión explícita:

1. Dejar el código fuera del alcance y documentar que el pago se confirma al reservar.
2. Implementar una seña al reservar y cobrar el saldo cerca del ingreso.
3. Implementar cuentas de anunciantes conectadas por OAuth y Split Payments, sujeto a las capacidades y condiciones de Mercado Pago.
4. Investigar un acuerdo comercial específico si se requiere retención y liberación posterior.

La autorización manual de tarjetas no resuelve reservas realizadas con semanas de anticipación, porque su ventana de captura es limitada.

**Criterio de cierre:** la documentación, el caso de uso y la demostración deben describir exactamente el mismo comportamiento financiero.

### 4.2 Reembolsos y cancelaciones

**Estado: pendiente crítico.**

El sistema detecta pagos reembolsados informados por Mercado Pago, pero no inicia devoluciones. Actualmente se bloquea la cancelación de una reserva pagada para evitar liberar las fechas sin devolver el dinero.

Falta definir:

- Política de cancelación.
- Plazos y porcentajes de devolución.
- Quién puede cancelar.
- Endpoint para ejecutar el reembolso.
- Registro de devolución y motivo.
- Tratamiento de reembolsos parciales.
- Interfaz para usuario y administrador.
- Notificaciones por correo.

**Criterio de cierre:** cancelar una reserva pagada debe mantener sincronizados Mercado Pago, la tabla `pago`, la reserva y las fechas.

### 4.3 Expiración de reservas pendientes

**Estado: parcial.**

Una reserva pendiente vence a los 15 minutos. Las reservas vencidas se liberan cuando alguien intenta crear otra reserva, pero no existe una tarea programada que las procese automáticamente.

Falta:

- Una tarea periódica o worker.
- Consultar Mercado Pago antes de liberar una reserva, para evitar cancelar un pago aprobado cuyo webhook llegó tarde.
- Registrar la causa de expiración.
- Mostrar la expiración en el frontend.

### 4.4 Inicio de conversaciones por el anunciante

**Estado: parcial.**

El anunciante puede responder una conversación existente, pero no puede iniciar el contacto con un inquilino que tenga una reserva confirmada. La inspección solicita que el anunciante de un alquiler temporal pueda iniciar el chat con su inquilino.

**Criterio de cierre:** permitir el inicio del chat solamente si existe una reserva válida entre ese anunciante y ese inquilino.

### 4.5 Permisos granulares del anunciante

**Estado: pendiente.**

La inspección diferencia entre bloquear completamente a un usuario y restringir herramientas específicas de un anunciante. El código solo maneja roles, verificación y bloqueo general.

Posibles permisos:

- Crear publicaciones.
- Modificar publicaciones.
- Recibir reservas.
- Usar el chat.
- Administrar disponibilidad.

Se necesita una entidad de permisos, endpoints administrativos, guards y una interfaz de gestión.

### 4.6 Calificación de anunciantes

**Estado: pendiente.**

La documentación menciona agregar un sistema de calificación, pero no existen entidades, reglas ni pantallas.

Antes de implementarlo se debe decidir:

- Quién puede calificar.
- Si se requiere una reserva finalizada.
- Escala de puntuación.
- Comentarios y moderación.
- Una calificación por reserva.
- Promedio público y tratamiento de eliminaciones.

### 4.7 Comprobantes y consulta administrativa de pagos

**Estado: pendiente recomendado.**

El usuario puede ver el estado general de su reserva, pero falta:

- Mostrar el identificador del pago.
- Mostrar método, fecha y detalle del estado.
- Acceso administrativo para conciliar operaciones.
- Descargar o enlazar un comprobante cuando Mercado Pago lo permita.
- Buscar pagos inconsistentes o pendientes durante demasiado tiempo.

## 5. Pendientes de consistencia y base de datos

### 5.1 Reserva, fechas y pago sin una transacción única

**Estado: pendiente crítico.**

Actualmente se realizan varias escrituras separadas:

1. Se valida la disponibilidad.
2. Se guarda la reserva.
3. Se marcan las fechas como ocupadas.
4. Se guarda el registro de pago.
5. Se crea la preferencia externa.

Si una operación intermedia falla, el sistema compensa algunos casos, pero no existe atomicidad completa. Además, dos solicitudes simultáneas podrían validar el mismo rango antes de que alguna lo bloquee.

Falta:

- Transacción de base de datos.
- Bloqueo pesimista u otra estrategia de concurrencia.
- Restricción única para publicación y fecha.
- Prueba automatizada de dos reservas simultáneas.

### 5.2 Migraciones

**Estado: pendiente crítico para despliegues estables.**

TypeORM usa `synchronize: true`. Esto facilita el desarrollo, pero no permite revisar ni controlar cambios de esquema de forma segura.

Falta:

- Desactivar `synchronize` en el entorno desplegado.
- Crear migraciones versionadas.
- Documentar cómo aplicar y revertir migraciones.
- Probar migraciones sobre una copia de la base.

### 5.3 Modelo conceptual y modelo implementado

**Estado: documentación desactualizada.**

La documentación describe `Propiedad` y `Publicación` como entidades separadas. El código actual almacena los datos del inmueble directamente en `Publicacion`. El DER y el diagrama de clases deben mostrar el modelo realmente implementado o se debe separar formalmente la entidad `Propiedad`.

### 5.4 Moneda

**Estado: parcial.**

El catálogo permite tipos de moneda, pero Mercado Pago se configura globalmente con `MP_CURRENCY_ID=ARS`. Se debe impedir que una publicación en otra moneda llegue al checkout como si su importe estuviera expresado en ARS, o implementar conversión con una fuente y reglas definidas.

## 6. Pendientes de seguridad

### 6.1 Refresh token

**Estado: pendiente.**

La documentación afirma que existe un access token corto acompañado de refresh token. El código solo emite un access token con una vigencia aproximada de una hora y lo almacena en `localStorage`.

Opciones:

- Implementar refresh token rotativo, revocación y almacenamiento seguro.
- O corregir la documentación y declarar que la sesión termina al vencer el JWT.

### 6.2 Secretos obligatorios

**Estado: parcial.**

- `JWT_SECRET` tiene un valor de respaldo en el código. En un despliegue debe fallar el inicio si la variable no existe.
- La validación de firma de Mercado Pago se omite si `MP_WEBHOOK_SECRET` está vacío. En el entorno desplegado debería ser obligatoria.
- Si falta `FRONTEND_URLS`, CORS permite cualquier origen. En el despliegue debería fallar o usar una lista segura.

### 6.3 Rate limiting

**Estado: pendiente.**

No hay límites de frecuencia para:

- Inicio de sesión.
- Reenvío de verificación.
- Recuperación de contraseña.
- Registro.
- Mensajes.
- Webhooks inválidos.

Falta agregar límites por IP y, cuando corresponda, por cuenta.

### 6.4 Manejo global de errores

**Estado: documentación incorrecta.**

La documentación dice que existe un manejador global de errores. El código utiliza excepciones de NestJS, pero no registra un filtro global propio. Se debe implementar el filtro o corregir el texto.

### 6.5 Datos de identidad

**Estado: parcial.**

La documentación debe agregar:

- Finalidad de las imágenes de DNI y rostro.
- Tiempo de conservación.
- Proceso de eliminación.
- Acceso autorizado.
- Manejo de incidentes.
- Consentimiento del usuario.

Aunque los documentos se mantienen privados y se entregan mediante URLs temporales, falta una política formal de ciclo de vida.

## 7. Pendientes de testing

### 7.1 Estado actual

Solo existen pruebas básicas:

- Un test unitario del controlador raíz del backend.
- Un test e2e del endpoint raíz.
- Dos archivos de pruebas frontend, principalmente creación de la aplicación y guard administrativo.

No se consideran cubiertos los flujos de negocio principales.

### 7.2 Pruebas mínimas necesarias

#### Autenticación

- Registro válido e inválido.
- Email duplicado.
- Verificación de cuenta.
- Contraseña incorrecta.
- Usuario bloqueado.
- Recuperación y vencimiento del token.
- Autorización por rol.

#### Anunciantes

- Solicitud inicial.
- Archivos faltantes o formato inválido.
- Vitalidad fallida.
- Rostro que no coincide.
- Aprobación, rechazo y reenvío.
- Acceso a documentos solo por administrador.

#### Publicaciones

- Crear sin imagen.
- Modificar una publicación ajena.
- Filtros y paginación.
- Publicación inactiva.
- Favoritos duplicados.

#### Reservas

- Cálculo de importe.
- Rango incompleto o pasado.
- Reserva de publicación propia.
- Dos usuarios intentando reservar las mismas fechas.
- Liberación al cancelar o vencer.
- Permisos de inquilino y anunciante.

#### Mercado Pago

- Preferencia creada correctamente.
- Falta de credenciales.
- Webhook con firma inválida.
- Webhook repetido.
- Importe o moneda incorrectos.
- Pago aprobado, pendiente y rechazado.
- Webhook demorado.
- Fallo de base de datos después de un pago aprobado.
- Reembolso y contracargo.

#### Frontend

- Selección de fechas.
- Botón de pago y redirección.
- Mensajes de retorno aprobado, pendiente y rechazado.
- Estados en “Mis reservas”.
- Guards y permisos.

### 7.3 Evidencia de testing

La entrega debería incluir:

- Plan de pruebas.
- Casos identificados y trazados a requisitos.
- Datos de entrada.
- Resultado esperado y obtenido.
- Capturas o logs.
- Defectos encontrados.
- Correcciones y regresión.
- Cobertura obtenida.

## 8. Correcciones necesarias en la documentación

### 8.1 Secciones incompletas

Completar:

1. Desarrollo e implementación.
2. Principales funcionalidades desarrolladas.
3. Capturas actuales del sistema.
4. Gestión de versiones y repositorio.
5. Testing.
6. Gestión del proyecto y metodología.
7. Roles del equipo.
8. Dificultades y decisiones.
9. Conclusiones.
10. Próximos pasos.
11. Bibliografía y fuentes.

### 8.2 Infraestructura

La documentación afirma que el backend se hospeda en Azure. El frontend productivo apunta actualmente a Render y el frontend se despliega en Vercel. Debe documentarse la infraestructura realmente utilizada y separar:

- Hosting del frontend.
- Hosting del backend.
- Base de datos.
- Azure Blob Storage.
- Azure Communication Services.
- Mercado Pago.

### 8.3 Casos de uso y requisitos

- Incorporar formalmente al actor `Visitante` en el diagrama definitivo.
- Separar contacto por WhatsApp y chat.
- Agregar favoritos.
- Agregar bloqueo de usuario.
- Reflejar que el anunciante solo puede iniciar o responder chats según las reglas implementadas.
- Eliminar o implementar permisos granulares de anunciante.
- Corregir el objetivo de “Crear publicación”, que menciona venta aunque la venta está fuera del alcance.
- Actualizar el caso de reserva: el sistema crea primero una reserva pendiente y la confirma mediante webhook.
- Indicar que el medio de pago se elige dentro de Mercado Pago, no en DEPA.
- Aclarar que el entorno de Mercado Pago permanecerá en modo prueba para la entrega.
- Eliminar el mecanismo de código de alojamiento si no se implementará, o marcarlo como trabajo futuro.

### 8.4 Diagramas

Actualizar:

- Diagrama de casos de uso.
- Diagrama de clases.
- DER con `Pago`, `Favorito`, solicitudes y revisiones de identidad.
- Arquitectura incluyendo Vercel, Render, Azure y Mercado Pago.
- Diagrama de secuencia de reserva y webhook.

### 8.5 Prototipos

Las capturas existentes ya no representan la interfaz actual. Deben reemplazarse por imágenes de:

- Inicio y búsqueda.
- Detalle de publicación.
- Calendario y Checkout Pro.
- Mis reservas.
- Solicitud y verificación de anunciante.
- Administración.
- Favoritos.
- Chat.
- Dashboard del anunciante.

## 9. Pendientes operativos y de despliegue

- Documentar todas las variables de entorno sin incluir secretos.
- Crear un procedimiento de despliegue de frontend y backend.
- Agregar endpoint de salud que compruebe aplicación y base de datos.
- Configurar monitoreo de errores y disponibilidad.
- Definir backups y restauración de la base.
- Registrar cambios de esquema mediante migraciones.
- Verificar CORS con los dominios definitivos.
- Comprobar el webhook después de cada despliegue.
- Evitar que el backend gratuito suspendido afecte la demostración; despertarlo antes de presentar.
- Sustituir los README genéricos de NestJS y Angular por documentación propia del proyecto.

## 10. Orden recomendado de trabajo

### Etapa 1 - Cerrar la entrega académica

1. Actualizar casos de uso, DER y arquitectura.
2. Completar implementación, testing, gestión y conclusión.
3. Definir por escrito que Mercado Pago se utiliza en modo prueba.
4. Definir si el código de alojamiento queda fuera de alcance.
5. Actualizar capturas.

### Etapa 2 - Asegurar el flujo crítico

1. Transacción y control de concurrencia de reservas.
2. Tarea automática para vencimientos.
3. Pruebas de pagos y reservas.
4. Política e implementación de cancelaciones y devoluciones.
5. Validación obligatoria de secretos en despliegue.

### Etapa 3 - Mejoras funcionales

1. Inicio de chat por el anunciante cuando existe una reserva.
2. Calificaciones.
3. Permisos granulares.
4. Panel administrativo de pagos.
5. Comprobantes.

### Etapa 4 - Madurez técnica

1. Migraciones.
2. Refresh token o corrección formal del requisito.
3. Rate limiting.
4. Observabilidad.
5. Backups y recuperación.
6. Mayor cobertura automatizada.

## 11. Definición de proyecto terminado

Para considerar cerrada la versión presentada, deberían cumplirse como mínimo estas condiciones:

- La documentación describe el sistema real sin contradicciones.
- Los casos de uso principales tienen evidencia de prueba.
- No es posible reservar dos veces las mismas fechas bajo concurrencia.
- Un pago aprobado, rechazado o pendiente deja un estado consistente.
- Los webhooks repetidos no generan efectos duplicados.
- Las reservas vencidas se liberan de forma segura.
- Existe una decisión documentada sobre cancelaciones, reembolsos y pago al anunciante.
- Los secretos son obligatorios en el despliegue y no están en Git.
- El equipo puede desplegar y demostrar el sistema siguiendo un procedimiento escrito.
