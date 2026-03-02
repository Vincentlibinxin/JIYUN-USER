$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$apiScript = Join-Path $PSScriptRoot "startup-api-3007.ps1"
$webScript = Join-Path $PSScriptRoot "startup-web-3008.ps1"

if (-not (Test-Path $apiScript)) {
  throw "Missing script: $apiScript"
}

if (-not (Test-Path $webScript)) {
  throw "Missing script: $webScript"
}

& powershell.exe -NoProfile -ExecutionPolicy Bypass -File $apiScript
Start-Sleep -Seconds 2
& powershell.exe -NoProfile -ExecutionPolicy Bypass -File $webScript

Write-Output "Startup scripts executed: API 3007 + Web 3008"
exit 0
