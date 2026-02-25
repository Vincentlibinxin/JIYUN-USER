# 管理後台系統使用文檔

## 📊 系統概述

榕台海峽快運管理後台是一個功能完整的企業級管理系統，提供：
- ✅ 會員用戶 CRUD 管理
- ✅ 訂單狀態管理
- ✅ 包裹追蹤管理
- ✅ 統計儀表板
- ✅ 搜尋和篩選功能

---

## 🔐 管理員登入

### 訪問管理後台
```
http://localhost:3000/admin/login
```

### 默認認證信息
| 項目 | 值 |
|------|-----|
| **用戶名** | `admin` |
| **密碼** | `admin123` |
| **邮箱** | `admin@rongtai.com` |

### 登入步驟
1. 訪問登入頁面
2. 輸入用戶名和密碼
3. 點擊「登入」按鈕
4. 成功後跳轉到儀表板

---

## 📋 功能模塊

### 1️⃣ 概覽（Overview）
- 系統狀態監控
- API 伺服器狀態
- 數據庫連接狀態
- 快速統計指標

### 2️⃣ 用戶管理（User Management）

#### 查看所有用戶
```
GET /api/admin/users?page=1&limit=10
```

#### 搜尋用戶
1. 在搜尋欄輸入關鍵詞
2. 支持搜尋項：
   - 用戶名
   - 手機號碼
   - 郵箱
   - 真名

```bash
# API 示例
GET /api/admin/users/search?q=0931239181
```

#### 編輯用戶信息
```
PUT /api/admin/users/:id
{
  "real_name": "張三",
  "address": "台北市",
  "email": "user@example.com"
}
```

#### 刪除用戶
- 在用戶列表點擊「刪除」按鈕
- 確認刪除操作

```
DELETE /api/admin/users/:id
```

### 3️⃣ 訂單管理（Order Management）

#### 查看所有訂單
```
GET /api/admin/orders?page=1&limit=10
```

#### 更新訂單狀態
點擊訂單狀態的下拉菜單選擇：
- 待處理 (pending)
- 處理中 (processing)
- 已發貨 (shipped)
- 已交付 (delivered)
- 已取消 (cancelled)

```
PATCH /api/admin/orders/:id
{
  "status": "shipped"
}
```

---

## 🗄️ 數據庫結構

### 管理員用戶表 (admin_users)
```sql
CREATE TABLE admin_users (
  id INTEGER PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'admin',
  status TEXT DEFAULT 'active',
  last_login DATETIME,
  created_at DATETIME,
  updated_at DATETIME
);
```

### 普通用戶表 (users)
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  phone TEXT UNIQUE,
  email TEXT,
  real_name TEXT,
  address TEXT,
  created_at DATETIME,
  updated_at DATETIME
);
```

### 訂單表 (orders)
```sql
CREATE TABLE orders (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  parcel_id INTEGER,
  total_amount REAL NOT NULL,
  currency TEXT DEFAULT 'TWD',
  status TEXT DEFAULT 'pending',
  payment_method TEXT,
  notes TEXT,
  created_at DATETIME,
  updated_at DATETIME
);
```

### 包裹表 (parcels)
```sql
CREATE TABLE parcels (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  tracking_number TEXT UNIQUE NOT NULL,
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  weight REAL,
  status TEXT DEFAULT 'pending',
  estimated_delivery DATETIME,
  created_at DATETIME,
  updated_at DATETIME
);
```

---

## 🔌 API 端點

### 管理員認證

#### 登入
```http
POST /api/admin/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}

Response 200:
{
  "message": "登入成功",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": {
    "id": 1,
    "username": "admin",
    "email": "admin@rongtai.com",
    "role": "admin"
  }
}
```

### 用戶管理

#### 取得所有用戶
```http
GET /api/admin/users?page=1&limit=10
Authorization: Bearer {token}

