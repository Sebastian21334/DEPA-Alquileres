# Datos obtenidos — Pruebas de rendimiento RNF8

Fecha de ejecución: **02/11/2026**. Zona horaria: **America/Buenos_Aires**.

## Datos de la medición

| Dato | Valor |
| --- | --- |
| Publicaciones visibles | 1.018 |
| Usuarios virtuales concurrentes | 10 |
| Escenarios | 4 |
| Repeticiones por escenario | 3 |
| Mediciones válidas | 12 |
| Duración medida por ejecución | 5 minutos |
| Solicitudes medidas | 23.175 |
| Tiempo promedio global, ponderado por solicitudes | 548,07 ms |
| Tiempo máximo observado | 10.020,66 ms |
| Solicitudes con duración superior a 2.000 ms | 26 |
| Solicitudes con error | 2 |
| Comprobaciones fallidas | 8 |
| Mediciones aprobadas | 8 |
| Mediciones no aprobadas | 4 |
| Cumplimiento del RNF8: máximo de 2.000 ms y ausencia de errores | No cumple en el ensayo realizado |

Los tiempos corresponden al envío, espera y recepción del JSON de la API (`http_req_duration` de k6). Excluyen DNS, conexión inicial/TLS, presentación en pantalla y descarga de imágenes. Los totales excluyen el calentamiento.

## Resultados por ejecución

| Escenario | Repetición | Solicitudes | Promedio (ms) | P95 (ms) | Máximo (ms) | Solicitudes con error | Comprobaciones fallidas | Resultado |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| E1 — Listado y paginación | 1 | 1.926 | 550,01 | 680,75 | 1.881,58 | 0 | 0 | Aprueba |
| E1 — Listado y paginación | 2 | 1.927 | 551,98 | 714,30 | 2.566,94 | 0 | 0 | No aprueba |
| E1 — Listado y paginación | 3 | 1.960 | 524,32 | 658,36 | 1.943,64 | 0 | 0 | Aprueba |
| E2 — Ubicación | 1 | 1.981 | 507,89 | 646,93 | 1.465,42 | 0 | 0 | Aprueba |
| E2 — Ubicación | 2 | 1.997 | 497,75 | 649,83 | 1.657,51 | 0 | 0 | Aprueba |
| E2 — Ubicación | 3 | 2.009 | 487,77 | 637,20 | 1.910,10 | 0 | 0 | Aprueba |
| E3 — Filtros combinados | 1 | 2.010 | 487,73 | 660,73 | 2.483,61 | 0 | 0 | No aprueba |
| E3 — Filtros combinados | 2 | 2.016 | 482,99 | 644,85 | 1.531,12 | 0 | 0 | Aprueba |
| E3 — Filtros combinados | 3 | 2.013 | 488,41 | 646,02 | 1.983,30 | 0 | 0 | Aprueba |
| E4 — Texto y ordenamiento | 1 | 1.800 | 661,73 | 958,30 | 1.613,61 | 0 | 0 | Aprueba |
| E4 — Texto y ordenamiento | 2 | 1.730 | 727,59 | 1.051,38 | 10.020,66 | 2 | 8 | No aprueba |
| E4 — Texto y ordenamiento | 3 | 1.806 | 655,39 | 995,88 | 2.374,76 | 0 | 0 | No aprueba |

## Errores registrados

| Ejecución | Hora (UTC−03:00) | Variante | Error | Código |
| --- | --- | --- | --- | --- |
| E4 — Repetición 2 | 22:56:20,7948954 | `texto_precio_menor_p1` | Tiempo de espera agotado (`request timeout`) | 1050 |
| E4 — Repetición 2 | 22:56:21,0489077 | `texto_balcon_p1` | Tiempo de espera agotado (`request timeout`) | 1050 |

Las ocho comprobaciones fallidas corresponden a estas dos solicitudes: cada una falló sus cuatro comprobaciones.

## Incidencias observadas

La ejecución original E1 — Repetición 3 presentó una pausa de 31 minutos y 51 segundos entre el calentamiento y la medición. Se conservó como incidencia y se repitió con calentamiento inmediato. La tabla y los totales incluyen la repetición válida y excluyen esa ejecución original.

La verificación posterior registró 1.018 publicaciones totales y activas. Los registros originales coincidieron con el manifiesto de creación en cinco de siete tablas; se detectaron diferencias en `publicacion` y `usuario`, sin determinar cuándo ocurrieron. Frente a la copia local, las 18 publicaciones restauradas presentaron cambios en `activa` y una también en `visualizaciones`.
