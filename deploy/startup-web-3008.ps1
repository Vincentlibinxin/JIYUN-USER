$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$logsDir = Join-Path $projectRoot "logs"
if (-not (Test-Path $logsDir)) {
  New-Item -ItemType Directory -Path $logsDir | Out-Null
}

if (Test-Path "C:\Program Files\nodejs") {
  $env:Path = "C:\Program Files\nodejs;" + $env:Path
}

$webConnections = Get-NetTCPConnection -LocalPort 3008 -State Listen -ErrorAction SilentlyContinue
if ($webConnections) {
  $ownerIds = $webConnections | Select-Object -ExpandProperty OwningProcess -Unique
  foreach ($ownerId in $ownerIds) {
    $proc = Get-Process -Id $ownerId -ErrorAction SilentlyContinue
    if ($null -ne $proc -and $proc.ProcessName -eq "node") {
      Stop-Process -Id $ownerId -Force -ErrorAction SilentlyContinue
    }
  }
}

Start-Sleep -Seconds 1

$webLog = Join-Path $logsDir "startup-web.log"
Start-Process -FilePath "cmd.exe" -WorkingDirectory $projectRoot -WindowStyle Hidden -ArgumentList "/c npm run dev >> `"$webLog`" 2>&1"
