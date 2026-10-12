# Casos de prueba de la plataforma de alquileres

Se definen seis casos de prueba para detectar fallas de validación, autorización e integridad, y orientar mejoras en la estructura del sistema. Los resultados esperados se basan en el documento **Proyecto Seminario Integrador - 2026 (1).pdf**. Se conserva el orden de campos y la tabla de pasos y resultados de **Test_Case-Template.docx**, adaptados a Markdown.

**Estado:** casos diseñados, pendientes de ejecución y contraste con la implementación. Las mejoras sugeridas son puntos para evaluar después de ejecutar las pruebas; no constituyen fallas comprobadas.

**Preparación general:** utilizar un entorno de pruebas, cuentas y propiedades de prueba, y el entorno de prueba de Mercado Pago o un simulador controlado. Registrar la versión evaluada, la fecha y las evidencias de cada ejecución. Si las fechas propuestas ya pasaron, reemplazarlas por fechas futuras conservando los mismos solapamientos.

**Criterios:** RF identifica requerimientos funcionales; RN, reglas de negocio; RNF, requerimientos no funcionales. Cuando se menciona un mensaje, se evalúa que comunique la situación; no se exige una redacción literal. Las respuestas de la API deben representar el resultado de la operación mediante un error controlado cuando corresponda.

## Registro con un correo electrónico existente

**ID:** CP-01  
**Requerimiento:** RF1 Gestión de cuentas; RN-2 Unicidad del correo. CU 1 Crear Usuario, flujo alternativo A1. Referencia: páginas 10, 12 y 32 del PDF.  
**Autor:** pendiente de completar.  
**Versión:** 1.0.  
**Descripción:** intentar crear una segunda cuenta con exactamente el mismo correo de una cuenta existente. Verificar que el rechazo también se produzca al enviar la solicitud directamente a la API y que la cuenta original conserve sus datos y credenciales.  
**Prioridad:** alta.  
**Tipo de testing:** funcional negativo e integración; partición de equivalencia de correo ya registrado.

**Precondición/es:**

- Existe una cuenta verificada de tipo Inquilino con el correo indicado en los datos.
- Se conocen sus datos y contraseña originales y se puede consultar cuántas cuentas tienen ese correo.
- El ejecutor está sin sesión para realizar el intento de registro.

**Data:**

| Dato | Valor |
| --- | --- |
| Correo existente | `inquilino.uno@example.com` |
| Contraseña original | `Alquiler2026!` |
| Nombre y apellido del intento | Cuenta Duplicada |
| Teléfono del intento | `3534000001` |
| Correo del intento | `inquilino.uno@example.com` |
| Contraseña del intento | `OtraClave2026!` |

| Pasos | Resultado esperado |
| --- | --- |
| 1. Registrar los datos de la cuenta original y contar las cuentas asociadas al correo de prueba. | Existe exactamente una cuenta. Se dispone de una referencia para comprobar que sus datos no se modifican. |
| 2. Completar el formulario de registro con los datos del intento y confirmar. | Se informa que el correo ya está registrado. No se muestra una confirmación de creación de cuenta. |
| 3. Enviar los mismos datos directamente a la operación de registro de la API, sin depender de las validaciones del formulario. | El servidor rechaza la duplicación con un error controlado. No crea una segunda cuenta ni reemplaza la existente. |
| 4. Volver a consultar la cantidad de cuentas y los datos originales. | Sigue existiendo exactamente una cuenta con ese correo. Su nombre, teléfono, rol y estado de verificación mantienen sus valores originales. |
| 5. Iniciar sesión con la contraseña original y luego intentar hacerlo con la contraseña del registro rechazado. | La contraseña original permite iniciar sesión. La contraseña del intento duplicado no permite hacerlo. |

**PostCondición:** existe una sola cuenta con el correo de prueba y conserva sus datos, credenciales y estado previos.

**Nota Aclaratoria:**

