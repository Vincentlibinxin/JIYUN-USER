# 集运系统M-H5

移动端 H5 独立项目（从原项目分离）。

## 启动

```bash
npm install
npm run dev
```

默认访问：`http://localhost:3008`

## 本地后端（已迁移到本项目）

后端代码位于 `server/`，默认监听 `3007` 端口。

```bash
npm run server
```

或前后端同时启动：

```bash
npm run dev:all
```

启动后端前请先配置环境变量（至少包含 `JWT_SECRET`）。

## 后端 API

默认前端请求 `/api`，开发环境由 Vite 代理到本机后端：`http://localhost:3007`。

这意味着：

- 电脑访问 `http://localhost:3008` 时可正常调用后端
- 手机访问 `http://<你的电脑IP>:3008` 时也可通过前端代理调用后端
- 后端无需直接暴露 `3007` 给手机（只要本机可访问 `localhost:3007`）

也可通过环境变量覆盖：

```bash
VITE_API_BASE=http://localhost:3007/api
```

启动前请确保后端服务已运行在 `3007` 端口，并允许当前设备访问。

认证已切换为 HttpOnly Cookie 会话，请确保后端 `CORS_ORIGINS` 配置为精确白名单域名，并保留 `credentials` 支持。

## 云端固定端口策略（本项目）

- 前端固定端口：`3008`（云端开放）
- API 固定端口：`3007`（云端不开放）

建议生产环境采用 IIS/ARR 反向代理：

- 对外访问 `http(s)://<域名或IP>:3008`
- IIS 将 `/api/*` 反代到 `http://127.0.0.1:3007/api/*`
- 云安全组仅放行 `3008`（及运维端口），不放行 `3007`

IIS 模板见：`deploy/web.config.iis-3008-3007.xml`

## JWT 密钥轮换（JWT_SECRET）

建议在以下场景立即轮换：

- 密钥疑似泄露
- 管理员变更或环境迁移
- 按季度例行安全轮换

操作步骤：

1. 在 `.env` 生成并替换 `JWT_SECRET`（建议使用高强度随机值，长度至少 32 字符）。
2. 重启后端服务：`npm run server`（或 `npm run dev:all`）。
3. 验证健康接口：`http://localhost:3007/api/health` 返回 200。
4. 验证登录流程：重新登录后可访问 `/api/auth/me` 与 `/api/user/profile`。

注意事项：

- 轮换后旧 JWT 会立即失效，已登录用户需要重新登录。
- 请勿将 `.env` 提交到代码仓库。
