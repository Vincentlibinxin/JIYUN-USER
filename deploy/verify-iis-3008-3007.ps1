param(
  [string]$SiteName = "Default Web Site",
  [string]$ApiHealthUrl = "http://127.0.0.1:3007/api/health",
  [string]$PublicCheckUrl = "http://127.0.0.1:3008/api/health"
)

$ErrorActionPreference = "Stop"

function Write-CheckResult {
  param(
    [string]$Name,
    [bool]$Passed,
    [string]$Detail
  )

  $prefix = if ($Passed) { "[PASS]" } else { "[FAIL]" }
  Write-Output "$prefix $Name - $Detail"
}

function Test-ModuleInstalled {
  param([string]$ModuleName)
  try {
    $module = & "$env:windir\system32\inetsrv\appcmd.exe" list modules | Select-String -Pattern $ModuleName -SimpleMatch
    return $null -ne $module
  } catch {
    return $false
  }
}

Write-Output "=== IIS Reverse Proxy Verification (3008 -> 3007) ==="
Write-Output "SiteName: $SiteName"

$allPassed = $true

try {
  Import-Module WebAdministration -ErrorAction Stop
  Write-CheckResult "WebAdministration" $true "PowerShell IIS module loaded"
} catch {
  Write-CheckResult "WebAdministration" $false "Cannot load WebAdministration module"
  exit 1
}

$rewriteInstalled = Test-ModuleInstalled -ModuleName "RewriteModule"
Write-CheckResult "URL Rewrite" $rewriteInstalled (if ($rewriteInstalled) { "RewriteModule detected" } else { "RewriteModule not found" })
if (-not $rewriteInstalled) { $allPassed = $false }

$arrInstalled = Test-ModuleInstalled -ModuleName "ARR"
if (-not $arrInstalled) {
  $arrInstalled = Test-Path "C:\Program Files\IIS\Application Request Routing"
}
Write-CheckResult "ARR" $arrInstalled (if ($arrInstalled) { "ARR detected" } else { "ARR not found" })
if (-not $arrInstalled) { $allPassed = $false }

$proxyEnabled = $false
try {
  $proxyEnabledValue = Get-WebConfigurationProperty -PSPath "MACHINE/WEBROOT/APPHOST" -Filter "system.webServer/proxy" -Name "enabled"
  $proxyEnabled = [bool]$proxyEnabledValue.Value
} catch {
  $proxyEnabled = $false
}
Write-CheckResult "ARR Proxy" $proxyEnabled (if ($proxyEnabled) { "Proxy enabled" } else { "Proxy is disabled" })
if (-not $proxyEnabled) { $allPassed = $false }

$site = Get-Website -Name $SiteName -ErrorAction SilentlyContinue
$siteExists = $null -ne $site
Write-CheckResult "IIS Site" $siteExists (if ($siteExists) { "Site found" } else { "Site not found" })
if (-not $siteExists) {
  exit 1
}

$binding3008 = $site.Bindings.Collection | Where-Object {
  $_.protocol -eq "http" -and $_.bindingInformation -match ":3008:"
}
$bindingOk = $null -ne $binding3008
Write-CheckResult "Site Binding 3008" $bindingOk (if ($bindingOk) { "HTTP binding on port 3008 exists" } else { "No HTTP binding on port 3008" })
if (-not $bindingOk) { $allPassed = $false }

$physicalPath = $site.physicalPath
$webConfigPath = Join-Path $physicalPath "web.config"
$webConfigExists = Test-Path $webConfigPath
Write-CheckResult "web.config" $webConfigExists (if ($webConfigExists) { $webConfigPath } else { "web.config not found in site root" })
if (-not $webConfigExists) { $allPassed = $false }

if ($webConfigExists) {
  $webConfigContent = Get-Content $webConfigPath -Raw
  $apiRuleOk = $webConfigContent -match "127\.0\.0\.1:3007/api/\{R:1\}"
  Write-CheckResult "API Rewrite Rule" $apiRuleOk (if ($apiRuleOk) { "Found 3007 rewrite target" } else { "Expected rewrite target not found" })
  if (-not $apiRuleOk) { $allPassed = $false }
}

$apiHealthOk = $false
try {
  $apiResp = Invoke-WebRequest -Uri $ApiHealthUrl -UseBasicParsing -TimeoutSec 5
  $apiHealthOk = $apiResp.StatusCode -eq 200 -and $apiResp.Content -match '"status"\s*:\s*"ok"'
} catch {
  $apiHealthOk = $false
}
Write-CheckResult "API Local Health" $apiHealthOk (if ($apiHealthOk) { $ApiHealthUrl } else { "Cannot reach API health" })
if (-not $apiHealthOk) { $allPassed = $false }

$proxyHealthOk = $false
try {
  $proxyResp = Invoke-WebRequest -Uri $PublicCheckUrl -UseBasicParsing -TimeoutSec 5
  $proxyHealthOk = $proxyResp.StatusCode -eq 200
} catch {
  $proxyHealthOk = $false
}
Write-CheckResult "IIS /api Proxy" $proxyHealthOk (if ($proxyHealthOk) { $PublicCheckUrl } else { "Cannot reach IIS proxied /api/health" })
if (-not $proxyHealthOk) { $allPassed = $false }

Write-Output ""
if ($allPassed) {
  Write-Output "Result: READY (3008 public + 3007 private via IIS/ARR)"
  exit 0
}

Write-Output "Result: NOT READY (check FAIL items above)"
exit 2
