# Cotización del dólar y cobros con backend intermitente

Las publicaciones con moneda ARS se cobran en ARS. Las publicaciones USD se
convierten al dólar blue **venta** y se cobran en ARS después de que el inquilino
vea y acepte un presupuesto. No se cambia solamente la etiqueta de la moneda.
Monedas desconocidas o distintas de ARS/USD se rechazan; no se infieren por ID.
`MP_CURRENCY_ID` debe ser `ARS` para esta integración.

## Cuando el backend duerme

No se utiliza una tarea externa que lo mantenga despierto. Al iniciar se revisa
el estado persistido. Mientras está activo, un temporizador liviano revisa una
vez por minuto si corresponde consultar. Cada presupuesto USD ejecuta la misma
verificación, por lo que no depende de que hayan corrido los temporizadores.
No se reconstruyen cotizaciones de horas en las que el sistema estuvo apagado.

La última consulta se guarda en PostgreSQL: reiniciar no renueva su vigencia.
Se consulta DolarApi como máximo una vez cada tres horas durante funcionamiento
normal, siguiendo su recomendación. Ante fallos, se vuelve a intentar después
de cinco minutos. Una cotización que supera el límite de antigüedad de la fuente
obliga a verificar nuevamente aunque todavía no hayan transcurrido tres horas.
El request HTTP tiene un límite de cinco segundos.

Las peticiones concurrentes se agrupan en el proceso y se coordinan entre réplicas
mediante un bloqueo transaccional de PostgreSQL. La espera por ese bloqueo tiene
un límite de ocho segundos. Cada actualización guarda cotización y consulta en
una transacción. No se bloquean reservas ni calendario mientras se consulta la API.

Si la última verificación falla o falta una cotización válida, las conversiones
USD se rechazan con un mensaje recuperable. No se utiliza silenciosamente el
precio viejo. Las reservas ARS no dependen del servicio del dólar.

## Vigencia y datos históricos

`cotizacion_dolar` guarda compra, venta, proveedor, fecha de publicación de la
fuente y fecha en que DEPA la consultó. Cada consulta válida agrega un registro
inmutable. `consulta_cotizacion` conserva por separado intentos y errores.

La antigüedad máxima del dato de la fuente se configura mediante
`DOLAR_MAX_ANTIGUEDAD_FUENTE_HORAS` (entre 3 y 168). El valor inicial es **96 horas**
para contemplar cierres de mercado durante fines de semana y feriados. Consultar
ahora no transforma una publicación antigua de la fuente en una nueva. Ambas
fechas y el límite vigente se muestran en administración y la fecha de la fuente
también se muestra al inquilino. Este límite es una política de aceptación del
negocio; no garantiza actualidad de mercado y puede reducirse según su operación.

La fuente fija es `https://dolarapi.com/v1/dolares/blue` (DolarApi / DolarHoy).
El uso se atribuye en las pantallas. DolarApi es informativo y no garantiza
vigencia ni disponibilidad: https://dolarapi.com/docs/legal y
https://dolarapi.com/docs/uso . No se sustituye automáticamente por otro dólar.

## Presupuesto y pago

`POST /pagos/presupuesto` obtiene los datos de la publicación en el servidor,
valida fechas y disponibilidad, y calcula el precio con aritmética decimal.
Se redondea a centavos una sola vez sobre el total convertido. El presupuesto
vence a los quince minutos y se firma con una clave derivada independiente de
los tokens de autenticación. Queda ligado al usuario, publicación, fechas,
tarifa, monedas, importes y registro de cotización.

`POST /pagos/checkout` recibe `presupuesto_token`. El servidor valida firma y
vencimiento y vuelve a comprobar precio, moneda y disponibilidad bajo el bloqueo
del calendario. La reserva guarda precio unitario original, moneda e importe
originales, importe y moneda del cobro, referencia a la cotización, emisión,
vencimiento y fecha de aceptación. La preferencia vence con el presupuesto.
Para clientes anteriores se admite checkout sin token únicamente en ARS.

Una respuesta tardía del pago se valida contra su importe ARS histórico, nunca
contra la cotización del día. Las verificaciones existentes de estado de reserva
y pertenencia del calendario siguen aplicándose. Reprogramar mantiene duración,
importes y conversión; los avisos y comprobantes incluyen la referencia original.
La liquidación se calcula sobre los pesos cobrados y sus comisiones: no promete
entregar al anunciante una cantidad futura de USD. Las devoluciones no deben
recalcularse al dólar actual.

## Administración y despliegue

El panel muestra cotización, vigencia, ambas fechas, filtros por fecha de consulta
(horario de Argentina), historial paginado y últimos intentos. Solo el rol
Administrador puede acceder o solicitar una verificación. Ese botón respeta los
intervalos de consulta y reintento. Cada liquidación muestra el registro y la
conversión aceptados por la reserva.

Antes de iniciar esta versión, con el backend detenido, desde `back`:

```sh
node scripts/cotizaciones-cobros.cjs
npm run db:cotizaciones-cobros
```

El primer comando consulta el estado; el segundo prepara tablas y columnas.
La migración es repetible y no modifica pagos existentes ni inventa cotizaciones
para reservas antiguas. `synchronize` permanece desactivado. Las migraciones
anteriores ya aplicadas no se editan. Probar primero sobre una copia de la base.
