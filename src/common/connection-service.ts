import { ethers } from "ethers";
import { globalFeedback } from "@/components/ui/Feedback";
import { configuration } from "../config/blockChain";

export const connectOnce = async () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!(window as any).ethereum) {
    globalFeedback.toast.error(
      "钱包未安装",
      "请安装 MetaMask 或其他以太坊钱包"
    );
    throw new Error("以太坊钱包未安装");
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const provider = new ethers.providers.Web3Provider((window as any).ethereum);
  await provider.send("eth_requestAccounts", []);
  const signer = provider.getSigner();
  const network = await provider.getNetwork();
  const address = await signer.getAddress();
  return { chainId: network.chainId, address: address, provider, signer };
};
export const trying = async () => {
  const { chainId, address, provider, signer } = await connectOnce();
  const supported = configuration().chainId.toString();
  if (chainId.toString() == supported) {
    globalFeedback.toast.success(
      "连接成功",
      `链ID: ${chainId} | 账户: ${address.substring(0, 5)}...`
    );
    return { success: true, provider, signer };
  }
  globalFeedback.toast.warning(
    "链ID不匹配",
    `当前链ID: ${chainId} | 账户: ${address.substring(0, 5)}...`
  );
  return { success: false };
};
export const connect = async () => {
  const { success } = await trying();
  if (success) return;
  const conf = configuration();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!(window as any).ethereum) {
    globalFeedback.toast.error(
      "钱包未安装",
      "请安装 MetaMask 或其他以太坊钱包"
    );
    return;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (window as any).ethereum.request({
    method: "wallet_addEthereumChain",
    params: conf.params,
  });
  await trying();
};

// NFT合约地址
const NFT_CONTRACT_ADDRESS = "0xf27b70557f83956823c3174bf7955660b7c13a4d";

