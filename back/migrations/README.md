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
