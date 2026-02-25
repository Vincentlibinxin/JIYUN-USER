# 集运系统M-H5

移动端 H5 独立项目（从原项目分离）。

## 启动

```bash
npm install
npm run dev
```

默认访问：`http://localhost:3004`

## 本地后端（已迁移到本项目）

后端代码位于 `server/`，默认监听 `3001` 端口。

```bash
npm run server
```

或前后端同时启动：

```bash
npm run dev:all
```

## 后端 API

默认前端请求 `/api`，开发环境由 Vite 代理到本机后端：`http://localhost:3001`。

这意味着：

- 电脑访问 `http://localhost:3004` 时可正常调用后端
- 手机访问 `http://<你的电脑IP>:3004` 时也可通过前端代理调用后端
- 后端无需直接暴露 `3001` 给手机（只要本机可访问 `localhost:3001`）

也可通过环境变量覆盖：

```bash
VITE_API_BASE=http://localhost:3001/api
```

启动前请确保后端服务已运行在 `3001` 端口，并允许当前设备访问。
