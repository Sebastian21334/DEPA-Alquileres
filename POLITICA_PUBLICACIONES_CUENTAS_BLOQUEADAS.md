# Ítem 13: cuentas bloqueadas y reservas

## Texto para incorporar al documento

Mientras una cuenta de Anunciante esté bloqueada, sus publicaciones no se mostrarán en el catálogo público, los resultados de búsqueda, las secciones del inicio, el perfil público del Anunciante ni los favoritos. El acceso mediante un enlace directo mostrará «Publicación no disponible», sin ofrecer acciones de contacto, WhatsApp ni nuevas reservas. El servidor rechazará también los intentos directos de cotizar, crear una reserva o enviar mensajes desde o hacia una cuenta bloqueada, incluso si existe una conversación anterior. El historial de mensajes se conserva y puede consultarlo la contraparte habilitada.

El bloqueo es reversible y no modifica el estado propio de las publicaciones. Al habilitar nuevamente la cuenta, volverán a mostrarse únicamente las publicaciones que cumplan las condiciones de visibilidad: estar activas, contar con al menos una imagen y no tener una baja administrativa. Las publicaciones pausadas o dadas de baja no se reactivan como consecuencia del desbloqueo.

El bloqueo de un Anunciante resuelve las reservas de sus publicaciones según el código de alojamiento. Las reservas pendientes de pago se cancelan y liberan sus fechas, sin devolución. Las reservas pagadas sin código de alojamiento validado se cancelan, liberan sus fechas y generan una devolución del 100 % del saldo cobrado no devuelto, porque el Inquilino no ingresó al alojamiento. Las reservas con código validado (en curso o finalizadas) no se cancelan ni se devuelven automáticamente: la liquidación queda en revisión para que el Administrador resuelva el pago, la retención o el recupero. Los reclamos, contracargos y liquidaciones ya en revisión siguen el circuito administrativo.

La devolución se registra con origen `CANCELACION` y el motivo del bloqueo. Si `MP_REFUNDS_ENABLED` está activo, puede ejecutarse por Mercado Pago; si no, el Administrador la registra manualmente. La cancelación y la liberación de fechas no dependen de Mercado Pago. El desbloqueo no restaura las reservas canceladas ni revierte las devoluciones.

La contraparte habilitada puede consultar sus reservas y realizar las gestiones que correspondan sobre ellas desde Mis reservas, aunque el enlace público del anuncio no esté disponible. Las reservas canceladas por el bloqueo figuran como canceladas y, cuando corresponde, con la devolución registrada. La cuenta bloqueada conserva sus datos pero no puede iniciar sesión ni operar; debe recurrir a soporte para las gestiones pendientes. En el detalle de la reserva se informa la suspensión del contacto y se deshabilitan los canales de comunicación con la cuenta restringida. La administración conserva el acceso a las publicaciones y operaciones anteriores.

## Aplicación y criterios de aceptación

- El catálogo filtra por cuenta habilitada antes de contar y paginar resultados. Se aplica también a la carga posterior de las publicaciones.
- El enlace público devuelve 404 con «Publicación no disponible»; las consultas internas para reservas e historial siguen disponibles.
- La lista por Anunciante filtra las cuentas restringidas incluso si se omite el parámetro `activa` o se envía `false`.
- Los favoritos se conservan en la base, pero se ocultan mientras dura la restricción; no se pueden agregar nuevos favoritos de esas publicaciones.
- La cotización y el checkout rechazan la cuenta bloqueada. La creación de la reserva vuelve a comprobar el estado dentro de la transacción del calendario.
- El cambio de bloqueo toma los mismos bloqueos de publicaciones que la creación de reservas: una operación concurrente se completa antes del bloqueo o es rechazada después de él.
- Los mensajes nuevos se rechazan antes de guardarlos o enviar el aviso por correo. El chat existente conserva el historial y deshabilita el envío al detectar la restricción.
- Al bloquear un Anunciante, las reservas pendientes de pago se cancelan y liberan sus fechas, sin devolución.
- Las reservas pagadas sin código validado se cancelan, liberan sus fechas y generan una devolución del 100 % del saldo cobrado no devuelto. Si ya existe una devolución parcial, se emite un complemento por el saldo faltante; no se duplica el importe ya devuelto.
- La creación y la confirmación de reembolsos se resuelven en una transacción con bloqueo del pago y del reembolso; un fallo de Mercado Pago no habilita un segundo reembolso por el mismo saldo.
- Las reservas con código validado, o con reclamo, contracargo o liquidación en revisión, no se cancelan ni devuelven automáticamente: pasan a revisión administrativa.
- Desbloquear no restaura reservas ni revierte devoluciones. Las cancelaciones y devoluciones son irreversibles.
- La resolución es idempotente: bloqueos repetidos, webhooks tardíos o dos administradores simultáneos no duplican cancelaciones ni reembolsos.
- Las pantallas ya abiertas pueden mostrar información leída antes del bloqueo; el servidor vuelve a validar las operaciones. El chat actualiza el estado mediante su consulta periódica.

No se requiere una migración: se utilizan `usuario.activa` y `usuario.bloqueado` existentes. El PDF original no se modifica.

## Verificación

Ejecutar desde `back`: `npm run test:publicaciones-bloqueadas`.
La suite incluye pruebas sobre publicaciones, favoritos, mensajería, bajas, bloqueo de Anunciante con reservas, presupuestos, checkout y conciliación de pagos ya iniciados. Ejecutar también `npm run test:bloqueo-anunciante`. La prueba de concurrencia de creación de reserva simula un bloqueo ocurrido durante la espera del calendario; no reemplaza una prueba de carga con PostgreSQL y solicitudes simultáneas.
