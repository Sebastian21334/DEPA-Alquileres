# Reseñas de publicaciones y perfiles

> Documento funcional del módulo `back/src/resenas`. Última revisión: 27/11/2026.

## 1. Alcance

El módulo es independiente de `publicaciones` y `anunciantes`. Una reseña apunta a
**una** publicación **o** a **un** perfil de anunciante, nunca a ambos. La misma
lógica de autoría, moderación y promedio aplica a los dos objetivos.

- Puntaje entero de 1 a 5 estrellas.
- Comentario obligatorio de hasta 200 caracteres.
- Hasta 3 imágenes por reseña.
- Una sola reseña por autor y objetivo, aunque esté oculta.
- Sin respuestas del anunciante en esta versión.
- Solo se reseñan publicaciones **Temporales**; las de Largo Plazo no admiten
  reseñas ni muestran promedio. Un perfil de anunciante se puede reseñar solo
  con una estadía terminada en una publicación Temporal del anunciante.

## 2. Reglas

### Quién puede reseñar

- Solo una cuenta autenticada con una **estadía finalizada**:
  - para una publicación **Temporal**, una reserva pagada, no cancelada y con
    `fecha_fin` anterior a hoy en Argentina;
  - para un perfil, una estadía finalizada en **cualquier publicación Temporal**
    del anunciante.
- El dueño de la publicación o del perfil no puede reseñarse a sí mismo.
- Si ya existe una reseña del mismo autor para el objetivo, la API responde
  `409`. El autor debe editar la existente.

### Autor y administración

- El autor puede editar su reseña y eliminarla.
- Una reseña oculta por moderación no se puede editar; el autor solo puede
  eliminarla.
- El administrador puede ocultarla con un motivo de 5 a 300 caracteres y
  restaurarla. La moderación queda auditada con `moderada_por` y
  `fecha_moderacion`.
- Las reseñas ocultas no se listan públicamente ni suman al promedio.
- Cualquier usuario autenticado, salvo el autor, puede **denunciar** una reseña
  como inapropiada. La reseña sigue visible y sin estado público; el
  administrador la ve como “Denunciada” y puede **quitar la denuncia** o
  **ocultarla**.
- La denuncia se guarda con `denunciada_por`, `motivo_denuncia` y
  `fecha_denuncia`. La primera denuncia define el estado; las siguientes son
  idempotentes.
- El DTO público incluye el booleano `denunciada` **solo** para deshabilitar la
  acción “Marcar como inapropiada” en el menú de la reseña. No se renderiza
  como estado, no muestra “En revisión” y el motivo/fecha quedan reservados a la
  respuesta administrativa.

## 3. Modelo

### `resena`

| Columna | Regla |
|---|---|
| `id_resena` | PK |
| `id_usuario` | autor, FK a `usuario` |
| `id_publicacion` | objetivo publicación, nullable |
| `id_anunciante` | objetivo perfil, FK a `anunciante(id_usuario)`, nullable |
| `puntaje` | `smallint` entre 1 y 5 |
| `comentario` | `varchar(200)` |
| `fecha`, `actualizada_en` | `timestamptz` |
| `visible` | `true` por defecto |
| `motivo_moderacion`, `moderada_por`, `fecha_moderacion` | auditoría de moderación |
| `denunciada`, `motivo_denuncia`, `denunciada_por`, `fecha_denuncia` | denuncia de usuario |

- `CHECK` exige exactamente un objetivo.
- Índices únicos parciales por `(objetivo, autor)`.
- `resena_imagen(id_resena_imagen, id_resena, url, orden)` con cascada.

### Cachés derivadas

`publicacion` y `anunciante` tienen `cantidad_resenas` y `promedio_resenas`.
`ResenasResumenService` es el único escritor: recalcula el resumen de todas las
reseñas visibles después de crear, editar, borrar, ocultar o restaurar. El
promedio se guarda con dos decimales y es `null` cuando no hay reseñas; el
frontend muestra estrellas solo si `cantidad_resenas > 0`.

