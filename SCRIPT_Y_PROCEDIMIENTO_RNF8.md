# Script y procedimiento de la prueba de rendimiento — RNF8

## Objetivo y alcance

La prueba realizada el 02/11/2026 evaluó las búsquedas mediante `GET /publicaciones` del backend publicado en Azure, conectado a una base de pruebas PostgreSQL en Neon. El catálogo contenía 1.018 publicaciones visibles: 1.000 ficticias y 18 restauradas. Se utilizó Grafana k6 v2.3.0 desde un equipo externo al servidor.

Se midió `http_req_duration`: envío de la solicitud, espera y recepción completa del JSON. Esta métrica contempla la comunicación con la API y el trabajo del backend y de la base de datos. Excluye DNS, establecimiento inicial de conexión/TLS, presentación de resultados en pantalla y descarga de imágenes.

## Scripts utilizados

| Archivo | Función |
| --- | --- |
| `back/performance/preparar.cjs` | Consulta la base de pruebas en modo de lectura, fija las URLs y los resultados esperados y comprueba que la API responda con los mismos totales e identificadores ordenados. Genera `config-rnf8.json`. |
| `back/performance/busquedas.js` | Genera la carga de diez usuarios virtuales, comprueba las respuestas y calcula los resultados y criterios de aprobación. |
| `back/performance/ejecutar.ps1` | Ejecuta la preparación, el calentamiento y las mediciones; registra el entorno y guarda los resultados de cada repetición. |

Los tres scripts completos se incluyen al final de este anexo. Corresponden a las copias conservadas al cierre de la prueba; su contenido coincide con los archivos del proyecto al preparar este anexo.

## Preparación del ensayo

1. Se preparó la base de pruebas con el esquema de la aplicación y los registros necesarios para consultar el catálogo, incluidas las relaciones con usuarios, anunciantes, ubicaciones, monedas e imágenes.
2. Se configuró el backend publicado para utilizar la base de pruebas de Neon y el contenedor de imágenes de prueba. No fue necesario ejecutar el frontend ni el backend en el equipo generador.
3. Se instaló k6 y se dispuso de Node.js y las dependencias del backend. El preparador utilizó el archivo `back/.env` para acceder a la base y el manifiesto `back/backups/rnf8-20261102-cd588e.json` para identificar el lote. Las credenciales no forman parte de este anexo.
4. Antes de generar la carga, el preparador calculó los resultados esperados mediante consultas SQL independientes de la API. Luego contrastó cada variante con el backend publicado. Ante diferencias de datos o fallos de conexión, el procedimiento se detiene antes de iniciar la carga.
5. Se registraron la fecha, las versiones de las herramientas, las características del equipo generador y el estado del código local en `entorno.json`. El commit local registrado no acredita por sí solo el commit desplegado en Azure.

## Escenarios evaluados

| Código | Consultas |
| --- | --- |
| E1 — Listado y paginación | Listado sin filtros, páginas 1, 25 y 85; doce publicaciones por página como máximo. |
| E2 — Ubicación | Provincia, provincia y ciudad combinadas, páginas intermedias y ubicación sin resultados. |
| E3 — Filtros combinados | Tipo de propiedad, moneda, precios, ambientes y superficie mínima; rango de precios reducido y consulta sin coincidencias. |
| E4 — Texto y ordenamiento | Búsqueda por texto, orden de precio ascendente o descendente, páginas intermedias y texto sin coincidencias. |

Se utilizaron 17 variantes en total: tres de E1, cinco de E2, cuatro de E3 y cinco de E4. Los parámetros exactos, las URLs, los totales y los identificadores esperados quedaron registrados en `config-rnf8.json`. Las consultas generales abarcaron las 1.018 publicaciones; algunas búsquedas textuales se limitaron al lote de 1.000 publicaciones ficticias.

## Ejecución

