# Implementación y funcionamiento de Mercado Pago en DEPA

Fecha: 29 de septiembre de 2026

Integración: Mercado Pago Checkout Pro
Entorno previsto para el proyecto: credenciales y operaciones de prueba

## 1. Objetivo

La integración permite que un inquilino seleccione fechas para una publicación temporaria, vea el total calculado por el servidor y sea redirigido a Mercado Pago para completar un pago de prueba.

DEPA no solicita ni almacena números de tarjeta, vencimientos ni códigos de seguridad. Los datos sensibles se ingresan exclusivamente en el checkout alojado por Mercado Pago.

Cuando Mercado Pago informa el resultado, el backend valida la operación y decide si confirma o cancela la reserva.

## 2. Alcance actual

La versión implementada incluye:

- Checkout Pro.
- SDK oficial de Mercado Pago para Node.js.
- Una única cuenta receptora configurada mediante `MP_ACCESS_TOKEN`.
- Preferencias de pago con vencimiento.
- URLs de retorno para éxito, rechazo y pendiente.
- Webhook de pagos.
- Validación opcional de firma mediante una clave secreta.
- Consulta del pago a la API de Mercado Pago.
- Validación de referencia, importe y moneda.
- Registro del pago en PostgreSQL.
- Confirmación o cancelación de la reserva según el estado.
- Correos posteriores a la aprobación.

Para la entrega académica se mantendrán credenciales de prueba incluso cuando frontend y backend estén desplegados públicamente. Por lo tanto, ninguna operación debe mover dinero real.

## 3. Componentes involucrados

### Frontend

- `front/src/app/features/publication-detail/publication-detail.component.ts`
- `front/src/app/features/publication-detail/publication-detail.component.html`
- `front/src/app/shared/services/reservation.service.ts`
- `front/src/app/features/mis-reservas/mis-reservas.component.ts`

El frontend selecciona las fechas, muestra el importe, solicita el checkout y redirige al usuario a la URL entregada por Mercado Pago.

### Backend

- `back/src/pagos/pagos.module.ts`
- `back/src/pagos/pagos.controller.ts`
- `back/src/pagos/pagos.service.ts`
- `back/src/pagos/entity/pago.entity.ts`
- `back/src/pagos/dto/crear-checkout.dto.ts`
- `back/src/reservas/service/reservas.service.ts`
- `back/src/reservas/entity/reserva.entity.ts`

El backend mantiene el token privado, calcula y verifica el importe, crea la preferencia, recibe el webhook y actualiza la base de datos.

### Servicios externos

- Mercado Pago Checkout Pro.
- Vercel para el frontend.
- Render para el backend.
- PostgreSQL para persistencia.
- Servicio de correo para notificaciones.

## 4. Modelo de datos

### Reserva

La entidad `Reserva` conserva los datos del alojamiento y agrega información del estado de pago:

| Campo | Descripción |
|---|---|
| `monto_pago` | Importe calculado por el backend. |
| `fecha_pago` | Fecha en que Mercado Pago aprobó el pago. Es nula mientras está pendiente. |
| `estado_pago` | `PENDIENTE`, `APROBADO`, `RECHAZADO`, `CANCELADO` o `REEMBOLSADO`. |
| `pago_vencimiento` | Límite para completar el checkout. |
| `fecha_inicio` / `fecha_fin` | Período reservado. |
| `cancelada` | Indica que la reserva fue cerrada. |

### Pago

La entidad `Pago` registra la operación externa sin almacenar datos de tarjeta:

| Campo | Descripción |
|---|---|
| `id_pago` | Identificador interno. |
| `id_reserva` | Reserva asociada, relación uno a uno. |
| `external_reference` | Referencia propia con formato `reserva:<id>`. |
| `preference_id` | Identificador de la preferencia de Checkout Pro. |
| `payment_id` | Identificador del pago informado por Mercado Pago. |
| `status` | Estado original de Mercado Pago. |
| `status_detail` | Motivo o detalle del estado. |
| `amount` | Importe esperado. |
| `currency` | Moneda esperada, actualmente `ARS`. |
| `payment_method_id` | Medio elegido dentro de Mercado Pago. |
| `idempotency_key` | Clave única utilizada al crear la preferencia. |
| `approved_at` | Fecha de aprobación externa. |
| `created_at` / `updated_at` | Auditoría básica. |

No se guardan número de tarjeta, CVV ni vencimiento.

## 5. Endpoints

