param(
  [int[]]$Ports = @(3007, 3008)
)

$ErrorActionPreference = "Stop"

Write-Output "[dev-all] Preparing ports: $($Ports -join ', ')"

foreach ($port in $Ports) {
  $connections = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
  if (-not $connections) {
    Write-Output "[dev-all] Port $port is free"
    continue
  }

  $ownerIds = $connections | Select-Object -ExpandProperty OwningProcess -Unique
  foreach ($ownerId in $ownerIds) {
    $proc = Get-Process -Id $ownerId -ErrorAction SilentlyContinue
    if ($null -eq $proc) {
      continue
    }

    if ($proc.ProcessName -ne 'node') {
      Write-Output "[dev-all] Port $port is used by non-node process $($proc.ProcessName) (PID $ownerId), skipping"
      continue
    }

    Write-Output "[dev-all] Stopping node PID $ownerId on port $port"
    Stop-Process -Id $ownerId -Force -ErrorAction SilentlyContinue
  }
}

Start-Sleep -Seconds 1

if (Test-Path "C:\Program Files\nodejs") {
  $env:Path = "C:\Program Files\nodejs;" + $env:Path
}

Write-Output "[dev-all] Starting backend + frontend"
npm run dev:all:raw