Desde la raíz del proyecto se ejecutó:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\back\performance\ejecutar.ps1
```

El ejecutor utilizó el backend:

```text
https://depa-alquileres-auepdya0fqgsfwhx.brazilsouth-01.azurewebsites.net
```

Cada escenario se ejecutó tres veces. Antes de cada medición se realizó un minuto de calentamiento con diez usuarios virtuales. A continuación se ejecutaron cinco minutos de medición con la misma concurrencia, en un proceso separado. Los escenarios se ejecutaron sucesivamente, con un máximo de diez usuarios virtuales simultáneos.

Cada usuario envió una consulta, esperó la respuesta, comprobó su contenido y realizó una pausa de un segundo antes de la siguiente consulta. Las variantes se alternaron en un orden reproducible. La simulación no requirió cuentas de usuario porque la búsqueda es pública; diez usuarios virtuales no equivalen a diez solicitudes por segundo.

Se configuró un tiempo de espera máximo de diez segundos por solicitud y hasta quince segundos para finalizar las solicitudes pendientes al cerrar cada fase. El protocolo previsto comprendió doce mediciones y doce calentamientos, equivalentes a 72 minutos de carga, más preparación y cierre. El tiempo total transcurrido fue mayor por la incidencia registrada.

## Comprobaciones y criterio de aceptación

En cada solicitud se verificaron cuatro condiciones:

1. Respuesta HTTP 200.
2. Página, límite, total, cantidad de páginas y cantidad de resultados correctos.
3. Identificadores y orden de resultados iguales a los calculados previamente mediante SQL.
4. Publicaciones activas y con imágenes asociadas.

Una medición aprueba si ninguna solicitud medida supera 2.000 ms, no existen errores HTTP o de conexión ni tiempos de espera agotados, todas las comprobaciones son correctas y todas las variantes reciben solicitudes. El promedio y el P95 son datos complementarios y no sustituyen el límite máximo. Los resultados del calentamiento se guardan por separado y no se incluyen en la evaluación del tiempo de las mediciones.

El ejecutor conserva las mediciones que no aprueban y continúa con los escenarios siguientes. Su finalización no significa que RNF8 se haya cumplido: la evaluación requiere revisar los resultados de las doce mediciones.

## Archivos de evidencia e incidencias

Cada ejecución generó resúmenes JSON, muestras detalladas de k6, registros de consola y una tabla CSV. También se conservaron la configuración de consultas y el registro del entorno. Los archivos se almacenaron en:

```text
back/performance/local/resultados/20261102-211831-056-oficial/
```

La ejecución original E1 — Repetición 3 tuvo una pausa de 31 minutos y 51 segundos entre calentamiento y medición. Se preservó como incidencia y se repitió con calentamiento inmediatamente anterior mediante:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\back\performance\ejecutar.ps1 -Escenario E1 -Repeticiones 1
```

La repetición quedó almacenada en:

```text
back/performance/local/resultados/20261102-230413-695-oficial/
```

Su ejecución E1 — Repetición 1 reemplaza únicamente la fila E1 — Repetición 3 del consolidado. La ejecución original se conserva como incidencia y no se suma a las doce mediciones válidas. Los excesos de tiempo y errores de las demás ejecuciones se conservaron en los resultados.

La verificación posterior detectó diferencias respecto del manifiesto de creación en las tablas originales `publicacion` y `usuario`, sin determinar cuándo ocurrieron. Esta limitación quedó registrada en el informe y en `verificacion-cierre.json`; no se afirma que toda la base permaneciera idéntica al momento de crear el lote.

Los valores medidos se presentan en [DATOS_OBTENIDOS_RNF8.md](DATOS_OBTENIDOS_RNF8.md). Los resultados completos y las referencias a la evidencia se encuentran en [RESULTADOS_RNF8_20261102.md](RESULTADOS_RNF8_20261102.md).

## Anexo: código utilizado

El código requiere la estructura del repositorio, las dependencias del backend, el manifiesto del lote y la configuración privada de la base. `busquedas.js` se ejecuta mediante k6; los otros archivos se ejecutan con Node.js y PowerShell, respectivamente. El ejecutor coordina los tres archivos.

### busquedas.js

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