- **Falla que busca detectar:** unicidad validada únicamente en el formulario, duplicación de cuentas o modificación accidental de una cuenta durante el registro.
- **Mejora de estructura a evaluar:** validación de unicidad en el servicio, restricción única en la base de datos y tratamiento uniforme del conflicto. El PDF no define normalización de mayúsculas o espacios en el correo; este caso utiliza una coincidencia exacta.
- **Resultado obtenido:** pendiente de ejecución.
- **Estado:** no ejecutado.
- **Evidencia:** completar con respuesta de la API, cantidad de cuentas y comprobación de las credenciales.
- **Falla observada y mejora propuesta:** completar después del contraste.

## Modificación de una publicación de otro anunciante

**ID:** CP-02  
**Requerimiento:** RF8 Gestión de publicaciones; RN-6 Pertenencia de la publicación; RN-8 Administración de publicaciones propias; RNF13 Seguridad de usuarios. Referencia: páginas 10, 12, 17 y 36 del PDF.  
**Autor:** pendiente de completar.  
**Versión:** 1.0.  
**Descripción:** comprobar que un anunciante autenticado no puede modificar una publicación perteneciente a otro anunciante, aunque conozca su identificador y envíe la solicitud directamente a la API.  
**Prioridad:** alta.  
**Tipo de testing:** seguridad de autorización e integración; prueba negativa de acceso a un recurso ajeno.

**Precondición/es:**

- Existen dos anunciantes verificados, A y B, habilitados y con sesiones válidas.
- A posee una publicación activa P, con al menos una imagen y datos válidos.
- Se conoce el identificador real de P y se puede consultar su estado antes y después de la prueba.

**Data:**

| Dato | Valor |
| --- | --- |
| Propietario de P | Anunciante A |
| Usuario que intenta modificar P | Anunciante B |
| Título original de P | Departamento de prueba |
| Título enviado por B | Modificación de otro anunciante |
| Precio original de P | ARS 50.000 |
| Precio enviado por B | ARS 60.000 |

| Pasos | Resultado esperado |
| --- | --- |
| 1. Consultar P y registrar su propietario, título, precio, estado e imágenes. | P pertenece a A y contiene los datos originales de prueba. |
| 2. Con la sesión de B, intentar abrir la edición de P mediante su identificador o una dirección directa. | La interfaz impide administrar una publicación ajena y comunica la falta de permisos. |
| 3. Con las credenciales de B, enviar directamente a la API una modificación del título y el precio de P. | El servidor rechaza la operación por falta de autorización, con una respuesta controlada de acceso denegado. |
| 4. Recargar el detalle público y consultar nuevamente los datos persistidos de P. | El título, precio, propietario, estado e imágenes permanecen sin cambios. No existe una modificación parcial. |
| 5. Enviar la misma modificación con la sesión de A. | La modificación se realiza correctamente y se conserva la pertenencia de P a A. Esto confirma que el rechazo anterior responde a los permisos. |

**PostCondición:** el intento de B no produjo cambios. La modificación de control realizada por A queda identificada y puede restaurarse a los valores iniciales.

**Nota Aclaratoria:**

- **Falla que busca detectar:** autorización basada solamente en ocultar botones o en verificar el rol de Anunciante, sin comprobar la pertenencia del recurso.
- **Mejora de estructura a evaluar:** comprobación de propiedad del recurso en el backend y una política de autorización reutilizable para las operaciones de administración.
- **Resultado obtenido:** pendiente de ejecución.
- **Estado:** no ejecutado.
- **Evidencia:** completar con identidad del usuario de prueba, respuesta del rechazo y comparación de P antes y después.
- **Falla observada y mejora propuesta:** completar después del contraste.

## Creación de una publicación sin imágenes

**ID:** CP-03  
**Requerimiento:** RF8 Gestión de publicaciones; RF9 Gestión de imágenes; RF10 Consulta y búsqueda; RN-9 Imagen obligatoria; RN-10 y RN-21 Visibilidad pública. CU 9 Registrar Publicación, flujo alternativo A2. Referencia: páginas 10 a 13 y 33 del PDF.  
**Autor:** pendiente de completar.  
**Versión:** 1.0.  
**Descripción:** intentar registrar una publicación con todos los datos obligatorios válidos, pero sin imágenes. Verificar el rechazo en el formulario y en la API, y comprobar que el intento no deja una publicación registrada ni visible.  
**Prioridad:** alta.  
**Tipo de testing:** funcional negativo e integración; análisis del límite de cero y una imagen.