| Método y ruta | Autenticación | Función |
|---|---|---|
| `POST /pagos/checkout` | JWT | Crea reserva pendiente, pago interno y preferencia. |
| `POST /pagos/reconciliar` | JWT | Verifica en Mercado Pago el pago informado al regresar del checkout. |
| `POST /pagos/webhook` | Firma de Mercado Pago | Recibe cambios del pago. |
| `GET /pagos/reservas/:id/estado` | JWT | Consulta el estado de una reserva propia. |
| `GET /reservas/:id/codigo-alojamiento` | JWT del inquilino | Consulta el código privado de una reserva aprobada. |
| `PATCH /reservas/:id/validar-codigo` | JWT del anunciante | Valida el código entregado y solicita la liquidación manual. |
| `PATCH /reservas/:id/reportar-problema` | JWT del inquilino | Congela la liquidación y abre una revisión administrativa. |
| `GET /reservas/liquidaciones/administracion` | Administrador | Lista pagos manuales y reclamos por resolver. |
| `PATCH /reservas/:id/liquidacion` | Administrador | Registra pago, devolución o resolución manual. |

### Solicitud para iniciar el checkout

```json
{
  "id_publicacion": 15,
  "fecha_inicio": "2026-10-07",
  "fecha_fin": "2026-10-09"
}
```

El usuario no envía el importe. El backend lo calcula usando el precio vigente de la publicación y la cantidad de días.

### Respuesta

```json
{
  "reserva_id": 42,
  "preference_id": "123456789-abc123",
  "checkout_url": "https://www.mercadopago.com.ar/checkout/v1/redirect?...",
  "expires_at": "2026-09-29T05:15:00.000Z"
}
```

El frontend redirige el navegador a `checkout_url`.

## 6. Flujo completo

### Paso 1 - Selección

El inquilino abre una publicación temporaria, selecciona ingreso y salida y presiona `Reservar ahora`.

El frontend calcula un total informativo, pero el total definitivo se vuelve a calcular en el backend para impedir que el navegador lo manipule.

### Paso 2 - Solicitud autenticada

El frontend ejecuta `POST /pagos/checkout` con el JWT del usuario y las fechas.

### Paso 3 - Validaciones del backend

`ReservasService.crearPendiente()` comprueba:

- Rango válido.
- Fechas no anteriores al día actual.
- Publicación existente y activa.
- Modalidad compatible con reservas por fecha.
- El inquilino no es dueño de la publicación.
- Todas las fechas están cargadas y disponibles.
- Importe calculable.

### Paso 4 - Reserva pendiente

Se crea una reserva con:

- `estado_pago = PENDIENTE`.
- `fecha_pago = null`.
- Vencimiento aproximado de 15 minutos.
- Copia histórica de los datos del inquilino.
- Copia del período y del importe.

Las fechas quedan bloqueadas para reducir el riesgo de que otro usuario las elija mientras el checkout está abierto.

### Paso 5 - Registro interno del pago

Se crea una fila en `pago` con:

- Referencia `reserva:<id>`.
- Importe.
- Moneda.
- Estado `pending`.
- Clave de idempotencia.

### Paso 6 - Preferencia de Mercado Pago

El backend usa `MP_ACCESS_TOKEN` para crear la preferencia. Se envían:

- Título y descripción.
- Una unidad por el total completo de la reserva.
- Moneda.
- Datos básicos del comprador.
- Referencia externa.
- URLs de retorno.
- URL de webhook.
- Fecha de expiración.
- Metadatos con el ID de la reserva.

Mercado Pago responde con un `preference_id` y un `init_point`. El `init_point` se devuelve al frontend como `checkout_url`.

### Paso 7 - Pago en Mercado Pago

El comprador elige tarjeta u otro medio habilitado dentro de Mercado Pago. DEPA no recibe esos datos.

Para el proyecto se deben utilizar cuentas, tarjetas y credenciales de prueba.

### Paso 8 - Retorno del navegador

Mercado Pago puede redirigir a:

- `MP_SUCCESS_URL`.
- `MP_FAILURE_URL`.
- `MP_PENDING_URL`.

Cuando el retorno contiene `payment_id` o `collection_id`, el frontend lo envía a `POST /pagos/reconciliar`. El backend consulta nuevamente la operación en Mercado Pago y verifica referencia, propietario de la reserva, importe y moneda antes de actualizarla. Por lo tanto, el identificador recibido desde el navegador se utiliza para buscar el pago, pero nunca se confía en el estado informado por la URL.

Esta conciliación funciona como respaldo del webhook: si la notificación automática se demora o falla, el regreso exitoso del comprador también puede confirmar la reserva de manera segura.

### Paso 9 - Webhook

Mercado Pago envía un `POST` a `/pagos/webhook` con el identificador del pago.

Si existe `MP_WEBHOOK_SECRET`, el backend valida:

- `x-signature`.
- `x-request-id`.
- ID recibido.
- Ventana temporal máxima de cinco minutos.

Después consulta el pago directamente con el SDK y el Access Token. Así, el backend no confía solamente en el cuerpo del webhook.

### Paso 10 - Conciliación

Antes de modificar la reserva se comprueba:

