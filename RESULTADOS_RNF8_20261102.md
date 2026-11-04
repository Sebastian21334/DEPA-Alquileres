# Resultados de rendimiento de búsquedas — RNF8

Fecha: 02/11/2026 (America/Buenos_Aires).

## Resultado

RNF8 no se cumple en el ensayo realizado: 4 de 12 mediciones no aprobaron. Se registraron 26 respuestas por encima de 2.000 ms, un máximo de 10.020,66 ms y 2 solicitudes con error. No se modifica el criterio de aceptación para interpretar el resultado.

Se completaron 12 mediciones válidas, con diez usuarios virtuales, un minuto de calentamiento y cinco minutos medidos por ejecución. La serie contiene 23175 solicitudes medidas; el calentamiento se excluye de estos totales. 8 mediciones aprobaron.

## Entorno y alcance

- Backend: https://depa-alquileres-auepdya0fqgsfwhx.brazilsouth-01.azurewebsites.net.
- Azure App Service Basic B1, según el plan indicado por el equipo. Sistema operativo, cantidad de instancias y configuración exacta del servicio: pendientes de confirmar en Azure.
- PostgreSQL en Neon: 18.6 (fd34222). Plan, recursos y región de Neon: pendientes de completar.
- Datos: 1018 publicaciones visibles, incluidas 1.000 ficticias y las 18 restauradas.
- Equipo generador: AMD Ryzen 5 3500U with Radeon Vega Mobile Gfx  ; 13.94 GB de RAM; Microsoft Windows NT 10.0.26200.0.
- Herramienta: k6.exe v2.3.0 (commit/e088784614, go1.26.8, windows/amd64).
- Node.js de preparación: v24.19.0.
- Commit local registrado: c34b1f4d01163c3d58ecb540af6a38bae4d520ff. Había cambios locales sin commit; el commit del backend efectivamente desplegado debe confirmarse por separado. Las copias de los scripts se adjuntaron al cierre, junto con sus hashes SHA-256.
- Tipo de conexión de Internet: pendiente de completar.

La medición corresponde a http_req_duration: envío, espera y recepción del JSON. Incluye la comunicación con la API y el trabajo del backend y PostgreSQL; excluye DNS, conexión inicial/TLS, renderizado y descarga de imágenes.

## Mediciones

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

## Incidencia y repetición

La ejecución original E1-3 tuvo un intervalo de 31 minutos y 51 segundos entre la ultima respuesta del calentamiento y la primera de medición. La causa no se determino. Se conservaron todos sus archivos y se repitio solo esa ejecución con calentamiento inmediatamente anterior. La fila E1-3 de esta tabla corresponde a E1-1 de la carpeta 20261102-230413-695-oficial. La ejecución original queda como evidencia de incidencia y no se mezcla con las doce mediciones válidas.

## Errores y límites de la interpretación

- E4 — 2: request timeout (código 1050), variante texto_precio_menor_p1, 2026-11-02T22:56:20.7948954-03:00.
- E4 — 2: request timeout (código 1050), variante texto_balcon_p1, 2026-11-02T22:56:21.0489077-03:00.

Los 8 fallos de comprobación corresponden a las dos solicitudes que agotaron el tiempo de espera: cada una falló sus cuatro comprobaciones. La evidencia no permite atribuir por sí sola los picos o tiempos de espera exclusivamente a Azure, Neon o la red del generador. Se requiere correlacionar los horarios con sus registros y métricas. No se cambiaron consultas, capacidad ni el límite de dos segundos durante la serie.

## Verificación posterior de los datos

La comprobación posterior conserva los conteos de 1.018 publicaciones y 1.018 activas. La comparación contra el manifiesto de creación coincide en cinco de siete tablas originales, pero detecta diferencias en publicacion y usuario. La comparación de publicaciones contra la copia local identifica cambios de activa en las 18 publicaciones restauradas y de visualizaciones en una. No se modificaron ni restauraron estas filas durante el cierre. Esta comprobación no determina cuándo ocurrieron los cambios; por ello, no se afirma que la base completa permaneciera idéntica al momento de crear el lote. Las consultas esperadas de las dos preparaciones del ensayo coinciden, y las respuestas recibidas durante la carga pasaron sus comprobaciones. El fallo de verificación y sus diferencias se conservan en verificacion-cierre.json.

## Evidencia

- [Detalle por variante](back/performance/local/resultados/20261102-211831-056-oficial/consolidado/variantes.csv).
- [Verificación posterior de los datos](back/performance/local/resultados/20261102-211831-056-oficial/verificacion-cierre.json).
- [Scripts y hashes](back/performance/local/resultados/20261102-211831-056-oficial/scripts/).
- [CSV consolidado](back/performance/local/resultados/20261102-211831-056-oficial/consolidado/resultados.csv).
- [JSON consolidado con fuentes por ejecución](back/performance/local/resultados/20261102-211831-056-oficial/consolidado/resultados.json).
- [Serie original y muestras](back/performance/local/resultados/20261102-211831-056-oficial/).
- [Repetición de la ejecución con incidencia](back/performance/local/resultados/20261102-230413-695-oficial/).
- [Procedimiento y scripts](back/performance/README.md).

Las carpetas de resultados están excluidas de Git. Deben conservarse y adjuntarse a la entrega como evidencia; sus rutas locales no sustituyen un enlace compartido o anexo. Faltan los datos administrativos del entorno indicados arriba y el enlace permanente al commit de los scripts una vez publicados.
