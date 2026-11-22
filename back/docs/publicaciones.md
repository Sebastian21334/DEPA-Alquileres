# Ciclo de vida de las publicaciones

Una publicación no tiene una columna `estado` ni una máquina de estados
persistida. Su situación se deriva de `activa`, `eliminada` y
`motivo_baja_admin`, y de las condiciones de la cuenta del anunciante y de su
galería. T27 agrega la reactivación administrativa y el filtro por estado del
listado del admin. No agrega columnas, estados persistidos ni migración.

## 1. Campos que intervienen

| Campo | Tabla | Efecto |
| --- | --- | --- |
| `activa` | `publicacion` | Indica si el anunciante publicó el aviso. Nace en `false` y pasa a `true` cuando se guarda la primera imagen. |
| `eliminada` | `publicacion` | Marca la papelera. No borra la fila, las imágenes ni las reservas. |
| `motivo_baja_admin` | `publicacion` | Texto libre de hasta 500 caracteres. Distinto de `null` identifica una baja administrativa. |
| `usuario.activa` | `usuario` | La baja de cuenta desactiva sus publicaciones en la misma transacción. |
| `usuario.bloqueado` | `usuario` | No cambia `activa`; la publicación deja de ser visible mientras la cuenta está bloqueada. |
| `anunciante.actividades_pausadas` | `anunciante` | No cambia `activa`; el catálogo excluye al anunciante mientras la pausa está activa. |
| `imagen` | `imagen` | Sin al menos una imagen, `esVisible` devuelve `false` y el catálogo no muestra la publicación. |

No hay columnas de fecha de baja, administrador que la aplicó ni historial de
motivos.

## 2. Situaciones derivadas

| Situación | Condición | Visible | Cómo se revierte |
| --- | --- | --- | --- |
| Publicada | `activa = true`, `eliminada = false`, sin motivo, cuenta habilitada, actividades no pausadas y al menos una imagen | Sí | — |
| Pausada por el anunciante | `activa = false`, `eliminada = false` y sin motivo | No | El anunciante la activa con `PATCH /publicaciones/:id` y `activa=true`, si tiene imágenes y la cuenta está habilitada; si no, sube la primera |
| Papelera | `eliminada = true` | No | El anunciante la restaura con `PATCH /publicaciones/:id/restaurar`; vuelve inactiva |
| Baja administrativa | `motivo_baja_admin` distinto de `null` | No | Solo el administrador con `PATCH /publicaciones/administracion/:id/reactivar` |
| Oculta por cuenta | `usuario.activa = false`, `usuario.bloqueado = true` o `anunciante.actividades_pausadas = true` | No | Se revierte la causa en la cuenta o en la pausa de actividades |
| Sin imágenes | Galería vacía, con `activa` en `true` o `false` | No | El anunciante sube una imagen |

Las situaciones se superponen. La papelera siempre deja `activa = false`, pero
conserva el motivo: una publicación que tenía baja administrativa y luego se
elimina sigue contando como baja. El motivo tiene prioridad para el filtro
`bajas`.

El caso sin imágenes es defensivo: el flujo normal activa la publicación recién
cuando se guarda la primera imagen. Una publicación puede quedar sin galería por
un alta incompleta o un fallo de subida; la regla de visibilidad la oculta con
independencia de `activa`. La reactivación administrativa sin imágenes deja
`activa = false` y el anunciante debe subir una foto para volver al catálogo.

La papelera es lógica: conserva imágenes, reservas y vínculos. La baja
administrativa tampoco cancela reservas ni libera fechas.

## 3. Regla de visibilidad

`esVisible` exige todas estas condiciones:

```ts
!eliminada
  && activa
  && usuario.activa === true
  && usuario.bloqueado === false
  && !motivo_baja_admin
  && imagenes.length > 0
```

La cuenta habilitada se evalúa con `cuentaAnuncianteHabilitada`, que exige
`usuario.activa === true` y `usuario.bloqueado === false`. La pausa de
actividades no forma parte de `esVisible`: se aplica como filtro propio en el
catálogo y en la lista pública por anunciante.

El catálogo paginado aplica los filtros equivalentes en SQL:

| Filtro del catálogo | Qué excluye |
| --- | --- |
| `publicacion.activa = true` | Publicaciones pausadas y dadas de baja |
| `publicacion.eliminada = false` | Papelera |
| `usuario.activa = true` | Cuentas dadas de baja |
| `usuario.bloqueado = false` | Cuentas bloqueadas |
| `anunciante.actividades_pausadas = false` | Anunciantes con actividades pausadas |
| `INNER JOIN publicacion.imagenes` | Publicaciones sin imágenes |

El catálogo no consulta `motivo_baja_admin`: la baja administrativa siempre
deja `activa = false`, así que la exclusión es equivalente. `esVisible` sí
comprueba el motivo de forma explícita.

## 4. Baja administrativa

Es la única operación que asigna un motivo de baja.

| Aspecto | Comportamiento |
| --- | --- |
| Ruta | `PATCH /publicaciones/administracion/:id/baja` |
| Acceso | Solo Administrador (`JwtAuthGuard` + `RolesGuard`) |
| Entrada | `motivo` obligatorio, recortado, entre 1 y 500 caracteres |
| Persistencia | `activa = false` y `motivo_baja_admin = motivo` |
| No modifica | `eliminada`, imágenes, reservas, fechas ni cuenta del anunciante |
| Correo | Envía el aviso de baja al contacto del anunciante |
| Respuesta | `{ publicacion, correoEnviado }` |

