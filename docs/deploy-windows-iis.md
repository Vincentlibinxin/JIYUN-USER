# Windows Server 2012 R2 Deployment (IIS + ARR)

This guide serves the Vite build output and proxies /api to the Node backend.

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
  - `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
  - `JWT_SECRET`, `SUBMAIL_APPID`, `SUBMAIL_APPKEY`
  - `CORS_ORIGINS=https://wise-borders.com`

## 3) IIS site configuration
- Create a new IIS Site:
  - Physical path: `C:\inetpub\wwwroot\jiyun-ui\`
  - Binding: `https://wise-borders.com`

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
          <action type="Rewrite" url="http://localhost:3001/api/{R:1}" logRewrittenUrl="true" />
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
- `https://wise-borders.com` loads UI
- `https://wise-borders.com/api/health` returns `{ "status": "ok" }`
- Admin login works and user list loads

## 6) Logs and troubleshooting
- IIS logs: `C:\inetpub\logs\LogFiles`
- Backend logs: configured by NSSM stdout/stderr or file redirection
