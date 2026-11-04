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
