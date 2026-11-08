# Verificación de integración local — 8 de noviembre de 2026

## Ramas y alcance

- Estado inicial: `main` en `d535824`, sin cambios locales pendientes.
- Se descargaron todas las referencias remotas y etiquetas.
- Se actualizó `main` por avance directo hasta `origin/main` (`eb0190a`).
- `codex/publicaciones-cuentas-bloqueadas` ya estaba incluida en ese `main`.
- Se integró `origin/fix/checklist-14-cancelaciones` (`a02395b`).
- Las demás ramas locales y remotas ya estaban contenidas en `main`.
- Respaldo local anterior a la integración: `codex/respaldo-pre-integracion-20261108`.
- No se realizó push, publicación, despliegue ni modificación de una base real.

## Correcciones durante la integración

- Los reembolsos manuales cargan el identificador del pago dentro de la
  transacción. La consulta bloqueada conserva las relaciones necesarias sin
  introducir un bloqueo sobre joins opcionales.
- La ejecución automática utiliza el identificador de pago cargado por el
  repositorio. Una respuesta pendiente no se presenta como devolución aprobada;
  se conserva su identificador externo para conciliación.
- No se aplica un reembolso a la reserva hasta que esté aprobado. La ejecución
  tampoco vuelve a iniciar un reembolso que ya esté en proceso.
- Las consultas de reclamos para participantes excluyen las notas `ADMIN`.
  La administración conserva acceso a esas notas.
- Las devoluciones manuales de reclamos y liquidaciones exigen una referencia
  antes de crear el reembolso; no se fabrica un comprobante a partir del ID.
- La conciliación usa actor nulo para una resolución externa, en lugar de
  referenciar un usuario inexistente con ID 0.

## Comprobaciones realizadas

| Comprobación | Resultado |
|---|---|
| Compilación del backend (`npm run build`) | Correcta |
| Revisión estática del backend (`npm run lint`) | Correcta |
| Dependencias del backend (`npm ls --depth=0`) | Sin faltantes ni versiones inválidas |
| Pruebas existentes del backend | 93 aprobadas |
| Pruebas nuevas de cancelaciones y devoluciones | 17 aprobadas |
| Compilación de producción del frontend | Correcta, con avisos de tamaño |
| Pruebas del frontend | 19 aprobadas |
| Jest CP-06, CP-07 y CP-08 | 23 aprobadas y 5 fallidas previamente documentadas |

Las 17 pruebas nuevas ejecutan consultas, relaciones y transacciones reales de
TypeORM sobre PostgreSQL embebido con PGlite. Se usa la interpretación de fechas
del controlador `pg` para conservar los días calendario en Argentina. Incluyen:

- migración repetible y conservación de reservas y pagos;
- reembolso manual idempotente y ejecución automática con pasarela sustituida;
- respuesta externa pendiente y rechazo de una aplicación prematura;
- devolución del 100 %, 50 % y 0 % en los límites de la política;
- privacidad de notas internas y denegación de acceso a terceros;
- exigencia de comprobante en devoluciones manuales;
- reclamo con devolución parcial sin cancelar la estadía;
- contracargo ganado o perdido, sin duplicar la disputa;
- arranque conjunto de los módulos y recorrido HTTP autenticado: solicitud,
  aprobación administrativa, devolución y liberación efectiva del calendario;
- respuestas 401 y 403 en las rutas administrativas según autenticación y rol.

Para ejecutar la suite nueva desde `back`:

```sh
npm run test:cancelaciones-devoluciones
```

## Cinco resultados previos pendientes

Los archivos de estas pruebas y el código de autenticación y DTOs de títulos
coinciden con `origin/main`: estos resultados no fueron introducidos por el merge.
Se conservan las pruebas y sus expectativas originales.

1. CP-06: el backend acepta un título compuesto solo por un espacio.
2. CP-06: acepta el título de cuatro caracteres `hola`.
3. CP-06: acepta la cadena de símbolos que el caso espera rechazar.
4. CP-06: acepta la cadena de emojis que el caso espera rechazar.
5. CP-08: una cuenta sin verificar recibe correctamente 403 y no obtiene token,
   pero el mensaje es «Tenés que verificar tu email antes de iniciar sesión»;
   el caso exige «Tu cuenta esta inactiva».

Estos casos figuran con resultado positivo de detección en
`Casos de pruebas_Actividad IA VS Tester.md`. La integración no queda con toda
la suite Jest en verde.

## Avisos y límites

- El frontend genera 608,79 kB iniciales frente al aviso de 500 kB. El estilo
  del detalle de publicación genera 13,91 kB frente al aviso de 12 kB. Ambos
  permanecen debajo de los límites que impiden compilar; ya existían avisos
  antes de esta integración.
- La migración de cancelaciones se verificó únicamente sobre una base temporal.
  Falta aplicarla de forma explícita al entorno donde se vaya a ejecutar esta
  versión, siguiendo `back/migrations/README.md`.
- Se sustituyeron correo, almacenamiento y pasarela externos en las pruebas.
  No se verificaron cobros, devoluciones, entrega de correos ni carga de
  evidencias contra los servicios reales, ni se hizo una revisión visual en
  navegador. Las pruebas embebidas tampoco prueban concurrencia entre
  conexiones PostgreSQL independientes.
