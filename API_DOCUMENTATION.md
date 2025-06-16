# QF-DAPP NFT 数字身份交易平台 API 文档

## 📋 项目概述

基于 NestJS 的 NFT 数字身份交易平台后端 API，提供用户认证、NFT 管理、订单处理、交易记录、财务管理等功能。

## 🌐 服务信息

- **基础URL**: `http://localhost:3000/api/v1`
- **认证方式**: Bearer Token (JWT)
- **响应格式**: JSON

## 📝 通用响应格式

### 成功响应

```json
{
  "success": true,
  "data": {}, // 具体的响应数据
  "message": "请求成功",
  "timestamp": "2025-01-18T12:00:00.000Z"
}
```

### 错误响应

```json
{
  "success": false,
  "statusCode": 400,
  "message": "错误信息",
  "timestamp": "2025-01-18T12:00:00.000Z",
  "path": "/api/v1/endpoint"
}
```

## 🔐 认证模块 (Auth)

### 用户注册

- **接口**: `POST /auth/register`
- **描述**: 注册新用户账户
- **请求体**:

```json
{
  "address": "0x1234567890123456789012345678901234567890",
  "username": "user123",
  "password": "password123"
}
```

- **响应**:

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "address": "0x1234567890123456789012345678901234567890",
    "username": "user123",
    "avatar": "",
    "balance": 0
  }
}
```

### 用户登录

- **接口**: `POST /auth/login`
- **描述**: 用户密码登录
- **请求体**:

```json
{
  "address": "0x1234567890123456789012345678901234567890",
  "password": "password123"
}
```

- **响应**: 同注册响应

### 钱包签名登录

- **接口**: `POST /auth/wallet-login`
- **描述**: 通过钱包签名登录
- **请求体**:

```json
{
  "address": "0x1234567890123456789012345678901234567890",
  "signature": "0x...",
  "message": "Login message"
}
```

- **响应**: 同注册响应

## 👤 用户模块 (User)

### 获取用户列表

- **接口**: `GET /user`
- **描述**: 获取所有用户列表
- **响应**:

```json
[
  {
    "id": 1,
    "address": "0x1234567890123456789012345678901234567890",
    "username": "user123",
    "avatar": "",
    "balance": 100.5,
    "createdAt": "2025-01-18T12:00:00.000Z"
  }
]
```

### 获取用户详情

- **接口**: `GET /user/:id`
- **描述**: 获取指定用户详情
- **路径参数**:
  - `id` (number): 用户ID
- **响应**: 同用户列表单个对象

### 更新用户信息

- **接口**: `PATCH /user/:id`
- **描述**: 更新用户信息
- **请求体**:

```json
{
  "username": "newusername",
  "avatar": "https://example.com/avatar.jpg"
}
```

## 🎨 NFT/Value ID 模块

### 获取 NFT 列表

- **接口**: `GET /value-ids`
- **描述**: 获取 NFT 列表，支持分页和筛选
- **查询参数**:

  - `page` (number): 页码，默认 1
  - `limit` (number): 每页数量，默认 10
  - `name` (string): 名称搜索
  - `rarity` (string): 稀有度筛选 (common/uncommon/rare/epic/legendary)
  - `isForSale` (boolean): 是否在售
  - `isForRent` (boolean): 是否可租赁
  - `minPrice` (number): 最低价格
  - `maxPrice` (number): 最高价格
  - `ownerId` (number): 所有者ID
  - `sortBy` (string): 排序字段 (price/createdAt/viewCount/favoriteCount)
  - `sortOrder` (string): 排序方向 (ASC/DESC)

- **响应**:

```json
{
  "data": [
    {
      "id": 1,
      "name": "Digital Avatar #001",
      "description": "Unique digital identity NFT",
      "image": "https://example.com/nft1.jpg",
      "tokenId": "token_001",
      "price": 100.5,
      "rarity": "rare",
      "isForSale": true,
      "isForRent": false,
      "viewCount": 150,
      "favoriteCount": 25,
      "owner": {
        "id": 1,
        "username": "user123"
      },
      "attributes": [
        {
          "traitType": "Background",
          "value": "Blue",
          "rarity": 15.5
        }
      ]
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 10
}
```

### 获取 NFT 详情

- **接口**: `GET /value-ids/:id`
- **描述**: 获取指定 NFT 详细信息
- **路径参数**:
  - `id` (number): NFT ID
- **响应**: NFT 完整信息对象

### 创建 NFT

- **接口**: `POST /value-ids`
- **认证**: 需要 JWT
- **描述**: 创建新的 NFT
- **请求体**:

```json
{
  "name": "Digital Avatar #002",
  "description": "Another unique digital identity",
  "image": "https://example.com/nft2.jpg",
  "tokenId": "token_002",
  "indexNumber": "002",
  "price": 150.0,
  "paymentAddress": "0x...",
  "paymentCurrency": "ETH",
  "rarity": "epic",
  "attributes": [
    {
      "traitType": "Eyes",
      "value": "Laser",
      "rarity": 5.0
    }
  ]
}
```

### 更新 NFT

- **接口**: `PATCH /value-ids/:id`
- **认证**: 需要 JWT
- **描述**: 更新 NFT 信息（仅所有者）

### 删除 NFT

- **接口**: `DELETE /value-ids/:id`
- **认证**: 需要 JWT
- **描述**: 删除 NFT（仅所有者）

### 上架销售

- **接口**: `POST /value-ids/:id/list-for-sale`
- **认证**: 需要 JWT
- **描述**: 将 NFT 上架销售
- **请求体**:

```json
{
  "price": 200.0,
  "paymentAddress": "0x...",
  "paymentCurrency": "ETH"
}
```

### 上架租赁

- **接口**: `POST /value-ids/:id/list-for-rent`
- **认证**: 需要 JWT
- **描述**: 将 NFT 上架租赁
- **请求体**:

```json
{
  "rentalPrice": 10.0,
  "rentalPeriod": 30,
  "paymentAddress": "0x...",
  "paymentCurrency": "ETH"
}
```

### 取消销售

- **接口**: `POST /value-ids/:id/cancel-sale`
- **认证**: 需要 JWT
- **描述**: 取消 NFT 销售

### 取消租赁

- **接口**: `POST /value-ids/:id/cancel-rent`
- **认证**: 需要 JWT
- **描述**: 取消 NFT 租赁

### 添加收藏

- **接口**: `POST /value-ids/:id/favorites`
- **认证**: 需要 JWT
- **描述**: 将 NFT 添加到收藏夹

### 取消收藏

- **接口**: `DELETE /value-ids/:id/favorites`
- **认证**: 需要 JWT
- **描述**: 从收藏夹移除 NFT

### 获取推荐 NFT

- **接口**: `GET /value-ids/recommendations`
- **描述**: 获取推荐的 NFT
- **查询参数**:
  - `limit` (number): 数量限制，默认 10

### 获取最新 NFT

- **接口**: `GET /value-ids/latest`
- **描述**: 获取最新创建的 NFT
- **查询参数**:
  - `limit` (number): 数量限制，默认 10

## 📦 订单模块 (Orders)

### 创建订单

- **接口**: `POST /orders`
- **认证**: 需要 JWT
- **描述**: 创建新订单
- **请求体**:

```json
{
  "type": "buy", // buy/sell/rent
  "valueIdId": 1,
  "amount": 100.0,
  "currency": "ETH",
  "rentalPeriod": 30 // 仅租赁订单需要
}
```

### 获取订单列表

- **接口**: `GET /orders`
- **认证**: 需要 JWT
- **描述**: 获取当前用户的订单列表
- **查询参数**:

  - `page` (number): 页码
  - `limit` (number): 每页数量
  - `type` (string): 订单类型
  - `sortBy` (string): 排序字段
  - `sortOrder` (string): 排序方向

- **响应**:

```json
{
  "data": [
    {
      "id": 1,
      "type": "buy",
      "status": "pending",
      "amount": 100.0,
      "currency": "ETH",
      "valueID": {
        "id": 1,
        "name": "Digital Avatar #001"
      },
      "buyer": {
        "id": 2,
        "username": "buyer123"
      },
      "seller": {
        "id": 1,
        "username": "seller123"
      },
      "createdAt": "2025-01-18T12:00:00.000Z"
    }
  ],
  "total": 50,
  "page": 1,
  "limit": 10
}
```

### 获取所有订单

- **接口**: `GET /orders/all`
- **认证**: 需要 JWT
- **描述**: 获取所有订单（管理员接口）

### 获取订单详情

- **接口**: `GET /orders/:id`
- **认证**: 需要 JWT
- **描述**: 获取指定订单详情

### 更新订单

- **接口**: `PATCH /orders/:id`
- **认证**: 需要 JWT
- **描述**: 更新订单信息

### 取消订单

- **接口**: `POST /orders/:id/cancel`
- **认证**: 需要 JWT
- **描述**: 取消订单

### 完成订单

- **接口**: `POST /orders/:id/complete`
- **认证**: 需要 JWT
- **描述**: 完成订单（仅卖家）

### 删除订单

- **接口**: `DELETE /orders/:id`
- **认证**: 需要 JWT
- **描述**: 删除订单

## 💳 交易模块 (Transactions)

### 创建交易

- **接口**: `POST /transactions`
- **认证**: 需要 JWT
- **描述**: 创建交易记录
- **请求体**:

```json
{
  "transactionHash": "0x...",
  "type": "purchase",
  "amount": 100.0,
  "fee": 2.5,
  "currency": "ETH",
  "fromAddress": "0x...",
  "toAddress": "0x...",
  "valueIdId": 1,
  "buyerId": 2,
  "sellerId": 1,
  "orderId": 1
}
```

### 获取交易列表

- **接口**: `GET /transactions`
- **认证**: 需要 JWT
- **描述**: 获取当前用户相关的交易记录
- **查询参数**:

  - `page` (number): 页码
  - `limit` (number): 每页数量
  - `type` (string): 交易类型 (purchase/sale/rental)
  - `status` (string): 交易状态 (pending/completed/failed)
  - `currency` (string): 币种
  - `sortBy` (string): 排序字段
  - `sortOrder` (string): 排序方向

- **响应**:

```json
{
  "data": [
    {
      "id": 1,
      "transactionHash": "internal_1642521600000_abc12345",
      "type": "purchase",
      "status": "completed",
      "amount": 100.0,
      "fee": 2.5,
      "netAmount": 97.5,
      "currency": "ETH",
      "buyer": {
        "id": 2,
        "username": "buyer123"
      },
      "seller": {
        "id": 1,
        "username": "seller123"
      },
      "valueID": {
        "id": 1,
        "name": "Digital Avatar #001"
      },
      "createdAt": "2025-01-18T12:00:00.000Z"
    }
  ],
  "total": 25,
  "page": 1,
  "limit": 10
}
```

### 获取交易统计

- **接口**: `GET /transactions/stats`
- **认证**: 需要 JWT
- **描述**: 获取当前用户的交易统计
- **响应**:

```json
{
  "totalTransactions": 10,
  "totalPurchased": 500.0,
  "totalEarned": 300.0,
  "totalFees": 20.0
}
```

### 获取交易详情

- **接口**: `GET /transactions/:id`
- **认证**: 需要 JWT
- **描述**: 获取指定交易详情

### 确认交易

- **接口**: `POST /transactions/:id/confirm`
- **认证**: 需要 JWT
- **描述**: 确认交易完成

### 标记交易失败

- **接口**: `POST /transactions/:id/fail`
- **认证**: 需要 JWT
- **描述**: 标记交易失败
- **请求体**:

```json
{
  "reason": "支付失败"
}
```

## 💰 财务模块 (Finance)

### 钱包管理

#### 创建钱包

- **接口**: `POST /finance/wallets`
- **认证**: 需要 JWT
- **描述**: 创建新钱包
- **请求体**:

```json
{
  "address": "0x...",
  "currency": "ETH",
  "type": "metamask",
  "label": "我的主钱包",
  "isDefault": true
}
```

#### 获取钱包列表

- **接口**: `GET /finance/wallets`
- **认证**: 需要 JWT
- **描述**: 获取当前用户的钱包列表
- **响应**:

```json
[
  {
    "id": 1,
    "address": "0x...",
    "currency": "ETH",
    "balance": 100.5,
    "frozenBalance": 0,
    "type": "metamask",
    "status": "active",
    "isDefault": true,
    "label": "我的主钱包",
    "createdAt": "2025-01-18T12:00:00.000Z"
  }
]
```

#### 获取钱包详情

- **接口**: `GET /finance/wallets/:id`
- **认证**: 需要 JWT
- **描述**: 获取指定钱包详情

#### 更新钱包

- **接口**: `PATCH /finance/wallets/:id`
- **认证**: 需要 JWT
- **描述**: 更新钱包信息
- **请求体**:

```json
{
  "label": "更新后的钱包名称",
  "isDefault": false
}
```

### 余额管理

#### 查询余额

- **接口**: `GET /finance/balance/:currency`
- **认证**: 需要 JWT
- **描述**: 查询指定币种的总余额
- **路径参数**:
  - `currency` (string): 币种名称
- **响应**:

```json
{
  "balance": 150.75
}
```

### 转账功能

#### 用户间转账

- **接口**: `POST /finance/transfer`
- **认证**: 需要 JWT
- **描述**: 用户间资金转账
- **请求体**:

```json
{
  "fromUserId": 1,
  "toUserId": 2,
  "amount": 50.0,
  "currency": "ETH",
  "description": "转账备注"
}
```

### 提现和充值

#### 提现

- **接口**: `POST /finance/withdraw`
- **认证**: 需要 JWT
- **描述**: 申请提现
- **请求体**:

```json
{
  "amount": 100.0,
  "currency": "ETH",
  "toAddress": "0x...",
  "description": "提现到外部钱包"
}
```

#### 充值

- **接口**: `POST /finance/deposit`
- **认证**: 需要 JWT
- **描述**: 记录充值
- **请求体**:

```json
{
  "amount": 200.0,
  "currency": "ETH",
  "fromAddress": "0x...",
  "transactionHash": "0x...",
  "description": "从外部钱包充值"
}
```

### 财务记录

#### 获取财务记录

- **接口**: `GET /finance/records`
- **认证**: 需要 JWT
- **描述**: 获取财务流水记录
- **查询参数**:

  - `page` (number): 页码
  - `limit` (number): 每页数量
  - `type` (string): 记录类型 (income/expense/fee等)
  - `category` (string): 分类 (trading/rental/platform_fee等)
  - `currency` (string): 币种
  - `startDate` (string): 开始日期
  - `endDate` (string): 结束日期
  - `sortBy` (string): 排序字段
  - `sortOrder` (string): 排序方向

- **响应**:

```json
{
  "data": [
    {
      "id": 1,
      "type": "income",
      "category": "trading",
      "amount": 97.5,
      "currency": "ETH",
      "balanceBefore": 50.0,
      "balanceAfter": 147.5,
      "description": "出售NFT: Digital Avatar #001",
      "createdAt": "2025-01-18T12:00:00.000Z"
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 10
}
```

#### 获取财务统计

- **接口**: `GET /finance/stats`
- **认证**: 需要 JWT
- **描述**: 获取财务统计信息
- **查询参数**:
  - `currency` (string): 币种筛选
- **响应**:

```json
{
  "totalIncome": 500.0,
  "totalExpense": 300.0,
  "totalFees": 15.0,
  "totalRecords": 25,
  "netAmount": 200.0
}
```

## 🔍 搜索模块 (Search)

### 搜索 NFT

- **接口**: `GET /search/value-ids`
- **描述**: 搜索 NFT
- **查询参数**:
  - `q` (string): 搜索关键词
  - `category` (string): 分类
  - `minPrice` (number): 最低价格
  - `maxPrice` (number): 最高价格
  - `rarity` (string): 稀有度
  - `sortBy` (string): 排序字段
  - `sortOrder` (string): 排序方向
  - `page` (number): 页码
  - `limit` (number): 每页数量

### 获取推荐

- **接口**: `GET /search/recommendations`
- **描述**: 获取推荐 NFT
- **查询参数**:
  - `limit` (number): 数量限制

### 获取最新

- **接口**: `GET /search/latest`
- **描述**: 获取最新 NFT
- **查询参数**:
  - `limit` (number): 数量限制

### 获取热门

- **接口**: `GET /search/trending`
- **描述**: 获取热门 NFT
- **查询参数**:
  - `limit` (number): 数量限制

## 📊 状态码说明

| 状态码 | 说明           |
| ------ | -------------- |
| 200    | 请求成功       |
| 201    | 创建成功       |
| 204    | 删除成功       |
| 400    | 请求参数错误   |
| 401    | 未认证         |
| 403    | 权限不足       |
| 404    | 资源不存在     |
| 409    | 资源冲突       |
| 500    | 服务器内部错误 |

## 🚀 使用示例

### JavaScript/TypeScript 示例

```javascript
// 设置基础配置
const API_BASE_URL = 'http://localhost:3000/api/v1';
const token = localStorage.getItem('access_token');

// 通用请求函数
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(url, config);
  const data = await response.json();

  if (!data.success) {
    throw new Error(data.message);
  }

  return data.data;
}

// 用户登录
async function login(address, password) {
  const response = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ address, password }),
  });

  localStorage.setItem('access_token', response.access_token);
  return response;
}

