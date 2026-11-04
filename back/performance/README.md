# Ejecución de las pruebas de RNF8

Este procedimiento mide las búsquedas del backend publicado en Azure App Service
B1, contra la base Neon de pruebas. No necesita que el frontend esté abierto ni
que el backend se ejecute en la PC. k6 se ejecuta en la PC y genera las peticiones.

## 1. Preparar Azure

En la aplicación `depa-alquileres`, comprobar que `DATABASE_URL` apunte a la base
de pruebas y `AZURE_STORAGE_CONTAINER` al contenedor `rnf8-20261102-cd588e`.
Guardar/aplicar los cambios para reiniciar el backend. Mantener fija la cantidad
de instancias, el plan B1 y la configuración de Neon durante las mediciones.

El script comprueba que el backend publicado muestre las 1.000 publicaciones
del lote. Si no las encuentra o las búsquedas no coinciden con la base de pruebas,
detiene la ejecución antes de iniciar la carga.

## 2. Instalar k6

Desde PowerShell:

```powershell
winget install k6 --source winget
```

Abrir una terminal nueva y ejecutar `k6 version`.

Si la terminal todavia no reconoce `k6`, el ejecutor tambien busca automaticamente
`C:\Program Files\k6\k6.exe`, la ubicacion del instalador de Windows.

## 3. Comprobación corta

Ubicarse en la raíz del proyecto:

```powershell
cd "C:\Users\sebas\OneDrive\Desktop\Proyectos\seminario_integrador"
```

Ejecutar:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\back\performance\ejecutar.ps1 -Escenario E1 -Repeticiones 1 -PruebaCorta
```

Esta opción usa diez usuarios, cinco segundos de calentamiento y quince de
medición, más el tiempo de preparación y cierre. Solo comprueba la configuración;
**no acredita RNF8**. La opción de ejecución de PowerShell se aplica únicamente
al proceso que ejecuta este archivo.

## 4. Medición completa

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\back\performance\ejecutar.ps1
```

Ejecuta cuatro escenarios y tres repeticiones por escenario. Cada repetición
inicia diez usuarios para un minuto de calentamiento y luego diez usuarios para
cinco minutos de medición. Ambas fases se ejecutan en procesos sucesivos y sus
resultados se guardan separados. Nunca se ejecutan cuarenta usuarios por combinar
los cuatro escenarios. Cada usuario espera un segundo entre consultas.

El tiempo previsto es de aproximadamente **72 minutos**, más las comprobaciones
iniciales, el inicio de procesos y el cierre de peticiones pendientes. No cambiar
datos ni desplegar otra versión mientras se ejecuta el ensayo.

Para medir un único escenario una sola vez, por ejemplo E2:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\back\performance\ejecutar.ps1 -Escenario E2 -Repeticiones 1
```

Si se modifica la URL del backend, pasar `-ApiUrl "https://URL-DEL-BACKEND"`.

## 5. Escenarios y verificaciones

- **E1:** listado completo, primera página, página 25 y última página.
- **E2:** provincia, provincia y ciudad, páginas intermedias y ubicación sin resultados.
- **E3:** tipo de propiedad, moneda, precios, ambientes y superficie combinados;
  también una consulta sin coincidencias.
- **E4:** texto y precio ascendente o descendente, páginas intermedias y texto sin coincidencias.

`preparar.cjs` obtiene los resultados esperados con consultas SQL de lectura
independientes de la API y registra las URLs y los IDs de cada página. Durante
la carga se verifica HTTP 200, cantidad, paginación, IDs, orden y presencia de
imágenes. La consulta SQL de preparación no se repite durante la medición.

El catálogo contiene **1.018 publicaciones visibles**: las 18 restauradas y las
1.000 ficticias. Las consultas generales usan el catálogo completo; algunas
búsquedas de texto se restringen al lote. Se registra el volumen real en cada
resultado, sin afirmar que el total sea exactamente 1.000.

## 6. Resultados y aprobación

Se guardan en `back/performance/local/resultados/FECHA-HORA-oficial/`:

- `resultados.csv`: tabla de las mediciones, con máximo, promedio, P95 y errores.
- `*-medicion-resumen.json`: resumen y métricas por variante.
- `*-medicion-metricas.json`: muestras detalladas de cada petición.
- Archivos equivalentes para el calentamiento, excluido de la aprobación de tiempo.
- `*-consola.txt`: salida de la herramienta.
- `config-rnf8.json`: consultas y resultados esperados utilizados.
- `entorno.json`: fecha, versiones, equipo generador, commit y cambios locales.

Completar en `entorno.json` el sistema operativo, región y cantidad de instancias
de Azure, plan y región de Neon y tipo de conexión del generador. Esos datos no
pueden inferirse solo de la URL de la aplicación.

Una medición aprueba si ninguna petición supera **2.000 ms**, no hay errores HTTP
o de conexión, todas las respuestas son correctas y todas las variantes reciben
peticiones. El P95 o promedio no reemplazan el máximo. Los escenarios que no
aprueban conservan su evidencia y no deben excluirse del informe.

La métrica `http_req_duration` incluye envío, espera y recepción del JSON. Excluye
DNS, establecimiento de conexión, TLS, renderizado de la pantalla y descarga de
imágenes. Los resultados de esta prueba no representan tiempos de carga visual.

Los archivos generados están excluidos de Git. Conservarlos y adjuntar los
resúmenes al informe de RNF8 cuando se complete el protocolo.

## Referencias

- [Instalación de k6](https://grafana.com/docs/k6/latest/set-up/install-k6/).
- [Métricas HTTP](https://grafana.com/docs/k6/latest/using-k6/metrics/reference/).
- [Criterios de aprobación](https://grafana.com/docs/k6/latest/using-k6/thresholds/).
- [Resumen personalizado](https://grafana.com/docs/k6/latest/results-output/end-of-test/custom-summary/).