La caché es derivada y eventual: si el segundo statement de actualización falla,
la fila de la reseña ya quedó confirmada y el promedio puede quedar desfasado
hasta la próxima operación que lo recalcule. La migración y el seed reconstruyen
ambas cachés con un backfill. No se abre una transacción cruzada entre
`resenas`, `publicaciones` y `anunciantes`.

## 4. Endpoints

| Método | Ruta | Acceso |
|---|---|---|
| `GET` | `/publicaciones/:id/resenas` | público, JWT opcional |
| `POST` | `/publicaciones/:id/resenas` | JWT |
| `GET` | `/anunciantes/:id/resenas` | público, JWT opcional |
| `POST` | `/anunciantes/:id/resenas` | JWT |
| `PATCH` | `/resenas/:id` | JWT, autor |
| `DELETE` | `/resenas/:id` | JWT, autor |
| `POST` | `/resenas/:id/imagenes` | JWT, autor, multipart `archivo` |
| `DELETE` | `/resenas/:id/imagenes/:idImagen` | JWT, autor |
| `POST` | `/resenas/:id/denunciar` | JWT, usuario distinto del autor |
| `GET` | `/administracion/resenas` | JWT + Administrador; `estado`, `q` por ID |
| `PATCH` | `/administracion/resenas/:id/visibilidad` | JWT + Administrador |
| `DELETE` | `/administracion/resenas/:id/denuncia` | JWT + Administrador |

La respuesta pública incluye `promedio`, `cantidad`, `distribucion`, la página de
reseñas visibles, `puedeResenar`, `motivoNoPuede` y `miResena` (incluye las
ocultas del propio autor). La reseña propia se excluye del arreglo `resenas` y
de `total`/paginación para no contarla dos veces; se muestra en `miResena`. El
autor se expone solo con nombre, apellido y foto; nunca email, teléfono ni
documentos.

## 5. Imágenes

- Máximo 3 por reseña, 10 MB por archivo.
- JPEG, PNG, WEBP, HEIC o HEIF; el servidor valida la firma real con Sharp y
  normaliza a JPEG de 1600 px.
- Se guardan en el contenedor público `imagenes`, carpeta `resenas/`.
- Borrar una imagen elimina primero la fila y después el blob en modo
  best-effort. Si el storage falla, la baja igual queda confirmada y el error se
  registra en el log.
- Borrar la reseña confirma primero la baja de la fila (las imágenes caen por
  cascada) y después limpia los blobs en modo best-effort; un fallo de Azure no
  revierte la operación.

## 6. Migración y datos demo

Con el backend detenido y sobre una base descartable:

```sh
cd back
npm run db:resenas          # aplica 20261126-resenas.sql
npm run db:datos-resenas    # carga usuarios, publicaciones, estadías y reseñas demo
```

`db:datos-resenas` es idempotente y solo permite hosts locales por defecto. Para
una base remota exige `DEPA_PERMITIR_DEMO_REMOTA=si`; no debe usarse sobre Neon
sin confirmación y respaldo. La contraseña demo se imprime al finalizar.

La migración agrega columnas y tablas, elimina las reseñas asociadas a
publicaciones de Largo Plazo y recalcula las cachés desde las reseñas visibles.
Es idempotente. En Neon no hay reseñas activas al aplicar esta versión.

## 7. Verificación

```sh
cd back
npm run lint
npm run build
npm run test:resenas
npm run test:perfil-anunciante-publico
npm run test:condiciones-economicas
```

El test de reseñas cubre DTO, reglas de autoría y objetivo, largo plazo,
denuncias, moderación, límite de imágenes, duplicados, borrado fila→blob,
paginación fuera de rango, visibilidad de publicaciones, guards y la migración
real sobre PGlite. La suite administrativa vive en
`test/resenas-administracion.test.cjs`; `npm run test:resenas` ejecuta ambas. El
frontend se verifica con `npm run build`, `npm run test:resenas` y la prueba
manual en escritorio y móvil. La moderación se usa dentro de `/admin#resenas`,
en la sección “Reseñas” de Gestión.
