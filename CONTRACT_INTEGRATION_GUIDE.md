# NFT合约集成使用指南

本文档说明如何使用新实现的前端合约调用功能。

## 功能概述

已实现的功能包括：

1. **获取某个用户的挂售和挂租的NFT列表**
2. **所有用户的挂售和挂租的NFT列表**
3. **用户之间购买、租赁NFT**
4. **用户所持有的NFT（已注册+已租赁）**
5. **当前用户的所有交易记录**

## 文件结构

```
src/
├── common/
│   └── connection-service.ts   # 现有的合约连接服务
├── hooks/
│   └── useContract.ts         # 新增的React Hooks
└── CONTRACT_INTEGRATION_GUIDE.md # 集成指南
```

## 核心服务

### connection-service.ts

项目已有的合约连接服务，位于 `src/common/connection-service.ts`，提供以下功能：

```typescript
// 获取用户NFT资产
const userNFTs = await getUserNFTAssets(userAddress)

// 获取当前用户NFT资产
const currentUserNFTs = await getCurrentUserNFTAssets()

// 获取所有NFT及挂售信息
const allNFTs = await getAllNFTsWithSaleInfo()

// 购买NFT
const txHash = await buyNFTFromSale(tokenId)

// 租赁NFT
const txHash = await rentNFT(tokenId, rentDays)

// 挂售NFT
const txHash = await listNFTForSale(tokenId, price, payToken, receiver)

// 挂租NFT
const txHash = await listNFTForRent(tokenId, rentFee, durationDays, rentReceiver, token)

// 取消挂售
const txHash = await cancelNFTSale(tokenId)

// 取消挂租
const txHash = await cancelNFTRent(tokenId)

// 注册NFT
const txHash = await registerNFT(tokenURI)

// 获取用户注册的ID
const registeredIDs = await getUserRegisteredIDs(userAddress)
```

## React Hooks

### 综合管理Hook

```typescript
import { useNFTManager } from '@/common/hooks';

function MyComponent() {
  const nftManager = useNFTManager(userAddress);
  
  // 合约状态
  const { isInitialized, contractLoading, contractError } = nftManager;
  
  // 用户NFT数据
  const { ownedNFTs, userSaleNFTs, userRentalNFTs } = nftManager;
  
  // 市场NFT数据
  const { marketSaleNFTs, marketRentalNFTs } = nftManager;
  
  // 交易功能
  const { buyNFT, rentNFT, listForSale, listForRent, cancelSale } = nftManager;
  
  // 交易记录
  const { transactions } = nftManager;
  
  // 刷新数据
  const { refetchAll, refetchUserNFTs, refetchMarketNFTs } = nftManager;
}
```

### 单独功能Hooks

```typescript
import {
  useUserSaleList,
  useUserRentalList,
  useAllSaleList,
  useAllRentalList,
  useUserOwnedNFTs,
  useTransactionHistory,
  useNFTTrading
} from '@/common/hooks';

// 获取用户挂售列表
const { nfts: userSaleNFTs, loading, error, refetch } = useUserSaleList(userAddress);

// 获取用户挂租列表
const { nfts: userRentalNFTs, loading, error, refetch } = useUserRentalList(userAddress);

// 获取所有挂售列表
const { nfts: allSaleNFTs, loading, error, refetch } = useAllSaleList();

// 获取所有挂租列表
const { nfts: allRentalNFTs, loading, error, refetch } = useAllRentalList();

// 获取用户持有的NFT
const { nfts: ownedNFTs, loading, error, refetch } = useUserOwnedNFTs(userAddress);

// 获取交易记录
const { transactions, loading, error, refetch } = useTransactionHistory(userAddress);

// NFT交易功能
const { buyNFT, rentNFT, listForSale, listForRent, cancelSale, loading, error } = useNFTTrading();
```

## 使用示例

### 1. 显示用户NFT资产

```typescript
import { useUserNFTs } from '@/hooks/useContract';

function UserNFTList() {
  const { nfts, loading, error, refetch } = useUserNFTs();
  
  if (loading) return <div>加载中...</div>;
  if (error) return <div>错误: {error}</div>;
  
  return (
    <div>
      <h2>我的NFT ({nfts.length})</h2>
      <button onClick={refetch}>刷新</button>
      {nfts.map(nft => (
        <div key={nft.tokenId}>
          <p>Token ID: {nft.tokenId}</p>
          <p>名称: {nft.name}</p>
          <p>拥有者: {nft.owner}</p>
          {nft.saleInfo?.isForSale && (
            <p>挂售价格: {nft.saleInfo.price} ETH</p>
          )}
        </div>
      ))}
    </div>
  );
}
```

