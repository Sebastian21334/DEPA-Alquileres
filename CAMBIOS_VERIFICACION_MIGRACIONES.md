# Verificación y aplicación de migraciones

## Objetivo

Comprobar que una base tenga todas las migraciones del repositorio y aplicar, en una sola
operación, las que le falten. Sirvió para validar la base nueva, copia de la anterior.

## Situación anterior

- Cada migración tenía su propio `npm run db:<nombre>` y no quedaba registro de cuáles se
  habían aplicado. Volver a ejecutarlas todas no es seguro: tres fallan sobre una base ya migrada.
- La base de pruebas no aplicaba cinco migraciones: `pausa-actividades`,
  `fechas-con-zona-horaria`, `descripcion-publicacion-larga`, `nombres-archivos-utf8` e
  `historial-denuncias-resenas`.

## Cambios en el back

- `scripts/migraciones/orden.cjs`: orden de aplicación sobre una base vacía; clasifica las seis
  migraciones anteriores al esquema inicial (ya incluidas en él) y `estados-disputa`,
  reemplazada por `estados-por-ambito`.
- `scripts/migraciones/esquema.cjs`: lee la estructura del esquema `public`, arma en PGlite el
  esquema esperado registrando qué migración crea, cambia o retira cada elemento, y compara.
  Ignora las conversiones de tipo y los paréntesis, que cada versión de PostgreSQL escribe distinto.
- `npm run db:verificar-esquema`: compara la base de `back/.env` en modo de solo lectura.
- `npm run db:migrar`: aplica solo las migraciones pendientes en una transacción y vuelve a
  comparar; si queda alguna diferencia, deshace todo. `node scripts/migrar.cjs --verificar` simula.
- La base de pruebas aplica las cinco migraciones que faltaban (la de nombres de archivo, solo
  con el circuito de liquidaciones).
- `migrations/README.md` documenta el procedimiento.

## Pruebas

`npm run test:migraciones`: todo archivo de `migrations/` está clasificado; las consolidadas ya
están en el esquema inicial; la base de pruebas coincide con las migraciones y cubre las
entidades; `db:migrar` simula sin guardar, aplica solo lo que falta y no repite; lo retirado es
un error y lo ajeno, una advertencia; la misma expresión de PGlite y de Neon se compara igual; no
reaplica el esquema inicial.

## Verificación realizada

Build, `oxlint` y la suite completa del back. Sobre la base nueva, `db:verificar-esquema`
informó la tabla `metodo_pago` sin retirar (se retiró con `npm run db:retirar-metodo-pago`) y
después «Estructura completa».

## Compatibilidad y alcance

No cambia el esquema, la API ni el front. Cada migración nueva debe sumarse a `orden.cjs` y a la
base de pruebas; el test lo exige.