Response 200:
{
  "data": [
    {
      "id": 6,
      "username": "0931239181",
      "phone": "0931239181",
      "email": "test0931239181@example.com",
      "real_name": null,
      "address": null,
      "created_at": "2026-02-22T...",
      "updated_at": "2026-02-22T..."
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 7,
    "pages": 1
  }
}
```

#### 搜尋用戶
```http
GET /api/admin/users/search?q=0931239181
Authorization: Bearer {token}

Response 200:
{
  "data": [
    {
      "id": 6,
      "username": "0931239181",
      ...
    }
  ],
  "count": 1
}
```

#### 取得單個用戶
```http
GET /api/admin/users/:id
Authorization: Bearer {token}
```

#### 編輯用戶
```http
PUT /api/admin/users/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "real_name": "張三",
  "address": "台北市信義區",
  "email": "user@example.com"
}

Response 200:
{
  "message": "用戶信息已更新",
  "user": {
    "id": 6,
    "username": "0931239181",
    "phone": "0931239181",
    "email": "user@example.com",
    "real_name": "張三",
    "address": "台北市信義區"
  }
}
```

#### 刪除用戶
```http
DELETE /api/admin/users/:id
Authorization: Bearer {token}

Response 200:
{
  "message": "用戶 0931239181 已刪除"
}
```

### 訂單管理

#### 取得所有訂單
```http
GET /api/admin/orders?page=1&limit=10
Authorization: Bearer {token}
```

#### 更新訂單狀態
```http
PATCH /api/admin/orders/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "shipped"
}

Response 200:
{
  "message": "訂單狀態已更新",
  "orderId": 1,
  "status": "shipped"
}
```

---

## 🛡️ 安全性

### 認證機制
- 使用 JWT Token 進行認證
- Token 有效期：24 小時
- 所有管理員 API 均需提供有效 Token

### 權限控制
- 所有管理員 API 都通過 `adminAuthMiddleware` 保護
- 標準用戶無法訪問管理員功能

### 密碼管理
- 使用 bcryptjs 進行密碼加密
- 推薦在首次登入後修改默認密碼

---

## 📱 UI 快捷方式

### 會員管理頁面
```
http://localhost:3000/admin/dashboard?tab=users
```

### 訂單管理頁面
```
http://localhost:3000/admin/dashboard?tab=orders
```

### 登出
- 點擊右上角「登出」按鈕
- Token 將被清除

---

## 🧪 測試

### 創建新的訂單
```bash
curl -X POST http://localhost:3001/api/admin/orders \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "parcel_id": 1,
    "total_amount": 500,
    "currency": "TWD",
    "payment_method": "credit_card"
  }'
```

### 更新用戶信息
```bash
curl -X PUT http://localhost:3001/api/admin/users/1 \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "real_name": "林先生",
    "address": "台北市"
  }'
```

---

## 📊 統計功能

### 儀表板統計
- **用戶總數**：系統中註冊的所有用戶
- **訂單總數**：所有創建的訂單
- **包裹總數**：所有追蹤的包裹

這些數據實時更新，點擊「概覽」標籤查看。

---

## 🔧 故障排查

### Q: 無法登入管理後台
**A:** 
1. 檢查用戶名和密碼是否正確
2. 確保後端服務運行中 (`npm run server`)
3. 清除瀏覽器 Cookie 並重試

### Q: 搜尋用戶沒有結果
**A:**
1. 檢查搜尋關鍵詞是否正確
2. 確認用戶確實存在於系統中
3. 嘗試刷新頁面

### Q: 無法刪除用戶
**A:**
1. 確認是否有相關訂單或包裹
2. 檢查是否有足夠的權限
3. 查看瀏覽器控制台的錯誤信息

---

## 📚 相關文件

| 文件 | 用途 |
|------|------|
| `server/routes/admin.ts` | 管理員 API 端點 |
| `src/pages/AdminLoginPage.tsx` | 登入頁面 |
| `src/pages/AdminDashboard.tsx` | 儀表板頁面 |
| `scripts/init-admin.js` | 管理員初始化腳本 |
| `server/db.ts` | 數據庫初始化和查詢語句 |

---

## 🚀 快速開始

```bash
# 1. 安裝依賴
npm install

# 2. 初始化管理員（如果未初始化）
node scripts/init-admin.js

# 3. 啟動服務
npm run dev:all

# 4. 訪問管理後台
# http://localhost:3000/admin/login
# 用戶名: admin
# 密碼: admin123
```

---

**最後更新日期**: 2026年2月22日