### 2. 购买NFT

```typescript
import { useNFTTrading } from '@/hooks/useContract';

function BuyNFTButton({ tokenId }: { tokenId: string }) {
  const { buyNFT, loading, error } = useNFTTrading();
  
  const handleBuy = async () => {
    try {
      const txHash = await buyNFT(tokenId);
      console.log('购买成功，交易哈希:', txHash);
    } catch (err) {
      console.error('购买失败:', err);
    }
  };
  
  return (
    <button onClick={handleBuy} disabled={loading}>
      {loading ? '购买中...' : '购买NFT'}
    </button>
  );
}
```

### 3. 挂售NFT

```typescript
import { useNFTTrading } from '@/hooks/useContract';

function ListForSaleForm() {
  const { listForSale, loading, error } = useNFTTrading();
  const [formData, setFormData] = useState({
    tokenId: '',
    price: '',
    payToken: '0x0000000000000000000000000000000000000000', // ETH
    receiver: ''
  });
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const txHash = await listForSale(
        formData.tokenId,
        formData.price,
        formData.payToken,
        formData.receiver || undefined
      );
      console.log('挂售成功，交易哈希:', txHash);
    } catch (err) {
      console.error('挂售失败:', err);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* 表单字段 */}
      <button type="submit" disabled={loading}>
        {loading ? '挂售中...' : '挂售NFT'}
      </button>
    </form>
  );
}
```

### 4. 显示市场NFT

```typescript
import { useMarketNFTs } from '@/hooks/useContract';

function MarketNFTList() {
  const { saleNFTs, loading, error, refetch } = useMarketNFTs();
  
  if (loading) return <div>加载中...</div>;
  if (error) return <div>错误: {error}</div>;
  
  const forSaleNFTs = saleNFTs.filter(nft => nft.saleInfo?.isForSale);
  
  return (
    <div>
      <h2>市场NFT ({forSaleNFTs.length})</h2>
      <button onClick={refetch}>刷新</button>
      {forSaleNFTs.map(nft => (
        <div key={nft.tokenId}>
          <p>Token ID: {nft.tokenId}</p>
          <p>名称: {nft.name}</p>
          <p>价格: {nft.saleInfo?.price} ETH</p>
          <p>卖家: {nft.saleInfo?.seller}</p>
        </div>
      ))}
    </div>
  );
}
```

## 数据类型

### UserNFTAsset

```typescript
interface UserNFTAsset {
  tokenId: string;
  name: string;
  idString: string;
  tokenURI: string;
  image?: string;
  saleInfo?: NFTSaleInfo;
  owner: string;
}
```

### NFTSaleInfo

```typescript
interface NFTSaleInfo {
  seller: string;
  price: string;
  payToken: string;
  receiver: string;
  isForSale: boolean;
}
```

## 错误处理

所有的hooks都包含错误处理机制：

```typescript
const { nfts, loading, error, refetch } = useUserSaleList(userAddress);

if (error) {
  // 处理错误
  console.error('获取数据失败:', error);
}
```

## 注意事项

1. **合约初始化**：使用任何合约功能前，确保合约已初始化
2. **用户地址**：某些功能需要提供用户地址参数
3. **网络连接**：确保用户已连接到正确的区块链网络
4. **权限检查**：某些操作需要用户授权或拥有相应的NFT
5. **Gas费用**：所有写入操作都需要支付Gas费用
6. **交易确认**：交易提交后需要等待区块链确认

## 集成到现有页面

由于页面UI已经完成，你只需要：

1. **在页面组件中导入hooks**：
```tsx
import { 
  useUserNFTs, 
  useMarketNFTs, 
  useNFTTrading,
  useUserSaleList,
  useAllSaleList 
} from '@/hooks/useContract';
```

2. **替换现有的数据获取逻辑**：
```tsx
// 获取用户NFT
const { nfts, loading, error, refetch } = useUserNFTs();

// 获取市场挂售NFT
const { saleNFTs, loading, error, refetch } = useAllSaleList();

// 获取用户挂售列表
const { saleNFTs, loading, error, refetch } = useUserSaleList();
```

3. **添加交易功能**：
```tsx
const { 
  buyNFT, 
  rentNFTToken, 
  listForSale, 
  listForRent, 
  cancelSale, 
  cancelRent 
} = useNFTTrading();
```

4. **使用现有的connection-service函数**：
```tsx
import { 
  getUserNFTAssets,
  buyNFTFromSale,
  listNFTForSale 
} from '@/common/connection-service';
```

这样就可以将合约功能无缝集成到现有的页面中。