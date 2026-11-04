## Verificación del rendimiento de búsquedas — RNF8

### Objetivo y alcance

La verificación de RNF8 tiene como objetivo comprobar que la API de búsqueda
responda en un tiempo máximo de dos segundos con diez usuarios concurrentes.
El conjunto preparado contiene 1.018 publicaciones visibles: 18 restauradas
desde una copia de la base y 1.000 ficticias agregadas para las pruebas. Se
documenta este volumen real, superior a las 1.000 publicaciones previstas en
el requisito.

La medición corresponde a `GET /publicaciones`, desde el envío de la solicitud
HTTP hasta la recepción completa del JSON. Se utiliza `http_req_duration` de k6,
que incluye envío, espera y recepción, pero excluye DNS, establecimiento de
conexión y TLS. El tiempo incluye la comunicación con la API; no representa
únicamente el procesamiento interno del servidor. No se mide el renderizado de
la pantalla ni la descarga de imágenes.

### Entorno de ejecución

| Componente | Configuración |
| --- | --- |
| Fecha, horario y zona horaria | 02/11/2026; respuestas medidas entre 21:19:58 y 23:10:38 (America/Buenos_Aires); incluye la incidencia documentada |
| Equipo generador de carga | AMD Ryzen 5 3500U; 13,94 GB de RAM; Windows NT 10.0.26200.0 |
| Conexión del generador | [Tipo de conexión y condiciones de red] |
| Herramienta | Grafana k6 v2.3.0, Windows amd64 |
| Backend | Azure App Service Basic B1: 1 núcleo y 1,75 GB de RAM; confirmar el plan utilizado al medir |
| Configuración de Azure | Sistema operativo: [completar]; región: [completar]; instancias: [completar]; Always On: [completar] |
| Base de datos | PostgreSQL en Neon; versión: 18.6 (fd34222); plan y recursos: [completar]; región: [completar] |
| Conexiones a la base | Pool del backend: El código local no define tamaño de pool; confirmar la configuración efectiva de la versión desplegada |
| Aplicación evaluada | https://depa-alquileres-auepdya0fqgsfwhx.brazilsouth-01.azurewebsites.net; commit desplegado pendiente de confirmar |
| Scripts utilizados | [Enlace permanente en GitHub al script y al commit ejecutado] |

k6 se ejecuta en el equipo generador y envía solicitudes al backend publicado
en Azure, conectado a la base de pruebas de Neon. Los datos y la configuración
del entorno deben mantenerse sin modificaciones durante las repeticiones. La
comprobación posterior detectó diferencias respecto del manifiesto de creación
en las tablas originales publicacion y usuario, sin determinar cuándo ocurrieron.
Esta limitación se registra en el informe de resultados. No se
realizan simultáneamente otras pruebas de carga, cargas de imágenes o procesos
de verificación facial. El ensayo corresponde al servicio activo después del
calentamiento; los arranques en frío se registran por separado si se evalúan.

### Procedimiento y escenarios

Se simulan diez usuarios virtuales en paralelo. Cada uno envía una búsqueda,
espera su respuesta y realiza una pausa de un segundo antes de la siguiente
consulta. Los usuarios virtuales no requieren cuentas porque el endpoint es
público. Esta configuración no equivale a diez solicitudes por segundo.

| Escenario | Operaciones evaluadas |
| --- | --- |
| E1 — Listado y paginación | Listado sin filtros, página inicial, página 25 y última página. |
| E2 — Ubicación | Provincia, provincia y ciudad combinadas, páginas intermedias y ubicación sin coincidencias. |
| E3 — Filtros combinados | Tipo de propiedad, moneda, rango de precios, ambientes y superficie mínima, incluyendo una consulta sin coincidencias. |
| E4 — Texto y ordenamiento | Búsqueda textual con orden de precio ascendente o descendente, páginas intermedias y texto sin coincidencias. |

Las páginas contienen hasta doce publicaciones. Las URLs, valores de filtros,
páginas, totales e identificadores esperados se fijan antes de la carga mediante
consultas SQL de control independientes del endpoint y se conservan en
`config-rnf8.json`. Las variantes se alternan de manera reproducible. El listado
general consulta las 1.018 publicaciones; algunas búsquedas de texto se
restringen al lote de 1.000 publicaciones ficticias.

