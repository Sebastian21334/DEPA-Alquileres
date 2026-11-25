# Casos de demostración de DEPA

Guía para mostrar DEPA en el frontend a alguien que no conoce el sistema o lo conoce poco. Cada caso dice qué demuestra, qué hay que tener listo, los pasos con las pantallas y botones reales y el resultado esperado.

Las reglas se verificaron contra el código de `main` (commit `5c7512d`, 25/11/2026): back en `back/src` y front en `front/src/app`.

## Convenciones

- **H** es el día de la demostración. **H+3** es tres días después y **H−6**, seis días antes. Todo se cuenta en días calendario de Argentina.
- Una estadía incluye el día de ingreso y el de salida: de H+4 a H+5 son **2 días**.
- Montos de ejemplo: las publicaciones en pesos cuestan **ARS 50.000 por día**, así que una reserva de 2 días cuesta **ARS 100.000**. La comisión de DEPA es del **10 %**: se cambia en Panel › «Comisión DEPA» y cada reserva guarda el porcentaje vigente al crearse.
- Usuarios: **ADM**, **ANU**, **INQ**, **INQ2** y **NUEVO** (ver 0.1). Publicaciones: **P1** a **P4** (ver 0.2). Reservas: **RP-n** (preparadas antes) y **R-x** (del día H) (ver 0.5).
- «Menú» es el menú lateral. «⋯» es el botón de más acciones de cada tarjeta de reserva.

## Índice de casos

