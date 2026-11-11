# Cancelaciones, devoluciones, reclamos y contracargos

Para habilitar el circuito del ítem 14, con el backend detenido y sobre una
copia o base descartable, ejecutar `npm run db:cancelaciones-devoluciones` desde `back/`.
La primera migración, `20261104-cancelaciones-devoluciones.sql`, agrega las tablas `solicitud_cancelacion`,
`reembolso`, `disputa`, `reclamo_reserva`, `reclamo_evidencia` y
`reclamo_mensaje`, además de las columnas de cancelación y reembolso.
La migración `20261110-estados-por-ambito.sql` crea los catálogos `ambito` y
`estado` y migra los estados persistidos de reservas, solicitudes de
cancelación, reembolsos, reclamos, verificación de anunciantes y disputas.
Acepta bases con el enum de disputas y bases con el catálogo histórico
`estado_disputa`. El comando es repetible, conserva los códigos existentes y
mantiene el índice de una sola solicitud de cancelación pendiente por reserva.

La ejecución automática de devoluciones por Mercado Pago queda apagada por
defecto con `MP_REFUNDS_ENABLED=false`. En ese modo el Administrador registra
la devolución manualmente con una referencia. Para el contenedor privado de
evidencias configurar `AZURE_RECLAMOS_CONTAINER` (por defecto `reclamos`).

# Inicializar una base nueva desde back/.env

Para una base vacía (por ejemplo, una base de pruebas en Neon), configurar
`DATABASE_URL` en `back/.env` y ejecutar desde `back`:

```sh
npm run db:inicializar
```

El comando lee la conexión directamente de ese archivo y aplica
`20261102-esquema-inicial.sql` en una transacción. Crea 21 tablas con sus tipos,
secuencias, índices y relaciones, sin cargar registros. Incluye el retiro del
catálogo obsoleto de métodos de pago. No necesita `pg_dump` ni `psql` instalados.

Solo admite un esquema `public` vacío. Si ya encuentra tablas u otros objetos,
rechaza la operación sin reemplazarlos. No ejecutar esta inicialización sobre
una base existente; para ella corresponden las migraciones incrementales.

Para consultar el estado sin cambios, ejecutar `node scripts/inicializar-base.cjs`.
Para probar la creación completa y revertirla al finalizar, ejecutar
`node scripts/inicializar-base.cjs --verificar`.

La migración inicial es una copia de la estructura disponible al 02/11/2026.
Después de inicializar, aplicar las migraciones de esta versión, incluida
`npm run db:cancelaciones-devoluciones`, y cargar los datos base.
Se conserva `synchronize: false` en la aplicación.

# Cargar datos base

Con el esquema de esta versión migrado y `DATABASE_URL` configurada en
`back/.env` para el entorno que se quiere preparar, ejecutar desde `back`:

```sh
npm run db:seed
```

La seed carga los roles `Administrador` e `Inquilino`, los ámbitos y estados,
las monedas, modalidades, tipos de anunciante y propiedad, y las provincias y
localidades. Se puede repetir: inserta lo faltante y conserva los valores
existentes. Informa cuántas filas agregó por tabla. Al arrancar, el backend
comprueba que los roles y estados obligatorios estén disponibles.