**Precondición/es:**

- Existe un anunciante verificado con una sesión válida.
- Existen los valores de catálogos y la relación provincia-localidad elegidos para la prueba.
- Se puede consultar tanto el catálogo público como las publicaciones del anunciante.
- No existe previamente una publicación con el título de prueba.

**Data:**

| Dato | Valor |
| --- | --- |
| Título | Publicación CP03 sin imagen |
| Descripción | Departamento destinado a una prueba de registro |
| Dirección | Dirección ficticia de prueba 123 |
| Provincia y localidad | Córdoba y Villa María, utilizando sus identificadores válidos |
| Ubicación geográfica | Coordenadas válidas del inmueble de prueba |
| Tipo y modalidad | Departamento y alquiler temporal, utilizando sus identificadores válidos |
| Moneda y precio | ARS y 50.000 |
| Ambientes y superficie | 2 ambientes y 45 m² |
| Imágenes del intento negativo | Ninguna |
| Imagen de control | Una fotografía de prueba válida de la propiedad |

| Pasos | Resultado esperado |
| --- | --- |
| 1. Completar todos los datos del formulario sin adjuntar imágenes y confirmar la creación. | Se informa que se requiere al menos una imagen y no se completa el registro. |
| 2. Enviar directamente a la API una creación con esos datos y sin imágenes. Si el proceso usa varias solicitudes, completar la secuencia de publicación omitiendo la carga de imágenes. | El backend impide completar la publicación sin una imagen. La validación no depende exclusivamente del formulario. |
| 3. Consultar las publicaciones del anunciante y los datos persistidos asociados al intento. | No queda una publicación registrada como resultado del intento fallido. No quedan relaciones ni archivos huérfanos atribuibles al intento. |
| 4. Buscar el título de prueba como Visitante en el catálogo público. | No aparece una publicación proveniente del intento rechazado. |
| 5. Repetir la creación con los mismos datos y una imagen válida. | La publicación se registra una sola vez, asociada al anunciante, y conserva la imagen. |
| 6. Consultar su detalle y buscarla en el catálogo una vez activa. | El detalle contiene la imagen y la publicación aparece en el catálogo. Se confirma el límite mínimo de una imagen. |

**PostCondición:** el intento sin imágenes no dejó una publicación registrada. Existe una única publicación de control creada con una imagen válida.

**Nota Aclaratoria:**

- **Falla que busca detectar:** creación anticipada de la publicación seguida de una carga de imágenes opcional, registros incompletos o visibilidad pública sin imagen.
- **Mejora de estructura a evaluar:** coordinación entre creación y carga de imágenes, con transacción y compensación de archivos cuando corresponda. Si se desea conservar borradores sin imágenes, esa excepción debe documentarse: el CU 9 describe que la publicación no se registra hasta corregir el error.
- **Resultado obtenido:** pendiente de ejecución.
- **Estado:** no ejecutado.
- **Evidencia:** completar con mensajes, respuestas de la API, registros resultantes y consulta pública.
- **Falla observada y mejora propuesta:** completar después del contraste.

## Reservas simultáneas con fechas superpuestas

**ID:** CP-04  
**Requerimiento:** RF15 Gestión de disponibilidad; RF16 Gestión de reservas; RN-14 Ausencia de superposición; RN-15 Fechas disponibles; RN-16 Bloqueo temporal. CU 19 Registrar Reserva, flujo alternativo A1. Referencia: páginas 11, 13 y 34 del PDF.  
**Autor:** pendiente de completar.  
**Versión:** 1.0.  
**Descripción:** enviar simultáneamente dos solicitudes de reserva sobre las mismas fechas de una publicación temporal y comprobar que solo una consigue bloquearlas.  
**Prioridad:** crítica.  
**Tipo de testing:** concurrencia e integración; prueba de conflicto sobre un recurso compartido.

**Precondición/es:**

- Existe una publicación temporal activa P con al menos una imagen.
- Los días de prueba están disponibles y no tienen reservas pendientes vigentes ni confirmadas.
- Existen dos Inquilinos verificados y habilitados, A y B, con sesiones independientes.
- Se dispone de un mecanismo para enviar las dos solicitudes en paralelo y consultar reservas y disponibilidad persistidas.

