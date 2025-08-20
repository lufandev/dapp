# 合约集成使用指南

## 概览

已成功集成三个智能合约到项目中：

1. **NFTCore** - 核心 NFT 合约，负责注册和铸造
2. **NFTSale** - NFT 出售合约，使用 ETH 支付
3. **NFTRental** - NFT 租赁合约，使用 ETH 支付

## 部署前准备

### 1. 更新合约地址

在 `src/config/blockChain.ts` 中更新你在 Remix 部署的合约地址：

```typescript
{
  chainId: 0xaa36a7, // Sepolia 测试网
  nftAddress: "0xf27b70557f83956823c3174bf7955660b7c13a4d",
  // 用你的实际部署地址替换这些
  nftCoreAddress: "0x你的NFTCore合约地址",
  nftSaleAddress: "0x你的NFTSale合约地址",
  nftRentalAddress: "0x你的NFTRental合约地址",
  // ...
}
```

### 2. 合约部署顺序

在 Remix 中按以下顺序部署：

1. **NFTCore** - 需要参数：

   - `_paymentToken`: ERC20 代币地址（用于支付注册费）
   - `_registerFee`: 注册费用（wei 单位）
   - `_platformWallet`: 平台收款地址

2. **NFTSale** - 需要参数：

   - `_nftCore`: NFTCore 合约地址
   - `_nftRental`: NFTRental 合约地址（先部署一个占位符或使用零地址）
   - `initialOwner`: 合约所有者地址

3. **NFTRental** - 需要参数：
   - `_nftCore`: NFTCore 合约地址
   - `initialOwner`: 合约所有者地址

### 3. 授权平台

部署完成后，需要在 NFTCore 合约中授权其他两个合约：

```solidity
// 在 NFTCore 合约中调用
authorizePlatform(nftSaleAddress, true);
authorizePlatform(nftRentalAddress, true);
```

## 使用示例

### NFT 注册

```typescript
import { registerNFT } from "@/common/connection-service";

// 注册新的ID
try {
  const result = await registerNFT("alice");
  console.log("注册成功:", result.txHash);
  console.log("Token ID:", result.tokenId);
} catch (error) {
  console.error("注册失败:", error);
}
```

### 获取用户注册的 ID

```typescript
import { getUserRegisteredIDs } from "@/common/connection-service";

// 获取当前用户注册的所有ID
const userIDs = await getUserRegisteredIDs();
console.log("用户注册的ID:", userIDs);

// 获取指定用户注册的ID
const specificUserIDs = await getUserRegisteredIDs("0x123...");
```

### NFT 出售功能

```typescript
import {
  listNFTForSale,
  buyNFTFromSale,
  cancelNFTSale,
  getNFTSaleInfo,
} from "@/common/connection-service";

// 上架NFT出售
await listNFTForSale("1", "0.1"); // Token ID 1, 价格 0.1 ETH

// 购买NFT
await buyNFTFromSale("1");

// 取消出售
await cancelNFTSale("1");

// 获取出售信息
const saleInfo = await getNFTSaleInfo("1");
if (saleInfo) {
  console.log("卖家:", saleInfo.seller);
  console.log("价格:", saleInfo.priceInEth, "ETH");
}
```

### NFT 租赁功能

```typescript
import {
  listNFTForRent,
  rentNFT,
  cancelNFTRent,
  getNFTRentalInfo,
  getNFTActiveRental,
  claimExpiredRental,
} from "@/common/connection-service";

// 上架NFT出租
await listNFTForRent("1", "0.01", 30); // Token ID 1, 每日0.01 ETH, 最大30天

// 租赁NFT
await rentNFT("1", 7); // 租赁7天

// 取消出租
await cancelNFTRent("1");

// 获取租赁信息
const rentalInfo = await getNFTRentalInfo("1");
if (rentalInfo) {
  console.log("出租人:", rentalInfo.lender);
  console.log("每日租金:", rentalInfo.pricePerDayInEth, "ETH");
  console.log("最大天数:", rentalInfo.maxDays);
}

// 获取活跃租赁
const activeRental = await getNFTActiveRental("1");
if (activeRental) {
  console.log("租客:", activeRental.renter);
  console.log("到期时间:", new Date(activeRental.endTime * 1000));
  console.log("是否过期:", activeRental.isExpired);
}

// 归还过期租赁
if (activeRental?.isExpired) {
  await claimExpiredRental("1");
}
```

## 前端页面集成

### 在组件中使用

```typescript
// 在 React 组件中
import { useState } from "react";
import { registerNFT, listNFTForSale } from "@/common/connection-service";

export default function NFTManagement() {
  const [loading, setLoading] = useState(false);

  const handleRegister = async (id: string) => {
    setLoading(true);
    try {
      const result = await registerNFT(id);
      console.log("注册成功:", result);
    } catch (error) {
      console.error("注册失败:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleListForSale = async (tokenId: string, price: string) => {
    setLoading(true);
    try {
      await listNFTForSale(tokenId, price);
      console.log("上架成功");
    } catch (error) {
      console.error("上架失败:", error);
    } finally {
      setLoading(false);
    }
  };

  return <div>{/* 你的UI组件 */}</div>;
}
```

## 错误处理

所有函数都包含完整的错误处理，常见错误信息：

### NFTCore 错误

- "ID 长度必须在 3-10 个字符之间"
- "ID 只能包含字母和数字"
- "该 ID 注册次数已达上限(50 次)"
- "余额不足，无法支付注册费用"

### NFTSale 错误

- "只有 NFT 拥有者才能上架出售"
- "NFT 正在租赁中，无法出售"
- "NFT 未上架出售"
- "支付金额不足"

### NFTRental 错误

- "只有 NFT 拥有者才能上架出租"
- "NFT 已在租赁中"
- "每日租金必须大于 0"
- "租赁天数无效"

## 注意事项

1. **Gas 费用**: 所有交易都需要支付 Gas 费用
2. **网络确认**: 交易需要等待区块链确认
3. **权限检查**: 确保合约已正确授权
4. **前端反馈**: 使用内置的 Toast 提示给用户反馈
5. **测试**: 建议先在测试网充分测试再部署到主网

## 接下来的步骤

1. 在 Remix 中部署三个合约
2. 更新 `blockChain.ts` 中的合约地址
3. 在 NFTCore 中授权 Sale 和 Rental 合约
4. 在前端页面中集成相关功能
5. 测试完整的用户流程
