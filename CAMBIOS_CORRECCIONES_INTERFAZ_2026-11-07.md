# Correcciones de interfaz y carga de imágenes

**Fecha:** 7 de noviembre de 2026.

Esta entrega reúne las correcciones de fondos, la visibilidad de reservas recibidas,
la optimización de fotos pequeñas del inicio y la paginación del perfil público del
anunciante. Los cambios se concentran en el frontend y su configuración de Vercel.

## Resumen

| Área | Resultado |
| --- | --- |
| Verificación de cuenta y contraseñas | Las tres pantallas que tenían un fondo sin foto usan la imagen compartida de autenticación. |
| Mis reservas | La pestaña, el contador y la consulta de reservas recibidas corresponden únicamente a anunciantes aprobados. |
| Tarjetas del inicio | Las fotos pequeñas solicitan versiones de menor tamaño según la pantalla. |
| Perfil del anunciante | Las publicaciones se muestran de a seis, con navegación y página guardada en la URL. |

## 1. Fondos de las pantallas de autenticación

Se incorporó la imagen compartida `--auth-bg-image`, que apunta a
`/images/login-bg.webp`, en estas rutas:

- `/verificar-cuenta`.
- `/recuperar-contrasenia`.
- `/restablecer-contrasena`.

Se usa el mismo sombreado que en inicio de sesión y registro, con la imagen
centrada, cubriendo el fondo y sin repetirse. El sombreado mantiene la legibilidad
del contenido. También se actualizó el comentario de la variable global para
indicar que pertenece al conjunto de pantallas de autenticación.

Se revisaron los fondos de inicio, login y registro. El cambio de esta sección
reutiliza la imagen existente y conserva la lógica de verificación y recuperación.

**Archivos principales:** los tres componentes de autenticación afectados y
`front/src/styles.css`.

## 2. Reservas recibidas únicamente para anunciantes

Antes, cualquier cuenta autenticada veía la opción “Reservas recibidas” y la
pantalla realizaba esa consulta aunque la cuenta fuera solamente de inquilino.

Ahora se consulta `PerfilService.esAnunciante()` y se utiliza el estado
`esAnuncianteVerificado`, igual que en el menú y los accesos de anunciante. La
condición es tener una solicitud aprobada; el nombre del rol del usuario por sí
solo no habilita esta opción.

- El inquilino ve sus reservas realizadas y un resumen de una sola columna.
- Una solicitud de anunciante pendiente todavía no habilita las reservas recibidas.
- El anunciante aprobado conserva ambas vistas y sus contadores.
- Para las cuentas que no cumplen la condición se omite la petición de reservas recibidas.
- El texto de presentación se adapta al tipo de cuenta.
- La vista de reservas realizadas se mantiene disponible si cambia el estado de anunciante.

El visitante sin sesión conserva la redirección existente al inicio de sesión.

**Archivos principales:**
`front/src/app/features/mis-reservas/mis-reservas.component.ts`, `.html` y `.scss`.

## 3. Fotos pequeñas del inicio

El alcance corresponde exclusivamente a las fotos de las tarjetas de propiedades
del inicio. Se observaron tarjetas de aproximadamente 280 píxeles que descargaban
fotos de hasta 1600 píxeles de ancho.

Se agregó la opción `miniaturaInicio` al componente compartido de tarjeta y se
activó desde la pantalla de inicio. En producción, esa opción prepara solicitudes
al optimizador de imágenes de Vercel:

- Anchos disponibles: 320, 640 y 1024 píxeles.
- Calidad configurada: 70.
- Formato optimizado habilitado: WebP.
- Selección de tamaño mediante `srcset` y `sizes`, de acuerdo con las columnas del inicio.
- Dimensiones explícitas en las fotos del inicio para reservar su proporción.
- Se conserva la carga diferida y se incorpora decodificación asíncrona.
- Ante un error del optimizador, la tarjeta vuelve a intentar con la foto original.

Las fotos completas del detalle, la portada del inicio y los fondos conservan sus
archivos y calidad. Las otras pantallas que reutilizan las tarjetas mantienen la
optimización desactivada por defecto.

La configuración se agregó tanto a `vercel.json` como a `front/vercel.json`, para
contemplar las dos ubicaciones de configuración presentes en el proyecto. Solo
se permiten fotos públicas de publicaciones del almacenamiento Azure existente,
incluido el catálogo de prueba RNF8. Los enlaces firmados, las rutas de documentos
privados y los servidores externos quedan fuera del optimizador. La caché mínima
configurada es de 24 horas.

En desarrollo se conserva la URL original, ya que el servidor local de Angular
no dispone del optimizador de Vercel.

**Archivos principales:** el componente `listing-card`, la plantilla de inicio,
`front/src/app/shared/utils/home-card-image.ts` y las dos configuraciones de Vercel.

