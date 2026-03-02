# Windows Server 2012 R2 Deployment (IIS + ARR)

This guide serves the Vite build output on port `3008` and proxies `/api` to the Node backend on private port `3007`.

## Prerequisites
- IIS installed (Web Server role)
- URL Rewrite module installed
- Application Request Routing (ARR) installed and enabled
- Node.js installed

## 1) Build and copy frontend assets
- Build locally: `npm run build`
- Copy `dist/` to the server, for example:
  - `C:\inetpub\wwwroot\jiyun-ui\`

## 2) Run backend service
Use a Windows service wrapper (NSSM recommended):
- Install NSSM
- Create a service that runs:
  - `node` or `npx tsx` with working dir set to the project root
  - Command: `npx tsx server/index.ts`
- Set environment variables in the service or via system env:
  - `PORT=3007`
  - `HOST=127.0.0.1`
  - `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
  - `JWT_SECRET`, `SUBMAIL_APPID`, `SUBMAIL_APPKEY`
  - `CORS_ORIGINS=http://<你的域名或IP>:3008`

## 3) IIS site configuration
- Create a new IIS Site:
  - Physical path: `C:\inetpub\wwwroot\jiyun-ui\`
  - Binding: `http://<你的域名或IP>:3008`

Cloud firewall/security group rules:

- Allow inbound `3008/TCP`
- Do not allow inbound `3007/TCP`

## 4) Add reverse proxy rules
Create or update `web.config` in the site root:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <rule name="API Proxy" stopProcessing="true">
          <match url="^api/(.*)" />
          <action type="Rewrite" url="http://127.0.0.1:3007/api/{R:1}" logRewrittenUrl="true" />
        </rule>
        <rule name="SPA Fallback" stopProcessing="true">
          <match url=".*" />
          <conditions logicalGrouping="MatchAll">
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
            <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
          </conditions>
          <action type="Rewrite" url="/index.html" />
        </rule>
      </rules>
    </rewrite>
  </system.webServer>
</configuration>
```

## 5) Validate
- `http://<你的域名或IP>:3008` loads UI
- `http://<你的域名或IP>:3008/api/health` returns `{ "status": "ok" }`
- `http://<你的域名或IP>:3007/api/health` should be unreachable from public network
- Admin login works and user list loads

## 6) Logs and troubleshooting
- IIS logs: `C:\inetpub\logs\LogFiles`
- Backend logs: configured by NSSM stdout/stderr or file redirection

## 7) One-command verification (recommended)

Run this script on the Windows server after IIS + ARR setup:

```powershell
powershell -ExecutionPolicy Bypass -File .\deploy\verify-iis-3008-3007.ps1 -SiteName "Your IIS Site Name"
```

It checks:

- URL Rewrite installed
- ARR installed and proxy enabled
- Site has HTTP binding on port `3008`
- `web.config` includes `/api -> 127.0.0.1:3007`
- Local API health and IIS proxied `/api/health`

## 8) Auto-apply web.config template (backup included)

Use this command on the Windows server to back up the current `web.config` and apply the fixed `3008 -> 3007` template:

```powershell
powershell -ExecutionPolicy Bypass -File .\deploy\apply-iis-webconfig-3008-3007.ps1 -SiteName "Your IIS Site Name"
```

Apply + run verification in one command:

```powershell
powershell -ExecutionPolicy Bypass -File .\deploy\apply-iis-webconfig-3008-3007.ps1 -SiteName "Your IIS Site Name" -RunVerify
```