const config = JSON.parse(open('./local/config-rnf8.json'));
const escenario = __ENV.ESCENARIO || 'E1';
const fase = __ENV.FASE || 'medicion';
const duracion = __ENV.DURACION || '5m';
const variantes = config.escenarios[escenario];
if (!variantes || !['calentamiento', 'medicion'].includes(fase)) throw new Error('Escenario o fase invalida');
const thresholds = { http_req_failed: ['rate==0'], checks: ['rate==1'] };
if (fase === 'medicion') {
  thresholds.http_req_duration = ['max<=2000'];
  for (const v of variantes) {
    thresholds[`http_req_duration{variante:${v.nombre}}`] = ['max<=2000'];
    thresholds[`http_reqs{variante:${v.nombre}}`] = ['count>0'];
  }
}

export const options = {
  scenarios: { busquedas: { executor: 'constant-vus', vus: 10, duration: duracion, gracefulStop: '15s' } },
  thresholds, summaryTrendStats: ['avg', 'min', 'med', 'p(95)', 'max'],
  tags: { escenario, fase, tipo: __ENV.TIPO || 'oficial' },
};

export default function () {
  const v = variantes[(__ITER + __VU - 1) % variantes.length];
  const r = http.get(config.api + v.url, { timeout: '10s', redirects: 0,
    tags: { variante: v.nombre, name: `${escenario}/${v.nombre}` } });
  let body;
  try { body = r.json(); } catch { body = null; }
  check(r, {
    'HTTP 200': response => response.status === 200,
    'pagina y cantidad correctas': () => body && body.pagina === v.pagina && body.limite === 12 &&
      body.total === v.total && body.totalPaginas === Math.ceil(v.total / 12) &&
      Array.isArray(body.datos) && body.datos.length === v.ids.length,
    'resultados y orden correctos': () => body && Array.isArray(body.datos) &&
      JSON.stringify(body.datos.map(p => p.id)) === JSON.stringify(v.ids),
    'publicaciones visibles con imagenes': () => body && Array.isArray(body.datos) &&
      body.datos.every(p => p.activa && Array.isArray(p.imagenes) && p.imagenes.length > 0),
  }, { variante: v.nombre });
  sleep(1);
}

export function handleSummary(data) {
  const duration = data.metrics.http_req_duration?.values || {};
  const failed = data.metrics.http_req_failed?.values || {};
  const validations = data.metrics.checks?.values || {};
  const passed = Object.values(data.metrics).every(m => !m.thresholds || Object.values(m.thresholds).every(t => t.ok));
  const resumen = { escenario, fase, tipo: __ENV.TIPO || 'oficial', api: config.api,
    repeticion: Number(__ENV.REPETICION || 1), publicaciones: config.publicaciones_visibles,
    usuarios: 10, duracion, solicitudes: data.metrics.http_reqs?.values.count || 0,
    promedio_ms: duration.avg ?? null, p95_ms: duration['p(95)'] ?? null, maximo_ms: duration.max ?? null,
    errores_http: failed.passes || 0, validaciones_fallidas: validations.fails || 0,
    aprobado: passed, k6: data };
  return {
    stdout: `\n${escenario} / ${fase}: ${passed ? 'APROBADO' : 'NO APROBADO'}\n` +
      `Solicitudes: ${resumen.solicitudes}; maximo: ${resumen.maximo_ms} ms; errores: ${resumen.errores_http}; validaciones fallidas: ${resumen.validaciones_fallidas}\n`,
    [__ENV.RESUMEN || './resumen-rnf8.json']: JSON.stringify(resumen, null, 2),
  };
}
```

### preparar.cjs

```javascript
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const dotenv = require('dotenv');
const { Client } = require('pg');
const { fingerprint } = require('../scripts/datos-rnf8.cjs');