| Sección | ID | Caso |
|---|---|---|
| 1. Cancelaciones | [CD-1](#cd-1--el-inquilino-cancela-con-7-días-o-más-devolución-del-100-) | El inquilino cancela con 7 días o más: devolución del 100 % |
| | [CD-2](#cd-2--el-inquilino-cancela-entre-2-y-6-días-antes-devolución-del-50-) | El inquilino cancela entre 2 y 6 días antes: devolución del 50 % |
| | [CD-3](#cd-3--el-inquilino-cancela-el-día-anterior-devolución-del-0-) | El inquilino cancela el día anterior: devolución del 0 % |
| | [CD-4](#cd-4--el-anunciante-cancela-devolución-del-100--al-inquilino) | El anunciante cancela: 100 % al inquilino |
| | [CD-5](#cd-5--cancelar-una-reserva-pendiente-de-pago) | Cancelar una reserva pendiente de pago |
| | [CD-6](#cd-6--desde-el-día-de-ingreso-no-se-puede-cancelar) | Desde el día de ingreso no se puede cancelar |
| | [CD-7](#cd-7--límite-de-tres-reservas-canceladas-por-día) | Límite de tres reservas canceladas por día |
| | [CD-8](#cd-8--consultar-el-reembolso-faltante) | Consultar el reembolso faltante |
| 2. Reservas y pagos | [CD-9](#cd-9--reserva-de-2-días-con-pago-aprobado) | Reserva de 2 días con pago aprobado |
| | [CD-10](#cd-10--pago-rechazado-y-reintento) | Pago rechazado y reintento |
| | [CD-11](#cd-11--reserva-pendiente-que-vence-a-los-15-minutos) | Reserva pendiente que vence a los 15 minutos |
| | [CD-12](#cd-12--reserva-de-una-publicación-en-dólares) | Reserva de una publicación en dólares |
| | [CD-13](#cd-13--reprogramar-las-fechas) | Reprogramar las fechas |
| | [CD-14](#cd-14--restricciones-al-reservar) | Restricciones al reservar |
| 3. Código de ingreso | [CD-15](#cd-15--el-inquilino-consulta-su-código) | El inquilino consulta su código |
| | [CD-16](#cd-16--el-anunciante-valida-el-código) | El anunciante valida el código |
| | [CD-17](#cd-17--código-incorrecto-y-bloqueo-a-los-5-intentos) | Código incorrecto y bloqueo a los 5 intentos |
| | [CD-18](#cd-18--pedido-de-reinicio-administración-habilita-5-intentos-más) | Pedido de reinicio: 5 intentos más |
| | [CD-19](#cd-19--pedido-de-reinicio-administración-confirma-el-ingreso-sin-código) | Pedido de reinicio: ingreso confirmado sin código |
| | [CD-20](#cd-20--pedido-de-reinicio-resuelto-con-devolución-al-inquilino) | Pedido de reinicio: devolución al inquilino |
| | [CD-21](#cd-21--ingreso-no-verificado-que-vence-a-favor-del-anunciante) | Ingreso no verificado que vence a favor del anunciante |
| 4. Reclamos | [CD-22](#cd-22--el-inquilino-reporta-un-problema-durante-la-estadía) | El inquilino reporta un problema durante la estadía |
| | [CD-23](#cd-23--conversación-del-reclamo) | Conversación del reclamo |
| | [CD-24](#cd-24--reclamo-resuelto-sin-devolución) | Reclamo resuelto sin devolución |
| | [CD-25](#cd-25--reclamo-resuelto-con-devolución-parcial) | Reclamo resuelto con devolución parcial |
| | [CD-26](#cd-26--reclamo-después-de-la-estadía-con-devolución-total) | Reclamo después de la estadía con devolución total |
| | [CD-27](#cd-27--plazos-y-límites-del-reclamo) | Plazos y límites del reclamo |
| 5. Reembolsos y liquidaciones | [CD-28](#cd-28--retención-y-lapso-de-espera) | Retención y lapso de espera |
| | [CD-29](#cd-29--registrar-el-pago-al-anunciante) | Registrar el pago al anunciante |
| | [CD-30](#cd-30--liquidación-del-resto-tras-una-cancelación-al-50-) | Liquidación del resto tras una cancelación al 50 % |
| | [CD-31](#cd-31--liquidación-tras-una-cancelación-al-0-) | Liquidación tras una cancelación al 0 % |
| | [CD-32](#cd-32--devolver-al-inquilino-desde-liquidaciones) | Devolver al inquilino desde Liquidaciones |
| | [CD-33](#cd-33--reembolso-por-transferencia-con-chat-y-comprobante) | Reembolso por transferencia con chat y comprobante |
| | [CD-34](#cd-34--cambiar-la-comisión-de-depa) | Cambiar la comisión de DEPA |
| 6. Publicaciones | [CD-35](#cd-35--alta-de-una-publicación-temporal) | Alta de una publicación temporal |
| | [CD-36](#cd-36--validaciones-del-formulario) | Validaciones del formulario |
| | [CD-37](#cd-37--activar-desactivar-y-la-última-foto) | Activar, desactivar y la última foto |
| | [CD-38](#cd-38--papelera-eliminar-y-restaurar) | Papelera: eliminar y restaurar |
| | [CD-39](#cd-39--baja-administrativa-y-reactivación) | Baja administrativa y reactivación |
| | [CD-40](#cd-40--pausar-las-actividades-del-anunciante) | Pausar las actividades del anunciante |
| | [CD-41](#cd-41--publicación-de-largo-plazo) | Publicación de largo plazo |
| 7. Verificación de anunciante | [CD-42](#cd-42--solicitud-de-un-particular-con-prueba-de-vida) | Solicitud de un particular con prueba de vida |
| | [CD-43](#cd-43--aprobación-de-identidad-y-cbu) | Aprobación de identidad y CBU |
| | [CD-44](#cd-44--rechazo-parcial-y-reenvío) | Rechazo parcial y reenvío |
| | [CD-45](#cd-45--solicitud-de-una-inmobiliaria) | Solicitud de una inmobiliaria |
| 8. Bloqueos y apelaciones | [CD-46](#cd-46--bloqueo-total-y-apelación) | Bloqueo total y apelación |
| | [CD-47](#cd-47--bloqueo-con-acceso-limitado) | Bloqueo con acceso limitado |
| | [CD-48](#cd-48--respuesta-a-la-apelación-y-desbloqueo) | Respuesta a la apelación y desbloqueo |
| 9. Cuenta | [CD-49](#cd-49--registro-y-verificación-del-correo) | Registro y verificación del correo |
| | [CD-50](#cd-50--baja-de-la-cuenta) | Baja de la cuenta |
| | [CD-51](#cd-51--recuperar-una-cuenta-dada-de-baja) | Recuperar una cuenta dada de baja |
| 10. Explorar y comunicarse | [CD-52](#cd-52--buscar-con-filtros-y-orden) | Buscar con filtros y orden |
| | [CD-53](#cd-53--mapa) | Mapa |
| | [CD-54](#cd-54--favoritos) | Favoritos |
| | [CD-55](#cd-55--chat-por-publicación-y-whatsapp) | Chat por publicación y WhatsApp |
| | [CD-56](#cd-56--asistente-depa) | Asistente depa |
| 11. Dashboard y panel | [CD-57](#cd-57--dashboard-del-anunciante) | Dashboard del anunciante |
| | [CD-58](#cd-58--panel-administrativo-resumen-y-pendientes) | Panel administrativo: resumen y pendientes |
| 12. Recorridos | [R-1](#r-1--de-la-publicación-a-la-liquidación) | De la publicación a la liquidación |
| | [R-2](#r-2--estadía-con-problema-código-reclamo-y-devolución-parcial) | Estadía con problema: código, reclamo y devolución parcial |
| | [R-3](#r-3--código-bloqueado-de-punta-a-punta) | Código bloqueado de punta a punta |

---

## 0. Preparación

### 0.1 Usuarios

| Alias | Cuenta | Cómo se obtiene | Para qué |
|---|---|---|---|
| ADM | Administrador | En una base vacía, el primer usuario que se registra queda como Administrador. | Panel administrativo |
| ANU | Anunciante particular verificado, con CBU aprobado | Registrarse, hacer CD-42 y que ADM apruebe identidad y CBU (CD-43) | Dueño de P1 a P4 |
| INQ | Inquilino | Registrarse y verificar el correo | Reserva, cancela y reclama |
| INQ2 | Inquilino | Ídem | Límite de cancelaciones, chat y bloqueo |
| NUEVO | Cuenta recién creada, con correo accesible y cámara | Se crea durante la demo | Registro y alta de anunciante |

- En la base solo existen los roles **Administrador** e **Inquilino**. «Anunciante» es un inquilino con la verificación aprobada, así que ANU también puede reservar publicaciones ajenas.
- Cada cuenta necesita un correo real: el enlace de verificación vence a las 24 h y los avisos llegan por mail.
- Contraseña: 12 caracteres o más, con al menos una letra, un número y un símbolo, sin espacios.
- Hacé los bloqueos (sección 8) al final y con una cuenta que no se use en otros casos: bloquear a ANU saca sus publicaciones del catálogo.

### 0.2 Publicaciones de ANU

| Alias | Tipo de alquiler | Precio | Uso |
|---|---|---|---|
| P1 | Temporal | ARS 50.000 por día | Cancelaciones, código bloqueado y reprogramación |
| P2 | Temporal | ARS 50.000 por día | Estadías de hoy, reclamos y liquidaciones |
| P3 | Largo plazo | En pesos | Publicación sin reserva por fecha |
| P4 | Temporal | USD 40 por día | Conversión a pesos |

Todas con al menos una foto. En P1, P2 y P4, cargá con anticipación los días disponibles desde H−6 hasta H+35 (paso «06 Días disponibles» del alta o «Calendario de disponibilidad» al editar).

### 0.3 Mercado Pago de prueba

- El back usa la credencial de un **vendedor de prueba** (`MP_ACCESS_TOKEN`) y cobra en pesos con Checkout Pro.
- Para pagar, en Mercado Pago iniciá sesión con una **cuenta de prueba compradora** (Mercado Pago Developers › Cuentas de prueba). No uses cuentas reales.
- Con las tarjetas de prueba, el **nombre del titular** decide el resultado: `APRO` aprueba y `OTHE` rechaza. Documento: DNI `12345678`. Los números vigentes están en la [página de tarjetas de prueba de MP](https://www.mercadopago.com.ar/developers/es/docs/checkout-pro-orders/integration-test/test-purchase-with-card). Por ejemplo, Mastercard `5031 7557 3453 0604`, CVV `123`, vencimiento `11/30`.
- **El medio de pago decide cómo se devuelve una cancelación automática:**
  - con **dinero en cuenta**, DEPA pide la devolución a la API de Mercado Pago (en el sandbox);
  - con **tarjeta** de crédito, débito o prepaga, la devolución es **simulada** (`MP_SIMULAR_REEMBOLSO_TARJETA=true`, activo en este entorno). En un entorno de práctica no se puede hacer la devolución automática a una tarjeta, por eso se simula; en un entorno real la haría Mercado Pago. No se mueve dinero y la pantalla dice «Devolución simulada». Si la simulación se apaga, pasa a transferencia manual (CD-33);
  - con otro medio, pasa a transferencia manual.
- Las devoluciones por reclamo y las que pide Administración desde Liquidaciones **no se simulan**: se piden a Mercado Pago. Si Mercado Pago no las confirma, quedan en Panel › «Reembolsos», donde Administración puede volver a solicitarlas, conciliarlas o pasarlas a transferencia (CD-33).
- La conciliación de reembolsos corre al iniciar el back y cada minuto: una devolución automática tarda hasta un minuto en aplicarse.
- Con el pago aprobado, Mercado Pago vuelve solo a DEPA, a «Resumen de la reserva», que confirma el pago con Mercado Pago aunque el aviso automático (webhook) no llegue, por ejemplo con el back local. Si el pago se rechaza, hay que volver a DEPA desde Mercado Pago.

### 0.4 Cómo dejar una reserva en cada estado

| Estado en pantalla | Cómo se obtiene | Cuándo |
|---|---|---|
| Pendiente de pago | Reservar y salir de Mercado Pago sin pagar, o pagar con `OTHE` | Dura 15 minutos desde que se crea |
| Confirmada | Pagar con `APRO` una reserva con ingreso futuro | En el momento |
| Pendiente de ingreso | Pagar una reserva con ingreso H | En el momento |
| En curso | Pendiente de ingreso y el anunciante valida el código | En el momento |
| Finalizada | En curso y pasa el día de salida | Desde el día siguiente a la salida |
| Ingreso no verificado | Termina la estadía sin código validado | Desde el día siguiente a la salida |
| Devolución pendiente | Entre la cancelación y la aplicación del reembolso | Hasta un minuto |
| Cancelada | CD-3, CD-5 o CD-11 | En el momento o a los 15 minutos |
| Reembolsada, Reembolsada parcialmente o Devolución simulada | CD-1, CD-2 o CD-26 | Hasta un minuto después |
| Liquidación retenida | Pago aprobado sin código validado | En el momento |
| Liquidación pendiente de pago al propietario | Código validado, cancelación al 0 % o vencimiento sin código (CD-21) | En el momento o a la salida + 5 |
| Pago al anunciante habilitado | Salida + 5 días ≤ hoy | Preparar con 6 días de anticipación |
| Liquidación en revisión | Reclamo abierto o código bloqueado | En el momento |

DEPA no permite reservar fechas pasadas, así que los estados que dependen del calendario se preparan con anticipación. No se recomienda cambiar fechas en la base: Neon es compartida.

### 0.5 Reservas necesarias

**Preparadas antes del día H** (todas de INQ, pagadas con `APRO`):

| Reserva | Publicación | Fechas | Qué hacer ese día | Casos |
|---|---|---|---|---|
| RP-1 | P2 | H−6 (1 día) | Crear y pagar el H−6. ANU valida el código ese mismo día. | CD-29, R-1 |
| RP-2 | P1 | H−6 (1 día) | Crear y pagar el H−6. **No** validar el código. | CD-21, CD-32 |
| RP-3 | P2 | H−2 a H−1 | Crear y pagar el H−2. ANU valida el código ese día. | CD-26, CD-27 |

**Del día H** (se crean en la demo o un rato antes):

| Reserva | Usuario | Publicación | Fechas | Casos |
|---|---|---|---|---|
| R-B | INQ | P2 | H a H+1 | CD-6, CD-15, CD-16, CD-28, CD-22 a CD-25 |
| R-A | INQ | P1 | H (1 día) | CD-17 a CD-20 |
| R-1 | INQ | P1 | H+10 a H+11 | CD-9, CD-1 |
| R-2 | INQ | P1 | H+4 a H+5 | CD-2, CD-30 |
| R-3 | INQ | P1 | H+1 a H+2 | CD-3, CD-31 |
| R-4 | INQ | P1 | H+7 a H+8 | CD-4 |
| R-13 | INQ | P1 | H+14 a H+15 | CD-13 |
| R-7 (×3) | INQ2 | P1 | H+20 a H+21 | CD-7 |
| R-5 | INQ | P1 | H+25 a H+26 | CD-5 |
| R-10 | INQ | P1 | H+27 a H+28 | CD-10 |
| R-11 | INQ | P1 | H+32 a H+33 | CD-11 |
| R-12 | INQ | P4 | H+30 a H+31 | CD-12 |

Las cancelaciones de la sección 1 se pueden hacer el mismo día H, porque dependen de cuántos días faltan para el ingreso.

**Receta para reservar y pagar** (la usan casi todos los casos; el detalle está en CD-9): ficha de la publicación › elegir primer y último día en el calendario › «Reservar N días» › «Revisá tu reserva» › «Pagar con Mercado Pago» › pagar con `APRO` › DEPA muestra «Reserva confirmada».

---

## 1. Cancelaciones

**Reglas del código** (`cancelaciones.service.ts`, `reservas.service.ts`):

- Una reserva **pendiente de pago** se cancela con «Cancelar reserva»: es inmediata, no hay devolución y libera las fechas.
- Una reserva **pagada** se cancela con «Solicitar cancelación». La aprobación es automática: nadie la revisa. Se piden un motivo de 10 a 500 caracteres y la aceptación de los términos. El servidor recalcula el importe; si no coincide con el que se mostró, responde «El importe de devolución cambió. Consultá las condiciones y aceptalas nuevamente.».
- Política vigente (si cambia, cada reserva usa la versión vigente a la fecha de su pago). Los días se cuentan desde el día de la cancelación hasta el día de ingreso:

| Quién cancela | Días antes del ingreso | Devolución |
|---|---|---|
| Inquilino | 7 o más | 100 % |
| Inquilino | 2 a 6 | 50 % |
| Inquilino | 1 (el día anterior) | 0 %, con advertencia |
| Anunciante | 1 o más | 100 % al inquilino |
| Cualquiera | 0 (el día de ingreso) o después | No se puede cancelar |
| Cualquiera | Con el código ya validado | No se puede cancelar |

- El porcentaje se aplica sobre lo que efectivamente se cobró y se redondea al centavo una sola vez.
- Con devolución, la reserva se cancela y las fechas se liberan **cuando el reembolso se aprueba**. Mientras tanto, la reserva muestra «Devolución pendiente» y las fechas siguen ocupadas.
- Con 0 %, la reserva se cancela en el momento, se liberan las fechas y el importe queda para el anunciante: se le paga desde la salida + 5, con comisión.
- Correos a inquilino y anunciante: «Cancelación aceptada» (con devolución) o «Reserva cancelada» (sin devolución). Al aplicarse la devolución llega «Reserva cancelada y devolución registrada» o «Cancelación con devolución simulada».

Bordes útiles para mostrar: ingreso en H+7 → 100 %; en H+6 → 50 %; en H+2 → 50 %; en H+1 → 0 %; en H → sin opción.

### CD-1 · El inquilino cancela con 7 días o más: devolución del 100 %

- **Objetivo:** el inquilino se arrepiente con tiempo y recupera todo lo pagado, sin intervención de Administración.
- **Precondiciones:** R-1 (P1, de H+10 a H+11, ARS 100.000) pagada y «Confirmada».
- **Pasos (INQ):**
  1. Menú › «Mis reservas» › pestaña «Reservas realizadas».
  2. En la tarjeta de R-1, «⋯» › «Solicitar cancelación».
  3. Mostrar el modal «Cancelar reserva»: «Importe de devolución: ARS 100.000,00 (100 %)» y «Calculada con la fecha de hoy: dd/mm/aaaa. 10 días antes del ingreso.».
  4. Desplegar «Términos y condiciones de cancelación».
  5. Escribir el motivo, tildar «Acepto los términos y el importe de devolución indicado» y pulsar «Confirmar cancelación».
- **Resultado esperado:**
  - Al confirmar: «La cancelación fue aceptada. La devolución está en gestión.». La tarjeta muestra «Devolución pendiente».
  - En hasta un minuto, la reserva queda cancelada con la etiqueta «Reembolsada» (dinero en cuenta) o «Devolución simulada» (tarjeta: «Devolución de prueba. No se transfirió dinero.»). H+10 y H+11 vuelven a estar libres en P1.
  - «Ver detalle» › «Datos del pago»: con dinero en cuenta, «Total reembolsado» ARS 100.000 y «Total sin devolver» ARS 0. Con la devolución simulada, «Devolución simulada» ARS 100.000 y «Total sin devolver» ARS 100.000, porque no se movió dinero.
- **Qué ve cada rol:**
  - ANU: la reserva en «Reservas recibidas» con «Devolución total al inquilino registrada». No hay nada para liquidarle.
  - ADM: Panel › Reembolsos: reembolso de tipo TOTAL por cancelación, «Aprobado» o «Simulado».

### CD-2 · El inquilino cancela entre 2 y 6 días antes: devolución del 50 %

- **Objetivo:** mostrar la devolución parcial por política y que el resto queda para el anunciante.
- **Precondiciones:** R-2 (P1, de H+4 a H+5, ARS 100.000) pagada.
- **Pasos (INQ):** igual que CD-1, sobre R-2.
- **Resultado esperado:**
  - El modal muestra «ARS 50.000,00 (50 %)» y «4 días antes del ingreso.».
  - En hasta un minuto: reserva cancelada, fechas libres, etiqueta «Reembolsada parcialmente» («Devolución parcial al inquilino: ARS 50.000,00 de ARS 100.000,00.») o «Devolución simulada».
  - Liquidación «Devuelto parcialmente al inquilino». Los ARS 50.000 restantes son del anunciante y se le pagan desde la salida + 5 (H+10), **sin comisión** (CD-30).
- **Qué ve cada rol:** ANU ve la devolución parcial en «Reservas recibidas». ADM ve la reserva en «Liquidaciones pendientes» con el lapso de espera.

### CD-3 · El inquilino cancela el día anterior: devolución del 0 %

- **Objetivo:** mostrar la advertencia y la cancelación sin devolución.
- **Precondiciones:** R-3 (P1, de H+1 a H+2, ARS 100.000) pagada.
- **Pasos (INQ):**
  1. «Mis reservas» › R-3 › «⋯» › «Solicitar cancelación».
  2. Mostrar el importe en ARS 0,00 (0 %), «1 día antes del ingreso.» y la advertencia «Faltan menos de 2 días para el ingreso. Si cancelás, no recibirás devolución del importe pagado (0 %).».
  3. Escribir el motivo, tildar «Acepto los términos y entiendo que no recibiré una devolución» y «Confirmar cancelación».
- **Resultado esperado:**
  - «La reserva quedó cancelada.»: etiqueta «Cancelada», fechas libres y ningún reembolso.
  - Liquidación «Pendiente de pago al propietario», con la observación «Cancelación sin devolución: el importe corresponde al anunciante». Se paga desde H+7 (CD-31).
  - Correo «Reserva cancelada» a las dos partes.

### CD-4 · El anunciante cancela: devolución del 100 % al inquilino

- **Objetivo:** el anunciante no puede cumplir y el inquilino recupera todo, sin importar cuántos días falten (mientras no sea el día de ingreso).
- **Precondiciones:** R-4 (P1, de H+7 a H+8) pagada.
- **Pasos (ANU):**
  1. «Mis reservas» › pestaña «Reservas recibidas» › R-4 › «⋯» › «Solicitar cancelación».
  2. Mostrar «Importe de devolución al inquilino: ARS 100.000,00 (100 %)» y el término «El anunciante puede solicitar la cancelación hasta el día anterior al ingreso, inclusive, con devolución del 100 % al inquilino.».
  3. Motivo, aceptar y «Confirmar cancelación».
- **Resultado esperado:** igual que CD-1. Esta cancelación no cuenta para el límite del inquilino (CD-7).

### CD-5 · Cancelar una reserva pendiente de pago

- **Objetivo:** una reserva sin pagar se cancela en el momento, sin devolución.
- **Precondiciones:** R-5: INQ reserva P1 de H+25 a H+26, pulsa «Pagar con Mercado Pago» y vuelve sin pagar.
- **Pasos (INQ):** «Mis reservas» › R-5 («Pendiente de pago») › «⋯» › «Cancelar reserva».
- **Resultado esperado:** «Cancelada» al instante y fechas libres. ANU recibe el correo «Reserva cancelada» («La reserva pendiente de pago fue cancelada.»). El anunciante no ve las reservas sin pagar en «Reservas recibidas».

### CD-6 · Desde el día de ingreso no se puede cancelar

- **Objetivo:** mostrar que, desde que empieza la estadía, el camino es el reclamo.
- **Precondiciones:** R-B (P2, ingreso H) pagada.
- **Pasos:** INQ abre «⋯» de R-B en «Mis reservas»; ANU hace lo mismo en «Reservas recibidas».
- **Resultado esperado:** no aparece «Solicitar cancelación». Al inquilino sí le aparece «Reportar un problema». Si se forzara por la API, el servidor responde «Desde la fecha de ingreso no se puede solicitar la cancelación. Para una devolución, abrí un reclamo.».

### CD-7 · Límite de tres reservas canceladas por día

- **Objetivo:** evitar que un inquilino bloquee fechas reservando y cancelando una y otra vez.
- **Regla:** un inquilino no puede reservar un día de una publicación si ya lo reservó, lo pagó y **lo canceló él mismo** tres veces. Se cuenta día por día. No cuentan las cancelaciones del anunciante, las del sistema ni las reprogramaciones, y no afecta a otros inquilinos.
- **Precondiciones:** INQ2 y P1 libres de H+20 a H+21. Hace falta pagar tres veces en el sandbox (unos 10 minutos).
- **Pasos (INQ2):**
  1. Tres veces: reservar P1 de H+20 a H+21, pagar con `APRO` y cancelar al 100 % (CD-1). Esperar entre una vez y otra a que la reserva quede «Reembolsada» o «Devolución simulada»: hasta entonces las fechas siguen ocupadas.
  2. Cuarta vez: elegir H+20 a H+21 y pulsar «Reservar 2 días».
- **Resultado esperado:** debajo del botón aparece «Ya reservaste y cancelaste el dd/mm/aaaa tres veces en esta publicación. Elegí otras fechas.». También falla de H+21 a H+22 (el H+21 ya suma tres). De H+22 a H+23 funciona, e INQ puede reservar de H+20 a H+21.

### CD-8 · Consultar el reembolso faltante

- **Objetivo:** el inquilino controla cuánto le correspondía, cuánto recibió y cuánto sigue en gestión.
- **Precondiciones:** reservas canceladas de CD-1, CD-2, CD-3 o CD-5.
- **Pasos (INQ):** «Mis reservas» › tarjeta cancelada › «Reclamar reembolso faltante».
- **Resultado esperado:**
  - Modal con «Correspondía devolver (50 %)», «Ya devuelto», «En gestión», «Falta recibir» y «Disponible para reclamar».
  - En el flujo normal: «No falta dinero según la política de cancelación. La parte retenida no constituye un faltante.». Si la devolución todavía no se aplicó: «La diferencia ya está en gestión…». En R-5 (pendiente cancelada): «No hay una cancelación aprobada con devolución para esta reserva.».
  - Si hubiera un faltante mayor a cero, aparece un formulario de 20 a 1000 caracteres y «Enviar reclamo por el faltante». ADM lo resuelve con «Completar faltante», una devolución parcial o «Sin devolución». En la demostración no se arma un faltante: el caso muestra solo la consulta.

---

## 2. Reservas y pagos

**Reglas del código:**

- Solo las publicaciones de modalidad **Temporal** admiten reservas por fecha. Las fechas van desde hoy en adelante y se cobran todos los días del período.
- No se puede reservar la publicación propia, una inactiva o eliminada, ni la de un anunciante bloqueado o con actividades pausadas. Una cuenta bloqueada no puede iniciar reservas.
- El presupuesto vence a los **15 minutos**. Al pulsar «Pagar con Mercado Pago» se crea la reserva pendiente, que bloquea las fechas por otros **15 minutos**. Si vence sin pago aprobado, el sistema la cancela y libera las fechas (lo revisa cada minuto).
- Con el pago aprobado, la reserva queda «Confirmada», se genera el código de ingreso y la liquidación queda retenida. Se guarda el porcentaje de comisión vigente en ese momento.
- Correos: al inquilino «Reserva #N confirmada — título» y al anunciante «Nueva reserva pagada #N — título».

### CD-9 · Reserva de 2 días con pago aprobado

- **Objetivo:** recorrido básico de reserva y pago.
- **Precondiciones:** INQ con sesión iniciada. P1 libre de H+10 a H+11.
- **Pasos (INQ):**
  1. Menú › «Explorar publicaciones» › abrir P1.
  2. En «Elegí las fechas de tu alquiler», tocar H+10 y H+11. El resumen muestra «Primer día», «Último día», «2 días» y el total de ARS 100.000.
  3. «Reservar 2 días» › modal «Revisá tu reserva»: precio por día, subtotal, total en pesos y «Válido hasta …» (15 minutos).
  4. «Pagar con Mercado Pago» › en Mercado Pago, cuenta compradora de prueba y tarjeta con titular `APRO`.
- **Resultado esperado:**
  - Vuelve a «Resumen de la reserva»: «Reserva #N», «Reserva confirmada» con el tilde animado, «Datos de la estadía» (2 días) y «Datos del pago» (total pagado, medio, operación y fecha).
  - Bloque «Contactá a …» con el correo y el teléfono del anunciante, «Mensaje por DEPA» y, si cargó un número, «Continuar por WhatsApp».
  - En «Mis reservas»: «Confirmada» y «Ver código de ingreso». Correos de confirmación a las dos partes.
- **Qué ve ANU:** la reserva en «Reservas recibidas», con la liquidación retenida (candado) y «Contacto por el chat de DEPA». El anunciante no ve el correo ni el teléfono del inquilino.

### CD-10 · Pago rechazado y reintento

- **Objetivo:** un pago rechazado no pierde la reserva mientras dure el plazo.
- **Pasos (INQ):**
  1. Reservar P1 de H+27 a H+28 y pagar con titular `OTHE`.
  2. Volver a DEPA desde Mercado Pago.
  3. En «Resumen de la reserva», pulsar «Volver a Mercado Pago» y pagar con `APRO`.
- **Resultado esperado:** tras el rechazo, «Pendiente de pago» y «El intento de pago no se completó. Podés volver a Mercado Pago mientras las fechas sigan reservadas.». INQ recibe el correo «Pago no aprobado». Después del reintento, «Reserva confirmada». El reintento solo se ofrece dentro de los 15 minutos de la reserva.

### CD-11 · Reserva pendiente que vence a los 15 minutos

- **Objetivo:** las fechas no quedan bloqueadas para siempre si nadie paga.
- **Pasos:**
  1. INQ reserva P1 de H+32 a H+33, abre Mercado Pago y no paga.
  2. INQ2 abre P1 y comprueba que esas fechas no se pueden elegir.
  3. Esperar 15 minutos (más hasta un minuto de la revisión periódica).
- **Resultado esperado:** la reserva pasa a «Cancelada» y las fechas vuelven a estar libres para INQ2. No se envía correo.

### CD-12 · Reserva de una publicación en dólares

- **Objetivo:** una publicación en USD se cobra en pesos con la cotización aceptada.
- **Precondiciones:** P4 (USD 40 por día). Cotización válida del dólar (ADM › Cotizaciones).
- **Pasos:**
  1. ADM: Panel › «Cotizaciones» › «Verificar cotización»: venta, compra, fuente y fecha.
  2. INQ: P4 › H+30 a H+31 › «Reservar 2 días».
  3. En el modal: «Precio por día» USD 40, «Subtotal · 2 días» USD 80, «Conversión de dólares a pesos» con el dólar blue venta y «Ver fuente y fechas de la cotización».
  4. «Pagar con Mercado Pago» está deshabilitado hasta tildar «Acepto esta cotización y pagar ARS … en pesos.». Pagar con `APRO`.
- **Resultado esperado:** se cobra USD 80 × dólar blue venta, redondeado al centavo. En «Mis reservas», «Ver cotización» muestra el importe en USD, la venta y el número de cotización. Las devoluciones y la liquidación se calculan en pesos sobre lo cobrado, sin volver a convertir.

### CD-13 · Reprogramar las fechas

- **Objetivo:** el inquilino cambia la fecha conservando la duración y el precio pagado.
- **Reglas:** solo el inquilino; reserva pagada, antes del ingreso, sin código validado, sin liquidación en revisión ni resuelta. La opción aparece si el ingreso actual está a 6 días o más, y el nuevo ingreso también tiene que estar a 6 días o más. Se mantienen la cantidad de días y el importe.
- **Precondiciones:** R-13 (P1, de H+14 a H+15) pagada.
- **Pasos (INQ):**
  1. «Mis reservas» › R-13 › «⋯» › «Cambiar fechas» (o «Ver detalle» › «Cambiar fechas»).
  2. En «Reprogramar reserva», elegir H+17 como nuevo ingreso: la salida se calcula sola (H+18) y se lee «Se mantiene la duración de 2 días y el total pagado.».
  3. «Confirmar reprogramación».
- **Resultado esperado:** fechas nuevas, mismo total y el bloque «Último cambio de fechas» con «Antes» y «Ahora». H+14 y H+15 quedan libres. ANU recibe un correo con el cambio; si el envío falla, la tarjeta muestra «Correo al anunciante pendiente…» y «Reintentar aviso».
- **Contraejemplo:** R-3 (ingreso en H+1) no ofrece «Cambiar fechas». La ficha de P1 lo avisa: «La reprogramación de fechas solo estará disponible con 6 días o más de antelación al inicio de la reserva.».

### CD-14 · Restricciones al reservar

- **Objetivo:** mostrar los límites de la reserva.
- **Pasos y resultado esperado:**
  1. ANU abre P1: el botón dice «No podés reservar tu publicación» y está deshabilitado. En su lugar ve «Modificar publicación» y la tarjeta «Validar ingreso».
  2. INQ abre P3 (largo plazo): no hay calendario ni reserva; solo contacto.
  3. En el calendario de P1, los días ocupados o anteriores a hoy no se pueden elegir.
  4. INQ deja abierto el modal «Revisá tu reserva» más de 15 minutos: «El presupuesto venció. Volvé a cotizar para continuar.» y el botón «Volver a cotizar».
  5. Con las actividades de ANU pausadas (CD-40), la ficha muestra «Actividades pausadas» y «Reserva no disponible».

---

## 3. Código de ingreso

**Reglas del código** (`reservas.service.ts`, `reservation-state.ts`):

- Se genera al aprobarse el pago: 8 caracteres entre letras y números, sin 0, O, 1 ni I. Al validarlo no importan las mayúsculas.
- **Solo lo ve el inquilino**, mientras la estadía está «Confirmada», «Pendiente de ingreso» o «En curso» y el código no se validó. Cuando termina la estadía, deja de mostrarse.
- El anunciante lo valida **solo durante la estadía** («Pendiente de ingreso»), una vez, sin liquidación en revisión y sin una devolución por cancelación en curso.
- Con **5 intentos incorrectos** se bloquea y la liquidación pasa a «En revisión».
- Validado, la liquidación queda «Pendiente de pago al propietario» y el pago se habilita a la salida + 5.
- Un código fallido nunca genera una devolución automática: lo decide Administración.

### CD-15 · El inquilino consulta su código

- **Precondiciones:** R-B (P2, ingreso H) o cualquier reserva confirmada.
- **Pasos (INQ):**
  1. «Mis reservas» › «Ver código de ingreso».
  2. «Ver detalle» › bloque «Tu código de ingreso» › «Copiar código».
- **Resultado esperado:** en la tarjeta, «Código personal de ingreso» con el código y «No lo compartas hasta estar físicamente en la propiedad.». En el detalle, «Mostráselo al propietario al llegar al alojamiento.». ANU no ve el código en ninguna pantalla.

### CD-16 · El anunciante valida el código

- **Objetivo:** el ingreso validado libera el pago al anunciante.
- **Precondiciones:** R-B pagada, «Pendiente de ingreso». INQ le dicta el código a ANU.
- **Pasos (ANU):**
  1. «Mis reservas» › «Reservas recibidas» (filtro «Ingreso pendiente»).
  2. En la tarjeta de R-B: «Validá el código que te entregue el huésped al ingresar.».
  3. Escribir el código en «Código entregado por el inquilino» y pulsar «Validar ingreso». También se puede hacer desde la ficha de P2, tarjeta «Validar ingreso».
- **Resultado esperado:**
  - R-B pasa a «En curso». La liquidación queda «Pendiente de pago al propietario» con «Pago disponible desde el dd/mm/aaaa» (H+6).
  - INQ recibe el correo «Ingreso confirmado». En su detalle se lee «Este código ya fue validado por el propietario.» y desaparece «Ver código de ingreso».
  - ADM ve R-B en «Liquidaciones pendientes» con el lapso de espera (CD-28).
- **Contraejemplo:** en una reserva «Confirmada» (ingreso futuro) el campo no aparece. El servidor respondería «Vas a poder validar el código desde el dd/mm/aaaa, cuando empieza la estadía.».

### CD-17 · Código incorrecto y bloqueo a los 5 intentos

- **Precondiciones:** R-A (P1, ingreso H) pagada, sin validar.
- **Pasos (ANU):** en «Reservas recibidas», cargar cinco veces un código equivocado.
- **Resultado esperado:**
  - Del primer al cuarto intento: «Código incorrecto. Te quedan 4 intentos de 5.» (3, 2 y 1 después).
  - Al quinto: «Código incorrecto. El código se bloqueó tras 5 intentos incorrectos. Pedí el reinicio a Administración desde la reserva.». El campo desaparece y aparecen «El código se bloqueó por demasiados intentos incorrectos.» y «Pedir reinicio a Administración».
  - Liquidación «En revisión» («Código bloqueado después de cinco intentos incorrectos»). ADM la ve en «Liquidaciones pendientes» con «Cerrar revisión del pago» y «Devolver al inquilino».
- **Variante:** sin pedido de reinicio, ADM puede usar «Cerrar revisión del pago»: el pago sigue retenido y el anunciante recupera los 5 intentos.

### CD-18 · Pedido de reinicio: Administración habilita 5 intentos más

- **Precondiciones:** R-A con el código bloqueado (CD-17), durante la estadía.
- **Pasos:**
  1. ANU: en la tarjeta de R-A, «Pedir reinicio a Administración». Completar «Pedir el reinicio del código de la reserva #N» (20 caracteres o más, imágenes opcionales) y «Enviar pedido».
  2. INQ y ANU lo ven en «Mis reservas» › «Reclamos» (ANU en «Como anunciante»).
  3. ADM: Panel › «Reclamos» › el pedido (categoría código bloqueado) › «Resolver reclamo» › «Habilitar 5 intentos más» › motivo › «Confirmar resolución».
  4. ANU vuelve a cargar el código, esta vez correcto.
- **Resultado esperado:**
  - Al enviar el pedido, las tres partes reciben «Pedido de reinicio del código de alojamiento».
  - Al resolver: reclamo «Resuelto a favor del anunciante», liquidación otra vez retenida, 5 intentos disponibles y correo «Código de alojamiento reiniciado».
  - Con el código correcto, R-A pasa a «En curso» (como CD-16).
- **Regla:** «Habilitar 5 intentos más» solo aparece mientras la estadía está en curso. No hay límite de reinicios.

### CD-19 · Pedido de reinicio: Administración confirma el ingreso sin código

- **Precondiciones:** volver a bloquear el código de R-A (5 intentos) y pedir otro reinicio.
- **Pasos (ADM):** «Resolver reclamo» › «Confirmar el ingreso sin código (a favor del anunciante)» › motivo › «Confirmar resolución».
- **Resultado esperado:** la reserva queda con el ingreso validado («En curso» o «Finalizada»). Liquidación «Pendiente de pago al propietario», con pago habilitado a la salida + 5 («El pago al anunciante se habilita en la fecha habitual, a los 5 días del fin de la estadía.»). Correo «Ingreso confirmado por la administración».

### CD-20 · Pedido de reinicio resuelto con devolución al inquilino

- **Precondiciones:** un pedido de reinicio abierto (alternativa a CD-18 y CD-19).
- **Pasos (ADM):** «Resolver reclamo» › «Devolver una parte al inquilino» (importe menor que lo pagado) o «Devolver el 100 % al inquilino» › motivo (obligatorio) › «Confirmar resolución».
- **Resultado esperado:**
  - Parcial (por ejemplo, ARS 20.000 de ARS 50.000): el ingreso sigue sin verificar y el resto (ARS 30.000) se paga al anunciante a la salida + 5, sin comisión.
  - Total: la reserva queda «Reembolsada» y no hay nada para el anunciante.
  - La devolución se pide a Mercado Pago. Si no se confirma en el momento, queda en gestión en «Reembolsos».

### CD-21 · Ingreso no verificado que vence a favor del anunciante

- **Objetivo:** si nadie reclama, el silencio favorece al anunciante.
- **Regla:** a la salida + 5, si el código no se validó, no hay reclamo abierto ni devolución en curso, la liquidación retenida (o en revisión solo por el código bloqueado) pasa a «Pendiente de pago al propietario». Se revisa cada minuto.
- **Precondiciones:** RP-2 (P1, H−6, sin código).
- **Pasos:**
  1. INQ: «Mis reservas» › RP-2: «Ingreso no verificado» y «La estadía terminó sin un código de ingreso validado.».
  2. ANU: «Reservas recibidas» › RP-2: liquidación pendiente de pago.
  3. ADM: «Liquidaciones pendientes» › RP-2.
- **Resultado esperado:** observación «Ingreso no verificado: venció el plazo de cinco días» y «Registrar pago al anunciante» habilitado (salida + 5 = H−1).
- **Variante:** con una reserva que terminó hace poco sin código, ANU ve «En N días la liquidación quedará pendiente de pago a tu favor.».

---

## 4. Reclamos

**Reglas del código** (`reclamos.service.ts`):

- Reclama el inquilino de una reserva pagada y no cancelada, con la liquidación sin resolver. La única excepción es el pedido de reinicio del código, que inicia el anunciante (CD-18).
- Plazo: **desde el día de ingreso hasta la salida + 4**, inclusive. Antes del ingreso se usa la cancelación.
- Categorías: Limpieza, Mantenimiento, Ingreso, La propiedad no coincide y Otro. Descripción de 20 a 1000 caracteres.
- Imágenes JPEG o PNG de hasta 5 MB: 10 por envío y 30 por reclamo.
- Un solo reclamo abierto por reserva.
- Abrir un reclamo pone la liquidación «En revisión»: frena el pago al anunciante y el vencimiento automático. No cancela la reserva ni libera fechas.
- Participan inquilino, anunciante y Administración. Resoluciones: «Sin devolución», «Devolución parcial» (menor que el saldo) y «Devolución total». El motivo es obligatorio y lo ven las partes.

### CD-22 · El inquilino reporta un problema durante la estadía

- **Precondiciones:** R-B con la estadía empezada (después de CD-16).
- **Pasos (INQ):**
  1. «Mis reservas» › R-B › «⋯» › «Reportar un problema».
  2. En «Reportar un problema en la reserva #N» («La liquidación quedará en revisión.»): elegir «Limpieza», describir (20 caracteres o más) y adjuntar dos fotos.
  3. «Enviar reclamo».
- **Resultado esperado:** reclamo «Abierto» en la pestaña «Reclamos». Liquidación «En revisión» («Reclamo del inquilino en revisión»). Las tres partes reciben «Reclamo abierto».
- **Qué ve cada rol:** ANU lo ve en «Reclamos» › «Como anunciante». ADM lo ve en Panel › «Reclamos» y en el contador «Reclamos abiertos».

### CD-23 · Conversación del reclamo

- **Pasos:**
  1. ADM: Panel › «Reclamos» › «Escribir mensaje» › «Enviar».
  2. ANU: «Mis reservas» › «Reclamos» › «Escribir un mensaje», con una foto como evidencia.
  3. INQ responde desde la misma pestaña.
- **Resultado esperado:** con el primer mensaje de ADM, el reclamo pasa a «En revisión». Los mensajes se actualizan solos cada 5 segundos y cada uno muestra su autor y sus imágenes. Los demás participantes reciben «Nuevo mensaje en un reclamo».

### CD-24 · Reclamo resuelto sin devolución

- **Pasos (ADM):** «Resolver reclamo» › «Sin devolución» › motivo › «Confirmar resolución».
- **Resultado esperado:** reclamo «Resuelto a favor del anunciante», correo «Reclamo resuelto». Como el código estaba validado, la liquidación vuelve a «Pendiente de pago al propietario». Si no lo estuviera, volvería a retenida y el anunciante recuperaría los 5 intentos.

### CD-25 · Reclamo resuelto con devolución parcial

- **Precondiciones:** R-B después de CD-24, dentro del plazo. Conviene que R-B se haya pagado con dinero en cuenta (ver 0.3).
- **Pasos:**
  1. INQ abre otro reclamo sobre R-B (por ejemplo, «Mantenimiento»).
  2. ADM: «Resolver reclamo» › «Devolución parcial» › importe ARS 30.000 (la ayuda dice «Pagó el inquilino ARS 100.000,00. La devolución parcial tiene que ser menor.») › motivo › «Confirmar resolución».
- **Resultado esperado:**
  - DEPA pide la devolución a Mercado Pago. Al aprobarse: reclamo «Resuelto a favor del inquilino» y correo «Reclamo resuelto con devolución».
  - La reserva no se cancela: la etiqueta sigue «En curso» y debajo se lee «Devolución parcial al inquilino: ARS 30.000,00 de ARS 100.000,00.». En el reclamo, INQ tiene «Ver reembolso».
  - Liquidación «Devuelto parcialmente al inquilino». Los ARS 70.000 restantes se pagan al anunciante desde H+6, sin comisión.
  - Si Mercado Pago no confirma en el momento, el reclamo queda resuelto y la devolución sigue en Panel › «Reembolsos» («La devolución está en gestión»).
  - Un importe igual o mayor al saldo se rechaza: «Para devolver todo elegí "Devolución total".».

### CD-26 · Reclamo después de la estadía con devolución total

- **Precondiciones:** RP-3 (P2, de H−2 a H−1, código validado): «Finalizada» y dentro del plazo (hasta H+3).
- **Pasos:**
  1. INQ: «Mis reservas» › RP-3 › «⋯» › «Reportar un problema» › «La propiedad no coincide» › «Enviar reclamo».
  2. ADM: «Resolver reclamo» › «Devolución total» › motivo › «Confirmar resolución».
- **Resultado esperado:** INQ ve «Reembolsada» (estado de pago reembolsado). Liquidación «Devuelto al inquilino»: no queda nada para el anunciante. Las fechas no se liberan porque la estadía ya pasó.

### CD-27 · Plazos y límites del reclamo

- **Pasos y resultado esperado** (INQ, en «⋯» de cada reserva):
  1. R-13 (ingreso futuro): «Podés reclamar desde el dd/mm/aaaa, cuando empieza la estadía. Antes, usá Solicitar cancelación.».
  2. RP-3 (salida H−1): en la tarjeta, «…podés reportarlo hasta el dd/mm/aaaa» (H+3).
  3. RP-1 (salida H−6, antes de CD-29): «El plazo para reclamar terminó el dd/mm/aaaa, antes de que se habilite el pago al anunciante.».
  4. Con un reclamo abierto: «Ya tenés un reclamo abierto para esta reserva. Seguilo desde la pestaña Reclamos.».
  5. R-B después de CD-25: ya no aparece «Reportar un problema», porque la liquidación quedó resuelta para el inquilino.
  6. Mientras hay un reclamo abierto, ADM no puede registrar el pago ni resolver la liquidación: «La reserva tiene un reclamo abierto; resolvelo antes de modificar la liquidación».

---

## 5. Reembolsos y liquidaciones

**Reglas del código** (`liquidaciones.service.ts`, `operaciones-liquidacion.service.ts`):

- DEPA cobra todo con su cuenta de Mercado Pago y le paga al anunciante a mano, por transferencia, registrando el comprobante.
- Estados de la liquidación: retenida, «Pendiente de pago al propietario», «Pagado al propietario», «En revisión», «Devuelto al inquilino» y «Devuelto parcialmente al inquilino».
- El pago se habilita a la **salida + 5** (el día siguiente al último día de reclamos).
- Al anunciante le corresponde **lo que pagó el inquilino menos lo que se le devolvió**.
- La comisión es el porcentaje guardado en la reserva al crearla (10 % inicial). **Si hubo cualquier devolución, la comisión es 0.**
- Para pagar hacen falta un CBU validado del anunciante, ningún reclamo abierto, ninguna devolución en curso y la liquidación fuera de revisión. Primero se le paga al inquilino (Reembolsos) y después al anunciante.
- Cuando se habilita el pago, ADM y el anunciante reciben «Liquidación disponible para pago manual» (si el CBU está validado).
- El comprobante del pago al anunciante lo ven ADM y el anunciante. El del reembolso, ADM y el inquilino.

| Situación | Pagó el inquilino | Devuelto | A liquidar | Comisión | Neto al anunciante |
|---|---|---|---|---|---|
| Estadía normal | 100.000 | 0 | 100.000 | 10.000 | 90.000 |
| Cancelación del inquilino al 0 % | 100.000 | 0 | 100.000 | 10.000 | 90.000 |
| Cancelación del inquilino al 50 % | 100.000 | 50.000 | 50.000 | 0 | 50.000 |
| Reclamo con devolución parcial de 30.000 | 100.000 | 30.000 | 70.000 | 0 | 70.000 |
| Cancelación al 100 % o devolución total | 100.000 | 100.000 | 0 | — | Nada |

### CD-28 · Retención y lapso de espera

- **Precondiciones:** R-B recién validada (CD-16), antes de los reclamos.
- **Pasos:**
  1. ANU: «Reservas recibidas» › R-B: «Pago disponible desde el dd/mm/aaaa» (H+6).
  2. ADM: Panel › «Liquidaciones pendientes» › R-B.
- **Resultado esperado:** «Lapso de espera · Faltan 6 días para habilitar el pago.», «A liquidar al anunciante» ARS 100.000, «Comisión DEPA: 10 % · $ 10.000,00» y «Neto al anunciante» $ 90.000,00. «Registrar pago al anunciante» está deshabilitado; al pasar el cursor: «No se puede registrar el pago todavía. Faltan 6 días para habilitarlo.».

### CD-29 · Registrar el pago al anunciante

- **Objetivo:** cerrar el circuito del dinero con comisión y comprobante.
- **Precondiciones:** RP-1 (P2, H−6, código validado): pago habilitado desde H−1. ANU con CBU validado. Un archivo de comprobante.
- **Pasos (ADM):**
  1. Panel › «Liquidaciones pendientes» › RP-1 › «Registrar pago al anunciante».
  2. Mostrar el modal: «Importe a liquidar» ARS 50.000, «Comisión DEPA: 10 % · $ 5.000,00», «Importe a transferir» $ 45.000,00 (copiable) y «Datos para transferir»: CBU o CVU validado, titular y CUIT/CUIL.
  3. Adjuntar el comprobante (obligatorio), cargar un número de operación y una observación (opcionales) y pulsar «Registrar pago».
- **Resultado esperado:**
  - RP-1 sale de pendientes y queda «Pagado al propietario». ANU recibe «Pago al anunciante registrado».
  - ADM: Panel › «Historial de liquidaciones», con el desglose y el comprobante.
  - ANU: «Reservas recibidas» muestra «Pago registrado el dd/mm/aaaa.». En «Mis publicaciones» › P2 › «Liquidaciones» y en «Dashboard» › «Historial de liquidaciones» ve fecha, importe, número de operación, observación, comprobante y desglose (pagó el inquilino, devuelto, comisión y pagado al anunciante).
- **Sin CBU validado:** «El anunciante necesita un CBU validado para recibir el pago.» y el botón queda deshabilitado.

### CD-30 · Liquidación del resto tras una cancelación al 50 %

- **Precondiciones:** R-2 después de CD-2.
- **Pasos (ADM):** «Liquidaciones pendientes» › R-2.
- **Resultado esperado:** «Pagó el inquilino» ARS 100.000, «A liquidar al anunciante» ARS 50.000, «Comisión DEPA: 10 % · $ 0,00» (el 10 % es la comisión pactada en la reserva; el importe es 0 porque hubo devolución), «Neto al anunciante» $ 50.000,00 y «Faltan 10 días».

### CD-31 · Liquidación tras una cancelación al 0 %

- **Precondiciones:** R-3 después de CD-3.
- **Pasos (ADM):** «Liquidaciones pendientes» › R-3.
- **Resultado esperado:** «A liquidar» ARS 100.000, comisión 10 % ($ 10.000,00), neto $ 90.000,00, «Faltan 7 días» y la observación «Cancelación sin devolución: el importe corresponde al anunciante».

### CD-32 · Devolver al inquilino desde Liquidaciones

- **Objetivo:** Administración decide devolver lo pendiente aunque no haya un reclamo.
- **Precondiciones:** RP-2 después de CD-21 (no uses RP-1, que es para CD-29).
- **Pasos (ADM):**
  1. «Liquidaciones pendientes» › RP-2 › «Devolver al inquilino».
  2. El modal «Devolver el pago al inquilino» explica que lo que queda (ARS 50.000) se deriva a Reembolsos y que el anunciante no lo recibirá. Escribir el motivo (obligatorio) › «Pasar a Reembolsos».
  3. Panel › «Reembolsos» › el nuevo reembolso › «Ver detalle» › «Solicitar devolución» («Al confirmar, se solicitará la devolución a Mercado Pago por el importe indicado.»).
- **Resultado esperado:** RP-2 sale de pendientes mientras la devolución está en curso (liquidación «En revisión»: «Devolución derivada a Reembolsos»). Al aprobarse, la reserva queda «Reembolsada», la liquidación «Devuelto al inquilino» y las partes reciben el aviso.

### CD-33 · Reembolso por transferencia con chat y comprobante

- **Objetivo:** cuando Mercado Pago no puede devolver, Administración transfiere y deja constancia.
- **Precondiciones (opcional):** back local con `MP_SIMULAR_REEMBOLSO_TARJETA=false`. INQ cancela al 100 % una reserva pagada con tarjeta: la conciliación la deriva a transferencia («La simulación de tarjeta no está habilitada en este entorno»). También pasa con un reembolso «Fallido» al pulsar «Habilitar transferencia», que primero verifica en Mercado Pago.
- **Pasos:**
  1. ADM: Panel › «Reembolsos» › «Transferencia bancaria pendiente · Chat disponible» › «Ver detalle y chat» › «Conversación con el inquilino»: pedirle el CBU o alias.
  2. INQ: aviso «Nuevo mensaje de administración» en la campana › «Resumen de la reserva» › «Reembolsos por transferencia» › «Ver conversación» › responder.
  3. ADM: adjuntar el comprobante, cargar número de operación y observación (opcionales) › «Registrar transferencia».
- **Resultado esperado:** reembolso «Aprobado», reserva cancelada y reembolsada, fechas libres. INQ ve «Comprobante de la transferencia: Ver …», el número de operación y la observación. ANU no ve ese comprobante.

### CD-34 · Cambiar la comisión de DEPA

- **Pasos (ADM):** Panel › «Comisión DEPA» › «Cambiar comisión» › por ejemplo, 12 % › guardar.
- **Resultado esperado:** «El porcentaje se aplica a nuevas reservas y no modifica las anteriores.». Una reserva nueva liquida con 12 %; R-B, RP-1 y las demás siguen con 10 %.

---

## 6. Publicaciones

**Reglas del código** (`publicaciones.service.ts`, `crear-publicacion.dto.ts`, `imagenes.service.ts`):

- Publica solo un anunciante con la identidad verificada y el CBU aprobado. Las publicaciones no pasan por aprobación de Administración.
- **Título:** de 15 a 255 caracteres, con al menos una letra o un número. Solo admite letras (con tildes y ñ), números, espacios, comas, dos puntos y puntos. No admite «!», «¿», guiones, emojis ni un espacio al final.
- Descripción hasta 5000 caracteres. Precio de 1 a 99.999.999,99, con hasta 2 decimales. Ambientes de 1 a 10. Superficie de 1 a 10.000 m².
- **Fotos:** al menos 1 y hasta 15. La publicación nace inactiva y se activa sola al guardarse la primera foto. No se puede borrar la última foto.
- Una publicación aparece en el catálogo si está activa, no está eliminada, tiene foto, no tiene baja administrativa, el anunciante tiene la cuenta habilitada y no pausó sus actividades.

### CD-35 · Alta de una publicación temporal

- **Precondiciones:** ANU (o NUEVO después de CD-43).
- **Pasos (ANU):**
  1. Menú › «Publicar propiedad» (o «Publicar» en la barra superior).
  2. «01 Datos de la publicación»: «Tipo de alquiler» Temporal, «Tipo de propiedad», «Título de la publicación» y «Descripción».
  3. «02 Ubicación»: marcar en el mapa y completar «Calle y número».
  4. «03 Características»: ambientes y superficie.
  5. «04 Fotos de la propiedad»: subir tres fotos, cambiar la portada y el orden.
  6. «05 Precio y condiciones»: moneda y precio.
  7. «06 Días disponibles»: habilitar un período en el calendario.
  8. «Publicar propiedad».
- **Resultado esperado:** aparece «Activa» en «Mis publicaciones» y en «Explorar publicaciones». ANU recibe «Tu publicación ya está publicada».

### CD-36 · Validaciones del formulario

- **Pasos y resultado esperado** (mensajes del formulario de «Publicar propiedad»; el servidor repite los mismos controles):

| Dato | Ejemplo | Resultado |
|---|---|---|
| Título corto | «Depto céntrico» (14 caracteres) | «Ingresá un título de 15 a 255 caracteres, con letras o números. Solo se admiten espacios, comas, dos puntos y puntos.» |
| Título con guion | «Casa quinta - con pileta» | Mismo mensaje |
| Título con signos | «¡Oferta! Departamento amplio» | Mismo mensaje |
| Título válido | «Cabaña en Villa General Belgrano: 2 ambientes, con pileta.» | Se acepta |
| Sin fotos | — | «Tenés que agregar al menos una foto para publicar la propiedad.» |
| Precio | 0 | «Ingresá un precio mayor a 0.» |
| Precio | 1500,555 | «Ingresá como máximo 2 decimales.» |
| Ambientes | 11 | «El máximo es 10 ambientes.» |

### CD-37 · Activar, desactivar y la última foto

- **Pasos (ANU):**
  1. «Mis publicaciones» › P1 › «Desactivar»: queda «Inactiva» y sale del catálogo.
  2. «Activar»: vuelve al catálogo.
  3. «Editar» › «Fotos de la propiedad»: borrar fotos hasta dejar una e intentar borrar esa.
- **Resultado esperado:** con una sola foto: «Una publicación debe tener al menos una imagen. Subí otra antes de borrar esta.». Con 15 fotos no deja subir más. Desactivar no afecta las reservas ni los chats existentes.

### CD-38 · Papelera: eliminar y restaurar

- **Precondiciones:** una publicación de prueba sin reservas vigentes ni futuras.
- **Pasos (ANU):**
  1. «Mis publicaciones» › la publicación de prueba › «Eliminar» › confirmar con «Mover a Papelera».
  2. Bajar hasta «Papelera (1)» › «Restaurar».
- **Resultado esperado:** al eliminarla sale del catálogo y del listado. Al restaurarla vuelve **inactiva** y hay que activarla a mano. Una publicación eliminada no admite mensajes nuevos («No se pueden enviar mensajes: esta publicación ha sido eliminada»).

### CD-39 · Baja administrativa y reactivación

- **Pasos:**
  1. ADM: Panel › «Publicaciones» › P-demo › «Dar de baja» › motivo › «Confirmar baja y notificar».
  2. ANU: «Mis publicaciones».
  3. ADM: «Reactivar».
  4. ANU: «Activar».
- **Resultado esperado:**
  - Tras la baja, ANU ve «Desactivada por un administrador» y «Motivo de la baja: …», con «Activar» deshabilitado («La baja administrativa impide activar esta publicación»). Recibe «Tu publicación fue desactivada por un administrador».
  - Tras la reactivación, la publicación queda «Inactiva» (no se republica sola) y ANU recibe «Se levantó la baja de tu publicación». La activa cuando quiere.
  - ADM puede usar «Actualizar baja / reenviar aviso» para cambiar el motivo.

### CD-40 · Pausar las actividades del anunciante

- **Pasos (ANU):** «Mi perfil» › «Cuenta de anunciante» › «Pausar actividades» › «Confirmar pausa». Después, «Reanudar actividades».
- **Resultado esperado:** durante la pausa, todas sus publicaciones salen del catálogo y su ficha muestra «Actividades pausadas» y «Reserva no disponible». Las reservas existentes siguen su curso.

### CD-41 · Publicación de largo plazo

- **Pasos (INQ):** abrir P3.
- **Resultado esperado:** sin calendario ni pago por DEPA. Se acuerda con el anunciante por «Contactar por WhatsApp» (si cargó número) o «Enviar Mensaje» (CD-55).

---

## 7. Verificación de anunciante

**Reglas del código** (`verificacion-anunciante.service.ts`, `prueba-vida.service.ts`):

- El particular presenta CUIT/CUIL, número de contacto, CBU de 22 dígitos (con dígito verificador válido), DNI de frente y dorso y la prueba de vida. La inmobiliaria suma los datos de la empresa y del corredor responsable y dos constancias.
- La prueba de vida guía movimientos con la cámara. El servidor verifica las capturas (gestos y que sea la misma persona). **No compara el rostro con el DNI:** eso lo revisa el administrador.
- Identidad y CBU se aprueban o rechazan por separado. Para aprobar el CBU, el administrador tiene que confirmar la titularidad.

### CD-42 · Solicitud de un particular con prueba de vida

- **Precondiciones:** NUEVO con sesión iniciada, en un dispositivo con cámara y buena luz.
- **Pasos (NUEVO):**
  1. Menú › «Quiero ser anunciante» › «Comenzar verificación» (o «Mi perfil» › «Quiero ser anunciante»).
  2. «Datos del anunciante»: «Tipo de anunciante» Particular, «CUIT / CUIL personal», «Número de contacto», «CBU de la cuenta bancaria» con la casilla de titularidad y los términos para anunciantes › «Continuar».
  3. «Documentación de identidad» › «Comenzar verificación». En la ventana:
     - «DNI frente» › «Sacar foto del frente» › «Usar esta foto» (o «Repetir foto»);
     - «DNI dorso», igual;
     - «Prueba de vida»: seguir los movimientos («Movimiento 1 de …»); la foto final se toma sola. Si un gesto no sale, «Probar otros movimientos». El desafío dura 10 minutos.
  4. «Prueba de vida válida» › «Enviar documentación».
- **Resultado esperado:** «Tu solicitud está en revisión». ADM recibe «Nueva solicitud de anunciante para revisar». En «Mi perfil» se lee «Tu documentación está en revisión.».

### CD-43 · Aprobación de identidad y CBU

- **Pasos (ADM):**
  1. Panel › «Verificaciones»: datos, «Prueba de vida: Completada», «CBU a revisar», DNI de frente y dorso y «Rostro».
  2. Comparar el rostro con el DNI.
  3. Tildar «Verifiqué en el banco que el CBU pertenece al mismo titular de la cuenta en DEPA.» y pulsar «Aprobar».
- **Resultado esperado:** NUEVO recibe «Revisión de anunciante aprobada». Su menú suma la sección «Anunciante» (Dashboard, Publicar propiedad y Mis publicaciones). La solicitud muestra «Identidad aprobada» y «Publicar propiedad».
- **Sin aprobación:** «Publicar propiedad» redirige con el aviso «Para publicar una propiedad primero debés solicitar ser anunciante.». Con la identidad aprobada y sin CBU aprobado: «Necesitás un CBU validado para publicar una propiedad.».

### CD-44 · Rechazo parcial y reenvío

- **Pasos:**
  1. ADM: «Rechazar» › tildar «Rechazar prueba de vida y documentación de identidad» y dejar el CBU sin marcar («Se aprobará la parte que dejes sin marcar.») › motivo (5 caracteres o más) › «Confirmar rechazo».
  2. NUEVO: correo «Tu solicitud de anunciante requiere una corrección». En «Mi perfil»: «Tu verificación fue rechazada.» con el motivo › «Reenviar documentación» › nueva captura.
  3. ADM aprueba la nueva revisión.
- **Resultado esperado:** el CBU queda aprobado desde el primer paso. La identidad vuelve a revisión con un nuevo número, y «Historial de revisiones» muestra cada decisión.

### CD-45 · Solicitud de una inmobiliaria

- **Pasos:** como CD-42, con «Tipo de anunciante» Inmobiliaria: «CUIT de la inmobiliaria», «Nombre o razón social», «Matrícula del corredor responsable», «Colegio profesional y jurisdicción», «Domicilio comercial» y «DNI del corredor responsable». En la documentación se adjuntan «Constancia de matrícula profesional» y «Constancia de CUIT de la inmobiliaria» (PDF, JPG o PNG de hasta 5 MB) y el corredor hace la prueba de vida.
- **Resultado esperado:** ADM ve el bloque «Inmobiliaria y corredor responsable» y los enlaces «Ver constancia de matrícula» y «Ver constancia de CUIT».

---

## 8. Bloqueos y apelaciones

**Reglas del código** (`usuarios.service.ts`, `jwt-auth.guard.ts`):

- El bloqueo lo hace ADM desde «Usuarios», con motivo obligatorio.
- Si la cuenta tiene **operaciones pendientes** (reservas pendientes de pago, estadías vigentes o futuras, liquidaciones pendientes, pagos en proceso, reclamos o reembolsos abiertos), el bloqueo es con **acceso limitado**: entra solo para resolverlas y apelar. Sin pendientes, el bloqueo es **total**. El acceso limitado se vuelve a evaluar en cada inicio de sesión.
- Las publicaciones de una cuenta bloqueada salen del catálogo. Las reservas ya existentes siguen su curso. Una cuenta bloqueada no puede reservar.
- Las liquidaciones de un anunciante bloqueado se le pagan igual: Administración registra el pago como en CD-29.

### CD-46 · Bloqueo total y apelación

- **Precondiciones:** una cuenta sin operaciones pendientes (por ejemplo, NUEVO antes de publicar).
- **Pasos:**
  1. ADM: Panel › «Usuarios» › buscar › «Bloquear» › «Bloquear usuario»: motivo › «Confirmar bloqueo».
  2. El usuario intenta «Ingresar».
  3. En «Tu cuenta está bloqueada»: leer el «Motivo del bloqueo» y, en «Apelar el bloqueo», escribir «Tu mensaje» (hasta 2000 caracteres), adjuntar una imagen opcional (JPEG o PNG de hasta 5 MB) y «Enviar apelación».
- **Resultado esperado:** estado «Bloqueada» en Usuarios y correo «Tu cuenta de DEPA fue bloqueada» con el motivo. Tras apelar: «Tu apelación está pendiente de respuesta.». ADM ve el contador «Apelaciones a responder».

### CD-47 · Bloqueo con acceso limitado

- **Precondiciones:** una cuenta con una reserva futura confirmada (por ejemplo, INQ2 con una reserva de P1). Hacerlo al final de la demo.
- **Pasos:**
  1. ADM bloquea la cuenta (como CD-46).
  2. El usuario inicia sesión.
- **Resultado esperado:** ADM ve el aviso «Usuario bloqueado con acceso a operaciones pendientes.» (en un bloqueo total, «Usuario bloqueado.»). El usuario entra, pero el menú solo ofrece «Mis chats», «Mis reservas» y «Consultar o apelar bloqueo», y la página dice «Tu cuenta tiene acceso limitado». Cualquier otra acción responde «Tu cuenta solo tiene acceso a operaciones pendientes y a la apelación del bloqueo.». Si es anunciante, sus publicaciones salen del catálogo pero sus reservas siguen (pagos, código y liquidaciones). Cuando ya no le quedan pendientes, el bloqueo pasa a total.

### CD-48 · Respuesta a la apelación y desbloqueo

- **Pasos (ADM):**
  1. Panel › «Bloqueos y apelaciones» › «Bloqueos actuales»: «Bloqueado por», «Fecha del bloqueo», «Motivo» y el estado «Apelación en curso».
  2. Responder en «Apelación del bloqueo» (texto obligatorio, una imagen opcional).
  3. «Desbloquear usuario».
- **Resultado esperado:** tras responder, la tarjeta dice «Respondida» y el usuario ve «Administración respondió tu apelación.» con el hilo. Tras desbloquear, el caso pasa a «Historial» con la fecha, el usuario recibe «Tu cuenta de DEPA fue habilitada» y sus publicaciones activas vuelven al catálogo. También se puede desbloquear desde «Usuarios» › «Habilitar».

---

## 9. Cuenta

### CD-49 · Registro y verificación del correo

- **Pasos (NUEVO):**
  1. Menú › «Crear cuenta»: completar los datos, una contraseña de 12 caracteres o más con letra, número y símbolo, y aceptar los términos.
  2. Intentar «Ingresar» antes de verificar.
  3. Abrir el enlace del correo e ingresar.
- **Resultado esperado:** «Usuario registrado exitosamente, revisá tu email para verificar la cuenta». Sin verificar, el ingreso responde «Tu cuenta está inactiva». El enlace vence a las 24 h y se puede pedir otro. La contraseña se cambia en «Mi perfil» › «Configuración de la cuenta» y se recupera desde «Ingresar».

### CD-50 · Baja de la cuenta

- **Pasos:**
  1. INQ (con reservas vigentes): «Mi perfil» › «Baja de cuenta» › «Solicitar baja» › «Enviar correo de confirmación».
  2. Una cuenta sin pendientes repite el paso.
  3. Abrir el correo «Confirmá la baja de tu cuenta de DEPA» antes de los 30 minutos y confirmar.
- **Resultado esperado:**
  - INQ: la baja se rechaza por las operaciones pendientes (el aviso previo lo anticipa: «…no vas a poder dar de baja la cuenta hasta regularizarlos.»).
  - La otra cuenta: «Te enviamos un enlace de confirmación. Tu cuenta sigue activa.» y, al confirmar, «Tu cuenta fue dada de baja correctamente».
  - Es una baja lógica: no puede ingresar, sus publicaciones se desactivan y sus reservas y pagos quedan como historial. ADM la ve «Dada de baja», con la fecha y el correo histórico. Ya no se puede bloquear ni habilitar.

### CD-51 · Recuperar una cuenta dada de baja

- **Precondiciones:** la cuenta dada de baja en CD-50.
- **Pasos:**
  1. Menú › «Crear cuenta» con el mismo correo.
  2. En «Elegí cómo continuar», «Recuperar mi cuenta por email».
  3. Abrir el enlace (vence a las 2 h) › «Recuperá tu cuenta» › «Confirmar alta».
  4. Ingresar con la contraseña anterior (o recuperarla).
- **Resultado esperado:** «Mail enviado» y la cuenta vuelve con su historial y su CUIT. «Crear una cuenta nueva» crea otra cuenta sin ese historial. Solo se recuperan las bajas pedidas por el titular, no las que hizo Administración.

---

## 10. Explorar y comunicarse

### CD-52 · Buscar con filtros y orden

- **Pasos (visitante, sin sesión):** Menú › «Explorar publicaciones»: buscar por texto, filtrar por modalidad, provincia, ciudad, tipo de propiedad, moneda, rango de precio, superficie mínima y ambientes, y cambiar el orden (recientes, antiguas, precio menor, precio mayor y título).
- **Resultado esperado:** solo aparecen publicaciones visibles (ver reglas de la sección 6). Al ordenar por precio, las publicaciones en USD se comparan en pesos con el dólar blue registrado. Un precio mínimo mayor que el máximo responde «El precio mínimo no puede superar al máximo». Una publicación desactivada en CD-37 no aparece.

### CD-53 · Mapa

- **Pasos:** Menú › «Ver mapa»: mover el mapa, elegir un pin y abrir «Ver detalles».
- **Resultado esperado:** los pines entran animados y se recargan al mover el mapa (hasta 500 por zona). El pin elegido se resalta en el listado. Solo aparecen publicaciones visibles con coordenadas.

### CD-54 · Favoritos

- **Pasos (INQ):** en la ficha de P2, «Guardar» (cambia a «Guardada»), o el marcador de la tarjeta. Después, menú › «Mis favoritos».
- **Resultado esperado:** la publicación aparece en «Mis favoritos». En su propia publicación, ANU no ve el botón.

### CD-55 · Chat por publicación y WhatsApp

- **Pasos:**
  1. INQ2: ficha de P2 › «Enviar mensaje» › escribir.
  2. ANU: recibe el aviso por correo › menú › «Mis chats» (buscador por persona o publicación) › responder.
  3. INQ: «Resumen de la reserva» de R-B › «Mensaje por DEPA».
  4. INQ: «Continuar por WhatsApp» › modal «Vas a salir de DEPA» › «Quedarme en DEPA» o «Abrir WhatsApp».
- **Resultado esperado:** la conversación queda asociada a la publicación. El inquilino puede escribirle al anunciante. El anunciante solo puede iniciar una conversación si el otro tiene una reserva aprobada en esa publicación o si ya conversaron ahí. El modal advierte que DEPA no podrá revisar lo que se hable por WhatsApp. No se puede escribir en una publicación eliminada ni a una cuenta dada de baja.

### CD-56 · Asistente depa

- **Precondiciones:** cualquier usuario, incluso sin sesión. El asistente no aparece en las pantallas de acceso, en la del CBU ni con acceso limitado.
- **Pasos:** abrir el asistente (botón abajo a la izquierda) y preguntar:
  1. «¿Cuánto me devuelven si cancelo 4 días antes?»
  2. «Buscame un departamento temporal en Villa María hasta 60.000 pesos»
  3. «¿Cómo valido el código de ingreso?»
  4. Algo ajeno, por ejemplo «¿Quién ganó el último mundial?»
- **Resultado esperado:** responde con la política (50 % en la política base) y sugiere ver las condiciones de la reserva; busca publicaciones con esos criterios, sin verificar disponibilidad por fecha; explica el recorrido; ante lo ajeno contesta «Solo puedo ayudarte con DEPA. ¿Querés buscar un alquiler o consultar cómo funciona la plataforma?». No pide contraseñas, códigos, DNI ni CBU. Admite 10 mensajes por minuto por IP. El texto lo genera un modelo, así que varía entre demos.

---

## 11. Dashboard y panel administrativo

### CD-57 · Dashboard del anunciante

- **Pasos (ANU):** menú › «Dashboard».
- **Resultado esperado:** «Resumen de tu actividad» con «Visualizaciones» (aperturas de fichas; una por sesión del navegador), «Publicaciones activas» (de N en total), «Reservas recibidas» (sin canceladas, con las pendientes o en curso), «Ingresos por reservas» («Sin contar cancelaciones»), los gráficos «Ingresos de los últimos 6 meses», «Reservas por día», «Rendimiento por publicación» y «Vistas que reservan», y el «Historial de liquidaciones» con el pago de CD-29. Los atajos «Administrar publicaciones» y «+ Nueva publicación» llevan a esas pantallas.

### CD-58 · Panel administrativo: resumen y pendientes

- **Pasos (ADM):** menú › «Panel administrativo».
- **Resultado esperado:**
  - Contadores «Reclamos abiertos», «Reembolsos pendientes», «Verificaciones pendientes», «Liquidaciones a pagar» y «Apelaciones a responder»: cada uno abre su sección.
  - «Pendientes de atención» con el caso, el estado y la acción («Ver más» y «Ver menos»), y «Accesos rápidos».
  - La sección queda en la URL (por ejemplo, `/admin#reclamos`). Cada lista tiene búsqueda, filtros y paginación.
  - «Ver reserva» abre el resumen en solo lectura con las dos partes (nombre, correo, teléfono y «Ver perfil»).
  - Menú del panel: Operaciones (Reclamos, Reembolsos, Liquidaciones pendientes e Historial de liquidaciones), Gestión (Verificaciones, Publicaciones, Usuarios y Bloqueos y apelaciones) y Configuración (Catálogos, Ubicaciones, Cotizaciones y Comisión DEPA).

---

## 12. Recorridos combinados

### R-1 · De la publicación a la liquidación

Muestra el ciclo completo del dinero. Hace falta un encuentro el H−6 (o la reserva RP-1 preparada).

**Parte A (H−6, unos 30 minutos):**

1. NUEVO se registra y verifica el correo (CD-49).
2. Pide ser anunciante con la prueba de vida (CD-42) y ADM aprueba identidad y CBU (CD-43).
3. Publica una propiedad temporal de ARS 50.000 por día, con fotos y días disponibles (CD-35). Aparece en «Explorar publicaciones» (CD-52).
4. INQ la encuentra en el mapa (CD-53), la guarda (CD-54) y le escribe por chat (CD-55).
5. INQ reserva ese mismo día (1 día) y paga con `APRO` (CD-9). Llegan los correos de confirmación.
6. INQ muestra su código (CD-15) y el anunciante lo valida (CD-16): «En curso». ADM ve «Faltan 5 días» (CD-28).

**Parte B (día H):**

7. La estadía figura «Finalizada» y el plazo de reclamos ya cerró (CD-27).
8. ADM registra el pago: ARS 50.000 − 10 % = **ARS 45.000**, con comprobante (CD-29).
9. El anunciante ve el pago, el desglose y el comprobante en «Dashboard» › «Historial de liquidaciones» (CD-57).

Si la demo es en un solo día, la Parte A se muestra en vivo y la Parte B se hace con RP-1.

### R-2 · Estadía con problema: código, reclamo y devolución parcial

Todo el día H, sobre R-B (P2, de H a H+1, ARS 100.000).

1. INQ reserva y paga (CD-9). ANU ve la nueva reserva con la liquidación retenida.
2. Al llegar, INQ dicta el código y ANU lo valida (CD-16). ADM ve «Faltan 6 días» y el neto de ARS 90.000 (CD-28).
3. INQ reporta un problema de limpieza con dos fotos (CD-22): la liquidación pasa a «En revisión».
4. ADM pide detalles y ANU responde con fotos (CD-23).
5. ADM resuelve con una devolución parcial de ARS 30.000 (CD-25).
6. INQ ve la devolución parcial en la tarjeta (la estadía sigue «En curso») y «Ver reembolso» en el reclamo. ADM ve en «Liquidaciones pendientes»: pagó el inquilino ARS 100.000, a liquidar ARS 70.000, comisión $ 0,00 y neto ARS 70.000, habilitado desde H+6.

### R-3 · Código bloqueado de punta a punta

Día H, sobre R-A (P1, H).

1. INQ reserva y paga. Le dicta mal el código a ANU.
2. ANU falla cinco veces: el código se bloquea y la liquidación pasa a «En revisión» (CD-17).
3. ANU pide el reinicio y las tres partes ven el pedido en «Reclamos» (CD-18).
4. ADM conversa en el pedido y elige «Habilitar 5 intentos más».
5. ANU valida el código correcto: «En curso», liquidación pendiente de pago desde la salida + 5.
6. Final alternativo, para explicar sin esperar: si nadie hubiera hecho nada, a la salida + 5 la liquidación habría pasado sola a favor del anunciante (CD-21). Si Administración hubiera confiado en el inquilino, habría devuelto todo o una parte (CD-20).