**Data:**

| Dato | Valor |
| --- | --- |
| Publicación | P, identificador obtenido de la preparación |
| Solicitantes | Inquilinos A y B |
| Fechas solicitadas por ambos | Días de calendario 10 y 11 de noviembre de 2026 |
| Estado inicial de los días | Disponibles |
| Pago durante la prueba | No aprobar el pago de la reserva ganadora |

| Pasos | Resultado esperado |
| --- | --- |
| 1. Desde las sesiones de A y B, consultar el calendario de P. | Ambos ven disponibles los días seleccionados antes de confirmar. |
| 2. Preparar dos solicitudes de reserva válidas para P y exactamente las mismas fechas. | Las solicitudes tienen datos equivalentes salvo por la identidad del Inquilino. |
| 3. Enviar ambas solicitudes en paralelo, procurando que lleguen al servidor antes de que una consulta posterior actualice las pantallas. | Solo una solicitud crea una reserva pendiente vigente y bloquea las fechas. La otra recibe un conflicto de disponibilidad y no crea una reserva vigente superpuesta. |
| 4. Consultar todas las reservas de P que incluyan los días de prueba. | Existe exactamente una reserva pendiente vigente para esos días. No hay dos reservas vigentes superpuestas. |
| 5. Recargar los calendarios de A y B e intentar reservar de nuevo el mismo período con el usuario que perdió el conflicto. | Los días aparecen bloqueados y el nuevo intento se rechaza mientras la primera reserva siga vigente. |
| 6. Cancelar la reserva pendiente ganadora mediante una acción permitida y consultar nuevamente el calendario. | La reserva se cancela y los días se liberan, sin dejar un bloqueo procedente del intento rechazado. |

**PostCondición:** nunca coexistieron reservas vigentes superpuestas. Tras cancelar la reserva de prueba, los días quedan disponibles.

**Nota Aclaratoria:**

- **Falla que busca detectar:** ambas solicitudes consultan disponibilidad antes de que alguna la modifique, y las dos terminan registrándose; también bloqueos parciales o permanentes.
- **Mejora de estructura a evaluar:** validación y bloqueo dentro de una operación atómica, con control de concurrencia y garantías de integridad en la base de datos.
- **Criterio de fechas:** el PDF no define si la fecha de salida se incluye. Preparar solicitudes que ocupen exactamente los mismos días según la convención acordada, para que el resultado no dependa de esa ambigüedad.
- **Resultado obtenido:** pendiente de ejecución.
- **Estado:** no ejecutado.
- **Evidencia:** completar con tiempos de envío, respuestas de ambas solicitudes, reservas persistidas y estado del calendario.
- **Falla observada y mejora propuesta:** completar después del contraste.

## Vencimiento de una reserva pendiente de pago

**ID:** CP-05  
**Requerimiento:** RF16 Gestión de reservas; RN-16 Liberación del bloqueo; RN-19 Vigencia máxima de 15 minutos; RNF7 Consistencia entre pagos y reservas. Referencia: páginas 11, 13, 15 y 16 del PDF.  
**Autor:** pendiente de completar.  
**Versión:** 1.0.  
**Descripción:** comprobar que una reserva sin pago aprobado se cancela al agotar su vigencia máxima y libera sus fechas automáticamente, aunque el Inquilino abandone el proceso de pago.  
**Prioridad:** alta.  
**Tipo de testing:** integración, transiciones de estado y análisis del límite temporal.

**Precondición/es:**

- Existe una publicación temporal activa con los días de prueba disponibles.
- Hay dos Inquilinos verificados y habilitados, A y B.
- Se puede observar el estado persistido sin ejecutar acciones de negocio que provoquen el vencimiento.
- El entorno permite esperar el vencimiento real o controlar el reloj y la ejecución del mecanismo automático.
- Se conoce la duración configurada de la vigencia, T. La documentación establece un máximo de 15 minutos, por lo que una duración menor también es válida.
- Mercado Pago o el simulador confirma que no existe un pago aprobado asociado a la reserva.

**Data:**

