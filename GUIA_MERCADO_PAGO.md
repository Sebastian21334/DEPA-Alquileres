# Cómo completar Mercado Pago en DEPA

La aplicación ya utiliza Checkout Pro: DEPA crea una reserva pendiente, Mercado Pago cobra y el webhook confirma la reserva. No ingreses números de tarjeta dentro de DEPA.

## 1. Crear una aplicación de prueba

1. Ingresá en `https://www.mercadopago.com.ar/developers/panel/app` con la cuenta que recibirá el dinero.
2. Elegí **Crear aplicación**.
3. Indicá que vas a usar **Pagos online** y **Checkout Pro**.
4. Entrá a **Credenciales de prueba**.
5. Copiá solamente el **Access Token de prueba**.

No compartas el Access Token, no lo pegues en Angular y no lo subas a Git.

## 2. Completar `back/.env`

Abrí `back/.env` y agregá al final:

```env
MP_ACCESS_TOKEN=TEST-PEGAR_ACA_EL_ACCESS_TOKEN_DE_PRUEBA
MP_CURRENCY_ID=ARS
MP_SUCCESS_URL=http://localhost:4200/reserva/resultado?payment=success
MP_FAILURE_URL=http://localhost:4200/reserva/resultado?payment=failure
MP_PENDING_URL=http://localhost:4200/reserva/resultado?payment=pending
MP_WEBHOOK_URL=
MP_WEBHOOK_SECRET=
```

Las publicaciones cobradas por esta integración deben tener sus precios expresados en pesos argentinos.

## 3. Probar la redirección local

1. Iniciá el backend desde la carpeta `back` con `npm run start:dev`.
2. Iniciá el frontend desde la carpeta `front` con `npm start`.
3. Iniciá sesión en DEPA con un usuario que no sea el dueño de la publicación.
4. Elegí fechas disponibles, presioná **Reservar ahora** y después **Pagar con Mercado Pago**.
5. Para una prueba completa usá un comprador de prueba y los datos de tarjeta de prueba que muestra Mercado Pago. No uses la misma cuenta vendedora como compradora.

Al regresar de Mercado Pago, DEPA muestra un resumen con el estado de la reserva, los datos de la estadía y la operación. Cuando el pago está aprobado, tanto el huésped como el anunciante pueden iniciar una conversación interna desde ese resumen. También pueden continuar por WhatsApp después de aceptar el aviso de que DEPA no puede revisar ni respaldar acuerdos realizados fuera de la plataforma.

Sin webhook público, la redirección funciona pero DEPA no debe marcar el pago como aprobado. La confirmación real llega por webhook.

## 4. Habilitar el webhook durante el desarrollo

Mercado Pago no puede llamar a `localhost`. Necesitás publicar temporalmente el puerto 3000 mediante un túnel HTTPS, por ejemplo:

```text
https://TU-DOMINIO-TEMPORAL/pagos/webhook
```

Después:

1. Pegá esa URL en `MP_WEBHOOK_URL`.
2. En el panel de Mercado Pago, abrí **Webhooks** y configurá la misma URL para el evento **Pagos**.
3. Copiá la **firma secreta** generada por el panel a `MP_WEBHOOK_SECRET`.
4. Reiniciá el backend después de modificar `.env`.

## 5. Pasar a producción

Cuando las pruebas estén completas:

1. Activá las credenciales de producción en el panel de Mercado Pago.
2. Reemplazá `MP_ACCESS_TOKEN` por el token de producción.
3. Cambiá las tres URLs de retorno por el dominio HTTPS real del frontend.
4. Cambiá `MP_WEBHOOK_URL` por la URL HTTPS real del backend.
5. Configurá nuevamente el webhook de producción y actualizá `MP_WEBHOOK_SECRET`.
6. Reiniciá o volvé a desplegar el backend.

## Qué no está incluido todavía

- Devoluciones automáticas al cancelar una reserva ya pagada.
- Pago dividido entre la plataforma y cada anunciante mediante OAuth.
- Liberación automática por reloj de reservas abandonadas. Actualmente se liberan al intentar una nueva reserva después del vencimiento.

Antes de cobrar dinero real deben definirse la política de cancelación, los reembolsos y quién emite los comprobantes.
