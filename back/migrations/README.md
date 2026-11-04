# Cancelaciones, devoluciones, reclamos y contracargos

Para habilitar el circuito del ítem 14, con el backend detenido y sobre una
copia o base descartable, aplicar `20261104-cancelaciones-devoluciones.sql`.
La migración es repetible y agrega las tablas `solicitud_cancelacion`,
`reembolso`, `disputa`, `reclamo_reserva`, `reclamo_evidencia` y
`reclamo_mensaje`, además de las columnas de cancelación y reembolso.

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
Después de inicializar, se deben cargar catálogos y datos ficticios para RNF8.
Se conserva `synchronize: false` en la aplicación.

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
