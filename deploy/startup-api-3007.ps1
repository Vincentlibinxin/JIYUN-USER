$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$logsDir = Join-Path $projectRoot "logs"
if (-not (Test-Path $logsDir)) {
  New-Item -ItemType Directory -Path $logsDir | Out-Null
}

if (Test-Path "C:\Program Files\nodejs") {
  $env:Path = "C:\Program Files\nodejs;" + $env:Path
}

$apiConnections = Get-NetTCPConnection -LocalPort 3007 -State Listen -ErrorAction SilentlyContinue
if ($apiConnections) {
  $ownerIds = $apiConnections | Select-Object -ExpandProperty OwningProcess -Unique
  foreach ($ownerId in $ownerIds) {
    $proc = Get-Process -Id $ownerId -ErrorAction SilentlyContinue
    if ($null -ne $proc -and $proc.ProcessName -eq "node") {
      Stop-Process -Id $ownerId -Force -ErrorAction SilentlyContinue
    }
  }
}

Start-Sleep -Seconds 1

$apiLog = Join-Path $logsDir "startup-api.log"
Start-Process -FilePath "cmd.exe" -WorkingDirectory $projectRoot -WindowStyle Hidden -ArgumentList "/c npm run server >> `"$apiLog`" 2>&1"