La baja queda aplicada aunque el correo falle. En ese caso el error se registra
y `correoEnviado` queda en `false`.

El anunciante no puede levantar la baja:

- `PATCH /publicaciones/:id` con `activa=true` responde 403.
- `marcarActiva` no activa una publicación con motivo de baja, ni siquiera al
  subir la primera imagen.
- `esVisible` devuelve `false`.
- `restaurar` no limpia el motivo: la publicación vuelve de la papelera con
  `activa = false` y sigue dada de baja.

El anunciante puede editar los demás campos o enviarla a la papelera; el motivo
se conserva.

## 5. Filtro del listado admin

`GET /publicaciones/administracion` acepta el parámetro `estado`. El endpoint
está restringido a Administrador. Sin parámetro se comporta como `todas`. El
filtro se resuelve en la consulta, junto con `q` y la paginación existentes.

| `estado` | Condición | Qué muestra |
| --- | --- | --- |
| `todas` | Sin filtro | Todo, incluidas bajas y papelera |
| `activas` | `activa = true` y `motivo_baja_admin IS NULL` | Publicaciones activas sin baja administrativa |
| `inactivas` | `activa = false` y `motivo_baja_admin IS NULL` | Pausadas, papelera y publicaciones de cuentas dadas de baja (la baja de cuenta las desactiva) |
| `bajas` | `motivo_baja_admin IS NOT NULL` | Bajas administrativas, aunque la publicación esté eliminada |

`bajas` tiene prioridad de clasificación: una publicación eliminada que
conserva motivo aparece en ese filtro. `inactivas` no incluye bajas porque exige
`motivo_baja_admin IS NULL`.

El filtro agrupa por las columnas, no por la visibilidad completa. Una cuenta
bloqueada o con actividades pausadas no cambia `activa`: sus publicaciones
pueden seguir apareciendo en `activas` aunque el catálogo no las muestre. La
baja de cuenta sí las desactiva y por eso cae en `inactivas`.

El listado general (`todas`) sigue mostrando todo. La decisión de no ocultar las
bajas se explica en la sección 8.

## 6. Reactivación

| Aspecto | Comportamiento |
| --- | --- |
| Ruta | `PATCH /publicaciones/administracion/:id/reactivar` |
| Acceso | Solo Administrador (`JwtAuthGuard` + `RolesGuard`) |
| Publicación inexistente | 404 |
| Publicación en la papelera | 409; no se reactiva |
| Publicación sin motivo de baja | 409; no hay nada que reactivar |
| Cambio concurrente | 409; otro pedido modificó la publicación |
| Motivo | Se limpia (`motivo_baja_admin = null`) |
| `activa` | `true` si tiene al menos una imagen; `false` si no tiene |
| Respuesta | La publicación actualizada, con `motivo_baja_admin = null` y `activa` recalculada |
| Correo | No se envía |
| Historial | No se registra |
| Reservas y cuenta | No se modifican |

La reactivación no exige imágenes para completarse. Si la publicación no tiene
ninguna, deja de ser una baja administrativa pero queda inactiva y no aparece
en el catálogo hasta que el anunciante suba una imagen. Si tiene imágenes pero
la cuenta está oculta, `activa = true` no alcanza para el catálogo: la
visibilidad sigue dependiendo de la cuenta y de la pausa de actividades.

El motivo anterior se pierde al reactivar. La operación no es idempotente: una
segunda llamada sobre la misma publicación responde 409 porque ya no tiene
motivo de baja. El anunciante no tiene una ruta equivalente: la reactivación de
una baja administrativa es exclusiva del administrador.

## 7. Deuda declarada

| Deuda | Consecuencia |
| --- | --- |
| Sin historial de motivos | Cada baja sobrescribe el motivo anterior; no se puede consultar el anterior |
| Sin fecha de baja | No se puede ordenar ni auditar por fecha de baja |
| Sin actor | No se registra qué administrador aplicó la baja |
| Sin correo de reactivación | El anunciante no recibe aviso cuando se reactiva la publicación |
| Sin migración | Todo el ciclo se apoya en columnas existentes; no hay cambios de esquema |

No hay tabla de auditoría ni columnas nuevas para cubrir estas deudas.

## 8. Divergencia con el testing

El testing exploratorio pidió que las publicaciones dadas de baja no aparezcan
en el listado general del admin. La decisión del Paquete 4 es no ocultarlas: el
listado general sigue mostrando todo y el administrador usa el filtro
`estado=bajas` para encontrarlas. La diferencia es deliberada; el criterio de
aceptación original se reemplaza por el filtro por estado.

## 9. Deudas preexistentes

Estas deudas no las introduce T27 y no se corrigen en este alcance:

- **`EntityManager` en `PublicacionesService`**: el service importa el tipo de
  TypeORM y lo recibe en los métodos que participan de transacciones. Es deuda
  declarada en `../../docs/arquitectura.md` §9.
- **Consulta a `Reserva` desde `PublicacionesRepository`**: el repositorio
  inyecta `Repository<Reserva>` y consulta esa tabla para `existeReserva` y para
  calcular `cantidad_reservas`. Es acceso cruzado declarado en
  `../../docs/arquitectura.md` §9.

T27 no agrega usos nuevos de `EntityManager` ni consultas a tablas de otros
módulos.