- La referencia comienza con `reserva:`.
- Existe un pago interno para esa referencia.
- El importe coincide con el esperado.
- La moneda coincide con la esperada.

Se guardan el identificador externo, estado, detalle, método y fecha de aprobación.

### Paso 11 - Resultado

#### Aprobado

- La reserva pasa a `APROBADO`.
- Se registra `fecha_pago`.
- Se elimina el vencimiento pendiente.
- Se mantienen las fechas bloqueadas.
- Se notifica por correo al inquilino y al anunciante.
- La reserva aparece como confirmada.

#### Pendiente

- La reserva sigue en `PENDIENTE`.
- Las fechas continúan bloqueadas temporalmente.
- Se espera otra notificación.

#### Rechazado o cancelado

- La reserva se marca cancelada.
- Se registra `RECHAZADO` o `CANCELADO`.
- Las fechas vuelven a estar disponibles.

#### Reembolsado o contracargo

- El estado se traduce a `REEMBOLSADO`.
- La integración reacciona a una devolución informada, aunque todavía no inicia devoluciones desde DEPA.

## 7. Decisiones de seguridad

### Access Token solo en backend

`MP_ACCESS_TOKEN` nunca se envía a Angular ni se incluye en Git. Se carga como secreto en Render.

### Datos de tarjeta fuera de DEPA

Se eliminaron los campos simulados de tarjeta. Checkout Pro se encarga de capturar y procesar los datos.

### Importe calculado por el servidor

El frontend no puede elegir cuánto pagar. El backend obtiene el precio de la publicación y calcula el total.

### Webhook como fuente de confirmación

La URL de éxito no confirma una reserva. El pago se valida mediante webhook y una consulta autenticada a Mercado Pago.

### Referencia e importe

Cada pago se vincula a una reserva mediante una referencia única. También se comparan importe y moneda.

### Idempotencia

La preferencia se crea con una clave UUID. Además, `external_reference` y `payment_id` son únicos en la tabla de pagos.

## 8. Variables de entorno

El archivo real `.env` no se versiona. `.env.example` solo muestra nombres y ejemplos.

### Backend desplegado en Render

```env
MP_ACCESS_TOKEN=ACCESS_TOKEN_DE_PRUEBA
MP_CURRENCY_ID=ARS

MP_SUCCESS_URL=https://depa-alquileres.vercel.app/reserva/resultado?payment=success
MP_FAILURE_URL=https://depa-alquileres.vercel.app/reserva/resultado?payment=failure
MP_PENDING_URL=https://depa-alquileres.vercel.app/reserva/resultado?payment=pending

MP_WEBHOOK_URL=https://seminario-integrador.onrender.com/pagos/webhook
MP_WEBHOOK_SECRET=FIRMA_SECRETA_GENERADA_POR_MERCADO_PAGO

FRONTEND_URLS=https://depa-alquileres.vercel.app
```

Aunque el sistema esté desplegado, el Access Token continuará siendo de prueba para esta entrega.

El frontend conserva temporalmente el número de la última reserva y Mercado Pago devuelve también la referencia externa del pago. Con cualquiera de esos datos, la ruta `/reserva/resultado` carga un comprobante accesible únicamente para el huésped o el anunciante participantes. Allí se muestran el estado, las fechas, el importe, el identificador de pago y los canales de contacto habilitados después de la acreditación.

La opción de WhatsApp exige aceptar un aviso: al salir de la mensajería interna, DEPA no puede revisar la conversación ni intervenir ante acuerdos o inconvenientes ocurridos fuera de la plataforma.

## 9. Configuración en Mercado Pago Developers

### Aplicación

- Producto: Checkout Pro.
- URL del sitio: `https://depa-alquileres.vercel.app`.
- No se utiliza OAuth.
- No se necesita configurar PKCE.
- No se necesitan credenciales productivas.

### Webhook

En `Notificaciones > Webhooks`:

1. Elegir modo de pruebas.
2. Configurar `https://seminario-integrador.onrender.com/pagos/webhook`.
3. Seleccionar el evento `Pagos`.
4. Guardar.
5. Copiar la clave secreta a `MP_WEBHOOK_SECRET` en Render.

## 10. Prueba de la integración

1. Confirmar que Render y Vercel terminaron el despliegue.
2. Abrir `https://depa-alquileres.vercel.app`.
3. Iniciar sesión con un inquilino que no sea dueño de la publicación.
4. Elegir una publicación temporaria con fechas disponibles.
5. Seleccionar ingreso y salida.
6. Presionar `Reservar ahora`.
7. Presionar `Pagar con Mercado Pago`.
8. Usar una cuenta compradora de prueba en una ventana de incógnito.
9. Utilizar una tarjeta de prueba y el nombre de titular correspondiente al resultado deseado.
10. Volver a `Mis reservas`.
11. Verificar el webhook en el panel de Mercado Pago y los logs de Render.
12. Confirmar que la reserva aparece aprobada o rechazada según la prueba.

