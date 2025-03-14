# QF-NFT 数字藏品交易平台

一个类似网易 BUFF 的 NFT 交易平台，提供数字藏品的买卖和租赁服务。

## 功能特点

- 浏览和搜索 NFT
- 购买或租赁 NFT
- 出售或出租自己的 NFT
- 管理个人 NFT 资产
- 连接钱包进行交易

## 技术栈

- Next.js 14
- TypeScript
- Tailwind CSS
- React Icons

## 页面结构

- 首页：展示全部在售 ID、推荐 ID、最新上架 ID，以及连接钱包功能
- 租赁：出租与挂租功能
- 库存：用户持有和已租的 ID 管理
- 个人中心：包含注册 ID、钱包地址、平台授权和轮播图等功能
- ID 详情：查看具体 NFT 的详细信息

## 开始使用

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 运行生产版本

```bash
npm start
```

## 项目结构

```
src/
├── app/                # 页面
│   ├── page.tsx        # 首页
│   ├── rental/         # 租赁页面
│   ├── inventory/      # 库存页面
│   ├── profile/        # 个人中心页面
│   └── nft/[id]/       # NFT详情页面
├── components/         # 组件
│   ├── layout/         # 布局组件
│   └── ui/             # UI组件
├── data/               # 模拟数据
└── types/              # 类型定义
```

## 后续开发计划

- 集成 Web3 钱包
- 添加 NFT 交易功能
- 实现用户认证
- 添加支付系统
- 优化移动端体验
