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

Aplicar la migración antes de arrancar esta versión: el proyecto todavía usa
`synchronize: true` y podría retirar la columna por sí mismo, sin el respaldo.