// 获取 NFT 列表
async function getNFTList(params = {}) {
  const queryString = new URLSearchParams(params).toString();
  return await apiRequest(`/value-ids?${queryString}`);
}

// 创建订单
async function createOrder(orderData) {
  return await apiRequest('/orders', {
    method: 'POST',
    body: JSON.stringify(orderData),
  });
}

// 获取用户余额
async function getUserBalance(currency) {
  return await apiRequest(`/finance/balance/${currency}`);
}
```

## 🔧 环境配置

### 开发环境

```env
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=password
DB_DATABASE=qf_dapp
DB_SYNC=true

# JWT配置
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# 应用配置
PORT=3000
NODE_ENV=development
```

### 生产环境

```env
# 数据库配置
DB_HOST=your-production-host
DB_PORT=3306
DB_USERNAME=your-username
DB_PASSWORD=your-password
DB_DATABASE=qf_dapp
DB_SYNC=false

# JWT配置
JWT_SECRET=your-super-secret-production-key
JWT_EXPIRES_IN=7d

# 应用配置
PORT=3000
NODE_ENV=production
```

## 📝 注意事项

1. **认证要求**: 标记为"需要 JWT"的接口必须在请求头中包含有效的 Bearer Token
2. **参数验证**: 所有接口都会进行严格的参数验证，请确保参数类型和格式正确
3. **分页查询**: 支持分页的接口默认每页返回 10 条记录，最大支持 100 条
4. **错误处理**: 请根据返回的状态码和错误信息进行相应的错误处理
5. **安全考虑**: 生产环境请使用 HTTPS 协议，并妥善保管 JWT Token

## 🔄 版本更新

- **v1.0.0**: 初始版本，包含基础功能
- 更多版本信息请查看项目 CHANGELOG

---

如有疑问或需要技术支持，请联系开发团队。