| Dato | Valor |
| --- | --- |
| Inquilino que crea la reserva | A |
| Inquilino que intenta utilizar las fechas luego del vencimiento | B |
| Días seleccionados | 12 y 13 de noviembre de 2026 |
| Inicio de vigencia | `t0`, obtenido del registro del servidor |
| Duración configurada | T, positiva y no mayor a 15 minutos |
| Comprobación previa | Un segundo antes de `t0 + T`; si T es 15 minutos, `t0 + 14 minutos 59 segundos` |
| Vencimiento configurado | `t0 + T` |
| Límite máximo permitido | `t0 + 15 minutos` |
| Pago | Sin aprobación; proceso abandonado |

| Pasos | Resultado esperado |
| --- | --- |
| 1. Con A, crear la reserva e iniciar el proceso de pago. Registrar su identificador, el momento de inicio y el vencimiento configurado. | La reserva queda pendiente y los días se bloquean temporalmente. Su vigencia configurada no supera los 15 minutos. |
| 2. Abandonar el proceso sin aprobar el pago y cerrar la pantalla de A. | No se registra un pago aprobado ni una confirmación de reserva. El abandono no exige una cancelación manual. |
| 3. Observar el estado un segundo antes del vencimiento configurado, sin provocar una actualización de negocio. | La reserva permanece pendiente y los días siguen bloqueados, siempre que no haya ocurrido otra causa válida de cancelación. |
| 4. Alcanzar el vencimiento configurado sin enviar nuevas solicitudes de reserva, pago o cancelación. Observar el procesamiento automático y comprobar el límite máximo de 15 minutos. | La reserva deja de estar vigente, se cancela y libera los días automáticamente. No necesita que un usuario vuelva a entrar para iniciar el vencimiento ni mantiene un bloqueo pendiente más allá del máximo permitido. |
| 5. Con B, consultar el calendario e intentar reservar los mismos días después del vencimiento. | Los días están disponibles y B puede generar una nueva reserva pendiente. La reserva anterior no impide la operación. |
| 6. Volver a consultar la reserva de A y las reservas vigentes para ese período. | La reserva de A continúa cancelada y conserva su historial. Solo la nueva reserva de B está vigente. |

**PostCondición:** la reserva original queda cancelada por vencimiento, sin pago aprobado. Las fechas pueden reutilizarse y solo están bloqueadas por la nueva reserva de control.

**Nota Aclaratoria:**

- **Falla que busca detectar:** fechas bloqueadas indefinidamente, vencimiento calculado con el reloj del navegador o liberación que ocurre únicamente al consultar una pantalla.
- **Mejora de estructura a evaluar:** vencimiento calculado por el servidor y mecanismo automático fiable que coordine estados de reserva, pago y disponibilidad. Registrar la precisión de observación y la frecuencia del proceso; la RN-19 establece una vigencia máxima de 15 minutos.
- **Alcance:** este caso requiere comprobar que no hubo un pago aprobado. Una aprobación externa pendiente de conciliación debe tratarse según el flujo alternativo A3 del CU 19, antes de liberar las fechas.
- **Resultado obtenido:** pendiente de ejecución.
- **Estado:** no ejecutado.
- **Evidencia:** completar con `t0`, hora de cancelación, estados persistidos y resultado de la nueva reserva.
- **Falla observada y mejora propuesta:** completar después del contraste.

## Conciliación de un pago aprobado con fallo de registro local

**ID:** CP-06  
**Requerimiento:** RF17 Procesamiento de pagos; RF19 Notificaciones; RN-16 Bloqueo de fechas; RN-17 Pago previo a la confirmación; RNF7 Consistencia entre pagos y reservas. CU 19 Registrar Reserva, flujo alternativo A3. Referencia: páginas 11, 13, 15, 16, 34 y 37 del PDF.  
**Autor:** pendiente de completar.  
**Versión:** 1.0.  
**Descripción:** provocar un fallo controlado al registrar localmente un pago que Mercado Pago ya aprobó. Reintentar su procesamiento y repetir la notificación para comprobar que el sistema recupera un estado consistente y procesa la operación una sola vez.  
**Prioridad:** crítica.  
**Tipo de testing:** integración con servicio externo, recuperación ante fallos e idempotencia.