No se debe usar la misma cuenta de prueba como vendedor y comprador.

## 11. Diagnóstico de errores frecuentes

### `auto_return invalid. back_url.success must be defined`

Mercado Pago no acepta `localhost` como URL de retorno. Las variables de Render deben apuntar al frontend HTTPS de Vercel.

### `Falta configurar MP_ACCESS_TOKEN`

La variable no está cargada en Render o el servicio no fue reiniciado después de guardarla.

### Se abre el checkout pero la reserva no se confirma

Revisar:

- `MP_WEBHOOK_URL`.
- Configuración del evento `Pagos`.
- `MP_WEBHOOK_SECRET`.
- Respuesta HTTP del webhook.
- Logs del backend.
- Que el pago pertenezca a la misma aplicación y credencial.

### Firma inválida

- Verificar que la clave de Render sea la de la aplicación correcta.
- No copiar espacios adicionales.
- Comprobar que no se haya restablecido la firma en el panel.

### Error de CORS

`FRONTEND_URLS` debe contener exactamente el origen de Vercel, sin rutas adicionales.

### Backend lento

El plan gratuito de Render puede suspender el servicio. Antes de una demostración conviene abrir el backend y esperar a que responda.

## 12. Diferencia entre retorno y webhook

| Elemento | Quién lo ejecuta | Para qué sirve | ¿Confirma el pago? |
|---|---|---|---|
| URL de retorno | Navegador del comprador | Volver a la interfaz y mostrar información | No |
| Webhook | Servidores de Mercado Pago | Informar cambios de estado al backend | Inicia la validación |
| Consulta con SDK | Backend de DEPA | Obtener el estado auténtico | Sí, junto con las validaciones internas |

## 13. Limitaciones actuales

### No existen devoluciones iniciadas por DEPA

El sistema no llama todavía a la API de reembolsos. Por seguridad, una reserva aprobada no se cancela automáticamente.

### No existe Split Payments

Todo el flujo corresponde a una sola cuenta. Los anunciantes no conectan su propia cuenta mediante OAuth y la plataforma no cobra comisión automática.

### Confirmación académica del alojamiento

El sistema genera un código privado de ocho caracteres cuando Mercado Pago aprueba la reserva. El inquilino lo consulta desde “Mis reservas” y lo entrega físicamente al anunciante. Al validarlo, la reserva queda pendiente de liquidación administrativa.

Este circuito no constituye un escrow ni realiza transferencias reales. Para la demostración académica, el administrador registra manualmente que el dinero fue pagado al propietario o devuelto al inquilino. También puede revisar reclamos antes de resolver la liquidación.

### Expiración parcial

Las reservas pendientes vencidas se limpian al comenzar otro intento de reserva. Falta una tarea automática y una verificación externa previa a la liberación.

### Concurrencia

Falta encapsular la creación de reserva, bloqueo de fechas y pago en una transacción de base de datos con protección contra solicitudes simultáneas.

### Moneda única

La integración está configurada para ARS. Las publicaciones en otra moneda requieren bloqueo o conversión explícita.

### Firma configurable

Si `MP_WEBHOOK_SECRET` está vacío, el código no ejecuta la validación criptográfica. Para el despliegue debe mantenerse configurado.

## 14. Mejoras futuras recomendadas

1. Pruebas unitarias y de integración del webhook.
2. Procesamiento idempotente de eventos repetidos con auditoría de notificaciones.
3. Tarea programada para reservas vencidas.
4. Transacciones y bloqueo de fechas a nivel de base de datos.
5. Reembolsos reales completos y parciales mediante la API de Mercado Pago.
6. Conciliación automática de transferencias; el panel actual registra decisiones manuales académicas.
7. Comprobantes y detalles del pago para el usuario.
8. OAuth y Split Payments si cada anunciante debe cobrar directamente.
9. Alertas para pagos aprobados sin reserva confirmada.
10. Migraciones de base de datos.

## 15. Referencias oficiales

- [Checkout Pro](https://www.mercadopago.com.ar/developers/es/docs/checkout-pro/landing)
- [Crear una preferencia](https://www.mercadopago.com.ar/developers/es/docs/checkout-pro-preferences/create-payment-preference)
- [Configurar URLs de retorno](https://www.mercadopago.com.ar/developers/es/docs/checkout-pro-preferences/configure-back-urls)
- [Webhooks](https://www.mercadopago.com.ar/developers/es/docs/checkout-bricks/additional-content/your-integrations/notifications/webhooks)
- [Compras de prueba](https://www.mercadopago.com.ar/developers/es/docs/checkout-pro-preferences/integration-test/test-purchases)
- [SDK oficial para Node.js](https://github.com/mercadopago/sdk-nodejs)
