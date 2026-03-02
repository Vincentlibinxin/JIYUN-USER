# AWS 部署（Nginx + 前端静态 + /api 反向代理）

目标：对外只开放 `80/443`，后端 API 仅监听本机 `127.0.0.1:3007`（或 `0.0.0.0:3007` 但不放行公网入站），通过 Nginx 统一转发 `/api`。

## 1. AWS 安全组

EC2 绑定安全组入站规则：

- 允许 `TCP 80`（来源 `0.0.0.0/0`）
- 如使用 HTTPS，再允许 `TCP 443`（来源 `0.0.0.0/0`）
- 管理端口 `22` 按你的运维策略放行
- 不要放行 `3007`
- 不要放行 `3008`

## 2. 服务器准备

```bash
sudo apt update
sudo apt install -y nginx
```

前端构建并上传到服务器目录（示例）：

```bash
npm run build
sudo mkdir -p /var/www/jiyun-ui
sudo cp -r dist /var/www/jiyun-ui/
```

## 3. 启用 Nginx 站点配置

将项目中的配置文件复制到 Nginx：

```bash
sudo cp deploy/nginx.aws.conf /etc/nginx/conf.d/jiyun.conf
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx
```

## 4. 启动后端 API（3007）

后端服务需常驻运行，推荐 systemd。

```bash
npm run server
```

建议检查后端本机健康接口：

```bash
curl http://127.0.0.1:3007/api/health
```

## 5. 验证

公网访问：

- `http://<你的公网IP或域名>/` 前端可打开
- `http://<你的公网IP或域名>/api/health` 返回 `{ "status": "ok" }`

本机端口检查：

```bash
ss -lntp | grep -E ':80|:3007'
```

安全组外网检查（应不通）：

- `http://<公网IP>:3007/api/health` 不可直接访问

## 6. HTTPS（可选）

如有域名，推荐在 Nginx 增加 `443` 配置并申请证书（Let’s Encrypt/ACM + Nginx）。