// NFT合约ABI - 只包含需要的函数
const NFT_CONTRACT_ABI = [
  {
    inputs: [{ internalType: "address", name: "owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "owner", type: "address" },
      { internalType: "uint256", name: "index", type: "uint256" },
    ],
    name: "tokenOfOwnerByIndex",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
    name: "tokenURI",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    name: "idOfToken",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    name: "saleInfo",
    outputs: [
      { internalType: "address", name: "seller", type: "address" },
      { internalType: "uint256", name: "price", type: "uint256" },
      { internalType: "address", name: "payToken", type: "address" },
      { internalType: "address", name: "receiver", type: "address" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSupply",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "index", type: "uint256" }],
    name: "tokenByIndex",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
    name: "ownerOf",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
];

// NFT出售信息接口
export interface NFTSaleInfo {
  seller: string;
  price: string;
  payToken: string;
  receiver: string;
  isForSale: boolean;
}

// 用户NFT资产接口
export interface UserNFTAsset {
  tokenId: string;
  name: string;
  idString: string;
  tokenURI: string;
  image?: string;
  saleInfo?: NFTSaleInfo;
  owner: string;
}

/**
 * 获取用户持有的所有NFT资产
 * @param userAddress 用户地址
 * @returns 用户的NFT资产列表
 */
export const getUserNFTAssets = async (
  userAddress?: string
): Promise<UserNFTAsset[]> => {
  try {
    const { provider, address } = await connectOnce();
    const targetAddress = userAddress || address;

    console.log("🚀 开始获取用户NFT资产");
    console.log("🚀 用户地址:", targetAddress);
    console.log("🚀 合约地址:", NFT_CONTRACT_ADDRESS);

    // 创建合约实例
    const contract = new ethers.Contract(
      NFT_CONTRACT_ADDRESS,
      NFT_CONTRACT_ABI,
      provider
    );

    // 获取用户拥有的NFT数量
    const balance = await contract.balanceOf(targetAddress);
    const balanceNum = balance.toNumber();

    console.log("🚀 用户拥有的NFT数量:", balanceNum);

    if (balanceNum === 0) {
      return [];
    }

    // 获取每个NFT的详细信息
    const assets: UserNFTAsset[] = [];

    for (let i = 0; i < balanceNum; i++) {
      try {
        // 获取tokenId
        const tokenId = await contract.tokenOfOwnerByIndex(targetAddress, i);
        const tokenIdString = tokenId.toString();

        console.log(`🚀 第${i + 1}个NFT - Token ID:`, tokenIdString);

        // 获取ID字符串
        const idString = await contract.idOfToken(tokenId);

        // 获取tokenURI
        const tokenURI = await contract.tokenURI(tokenId);

        console.log(`🚀 NFT详情 - ID: ${idString}, URI: ${tokenURI}`);

        // 获取出售信息
        const saleInfo = await getSaleInfo(tokenIdString);

        // 构造NFT资产对象
        const asset: UserNFTAsset = {
          tokenId: tokenIdString,
          name: idString || `NFT #${tokenIdString}`,
          idString: idString,
          tokenURI: tokenURI,
          image: `/images/nft${(i % 6) + 1}.jpg`, // 临时使用本地图片
          saleInfo: saleInfo,
          owner: targetAddress,
        };

        assets.push(asset);
      } catch (error) {
        console.error(`🚀 获取第${i + 1}个NFT信息失败:`, error);
      }
    }

    console.log("🚀 获取NFT资产完成:", assets);
    return assets;
  } catch (error) {
    console.error("🚀 获取用户NFT资产失败:", error);
    globalFeedback.toast.error(
      "获取资产失败",
      "无法获取您的NFT资产，请检查网络连接"
    );
    return [];
  }
};

/**
 * 获取NFT的出售信息
 * @param tokenId NFT的token ID
 * @returns NFT的出售信息
 */
export const getSaleInfo = async (tokenId: string): Promise<NFTSaleInfo> => {
  try {
    const { provider } = await connectOnce();

    console.log("🚀 查询NFT出售信息, Token ID:", tokenId);

    // 创建合约实例
    const contract = new ethers.Contract(
      NFT_CONTRACT_ADDRESS,
      NFT_CONTRACT_ABI,
      provider
    );

    // 调用saleInfo方法
    const saleResult = await contract.saleInfo(tokenId);

    console.log("🚀 合约返回的出售信息:", saleResult);

    // 检查是否有出售信息（price大于0表示正在出售）
    const price = saleResult.price.toString();
    const isForSale = price !== "0";

    const saleInfo: NFTSaleInfo = {
      seller: saleResult.seller,
      price: price,
      payToken: saleResult.payToken,
      receiver: saleResult.receiver,
      isForSale: isForSale,
    };

    console.log("🚀 处理后的出售信息:", saleInfo);
    return saleInfo;
  } catch (error) {
    console.error("🚀 获取NFT出售信息失败:", error);
    // 返回默认的空出售信息
    return {
      seller: "0x0000000000000000000000000000000000000000",
      price: "0",
      payToken: "0x0000000000000000000000000000000000000000",
      receiver: "0x0000000000000000000000000000000000000000",
      isForSale: false,
    };
  }
};

/**
 * 获取所有有价格的NFT（用于市场展示）
 * @returns 所有正在出售的NFT资产列表
 */
export const getAllNFTsWithSaleInfo = async (): Promise<UserNFTAsset[]> => {
  try {
    const { provider } = await connectOnce();

    console.log("🚀 开始获取所有NFT及出售信息...");

    // 创建合约实例
    const contract = new ethers.Contract(
      NFT_CONTRACT_ADDRESS,
      NFT_CONTRACT_ABI,
      provider
    );

    // 获取总供应量
    const totalSupply = await contract.totalSupply();
    const totalSupplyNum = totalSupply.toNumber();

    console.log("🚀 NFT总供应量:", totalSupplyNum);

    if (totalSupplyNum === 0) {
      return [];
    }

    // 获取所有NFT的详细信息
    const nftsWithSaleInfo: UserNFTAsset[] = [];

    for (let i = 0; i < totalSupplyNum; i++) {
      try {
        // 获取tokenId (通过索引)
        const tokenId = await contract.tokenByIndex(i);
        const tokenIdString = tokenId.toString();

        console.log(`🚀 第${i + 1}个NFT - Token ID:`, tokenIdString);

        // 获取出售信息
        const saleInfo = await getSaleInfo(tokenIdString);

        // 只处理有价格的NFT（正在出售的）
        if (saleInfo.isForSale && parseFloat(saleInfo.price) > 0) {
          // 获取NFT的其他信息
          const idString = await contract.idOfToken(tokenId);
          const tokenURI = await contract.tokenURI(tokenId);
          const owner = await contract.ownerOf(tokenId);

          console.log(
            `🚀 出售中的NFT - ID: ${idString}, 价格: ${saleInfo.price}, 所有者: ${owner}`
          );

          // 构造NFT资产对象
          const asset: UserNFTAsset = {
            tokenId: tokenIdString,
            name: idString || `NFT #${tokenIdString}`,
            idString: idString,
            tokenURI: tokenURI,
            image: `/images/nft${(i % 6) + 1}.jpg`, // 临时使用本地图片
            saleInfo: saleInfo,
            owner: owner,
          };

          nftsWithSaleInfo.push(asset);
        } else {
          console.log(`🚀 跳过未出售的NFT - Token ID: ${tokenIdString}`);
        }
      } catch (error) {
        console.error(`🚀 获取第${i + 1}个NFT信息失败:`, error);
      }
    }

    console.log("🚀 获取所有出售中的NFT完成:", nftsWithSaleInfo);
    return nftsWithSaleInfo;
  } catch (error) {
    console.error("🚀 获取所有NFT出售信息失败:", error);
    globalFeedback.toast.error(
      "获取市场数据失败",
      "无法获取市场上的NFT信息，请检查网络连接"
    );
    return [];
  }
};

/**
 * 获取当前连接用户的NFT资产
 * @returns 当前用户的NFT资产列表
 */
export const getCurrentUserNFTAssets = async (): Promise<UserNFTAsset[]> => {
  return getUserNFTAssets();
};