Las ubicaciones vienen de una copia local de
[GeoRef, Dirección de Datos Abiertos de Argentina](https://www.argentina.gob.ar/georef/descarga-de-la-base-completa),
bajo [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Se agrupan los
registros por provincia, departamento y nombre. Los homónimos de distintos
departamentos incluyen el departamento en su nombre visible.

El primer administrador se crea mediante el registro del sistema. Los datos
ficticios de rendimiento se cargan por separado con `npm run db:datos-rnf8`
en el entorno de pruebas.

# Unicidad del calendario y concurrencia de reservas

Para separar la prueba de vida de la revisión manual de identidad, aplicar
`20261028-verificacion-identidad.sql` según [estas instrucciones](../docs/verificacion-identidad.md).

Para cotizaciones históricas y conversión USD → ARS, aplicar además
`20261027-cotizaciones-cobros.sql` según [estas instrucciones](../docs/cotizaciones-cobros.md).

Para habilitar también el cambio de fechas desde la web y sus avisos al anunciante,
ver [la política y migración de reprogramaciones](../docs/reprogramaciones.md).

Antes de iniciar esta versión con una base existente, detener el backend y,
desde `back`, ejecutar:

```sh
node scripts/calendario-unico.cjs
npm run db:calendario-unico
```

El primer comando informa fechas duplicadas o sin publicación. El segundo aplica
`20261027-calendario-unico.sql` dentro de una transacción con bloqueo de tabla.
Si encuentra esos problemas, revierte y exige revisar los datos; nunca borra ni
fusiona filas. La migración es repetible. Aplicarla antes de arrancar: el backend
tiene `synchronize: false` y no actualiza el esquema automáticamente.

Las escrituras de calendario usan una misma transacción para reserva y fechas.
Se bloquea la reserva existente antes de modificarla, luego la publicación y
las fechas en orden ascendente. El bloqueo por publicación también coordina la
creación de días ausentes y evita invertir el orden entre rangos al reprogramar.
Publicaciones diferentes pueden modificarse en paralelo. Los correos se envían
fuera de la transacción y solo actualizan sus indicadores de envío.

# Retiro del catálogo de métodos de pago

Para la política por eventos de eliminación de DNI, rostro y constancias,
ver [preparación, migración y requisitos de Azure](../docs/eliminacion-documentos.md).

Los pagos se gestionan mediante Mercado Pago Checkout Pro. El medio confirmado
se conserva en `pago.payment_method_id`; ya no existe un catálogo propio ni una
relación desde `reserva`.

Con el back detenido, desde `back`:

```sh
node scripts/retirar-metodo-pago.cjs
npm run db:retirar-metodo-pago
```

La primera instrucción consulta el estado. La segunda aplica la migración
`20261009-retirar-metodo-pago.sql` a la base configurada en `.env`.

El runner guarda un respaldo local en `backups` antes de eliminar el catálogo y
la columna. Conserva los valores antiguos y sus definiciones para una eventual
restauración. Usa una transacción, no elimina dependencias con `CASCADE` y compara
el contenido de las reservas (excluyendo la columna retirada) y de los pagos
antes y después. Puede ejecutarse nuevamente sin duplicar cambios.

Aplicar la migración antes de arrancar esta versión. El proyecto usa
`synchronize: false`: los cambios de esquema requieren migraciones explícitas.

Para documentación diferenciada de inmobiliarias, ver [el flujo y su migración](../docs/documentacion-inmobiliaria.md).

# Portada y orden de imágenes (2026-11-04)

Antes de desplegar el backend con esta funcionalidad, ejecutar desde `back`:

```sh
npm run db:orden-imagenes
```

Usa `DATABASE_URL` (entorno o `back/.env`). Agrega `imagen.orden` y conserva el orden
histórico por ID, incluida la portada. Es reejecutable y no borra fotos ni cambia
órdenes guardados previamente. Aplicar también después de inicializar una base nueva.

# CUIT/CUIL y email únicos entre cuentas vigentes (RN-37)

Una cuenta dada de baja libera su email y, si es Anunciante, su CUIT/CUIL, para
que la persona pueda registrarse de nuevo. Los valores originales se conservan en
`usuario.email_historico` y `anunciante.cuit_cuil_historico`, y siguen
identificándola en el historial (por ejemplo, en el detalle de una reserva).

La migración `20261104-cuit-email-historicos.sql`:

- agrega `anunciante.cuit_cuil_historico` y `usuario.email_historico`, y permite
  `usuario.email` en null;
- mueve al histórico el email y el CUIT/CUIL de las cuentas que ya estaban dadas de baja;
- crea el índice único `uq_anunciante_cuit_cuil_digitos`, que compara solo los
  dígitos del CUIT/CUIL (con o sin guiones), también para inmobiliarias.

Si encuentra CUIT/CUIL repetidos entre cuentas vigentes, se revierte y los lista:
nunca fusiona ni modifica esos datos. Con el back detenido, desde `back`:

```sh
node scripts/cuit-email-historicos.cjs
npm run db:cuit-email-historicos
```

El primer comando informa qué se movería y si hay repetidos, sin cambios. El
segundo aplica la migración en una transacción. Es repetible. En una base nueva,
aplicarla después de `npm run db:inicializar`.