Cada escenario se ejecuta tres veces. Antes de cada medición se realiza un
minuto de calentamiento con diez usuarios. A continuación se miden cinco
minutos con la misma concurrencia. Ambas fases se ejecutan sucesivamente y sus
resultados se almacenan por separado. Se completan doce ejecuciones medidas,
con una duración total prevista de 72 minutos, más preparación y cierre de
solicitudes pendientes.

En cada respuesta se verifica el estado HTTP, estructura, paginación, cantidad,
identificadores y orden de los resultados, además de que las publicaciones estén
activas y tengan imágenes asociadas. La comprobación corta de instalación no
forma parte de las mediciones oficiales.

### Criterio de aceptación

RNF8 se considera cumplido en el entorno documentado cuando las doce
ejecuciones finalizan correctamente, todas las variantes reciben solicitudes,
ninguna respuesta medida supera 2.000 ms y no existen errores HTTP, de conexión,
tiempos de espera agotados ni fallos en las validaciones de resultados.

El promedio y el percentil 95 (P95) se informan como datos complementarios;
no reemplazan el límite máximo. Los resultados que excedan el límite o
presenten errores se conservan y se incluyen en la evaluación.

### Resultados de la medición oficial

Se completaron doce mediciones válidas sobre 1018 publicaciones visibles y diez usuarios concurrentes. El calentamiento queda excluido.

| Ejecución | Solicitudes | Promedio (ms) | P95 (ms) | Máximo (ms) | Errores | Fallos de validación | Resultado |
| --- | --- | --- | --- | --- | --- | --- | --- |
| E1 — 1 | 1926 | 550,01 | 680,75 | 1.881,58 | 0 | 0 | Aprueba |
| E1 — 2 | 1927 | 551,98 | 714,30 | 2.566,94 | 0 | 0 | No aprueba |
| E1 — 3 | 1960 | 524,32 | 658,36 | 1.943,64 | 0 | 0 | Aprueba |
| E2 — 1 | 1981 | 507,89 | 646,93 | 1.465,42 | 0 | 0 | Aprueba |
| E2 — 2 | 1997 | 497,75 | 649,83 | 1.657,51 | 0 | 0 | Aprueba |
| E2 — 3 | 2009 | 487,77 | 637,20 | 1.910,10 | 0 | 0 | Aprueba |
| E3 — 1 | 2010 | 487,73 | 660,73 | 2.483,61 | 0 | 0 | No aprueba |
| E3 — 2 | 2016 | 482,99 | 644,85 | 1.531,12 | 0 | 0 | Aprueba |
| E3 — 3 | 2013 | 488,41 | 646,02 | 1.983,30 | 0 | 0 | Aprueba |
| E4 — 1 | 1800 | 661,73 | 958,30 | 1.613,61 | 0 | 0 | Aprueba |
| E4 — 2 | 1730 | 727,59 | 1.051,38 | 10.020,66 | 2 | 8 | No aprueba |
| E4 — 3 | 1806 | 655,39 | 995,88 | 2.374,76 | 0 | 0 | No aprueba |

### Evidencia, incidencias y conclusión

RNF8 no se cumple en el ensayo realizado: 4 de 12 mediciones no aprobaron. Se registraron 26 respuestas por encima de 2.000 ms, un máximo de 10.020,66 ms y 2 solicitudes con error. No se modifica el criterio de aceptación para interpretar el resultado.

La ejecución original E1-3 se conserva como incidencia por la pausa prolongada previa a medir. Su repetición reemplaza esa fila en los resultados consolidados. Los archivos originales no se borraron.

El detalle del entorno, los errores, la correspondencia de fuentes y la evidencia se encuentra en [RESULTADOS_RNF8_20261102.md](RESULTADOS_RNF8_20261102.md). Completar los campos pendientes del entorno y agregar los enlaces o anexos de resultados.csv, resultados.json, entorno.json, config-rnf8.json, muestras y registros de consola de ambas carpetas.
