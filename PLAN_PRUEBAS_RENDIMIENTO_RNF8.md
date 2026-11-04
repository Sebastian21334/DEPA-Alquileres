# Plan de pruebas de rendimiento de búsquedas — RNF8

**Proyecto:** DEPA — Seminario Integrador 2026  
**Fecha:** 02/11/2026  
**Estado:** protocolo ejecutado el 02/11/2026. Se completaron doce mediciones
válidas; ocho aprobaron y cuatro no. Véase
[RESULTADOS_RNF8_20261102.md](RESULTADOS_RNF8_20261102.md).
El resto de este documento conserva el procedimiento previsto; los valores
reales y las incidencias constan en el informe de resultados.

**Ejecución:** los scripts y pasos están en
[back/performance/README.md](back/performance/README.md). El backend se evaluará
en Azure App Service Basic B1, según el entorno previsto por el equipo.

**Actualización de preparación:** se restauró una copia de la base y se agregaron
1.000 publicaciones ficticias nuevas, conservando las 18 anteriores. El volumen
actual es de 1.018 publicaciones en la base; se debe registrar también cuántas
son visibles en el catálogo al ejecutar cada ensayo. El detalle del lote y su
limpieza se encuentra en [DATOS_PRUEBA_RNF8.md](DATOS_PRUEBA_RNF8.md).

## 1. Objetivo

Verificar que la API de búsqueda responda en un tiempo máximo de **dos segundos**,
con una base de **1.000 publicaciones** y **10 usuarios virtuales concurrentes**.

La evaluación abarcará el listado, la combinación de filtros, la búsqueda por
texto, el ordenamiento y la paginación. Este documento describe la preparación,
ejecución, criterio de aprobación y evidencia que se incorporará al informe final.

## 2. Requisito evaluado y punto de medición

**RNF8 — Rendimiento de búsquedas**

La API de búsqueda deberá responder en un tiempo máximo de dos segundos, con
1.000 publicaciones y 10 usuarios concurrentes, para los escenarios y el entorno
definidos en este protocolo. Se medirá desde el envío de la solicitud HTTP hasta
la recepción completa de su respuesta, sin incluir la presentación de resultados
ni la descarga de imágenes.

Se evaluará el endpoint público `GET /publicaciones`, con páginas de hasta
12 publicaciones, como utiliza actualmente la pantalla de exploración.

El punto de observación será el equipo que ejecute k6. Se utilizará la métrica
`http_req_duration`, que incluye envío, espera y recepción del cuerpo de la
respuesta. Por lo tanto, contempla el trabajo del backend y la base de datos,
además de la transferencia entre el generador de carga y la API. No representa
únicamente el tiempo interno de ejecución del servidor.

Se excluyen la resolución DNS, el establecimiento inicial de conexión y TLS,
el procesamiento y renderizado del frontend, y la descarga de las imágenes.
Las URLs y los datos de imágenes incluidos en el JSON sí forman parte de la
respuesta medida. Los tiempos de conexión podrán conservarse como información
complementaria, pero no formarán parte del límite definido para RNF8.

## 3. Preparación de la base de datos

El responsable del proyecto creará una **base PostgreSQL exclusiva para pruebas**
y cargará los registros necesarios para el funcionamiento de la página.

Se utilizará el mismo esquema, relaciones, restricciones e índices de la versión
de la aplicación que se evaluará. La instancia del backend de prueba se conectará
a esta base y no a los datos de uso habitual del proyecto.

La carga comprenderá:

| Datos | Preparación prevista |
| --- | --- |
| Catálogos | Roles, tipos de anunciante, tipos de propiedad, modalidades y monedas utilizados por las publicaciones. |
| Ubicaciones | Provincias y ciudades relacionadas correctamente. |
| Usuarios y anunciantes | Cuentas ficticias con anunciantes habilitados para publicar y registros relacionados que requiera la aplicación. |
| Publicaciones | Exactamente 1.000 publicaciones activas y consultables en el catálogo público. |
| Imágenes | Al menos una imagen asociada a cada publicación, con archivos o URLs válidos para revisar la página. Algunas publicaciones podrán tener varias imágenes. |
| Datos complementarios | Registros que requiera la navegación funcional. Si se incluyen reservas o favoritos, se registrará su cantidad y se mantendrán iguales durante todas las repeticiones. |

No alcanza con insertar 1.000 filas: se comprobará que todas las publicaciones
sean visibles para la consulta pública. Se evitarán registros inactivos, sin
imágenes o con relaciones incompletas que reduzcan artificialmente el conjunto
efectivamente consultado.

### Distribución de los datos

Se cargarán publicaciones con variedad suficiente para probar los filtros:

- Al menos dos provincias y tres ciudades.
- Al menos tres tipos de propiedad.
- Modalidades de alquiler temporario y de largo plazo.
- Publicaciones en ARS y USD.
- Distintos precios, superficies y cantidades de ambientes: 1, 2, 3 y 4 o más.
- Títulos y descripciones con términos conocidos para las búsquedas por texto.

