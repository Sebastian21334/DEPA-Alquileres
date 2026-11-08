# Ítem 13: publicaciones de cuentas bloqueadas

## Texto para incorporar al documento

Mientras una cuenta de Anunciante esté bloqueada, sus publicaciones no se mostrarán en el catálogo público, los resultados de búsqueda, las secciones del inicio, el perfil público del Anunciante ni los favoritos. El acceso mediante un enlace directo mostrará «Publicación no disponible», sin ofrecer acciones de contacto, WhatsApp ni nuevas reservas. El servidor rechazará también los intentos directos de cotizar, crear una reserva o enviar mensajes desde o hacia una cuenta bloqueada, incluso si existe una conversación anterior. El historial de mensajes se conserva y puede consultarlo la contraparte habilitada.

El bloqueo es reversible y no modifica el estado propio de las publicaciones. Al habilitar nuevamente la cuenta, volverán a mostrarse únicamente las publicaciones que cumplan las condiciones de visibilidad: estar activas, contar con al menos una imagen y no tener una baja administrativa. Las publicaciones pausadas o dadas de baja no se reactivan como consecuencia del desbloqueo.

El bloqueo no elimina ni cancela automáticamente reservas anteriores, no genera devoluciones y no cambia el estado del pago, la estadía, el reclamo ni la liquidación. Las reservas confirmadas o en curso conservan su vigencia y las pendientes de pago mantienen las reglas existentes de vencimiento y conciliación. Un pago ya iniciado puede seguir notificándose por Mercado Pago. Los reclamos, solicitudes de cancelación, devoluciones y liquidaciones pendientes se resuelven por sus procedimientos y autorizaciones habituales, con intervención administrativa cuando corresponda. El bloqueo no habilita por sí mismo una liquidación ni sustituye la validación del ingreso.

La contraparte habilitada puede consultar sus reservas y realizar las gestiones que correspondan sobre ellas desde Mis reservas, aunque el enlace público del anuncio no esté disponible. La cuenta bloqueada conserva sus datos pero no puede iniciar sesión ni operar; debe recurrir a soporte para las gestiones pendientes. En el detalle de la reserva se informa la suspensión del contacto y se deshabilitan los canales de comunicación con la cuenta restringida. La administración conserva el acceso a las publicaciones y operaciones anteriores.

## Aplicación y criterios de aceptación

- El catálogo filtra por cuenta habilitada antes de contar y paginar resultados. Se aplica también a la carga posterior de las publicaciones.
- El enlace público devuelve 404 con «Publicación no disponible»; las consultas internas para reservas e historial siguen disponibles.
- La lista por Anunciante filtra las cuentas restringidas incluso si se omite el parámetro `activa` o se envía `false`.
- Los favoritos se conservan en la base, pero se ocultan mientras dura la restricción; no se pueden agregar nuevos favoritos de esas publicaciones.
- La cotización y el checkout rechazan la cuenta bloqueada. La creación de la reserva vuelve a comprobar el estado dentro de la transacción del calendario.
- El cambio de bloqueo toma los mismos bloqueos de publicaciones que la creación de reservas: una operación concurrente se completa antes del bloqueo o es rechazada después de él.
- Los mensajes nuevos se rechazan antes de guardarlos o enviar el aviso por correo. El chat existente conserva el historial y deshabilita el envío al detectar la restricción.
- Bloquear y desbloquear no actualiza las reservas, pagos, reclamos ni liquidaciones. Sus procedimientos conservan las validaciones existentes.
- Las pantallas ya abiertas pueden mostrar información leída antes del bloqueo; el servidor vuelve a validar las operaciones. El chat actualiza el estado mediante su consulta periódica.

No se requiere una migración: se utilizan `usuario.activa` y `usuario.bloqueado` existentes. El PDF original no se modifica.

## Verificación

Ejecutar desde `back`: `npm run test:publicaciones-bloqueadas`.
La suite incluye 49 pruebas sobre publicaciones, favoritos, mensajería, bajas, preservación de operaciones anteriores, presupuestos, checkout y conciliación de pagos ya iniciados. La prueba de concurrencia de creación de reserva simula un bloqueo ocurrido durante la espera del calendario; no reemplaza una prueba de carga con PostgreSQL y solicitudes simultáneas.