async function main() {
  const api = (process.argv[2] || '').replace(/\/$/, '');
  if (!/^https?:\/\//.test(api)) throw new Error('Indicar la URL del backend');
  const env = dotenv.parse(fs.readFileSync(path.join(__dirname, '..', '.env')));
  const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'backups', 'rnf8-20261102-cd588e.json')));
  assert.equal(fingerprint(env.DATABASE_URL), manifest.fingerprint, 'El .env no apunta a la base del lote RNF8');
  const db = new Client({ connectionString: env.DATABASE_URL, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 10000 });
  await db.connect();
  try {
    await db.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
    const config = { api, lote: manifest.runId, generado: new Date().toISOString(),
      usuarios: 10, limite_ms: 2000, plan_backend: 'Azure App Service B1',
      escenarios: {}, comprobacion: `/publicaciones?limite=1&q=${manifest.runId}` };
    const visible = `p.activa AND EXISTS (SELECT 1 FROM imagen i WHERE i.id_publicacion=p.id_publicacion)`;
    const [n] = (await db.query(`SELECT count(*)::int AS total FROM publicacion p WHERE ${visible}`)).rows;
    config.publicaciones_visibles = n.total;
    config.postgresql = (await db.query('SHOW server_version')).rows[0].server_version;
    async function add(group, name, params, where = 'TRUE', values = [], order = 'p.fecha_publicacion DESC,p.id_publicacion DESC', pages = [1]) {
      const ids = (await db.query(`SELECT p.id_publicacion FROM publicacion p WHERE ${visible} AND (${where}) ORDER BY ${order}`, values)).rows.map(r => r.id_publicacion);
      for (const page of pages) {
        if (page > 1 && (page - 1) * 12 >= ids.length) continue;
        const query = new URLSearchParams({ pagina: String(page), limite: '12', ...params });
        (config.escenarios[group] ||= []).push({ nombre: `${name}_p${page}`, url: `/publicaciones?${query}`,
          pagina: page, total: ids.length, ids: ids.slice((page - 1) * 12, page * 12) });
      }
    }
    await add('E1', 'general', { orden: 'recientes' }, 'TRUE', [], undefined, [1, 25, Math.ceil(n.total / 12)]);
    const c = manifest.catalogs;
    const cordoba = c.ciudades.find(x => x.provincia === 'Córdoba');
    const city = c.ciudades[0];
    await add('E2', 'provincia', { idProvincia: String(cordoba.id_provincia) }, 'p.id_provincia=$1', [cordoba.id_provincia], undefined, [1, 10]);
    await add('E2', 'ciudad', { idProvincia: String(city.id_provincia), idsCiudad: String(city.id_ciudad) }, 'p.id_provincia=$1 AND p.id_ciudad=$2', [city.id_provincia, city.id_ciudad], undefined, [1, 5]);
    const empty = (await db.query(`SELECT c.id_ciudad,c.id_provincia FROM ciudad c WHERE NOT EXISTS
      (SELECT 1 FROM publicacion p WHERE ${visible} AND p.id_ciudad=c.id_ciudad) ORDER BY c.id_ciudad LIMIT 1`)).rows[0];
    if (!empty) throw new Error('No hay una ciudad sin coincidencias para E2');
    await add('E2', 'ubicacion_sin_resultados', { idProvincia: String(empty.id_provincia), idsCiudad: String(empty.id_ciudad) }, 'p.id_provincia=$1 AND p.id_ciudad=$2', [empty.id_provincia, empty.id_ciudad]);
    const ars = c.ars.id_tipo_moneda, tipo = c.tipos[0].id_tipo_propiedad;
    const filters = { idsTipoMoneda: String(ars), idsTipoPropiedad: String(tipo), precioMin: '200000', precioMax: '1800000', ambientes: '2,3', superficieMin: '45', orden: 'precio-menor' };
    await add('E3', 'combinados', filters, 'p.id_tipo_moneda=$1 AND p.id_tipo_propiedad=$2 AND p.precio BETWEEN 200000 AND 1800000 AND p.cantidad_ambientes IN (2,3) AND p.superficie>=45', [ars, tipo], 'p.precio ASC,p.id_publicacion DESC', [1, 2]);
    await add('E3', 'rango_estrecho', { ...filters, precioMin: '300000', precioMax: '800000' }, 'p.id_tipo_moneda=$1 AND p.id_tipo_propiedad=$2 AND p.precio BETWEEN 300000 AND 800000 AND p.cantidad_ambientes IN (2,3) AND p.superficie>=45', [ars, tipo], 'p.precio ASC,p.id_publicacion DESC');
    await add('E3', 'precio_sin_resultados', { idsTipoMoneda: String(ars), precioMin: '99999999', precioMax: '99999999' }, 'p.id_tipo_moneda=$1 AND p.precio=99999999', [ars]);
    await add('E4', 'texto_precio_menor', { q: manifest.runId, idsTipoMoneda: String(ars), orden: 'precio-menor' }, 'p.titulo LIKE $1 AND p.id_tipo_moneda=$2', [`%${manifest.runId}%`, ars], 'p.precio ASC,p.id_publicacion DESC', [1, 20]);
    await add('E4', 'texto_balcon', { q: `${manifest.runId} balcon`, orden: 'precio-mayor' }, "p.titulo LIKE $1 AND p.descripcion ILIKE '%balcón%'", [`%${manifest.runId}%`], 'p.precio DESC,p.id_publicacion DESC', [1, 10]);
    await add('E4', 'texto_sin_resultados', { q: `${manifest.runId} sincoincidenciasrnf8` }, "p.titulo LIKE $1 AND p.descripcion ILIKE '%sincoincidenciasrnf8%'", [`%${manifest.runId}%`]);
    await db.query('COMMIT');
    const response = await fetch(api + config.comprobacion, { signal: AbortSignal.timeout(60000) });
    if (!response.ok) throw new Error(`El backend responde HTTP ${response.status}`);
    const body = await response.json();
    assert.equal(body.total, 1000, 'La API no muestra el lote: revisar DATABASE_URL en Azure y reiniciar');
    for (const [scenario, variants] of Object.entries(config.escenarios)) {
      for (const variant of variants) {
        const r = await fetch(api + variant.url, { signal: AbortSignal.timeout(60000) });
        assert.equal(r.status, 200, `Fallo HTTP en ${scenario}/${variant.nombre}`);
        const data = await r.json();
        assert.equal(data.total, variant.total, `Total incorrecto en ${scenario}/${variant.nombre}`);
        assert.deepEqual(data.datos.map(p => p.id), variant.ids, `Resultados u orden incorrectos en ${scenario}/${variant.nombre}`);
      }
    }
    const folder = path.join(__dirname, 'local'); fs.mkdirSync(folder, { recursive: true });
    fs.writeFileSync(path.join(folder, 'config-rnf8.json'), JSON.stringify(config, null, 2));
    console.log(`API comprobada. ${n.total} publicaciones visibles. Configuracion E1-E4 preparada.`);
  } finally { await db.end(); }
}
main().catch(e => { console.error('No se pudo preparar RNF8:', e.message.replace(/postgres(?:ql)?:\/\/\S+/g, '[conexion omitida]')); process.exitCode = 1; });
```

### ejecutar.ps1

```powershell
param(
  [string]$ApiUrl = 'https://depa-alquileres-auepdya0fqgsfwhx.brazilsouth-01.azurewebsites.net',
  [ValidateSet('TODOS','E1','E2','E3','E4')][string]$Escenario = 'TODOS',
  [ValidateRange(1,3)][int]$Repeticiones = 3,
  [switch]$PruebaCorta
)
$ErrorActionPreference = 'Stop'
$taskK6Command = (Get-Command k6 -ErrorAction SilentlyContinue | Select-Object -First 1).Source
if (-not $taskK6Command -and (Test-Path -LiteralPath 'C:\Program Files\k6\k6.exe')) {
  $taskK6Command = 'C:\Program Files\k6\k6.exe'
}
if (-not $taskK6Command) { throw 'Falta k6. Instalar: winget install k6 --source winget. Luego abrir una terminal nueva.' }
$taskBack = Split-Path -Parent $PSScriptRoot
$taskRoot = Split-Path -Parent $taskBack
$taskStamp = Get-Date -Format 'yyyyMMdd-HHmmss-fff'
$taskKind = if ($PruebaCorta) { 'prueba-corta' } else { 'oficial' }
$taskResults = Join-Path $PSScriptRoot "local\resultados\$taskStamp-$taskKind"
New-Item -ItemType Directory -Path $taskResults -Force | Out-Null
$taskWarm = if ($PruebaCorta) { '5s' } else { '1m' }
$taskDuration = if ($PruebaCorta) { '15s' } else { '5m' }
$taskCases = if ($Escenario -eq 'TODOS') { @('E1','E2','E3','E4') } else { @($Escenario) }
Push-Location $taskBack
try {
  & node (Join-Path $PSScriptRoot 'preparar.cjs') $ApiUrl
  if ($LASTEXITCODE -ne 0) { throw 'No se pudo comprobar el backend y preparar las consultas. No se inicio carga.' }
  Copy-Item -LiteralPath (Join-Path $PSScriptRoot 'local\config-rnf8.json') -Destination $taskResults
  $taskCpu = Get-CimInstance Win32_Processor | Select-Object -First 1 -ExpandProperty Name
  $taskRam = [math]::Round((Get-CimInstance Win32_ComputerSystem).TotalPhysicalMemory / 1GB,2)
  $taskEnv = [ordered]@{
    fecha = (Get-Date).ToString('o'); api = $ApiUrl; tipo = $taskKind
    sistema = [Environment]::OSVersion.VersionString; cpu = $taskCpu; ram_gb = $taskRam
    node = (& node --version); k6 = (& $taskK6Command version); commit = (& git -C $taskRoot rev-parse HEAD)
    cambios_locales = @(& git -C $taskRoot status --short)
    backend = 'Azure App Service B1; completar SO, region y cantidad de instancias'
    neon = 'Completar plan, recursos y region de Neon'; red = 'Completar tipo de conexion del generador'
  }
  $taskEnv | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath (Join-Path $taskResults 'entorno.json') -Encoding UTF8
  $taskRows = @()
  foreach ($taskCase in $taskCases) {
    for ($taskRepeat=1; $taskRepeat -le $Repeticiones; $taskRepeat++) {
      foreach ($taskPhase in @('calentamiento','medicion')) {
        $taskTime = if ($taskPhase -eq 'calentamiento') { $taskWarm } else { $taskDuration }
        $taskPrefix = Join-Path $taskResults "$taskCase-$taskRepeat-$taskPhase"
        $taskSummary = "$taskPrefix-resumen.json"
        Write-Host "Ejecutando $taskCase, repeticion $taskRepeat, $taskPhase ($taskTime)..."
        try {
          $ErrorActionPreference = 'Continue'
          & $taskK6Command run --out "json=$taskPrefix-metricas.json" `
            -e "ESCENARIO=$taskCase" -e "FASE=$taskPhase" -e "DURACION=$taskTime" `
            -e "TIPO=$taskKind" -e "REPETICION=$taskRepeat" -e "RESUMEN=$taskSummary" `
            (Join-Path $PSScriptRoot 'busquedas.js') 2>&1 | Tee-Object -FilePath "$taskPrefix-consola.txt"
          $taskExit = $LASTEXITCODE
        } finally { $ErrorActionPreference = 'Stop' }
        if (-not (Test-Path -LiteralPath $taskSummary)) { throw "Ejecucion incompleta: falta el resumen de $taskCase/$taskPhase. Revisar $taskPrefix-consola.txt" }
        $taskReport = Get-Content -LiteralPath $taskSummary -Raw | ConvertFrom-Json
        if ($taskReport.solicitudes -eq 0) { throw 'No se registraron solicitudes; la ejecucion no es valida.' }
        if ($taskPhase -eq 'calentamiento' -and $taskExit -ne 0) { throw 'El calentamiento encontro errores de conexion o datos. Revisar antes de medir.' }
        if ($taskPhase -eq 'medicion') {
          $taskReport.aprobado = $taskReport.aprobado -and ($taskExit -eq 0)
          $taskRows += $taskReport | Select-Object escenario,repeticion,tipo,publicaciones,usuarios,solicitudes,promedio_ms,p95_ms,maximo_ms,errores_http,validaciones_fallidas,aprobado
          $taskRows | Export-Csv -LiteralPath (Join-Path $taskResults 'resultados.csv') -NoTypeInformation -Encoding UTF8
          if ($taskExit -ne 0) { Write-Host 'El escenario no aprobo. Se conserva el resultado y se continua con los siguientes.' }
        }
      }
    }
  }
  Write-Host "Resultados guardados en: $taskResults"
  if ($PruebaCorta) { Write-Host 'Esta fue una comprobacion corta; no acredita RNF8.' }
} finally { Pop-Location }
```