Antes de la ejecución se guardará una ficha del conjunto de datos con cantidades
por categoría, IDs reales de los catálogos, términos de búsqueda y rangos de
precio seleccionados. El conjunto se conservará sin modificaciones durante la
medición. Se guardará el procedimiento de carga o una copia reproducible de esta
base de pruebas para repetir el ensayo con el mismo contenido.

Se prepararán consultas con muchos resultados, con pocos resultados y sin
coincidencias. La medición no se limitará a consultas vacías, que no representan
el costo de devolver publicaciones completas.

## 4. Entorno de prueba

Se utilizará una instancia del backend compilada, sin modo de desarrollo ni
recarga automática. El frontend se utilizará para comprobar que los registros
cargados permiten navegar y buscar, mientras que la carga de diez usuarios se
generará directamente contra la API.

Antes de ejecutar las pruebas se completará esta ficha con los valores reales.
No se atribuirán los resultados a un entorno que no haya sido medido.

| Elemento | Dato que se registrará |
| --- | --- |
| Versión de la aplicación | Rama y hash del commit evaluado. |
| Backend | Equipo o servicio, CPU/vCPU, RAM, sistema operativo, versión de Node.js, número de instancias y configuración del pool de conexiones a PostgreSQL. Si se usa el valor predeterminado, se dejará asentado. |
| Base de datos | Versión de PostgreSQL, ubicación, recursos o plan contratado e índices aplicados. |
| Generador de carga | Equipo, CPU, RAM, sistema operativo y versión de k6. |
| Red | Si los componentes son locales o remotos, ubicación o región, tipo de conexión y latencia aproximada hacia la API y la base. |
| Fecha de ejecución | Fecha, horario y zona horaria. |
| Estado inicial | Backend y base activos; calentamiento realizado; configuración de caché y servicios externos relevante para la búsqueda. |

Preferentemente, k6 se ejecutará en un equipo separado del backend. Si ambos
comparten equipo, se documentará y se observará su consumo de recursos, porque
el generador de carga también utiliza CPU y memoria.

La prueba se realizará sin cargas ajenas al ensayo que alteren sus condiciones.
Se conservarán la misma configuración y ubicación de los componentes en las tres
repeticiones. Si el alojamiento suspende el servicio por inactividad, el arranque
en frío se registrará por separado: el objetivo principal corresponde al servicio
activo después del calentamiento.

## 5. Simulación de los usuarios

Se utilizará **Grafana k6** para ejecutar diez usuarios virtuales en paralelo.
Cada usuario repetirá este ciclo:

1. Enviar una búsqueda al backend de prueba.
2. Esperar la recepción completa de la respuesta.
3. Verificar el estado HTTP, el formato y los datos esperados.
4. Esperar un segundo antes de la siguiente búsqueda.

Los diez usuarios virtuales permanecerán activos durante el período de carga.
Esto no equivale a diez solicitudes por segundo ni exige que haya diez solicitudes
en vuelo en todo momento: la frecuencia efectiva depende del tiempo de respuesta
y de la pausa entre consultas.

Como la búsqueda es pública, los usuarios virtuales no necesitarán iniciar sesión
ni contar con diez cuentas registradas. Las cuentas de la base servirán para
mantener las relaciones y el funcionamiento de la aplicación.

## 6. Escenarios de búsqueda

Se preparará un script que permita seleccionar un escenario por ejecución.
Cada escenario utilizará diez usuarios; no se ejecutarán los cuatro a la vez,
para no convertir accidentalmente la prueba en una carga de cuarenta usuarios.

| Código | Escenario | Consultas previstas |
| --- | --- | --- |
| E1 | Listado general y paginación | Sin filtros; páginas 1, 25 y la última, con límite de 12. Con las 1.018 publicaciones visibles actuales, la última página es la 85 y contiene 10 registros. |
| E2 | Ubicación | Provincia y ciudad combinadas; variantes con muchos resultados, pocos resultados y sin coincidencias. |
| E3 | Filtros combinados | Tipo de propiedad, moneda, precio mínimo y máximo, ambientes y superficie mínima. Los rangos de precio se definirán dentro de una misma moneda. |
| E4 | Texto y ordenamiento | Términos presentes en títulos o descripciones, con orden de precio ascendente y descendente; se incluirá un término sin coincidencias. |

En E2, E3 y E4 se consultarán la primera página y una página intermedia cuando
la cantidad de resultados lo permita. Las variantes de cada escenario se
alternarán en un orden fijo y reproducible.

La ficha de datos fijará los parámetros exactos, las URLs y los resultados
esperados antes de medir. Se obtendrán los totales y registros esperados a partir
del conjunto de prueba, mediante consultas de control independientes del endpoint
evaluado. Así se podrá detectar una respuesta rápida que aplique mal los filtros.

En cada respuesta se verificará, según corresponda:

- Estado HTTP 200 y JSON con la estructura de la página.
- Coincidencia de página, límite, total y cantidad de resultados esperados.
- Cumplimiento de los filtros solicitados y ordenamiento de los resultados.
- Ausencia de duplicados dentro de la página y de publicaciones no visibles.

## 7. Procedimiento de ejecución

