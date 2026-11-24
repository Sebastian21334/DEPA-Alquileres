export const BASE_DE_CONOCIMIENTO_DEPA = `
## Catálogo y contacto

- DEPA reúne alquileres temporarios y de largo plazo. Podés explorar el catálogo sin iniciar sesión. Los anuncios del catálogo están activos, tienen al menos una imagen y pertenecen a anunciantes con cuenta habilitada y actividades sin pausar.
- Podés buscar por texto y filtrar por modalidad, provincia, ciudad, tipo de propiedad, moneda, rango de precio, superficie mínima y ambientes. El mapa muestra anuncios con coordenadas. Para saber si un temporario está disponible en fechas concretas, consultá el calendario de la publicación.
- En los alquileres a largo plazo, contactá al anunciante para acordar el alquiler. Los temporarios permiten reservar por fecha. Para guardar favoritos o usar la mensajería interna necesitás iniciar sesión.
- El chat interno queda asociado a una publicación. El inquilino puede escribirle al anunciante. El anunciante contacta al inquilino por el chat de DEPA y puede iniciar una conversación si tiene una reserva aprobada en esa publicación o si ya tiene una conversación allí. Desactivar un anuncio permite seguir conversando. Si el anuncio se elimina o una cuenta se da de baja, se conserva el historial y se suspende el envío de mensajes. Una cuenta bloqueada que conserva acceso limitado puede usar la mensajería.

## Reservas y pagos

- Para reservar un temporario, iniciá sesión y elegí fechas disponibles desde hoy en adelante. Se cobran y ocupan todos los días del período, incluidos el de inicio y el de fin. Un anunciante no puede reservar su propio anuncio.
- El presupuesto muestra el importe a pagar y vence a los 15 minutos de emitirse. El pago se hace con Mercado Pago en pesos argentinos. Si el anuncio está en dólares, el presupuesto muestra la conversión aplicada. Si vence el presupuesto o cambia el precio o la moneda antes de crear la reserva, obtené uno nuevo.
- Al crear la reserva pendiente de pago comienza otro plazo de 15 minutos. Las fechas quedan bloqueadas. Si un intento de pago es rechazado o cancelado, podés volver a intentar dentro del plazo original. Si vence sin aprobación, la reserva se cancela y se liberan las fechas. La aprobación del pago confirma la reserva. Si el pago se informa con demora y la reserva no puede confirmarse, la operación se revisa para devolver el dinero.
- Para reprogramar, la reserva debe estar pagada y confirmada, antes de su inicio, sin ingreso validado y con la liquidación sin resolver ni en revisión. Solo puede hacerlo el inquilino titular. Conserva la duración y las condiciones de pago. El nuevo inicio debe quedar a 6 días corridos o más desde la solicitud y las fechas deben estar disponibles o pertenecer a la misma reserva.
- Al confirmarse la reserva, el inquilino recibe un código de alojamiento que debe entregar al anunciante al ingresar. El anunciante valida el código. Tras 5 intentos incorrectos, queda bloqueado y el anunciante puede pedir a Administración que restablezca los intentos.

## Cancelaciones y devoluciones

- El inquilino titular o el anunciante puede cancelar una reserva pendiente de pago y liberar las fechas. Para una reserva pagada, puede confirmar la cancelación hasta el día anterior al ingreso, indicando el motivo y aceptando las condiciones y el importe. Se aprueba automáticamente y las fechas se liberan al confirmarse la devolución, o inmediatamente si no corresponde devolución.
- El reintegro se calcula sobre lo efectivamente pagado, según la política aplicable al momento del pago. En la política base, si el inquilino lo pide con 7 días o más de anticipación corresponde el 100 %, de 2 a 6 días el 50 % y con 1 día el 0 %. Si lo pide el anunciante, corresponde el 100 %. Para conocer lo que aplica a una reserva concreta, consultá sus condiciones de cancelación.
- En cancelaciones automáticas se solicita a Mercado Pago la devolución de dinero en cuenta. Las devoluciones con tarjeta se simulan cuando el entorno está configurado para pruebas. Las devoluciones simuladas no mueven dinero.

## Reclamos

- El inquilino titular puede reclamar por una estadía con pago aprobado desde el inicio hasta el cuarto día corrido posterior al fin, inclusive. El reclamo se revisa sin cancelar la reserva. En el expediente se pueden enviar mensajes y adjuntar JPEG o PNG de hasta 5 MB cada uno, con un máximo de 10 imágenes por envío y 30 en total.
- Si una solicitud de cancelación sigue sin resolverse al llegar el día de inicio, se rechaza por demora y la reserva sigue vigente. Quien la solicitó puede reclamar por demora administrativa desde el inicio hasta el séptimo día corrido posterior al fin, inclusive.
- Si se aprobó una cancelación y queda un importe de devolución sin cubrir, el inquilino titular puede reclamar el faltante. El cálculo tiene en cuenta lo recibido y lo que sigue en gestión.

## Alta de anunciante y gestión de publicaciones

- Podés solicitar el alta como particular o inmobiliaria. La solicitud requiere aceptar los términos de anunciante, informar CUIT/CUIL y contacto, presentar frente y dorso del DNI, completar la prueba de vida e informar un CBU de 22 dígitos para revisión de titularidad. Las inmobiliarias presentan también los datos de la empresa y del corredor responsable, la matrícula y la constancia de CUIT.
- Para crear publicaciones necesitás identidad verificada y un CBU aprobado. La identidad y el CBU se pueden resolver por separado. Si rechazan la identidad, podés volver a presentar la documentación y hacer una nueva prueba de vida. Si solicitás cambiar un CBU aprobado, sigue vigente hasta que se apruebe el reemplazo.
- Una publicación necesita al menos una foto para activarse. Podés reordenar las fotos y restaurar anuncios propios de la papelera. Al restaurar, el anuncio queda inactivo. Si pausás tus actividades, tus anuncios salen del catálogo y dejan de aceptar nuevas reservas. Podés seguir gestionando las reservas existentes.

## Cuenta y acceso

- Para crear una cuenta aceptá los términos de uso y verificá tu correo antes de iniciar sesión. El enlace para recuperar la contraseña vence a las 2 horas y es de un solo uso.
- Una cuenta bloqueada puede consultar el motivo y presentar una apelación. Si tiene operaciones pendientes, puede conservar acceso limitado para gestionarlas. Sus anuncios dejan de aparecer en el catálogo.
- Podés pedir la baja de tu cuenta si está habilitada, tiene el correo verificado y no tenés operaciones pendientes. El enlace de confirmación vence a los 30 minutos. Si confirmaste una baja propia, podés pedir recuperar tu cuenta por correo con tu contraseña anterior, siempre que tus datos de registro sigan libres. Tus anuncios quedan desactivados.
`.trim();
