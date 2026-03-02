param(
  [string]$SiteName = "Default Web Site",
  [string]$TemplatePath = ".\deploy\web.config.iis-3008-3007.xml",
  [switch]$RunVerify
)

$ErrorActionPreference = "Stop"

function Write-Info {
  param([string]$Message)
  Write-Output "[INFO] $Message"
}

function Write-Pass {
  param([string]$Message)
  Write-Output "[PASS] $Message"
}

function Write-Fail {
  param([string]$Message)
  Write-Output "[FAIL] $Message"
}

try {
  Import-Module WebAdministration -ErrorAction Stop
} catch {
  Write-Fail "Cannot load WebAdministration module. Ensure IIS management tools are installed."
  exit 1
}

$site = Get-Website -Name $SiteName -ErrorAction SilentlyContinue
if (-not $site) {
  Write-Fail "IIS site not found: $SiteName"
  exit 1
}

$physicalPath = $site.physicalPath
if (-not (Test-Path $physicalPath)) {
  Write-Fail "Site physical path does not exist: $physicalPath"
  exit 1
}

$resolvedTemplatePath = Resolve-Path $TemplatePath -ErrorAction SilentlyContinue
if (-not $resolvedTemplatePath) {
  Write-Fail "Template file not found: $TemplatePath"
  exit 1
}

$targetWebConfig = Join-Path $physicalPath "web.config"
$backupPath = "$targetWebConfig.bak.$(Get-Date -Format 'yyyyMMdd-HHmmss')"

Write-Info "Site: $SiteName"
Write-Info "Site path: $physicalPath"
Write-Info "Template: $resolvedTemplatePath"
Write-Info "Target: $targetWebConfig"

if (Test-Path $targetWebConfig) {
  Copy-Item -Path $targetWebConfig -Destination $backupPath -Force
  Write-Pass "Existing web.config backed up to: $backupPath"
} else {
  Write-Info "No existing web.config found; creating a new one."
}

Copy-Item -Path $resolvedTemplatePath -Destination $targetWebConfig -Force
Write-Pass "Template applied to site web.config"

$binding3008 = $site.Bindings.Collection | Where-Object {
  $_.protocol -eq "http" -and $_.bindingInformation -match ":3008:"
}
if ($binding3008) {
  Write-Pass "Site already has HTTP binding on port 3008"
} else {
  Write-Info "Site has no HTTP 3008 binding yet. Add it in IIS bindings if needed."
}

Write-Info "Recycling IIS app pool for this site..."
try {
  $app = Get-WebApplication -Site $SiteName -ErrorAction SilentlyContinue | Select-Object -First 1
  if ($app) {
    Restart-WebAppPool -Name $app.applicationPool -ErrorAction SilentlyContinue
  }
  Write-Pass "IIS app pool recycle attempted"
} catch {
  Write-Info "App pool recycle skipped: $($_.Exception.Message)"
}

if ($RunVerify) {
  $verifyScript = Join-Path (Split-Path -Parent $MyInvocation.MyCommand.Path) "verify-iis-3008-3007.ps1"
  if (Test-Path $verifyScript) {
    Write-Info "Running verification script..."
    & $verifyScript -SiteName $SiteName
    exit $LASTEXITCODE
  }

  Write-Info "Verification script not found: $verifyScript"
}

Write-Pass "Done."
Write-Output "Next: ensure cloud firewall/security group allows 3008 and blocks 3007."
exit 0