1. **Preparar los datos.** Crear la base, cargar los registros y comprobar las
   1.000 publicaciones visibles y las relaciones necesarias.
2. **Verificar el funcionamiento.** Abrir la página, navegar por el listado y
   aplicar los filtros con el backend conectado a la base de prueba.
3. **Fijar el ensayo.** Registrar la versión del código, la ficha del entorno y
   las consultas exactas de E1 a E4. Preparar el script de k6 y las validaciones.
4. **Calentar el escenario.** Ejecutar durante un minuto la misma carga de diez
   usuarios. Los datos del calentamiento se guardarán separados y se excluirán
   de los criterios de aprobación de los cinco minutos medidos.
5. **Medir.** Ejecutar el escenario durante cinco minutos con diez usuarios y
   pausa de un segundo por usuario. Registrar todas las solicitudes iniciadas
   en ese período hasta que terminen o alcancen el tiempo de espera configurado.
6. **Repetir.** Realizar tres ejecuciones por escenario, con un nuevo calentamiento
   antes de cada una. Mantener datos y configuración sin cambios.
7. **Guardar evidencia.** Exportar resultados y registrar incidencias, recursos y
   condiciones de cada ejecución.
8. **Evaluar.** Comparar cada ejecución y variante con el límite de dos segundos
   y los controles de corrección. Elaborar la conclusión con los valores reales.

Se completarán **12 ejecuciones medidas**: cuatro escenarios por tres
repeticiones. La carga planificada ocupará aproximadamente **72 minutos**,
considerando cinco minutos medidos y uno de calentamiento por ejecución, más
el tiempo de preparación, cierre de solicitudes y revisión de resultados.

Los tiempos de espera agotados, errores y respuestas inválidas no se eliminarán
del informe para mejorar los resultados. Si se corrige el código, los índices o
la infraestructura, la nueva versión se identificará y se repetirá el protocolo.

## 8. Criterio de aprobación

RNF8 se considerará cumplido en el entorno documentado si **todas las ejecuciones
medidas** satisfacen estas condiciones:

1. El tiempo máximo observado de respuesta es **menor o igual a 2.000 ms**.
2. No se registran errores HTTP, errores de conexión ni tiempos de espera agotados.
3. Todas las respuestas cumplen las comprobaciones de resultados esperados.
4. La carga utiliza diez usuarios virtuales y el conjunto conserva las 1.000
   publicaciones visibles durante toda la ejecución.

Se informarán también promedio, mediana, percentil 95 y cantidad de solicitudes.
Son datos complementarios: un promedio o percentil 95 inferior a dos segundos
no compensa una solicitud que supere el máximo exigido.

El resultado demostrará el comportamiento observado en ese entorno y carga;
no constituirá una garantía para otros volúmenes, infraestructura o condiciones.

## 9. Evidencia e informe de resultados

Por cada ejecución se conservarán:

- Script de k6, configuración y comando utilizado.
- Ficha del conjunto de datos y comprobación de las 1.000 publicaciones visibles.
- Ficha del entorno, fecha y commit evaluado.
- Resultados detallados exportados y resumen de métricas, diferenciando calentamiento y medición.
- Identificación del escenario y variante en cada solicitud.
- Captura del resumen final y registros de errores o incidencias, si los hubiera.
- Observaciones del consumo de CPU, memoria y conexiones, cuando estén disponibles.

Los resultados se presentarán con este formato, una fila por ejecución:

| Escenario | Repetición | Solicitudes | Promedio (ms) | P95 (ms) | Máximo (ms) | Errores | Validaciones fallidas | Resultado |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| E1 | 1 | Pendiente | Pendiente | Pendiente | Pendiente | Pendiente | Pendiente | Sin medir |

Se agregarán las once filas restantes y un detalle por variante para identificar
qué consultas presentan mayores tiempos. La conclusión indicará si RNF8 se
cumple, no se cumple o no pudo evaluarse por una ejecución incompleta.

**No se incorporan valores de rendimiento ficticios:** la tabla se completará
después de ejecutar las pruebas.

## 10. Responsabilidades y próximos pasos

**Responsable del proyecto:** crear la base de prueba, cargar los catálogos,
cuentas, anunciantes, publicaciones, imágenes y registros necesarios; informar
la distribución y los IDs que utilizarán los escenarios.

**Preparación técnica posterior:** completar la ficha del entorno, implementar
el script de k6 con sus escenarios y controles, ejecutar el protocolo y generar
el informe de resultados con evidencia.

Este documento entrega el **plan de ejecución**. No crea la base, no carga
registros, no instala k6 y no ejecuta pruebas de carga.

## Referencias

- [Ejecución de pruebas y usuarios virtuales en k6](https://grafana.com/docs/k6/latest/get-started/running-k6/).
- [Definición de las métricas HTTP de k6](https://grafana.com/docs/k6/latest/using-k6/metrics/reference/).
- [Criterios de aprobación mediante thresholds](https://grafana.com/docs/k6/latest/using-k6/thresholds/).
- [Exportación de mediciones detalladas a JSON](https://grafana.com/docs/k6/latest/results-output/real-time/json/).