**Lighthouse:** se recibió un informe previo con Performance 53 y LCP de 17 segundos.
No se ejecutó una nueva medición después de estos cambios. Las cinco pruebas
automatizadas comprueban la generación de URLs, los tamaños y las restricciones
de origen; el servicio de optimización real debe comprobarse tras el despliegue.
El informe previo por sí solo no demuestra cuánto mejorará el puntaje.

## 4. Paginación del perfil público del anunciante

En `/perfil/:id`, la lista se muestra en páginas de seis publicaciones.

- Controles “Anterior” y “Siguiente”, deshabilitados en los extremos.
- Indicador “Página X de Y” y rango “Mostrando X–Y de Z publicaciones”.
- El total de propiedades del perfil representa todas las publicaciones activas,
  independientemente de la página visible.
- La página se guarda en el parámetro `pagina`; por ejemplo, `/perfil/7?pagina=2`.
- La navegación conserva los demás parámetros de la dirección y permite usar el historial del navegador.
- Las páginas inválidas se ajustan a un valor válido para la visualización.
- Al cambiar de página se lleva la vista al encabezado de las publicaciones.
- Con seis publicaciones o menos, los controles de paginación se ocultan.
- Se liberan las suscripciones al abandonar el componente.

La paginación se realiza en el frontend sobre el listado que ya devuelve la API.
La consulta existente sigue obteniendo todas las publicaciones activas del
anunciante; este cambio limita las tarjetas mostradas, no el tamaño de esa respuesta.

**Archivos principales:**
`front/src/app/features/advertiser-profile/advertiser-profile.component.ts`, `.html` y `.scss`.

## 5. Verificaciones realizadas

| Comprobación | Resultado |
| --- | --- |
| Compilación de producción del frontend después de los cambios de paginación | Correcta. |
| Pruebas de fotos del inicio | 5 aprobadas. |
| Fondos de autenticación e inicio | Revisados en escritorio y en un tamaño de navegador móvil. |
| Mis reservas | Comprobado como inquilino, anunciante pendiente, anunciante aprobado y visitante sin sesión. |
| Perfil con 14 publicaciones | Páginas de 6, 6 y 2 tarjetas, con sus enlaces correspondientes. |
| Navegación del perfil | Probados avance, regreso, historial, acceso por URL y páginas fuera de rango. |
| Perfil con 6 y con 0 publicaciones | Sin paginador; el caso vacío conserva el mensaje de perfil no disponible. |
| Perfil a 320 píxeles de ancho | Controles utilizables y sin desborde horizontal después de las animaciones. |
| Revisión del diff | Sin errores de espacios detectados por `git diff --check`. |

La compilación conserva avisos por el tamaño del paquete inicial (600,27 kB frente
a un umbral de aviso de 500 kB) y de los estilos del detalle de publicación
(13,91 kB frente a un umbral de aviso de 12 kB). Estos avisos no impidieron compilar.

Para ejecutar las pruebas de imágenes desde la raíz:

```sh
npm --prefix front run test:imagenes-inicio
```

La vista local de prueba permite reproducir los casos sin escribir en la API:

```sh
npm --prefix front run preview:responsive
```

Ejemplos en `http://localhost:4318`:

- `/mis-reservas?rol=Usuario&anunciante=no`.
- `/mis-reservas?rol=Usuario&anunciante=pendiente`.
- `/mis-reservas?rol=Usuario` para el anunciante aprobado de prueba.
- `/mis-reservas?sesion=no` para comprobar la redirección del visitante.
- `/perfil/7?publicacionesPerfil=14&pagina=2`.
- `/perfil/7?publicacionesPerfil=0`.

Los parámetros nuevos de prueba se documentaron en `front/test/RESPONSIVE.md`.

## 6. Finalización automática de estadías: funcionalidad existente revisada

Se comprobó que ya estaba implementada en el commit `f1a3a62`, del 4 de noviembre
de 2026, cuyo autor registrado es “Seba Laptop”. Esta entrega no modifica esa lógica.

El backend revisa al iniciar y cada minuto las reservas aprobadas, no canceladas,
con fechas válidas e ingreso validado. La finalización corresponde después del
último día de reserva según la fecha de Argentina. Si no se validó el ingreso,
el estado pasa a `INGRESO_NO_VERIFICADO`.

La compilación del backend y las tres pruebas existentes de finalización fueron
correctas. Esa revisión fue local; no se comprobó qué versión del backend está
desplegada en Azure.

## 7. Publicación y alcance de la entrega

Esta entrega no agrega dependencias ni requiere cambios de base de datos o
migraciones. Los cambios funcionales corresponden al frontend y a la
configuración de imágenes del hosting.

Después del despliegue del frontend corresponde comprobar que las solicitudes a
`/_vercel/image` devuelvan imágenes optimizadas y repetir Lighthouse en las mismas
condiciones que el informe anterior. La subida al repositorio y la finalización
del despliegue son estados distintos; este documento no certifica un despliegue
terminado ni un nuevo puntaje de rendimiento.