**Precondición/es:**

- Existe una reserva R pendiente vigente con sus fechas bloqueadas y una operación de pago de prueba asociada.
- Se conocen el importe y la moneda calculados por el servidor y la referencia externa de R.
- El proveedor de prueba permite consultar un pago aprobado con esos valores.
- Es posible provocar una falla temporal de persistencia durante el registro local del pago, observar los estados y luego restaurar el servicio.
- La recuperación se ejecuta dentro de la vigencia de R para aislar este caso del vencimiento y de posibles pagos tardíos.

**Data:**

| Dato | Valor |
| --- | --- |
| Reserva | R, identificador obtenido de la preparación |
| Días reservados | 14 y 15 de noviembre de 2026 |
| Pago externo | MP-PRUEBA-01, identificador lógico a reemplazar por uno válido del entorno de prueba |
| Estado externo | Aprobado |
| Importe | M, total cotizado por el servidor para R |
| Moneda | ARS |
| Referencia externa | La referencia exacta que identifica a R |
| Falla inducida | Error temporal de persistencia antes de completar el registro local del pago y la confirmación |
| Repetición | Procesamiento inicial, reintento y una notificación duplicada del mismo pago |

| Pasos | Resultado esperado |
| --- | --- |
| 1. Registrar los estados iniciales de R, el pago local y la disponibilidad. Aprobar el pago mediante el proveedor de prueba. | R está pendiente y sus fechas están bloqueadas. El proveedor registra un único pago aprobado con importe M, moneda ARS y la referencia de R. |
| 2. Activar la falla temporal de persistencia y procesar la notificación del pago aprobado. | El servidor consulta al proveedor y verifica estado, importe, moneda y referencia. La falla local no produce una confirmación inconsistente ni se presenta como un rechazo del pago externo. |
| 3. Consultar la situación desde la perspectiva del Inquilino y observar los estados persistidos. | El sistema no exige efectuar un nuevo pago sin comprobar la operación original. Las fechas no se liberan mientras el pago aprobado requiere conciliación. El fallo queda identificable para su recuperación. |
| 4. Restaurar la persistencia y ejecutar el reintento o mecanismo de conciliación del mismo pago. | Se verifica nuevamente la operación externa y se completa el registro local. R queda confirmada, el pago queda aprobado y los días siguen reservados. |
| 5. Enviar otra vez la notificación correspondiente al mismo identificador de pago. | El procesamiento es idempotente: no registra una segunda operación económica, no duplica la reserva ni vuelve a aplicar la confirmación. |
| 6. Consultar el pago, la reserva, la disponibilidad y las notificaciones generadas. | Los tres estados coinciden: pago aprobado, reserva confirmada y fechas ocupadas. Se mantiene una sola asociación del pago con R y se emite la confirmación a las partes sin duplicarla por el reprocesamiento. |

**PostCondición:** R queda confirmada y conserva sus fechas ocupadas. Existe una sola operación de pago efectiva asociada a R y el fallo temporal fue recuperado sin exigir otro pago.

**Nota Aclaratoria:**

- **Falla que busca detectar:** cobro externo aprobado con reserva local pendiente o cancelada, liberación de fechas pagadas, registro parcial, procesamiento repetido o solicitud de un segundo pago al usuario.
- **Mejora de estructura a evaluar:** transacciones para los cambios locales, identificación única del pago, procesamiento idempotente y mecanismo de conciliación recuperable. Para las notificaciones, evaluar un registro de envío o una cola que permita reintentos sin duplicar la confirmación; este último punto es un criterio de mejora derivado de la idempotencia.
- **Alcance:** este caso verifica el pago de la reserva. El PDF declara pendientes el circuito de transferencia al Anunciante y las devoluciones de reservas pagadas; esas funciones no forman parte de esta prueba.
- **Resultado obtenido:** pendiente de ejecución.
- **Estado:** no ejecutado.
- **Evidencia:** completar con consulta al proveedor, fallo inducido, resultado del reintento, cantidad de operaciones locales y estados finales.
- **Falla observada y mejora propuesta:** completar después del contraste.
