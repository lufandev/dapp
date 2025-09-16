import { ethers } from "ethers";
import { globalFeedback } from "@/components/ui/Feedback";
import { configuration } from "../config/blockChain";

// 导入新的合约ABI
import IDNFTABI from "@/artifacts/IDNFT.json";
import IDNFTSaleABI from "@/artifacts/IDNFTSale.json";
import IDNFTRentABI from "@/artifacts/IDNFTRent.json";

// 全局变量跟踪连接状态
let isConnecting = false;

// 类型定义
interface EthereumProvider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  send: (method: string, params: unknown[]) => Promise<unknown>;
}

interface WindowWithEthereum extends Window {
  ethereum?: EthereumProvider;
}

interface LogEvent {
  args: {
    account: string;
    id: string;
    tokenId: ethers.BigNumber;
    amount: ethers.BigNumber;
    nftAddr: string;
  };
  blockNumber: number;
  transactionHash: string;
}

interface TransactionEvent {
  event: string;
  args: {
    tokenId: ethers.BigNumber;
    [key: string]: unknown;
  };
}

export const connectOnce = async () => {
  if (typeof window === "undefined") {
    throw new Error("服务端环境不支持钱包连接");
  }
  if (!(window as WindowWithEthereum).ethereum) {
    globalFeedback.toast.error(
      "钱包未安装",
      "请安装 MetaMask 或其他以太坊钱包"
    );
    throw new Error("以太坊钱包未安装");
  }
  const provider = new ethers.providers.Web3Provider(
    (window as WindowWithEthereum)
      .ethereum as unknown as ethers.providers.ExternalProvider
  );
  console.log("开始连接钱包", provider);

  await provider.send("eth_requestAccounts", []);
  const signer = provider.getSigner();
  const network = await provider.getNetwork();
  const address = await signer.getAddress();
  return { chainId: network.chainId, address: address, provider, signer };
};
export const trying = async () => {
  if (typeof window === "undefined") {
    return { success: false };
  }
  console.log("trying");
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
  if (typeof window === "undefined") {
    throw new Error("服务端环境不支持钱包连接");
  }

  // 防止重复连接
  if (isConnecting) {
    globalFeedback.toast.warning("连接中", "钱包连接正在进行中，请稍候...");
    return;
  }

  try {
    isConnecting = true;
    console.log("connect");
    const { success } = await trying();
    if (success) return;
    const conf = configuration();
    if (!(window as WindowWithEthereum).ethereum) {
      globalFeedback.toast.error(
        "钱包未安装",
        "请安装 MetaMask 或其他以太坊钱包"
      );
      return;
    }
    await (window as WindowWithEthereum).ethereum!.request({
      method: "wallet_addEthereumChain",
      params: conf.params,
    });
    await trying();
  } catch (error) {
    console.error("连接钱包失败:", error);
    if (
      error instanceof Error &&
      error.message.includes("Already processing eth_requestAccounts")
    ) {
      globalFeedback.toast.warning(
        "请求处理中",
        "钱包正在处理连接请求，请稍候片刻再试"
      );
    } else {
      globalFeedback.toast.error("连接失败", "钱包连接失败，请重试");
    }
  } finally {
    // 延迟重置连接状态，避免用户快速重复点击
    setTimeout(() => {
      isConnecting = false;
    }, 2000);
  }
};

// 合约地址获取函数
export const getContractAddresses = () => {
  const config = configuration();
  return {
    nftCore: config.nftCoreAddress,
    nftSale: config.nftSaleAddress,
    nftRental: config.nftRentalAddress,
    // 向后兼容
    nft: config.nftAddress,
  };
};

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
 * 获取用户持有的所有NFT资产 - 基于事件日志
 * @param userAddress 用户地址
 * @returns 用户的NFT资产列表
 */
export const getUserNFTAssets = async (
  userAddress?: string
): Promise<UserNFTAsset[]> => {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const { provider, address } = await connectOnce();
    const targetAddress = userAddress || address;
    const addresses = getContractAddresses();

    console.log("🚀 开始获取用户NFT资产（基于事件日志）");
    console.log("🚀 用户地址:", targetAddress);
    console.log("🚀 NFTCore合约地址:", addresses.nftCore);

    // 过滤ABI，只保留函数和事件定义，排除error定义
    const filteredABI = IDNFTABI.filter(
      (item: { type: string }) =>
        item.type === "function" || item.type === "event"
    );

    // 创建NFTCore合约实例
    const nftCoreContract = new ethers.Contract(
      addresses.nftCore,
      filteredABI,
      provider
    );

    // 获取所有IDNFTMint事件（因为account参数不是索引参数，无法直接过滤）
    const filter = nftCoreContract.filters.IDNFTMint();
    const allLogs = await nftCoreContract.queryFilter(filter, 0, "latest");

    // 手动过滤用户相关的事件
    const logs = allLogs.filter((log: unknown) => {
      const logEvent = log as LogEvent;
      return (
        logEvent.args.account.toLowerCase() === targetAddress.toLowerCase()
      );
    });

    console.log(`🚀 找到 ${logs.length} 条注册记录`);

    if (logs.length === 0) {
      return [];
    }

    const assets: UserNFTAsset[] = [];

    // 处理每个注册事件
    for (let i = 0; i < logs.length; i++) {
      try {
        const log = logs[i];
        const logEvent = log as unknown as LogEvent;

        const tokenIdString = logEvent.args.tokenId.toString();
        const finalID = logEvent.args.id;

        console.log(
          `🚀 第${
            i + 1
          }个NFT - Token ID: ${tokenIdString}, Final ID: ${finalID}`
        );

        // 获取tokenURI
        let tokenURI;
        try {
          tokenURI = await nftCoreContract.uri(tokenIdString);
        } catch (error) {
          console.log(`🚀 无法获取NFT #${tokenIdString} 的tokenURI:`, error);
          tokenURI = finalID; // 使用finalID作为备用
        }

        console.log(`🚀 NFT详情 - ID: ${finalID}, URI: ${tokenURI}`);

        // 获取出售信息（使用新的NFTSale合约）
        let saleInfo: NFTSaleInfo;
        try {
          const nftSaleInfo = await getNFTSaleInfo(tokenIdString);
          if (nftSaleInfo) {
            saleInfo = {
              seller: nftSaleInfo.seller,
              price: nftSaleInfo.price,
              payToken: "0xC74d33a78Bf73d42CD7c9c236f4c819941B35852", // ETH
              receiver: nftSaleInfo.seller,
              isForSale: true,
            };
          } else {
            saleInfo = {
              seller: "0x0000000000000000000000000000000000000000",
              price: "0",
              payToken: "0xC74d33a78Bf73d42CD7c9c236f4c819941B35852",
              receiver: "0x0000000000000000000000000000000000000000",
              isForSale: false,
            };
          }
        } catch (error) {
          console.log(`🚀 无法获取NFT #${tokenIdString} 的出售信息:`, error);
          saleInfo = {
            seller: "0x0000000000000000000000000000000000000000",
            price: "0",
            payToken: "0xC74d33a78Bf73d42CD7c9c236f4c819941B35852",
            receiver: "0x0000000000000000000000000000000000000000",
            isForSale: false,
          };
        }

        // 构造NFT资产对象
        const asset: UserNFTAsset = {
          tokenId: tokenIdString,
          name: finalID || `NFT #${tokenIdString}`,
          idString: finalID,
          tokenURI: tokenURI,
          image: `/images/nft${(i % 6) + 1}.jpg`, // 临时使用本地图片
          saleInfo: saleInfo,
          owner: targetAddress,
        };

        assets.push(asset);
      } catch (error) {
        console.error(`🚀 处理第${i + 1}个注册记录失败:`, error);
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
 * 获取所有有价格的NFT（用于市场展示）- 通过监听SaleEvent事件
 * @returns 所有正在出售的NFT资产列表
 */
export const getAllNFTsWithSaleInfo = async (): Promise<UserNFTAsset[]> => {
  console.log("🚀 开始获取NFT销售信息");
  if (typeof window === "undefined") {
    console.log("🚀 服务端环境，返回空数组");
    return [];
  }
  try {
    // 使用只读provider，不需要钱包连接
    let provider;
    try {
      console.log("🚀 尝试连接钱包");
      const { provider: walletProvider } = await connectOnce();
      provider = walletProvider;
      console.log("🚀 钱包连接成功");
    } catch {
      // 如果钱包连接失败，使用只读provider
      console.log("🚀 钱包未连接，使用只读provider");
      try {
        const { rpcUrl } = await import("../config/blockChain");
        provider = new ethers.providers.JsonRpcProvider(rpcUrl());
        console.log("🚀 只读provider创建成功", rpcUrl());
        // 测试连接
        await provider.getNetwork();
        console.log("🚀 区块链连接测试成功");
      } catch (providerError) {
        console.log("🚀 区块链连接失败，使用模拟数据", providerError);
        // 返回模拟数据，确保name和description正确
        return [
          {
            tokenId: "1",
            name: "bbb",
            idString: "bbb",
            image: "/images/nft2.jpg",
            tokenURI: "",
            owner: "0xFFe523C8CD17DE73068620f95eA6f0264D3d4749",
            saleInfo: {
              isForSale: true,
              price: "1000000000000000000", // 1 ETH in wei
              payToken: "0xC74d33a78Bf73d42CD7c9c236f4c819941B35852",
              receiver: "0xFFe523C8CD17DE73068620f95eA6f0264D3d4749",
              seller: "0xFFe523C8CD17DE73068620f95eA6f0264D3d4749",
            },
          },
        ];
      }
    }
    const addresses = getContractAddresses();

    console.log("🚀 开始获取所有NFT及出售信息（通过SaleEvent事件）...");
    console.log("🚀 NFTSale合约地址:", addresses.nftSale);
    console.log("🚀 NFTCore合约地址:", addresses.nftCore);

    // 过滤ABI，只保留函数和事件定义，排除error定义
    const filteredSaleABI = IDNFTSaleABI.filter(
      (item: { type: string }) =>
        item.type === "function" || item.type === "event"
    );
    const filteredCoreABI = IDNFTABI.filter(
      (item: { type: string }) =>
        item.type === "function" || item.type === "event"
    );

    // 创建合约实例
    const nftSaleContract = new ethers.Contract(
      addresses.nftSale,
      filteredSaleABI,
      provider
    );
    const nftCoreContract = new ethers.Contract(
      addresses.nftCore,
      filteredCoreABI,
      provider
    );

    // 获取所有SaleEvent事件（上架事件）
    const saleFilter = nftSaleContract.filters.SaleEvent();
    const saleEvents = await nftSaleContract.queryFilter(
      saleFilter,
      0,
      "latest"
    );

    console.log(`🚀 找到 ${saleEvents.length} 条SaleEvent记录`);
    
    // 添加详细的事件信息日志
    console.log(`📋 所有SaleEvent事件详情:`);
    saleEvents.forEach((event, index) => {
      const args = event.args;
      if (args) {
        console.log(`  事件 #${index}: TokenId=${args.tokenId.toString()}, Amount=${args.amount.toString()}, Buyer=${args.buyer}, Price=${ethers.utils.formatEther(args.price)} ETH, Block=${event.blockNumber}`);
      }
    });
    console.log(`🔍 开始分析所有SaleEvent事件...`);

    if (saleEvents.length === 0) {
      return [];
    }

    const assets: UserNFTAsset[] = [];
    const tokenSaleStatus = new Map<string, { isForSale: boolean; latestEvent: ethers.Event }>(); // 记录每个tokenId的最新销售状态

    // 首先处理所有事件，找出每个tokenId的最新状态
    for (let i = saleEvents.length - 1; i >= 0; i--) {
      // 从最新的事件开始处理
      try {
        const event = saleEvents[i];
        const args = event.args;

        if (!args) continue;

        const tokenIdString = args.tokenId.toString();
        const amountString = args.amount.toString();
        const buyer = args.buyer;
        const blockNumber = event.blockNumber;
        const transactionHash = event.transactionHash;

        console.log(`🔍 处理事件 #${i}: TokenId=${tokenIdString}, Amount=${amountString}, Buyer=${buyer}, Block=${blockNumber}, TxHash=${transactionHash}`);

        // 如果这个tokenId还没有被处理过，记录其最新状态
        if (!tokenSaleStatus.has(tokenIdString)) {
          // 判断是否仍在销售中
          const isForSale = buyer === "0x0000000000000000000000000000000000000000" && amountString !== "0";
          
          tokenSaleStatus.set(tokenIdString, {
            isForSale,
            latestEvent: event
          });
          
          console.log(`✅ NFT #${tokenIdString} 最新状态: ${isForSale ? '在售' : '已售出/已取消'} (Amount=${amountString}, Buyer=${buyer})`);
        } else {
          console.log(`⏭️ NFT #${tokenIdString} 已处理过，跳过此事件`);
        }
      } catch (error) {
        console.error(`🚀 处理第${i + 1}个SaleEvent记录失败:`, error);
      }
    }

    console.log(`📊 事件分析完成，共处理 ${tokenSaleStatus.size} 个不同的TokenId`);
    console.log(`🔍 开始构建在售NFT列表...`);

    // 然后处理所有仍在销售中的NFT
    for (const [tokenIdString, status] of tokenSaleStatus) {
      if (!status.isForSale) {
        console.log(`⏭️ 跳过NFT #${tokenIdString} (不在售)`);
        continue; // 跳过已售出或已取消的NFT
      }

      console.log(`🛒 处理在售NFT #${tokenIdString}`);

      try {
        const event = status.latestEvent;
        const args = event.args;

        if (!args) continue;

        // 安全地转换BigNumber类型的数据
        const priceString = args.price.toString();
        const amountString = args.amount.toString();
        const priceInEther = ethers.utils.formatEther(args.price);

        // 处理Indexed类型的id字段
        let idValue = "";
        if (args.id && typeof args.id === "object" && "hash" in args.id) {
          // id是indexed参数，只能获取hash值
          idValue = args.id.hash || "";
        } else if (typeof args.id === "string") {
          idValue = args.id;
        }

        const seller = args.seller;
        const receiver = args.receiver;
        const payToken = args.payToken;
        const nftAddr = args.nftAddr;

        console.log(
          `🚀 处理NFT #${tokenIdString} - ID: ${idValue}, 价格: ${priceInEther} ETH, 卖家: ${seller}`
        );

        // 通过tokenId查询IDNFTMint事件获取原始的id值
        let originalId = "";
        try {
          const mintFilter = nftCoreContract.filters.IDNFTMint(
            null,
            null,
            tokenIdString
          );
          const mintLogs = await nftCoreContract.queryFilter(
            mintFilter,
            0,
            "latest"
          );
          if (mintLogs.length > 0) {
            const mintEvent = mintLogs[0] as unknown as LogEvent;
            originalId = mintEvent.args.id;
            console.log(
              `🚀 找到原始ID: ${originalId} for tokenId: ${tokenIdString}`
            );
          }
        } catch (error) {
          console.log(`🚀 无法获取NFT #${tokenIdString} 的原始ID:`, error);
        }

        // 获取tokenURI
        let tokenURI;
        try {
          tokenURI = await nftCoreContract.uri(tokenIdString);
        } catch (error) {
          console.log(`🚀 无法获取NFT #${tokenIdString} 的tokenURI:`, error);
          tokenURI = originalId || idValue || `NFT #${tokenIdString}`;
        }

        // 构造出售信息
        const saleInfo: NFTSaleInfo = {
          seller: seller,
          price: priceString, // 使用wei单位的价格字符串
          payToken: payToken, // 使用实际的支付代币地址
          receiver: receiver,
          isForSale: true,
        };

        // 构造NFT资产对象
        const asset: UserNFTAsset = {
          tokenId: tokenIdString,
          name: originalId || `NFT #${tokenIdString}`,
          idString: originalId,
          tokenURI: tokenURI,
          image: `/images/nft${(assets.length % 6) + 1}.jpg`, // 临时使用本地图片
          saleInfo: saleInfo,
          owner: seller,
        };

        // 记录NFT合约地址信息（用于调试）
        console.log(`🚀 NFT合约地址: ${nftAddr}, 数量: ${amountString}`);

        assets.push(asset);
      } catch (error) {
        console.error(`🚀 处理NFT #${tokenIdString} 失败:`, error);
      }
    }

    console.log(
      `🚀 获取所有NFT出售信息完成，共 ${assets.length} 个正在出售的NFT`
    );
    return assets;
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

// ========== NFTCore 合约相关函数 ==========

/**
 * 注册新的ID并铸造NFT
 * @param id 要注册的ID字符串
 * @returns 交易哈希和新生成的tokenId
 */
export const registerNFT = async (
  id: string
): Promise<{ txHash: string; tokenId?: string }> => {
  try {
    const { signer, address } = await connectOnce();
    const addresses = getContractAddresses();

    console.log("🚀 注册NFT - ID:", id, addresses.nftCore, signer);

    // 过滤ABI，只保留函数定义，排除错误定义
    const filteredABI = IDNFTABI.filter(
      (item: { type: string }) =>
        item.type === "function" || item.type === "event"
    );
    const contract = new ethers.Contract(
      addresses.nftCore,
      filteredABI,
      signer
    );

    // 调用mint函数铸造NFT
    console.log("🚀 ~ registerNFT ~ userAddress:", address);
    const tx = await contract.mint(address, id, 1, "0x");
    console.log("🚀 交易已发送:", tx.hash);

    globalFeedback.toast.success("交易已发送", "正在等待区块链确认...");

    // 等待交易确认
    const receipt = await tx.wait();
    console.log("🚀 交易确认:", receipt);

    // 从事件日志中获取tokenId
    let tokenId;
    if (receipt.events) {
      const mintEvent = receipt.events.find(
        (event: unknown) => (event as TransactionEvent).event === "IDNFTMint"
      );
      if (mintEvent) {
        tokenId = mintEvent.args.tokenId.toString();
      }
    }

    globalFeedback.toast.success(
      "注册成功",
      `ID "${id}" 注册成功！${tokenId ? `Token ID: ${tokenId}` : ""}`
    );

    return { txHash: tx.hash, tokenId };
  } catch (error) {
    console.error("🚀 注册NFT失败:", error);

    let errorMessage = "注册失败，请重试";
    if (error instanceof Error) {
      if (error.message.includes("ID length invalid")) {
        errorMessage = "ID长度必须在3-10个字符之间";
      } else if (error.message.includes("ID must be alphanumeric")) {
        errorMessage = "ID只能包含字母和数字";
      } else if (error.message.includes("ID max registration reached")) {
        errorMessage = "该ID注册次数已达上限(50次)";
      } else if (error.message.includes("insufficient funds")) {
        errorMessage = "余额不足，无法支付注册费用";
      }
    }

    globalFeedback.toast.error("注册失败", errorMessage);
    throw error;
  }
};

/**
 * 获取所有注册的ID（分页）
 * @param offset 起始位置
 * @param limit 数量限制
 * @returns ID列表
 */
export const getAllRegisteredIDs = async (
  offset: number = 0,
  limit: number = 20
): Promise<string[]> => {
  try {
    const { provider } = await connectOnce();
    const addresses = getContractAddresses();

    // 过滤ABI，只保留函数和事件定义，排除error定义
    const filteredABI = IDNFTABI.filter(
      (item: { type: string }) =>
        item.type === "function" || item.type === "event"
    );

    const contract = new ethers.Contract(
      addresses.nftCore,
      filteredABI,
      provider
    );
    const ids = await contract.getIDsPaginated(offset, limit);

    console.log(
      `🚀 获取ID列表 - 偏移:${offset}, 限制:${limit}, 结果:${ids.length}条`
    );
    return ids;
  } catch (error) {
    console.error("🚀 获取ID列表失败:", error);
    return [];
  }
};

// ========== NFTSale 合约相关函数 ==========

/**
 * 上架NFT出售
 * @param tokenId NFT的token ID
 * @param priceInEth 价格（ETH单位）
 * @returns 交易哈希
 */
export const listNFTForSale = async (
  tokenId: string,
  priceInEth: string,
  id: string = "",
  amount: string = "1",
  payToken: string = "0xC74d33a78Bf73d42CD7c9c236f4c819941B35852", // ETH
  receiver?: string,
  nftAddr?: string
): Promise<string> => {
  try {
    const { signer, address } = await connectOnce();
    const addresses = getContractAddresses();

    console.log(
      `🚀 上架NFT出售 - Token ID: ${tokenId}, 价格: ${priceInEth} ETH`
    );

    // 过滤ABI，只保留函数和事件定义，排除error定义
    const filteredSaleABI = IDNFTSaleABI.filter(
      (item: { type: string }) =>
        item.type === "function" || item.type === "event"
    );

    const contract = new ethers.Contract(
      addresses.nftSale,
      filteredSaleABI,
      signer
    );
    const priceInWei = ethers.utils.parseEther(priceInEth);
    const finalReceiver = receiver || address;
    const finalNftAddr = nftAddr || addresses.nftCore;

    // 根据ABI，listForSale需要7个参数：id, tokenId, price, amount, payToken, receiver, nftAddr
    const tx = await contract.listForSale(
      id,
      tokenId,
      priceInWei,
      amount,
      payToken,
      finalReceiver,
      finalNftAddr
    );
    console.log("🚀 交易已发送:", tx.hash);

    globalFeedback.toast.success("交易已发送", "正在等待区块链确认...");

    await tx.wait();
    globalFeedback.toast.success("上架成功", `NFT #${tokenId} 已成功上架！`);

    return tx.hash;
  } catch (error) {
    console.error("🚀 上架NFT失败:", error);

    let errorMessage = "上架失败，请重试";
    if (error instanceof Error) {
      if (error.message.includes("Not NFT owner")) {
        errorMessage = "只有NFT拥有者才能上架出售";
      } else if (error.message.includes("NFT is rented")) {
        errorMessage = "NFT正在租赁中，无法出售";
      } else if (error.message.includes("Price=0")) {
        errorMessage = "价格必须大于0";
      }
    }

    globalFeedback.toast.error("上架失败", errorMessage);
    throw error;
  }
};

/**
 * 购买NFT
 * @param tokenId NFT的token ID
 * @param amount 购买数量，默认为1
 * @returns 交易哈希
 */
export const buyNFTFromSale = async (
  tokenId: string,
  amount: string = "1"
): Promise<string> => {
  try {
    const { signer } = await connectOnce();
    const addresses = getContractAddresses();

    console.log(`🚀 购买NFT - Token ID: ${tokenId}, 数量: ${amount}`);

    // 转换参数类型
    const tokenIdBN = ethers.BigNumber.from(tokenId);

    // 过滤ABI，只保留函数和事件定义，排除error定义
    const filteredSaleABI = IDNFTSaleABI.filter(
      (item: { type: string }) =>
        item.type === "function" || item.type === "event"
    );

    const contract = new ethers.Contract(
      addresses.nftSale,
      filteredSaleABI,
      signer
    );

    // 首先获取销售信息（通过事件日志）
    console.log("🚀 获取销售信息...");
    let saleInfo: {
      price: ethers.BigNumber;
      payToken: string;
      seller: string;
      receiver: string;
      nftAddr: string;
    } | null = null;

    try {
      // 查询SaleEvent事件获取销售信息
      const filter = contract.filters.SaleEvent(null, tokenIdBN);
      const events = await contract.queryFilter(filter, 0, "latest");

      if (events.length > 0) {
        // 获取最新的销售事件（buyer为0地址表示上架，非0地址表示已售出）
        const latestEvent = events[events.length - 1];
        const eventArgs = latestEvent.args;

        if (eventArgs && eventArgs.buyer === ethers.constants.AddressZero) {
          saleInfo = {
            price: eventArgs.price,
            payToken: eventArgs.payToken,
            seller: eventArgs.seller,
            receiver: eventArgs.receiver,
            nftAddr: eventArgs.nftAddr,
          };
          console.log("🚀 找到销售信息:", saleInfo);
        } else {
          throw new Error("NFT已售出或未上架");
        }
      } else {
        throw new Error("未找到销售信息");
      }
    } catch (eventError) {
      console.error("🚀 获取销售信息失败:", eventError);
      throw new Error("无法获取NFT销售信息，可能未上架出售");
    }

    // 检查支付代币类型
    if (saleInfo.payToken === ethers.constants.AddressZero) {
      // payToken为0地址，表示使用ETH定价
      throw new Error(
        "此NFT使用ETH定价，但当前合约版本存在设计缺陷，无法正确处理任何类型的支付。\n\n问题详情：合约的buy函数使用了错误的转账方式，导致无法从买家账户扣款。\n\n建议解决方案：\n1. 联系开发团队修复合约代码\n2. 或联系卖家重新部署修复后的合约\n3. 或等待合约升级"
      );
    }

    // 处理ERC20代币支付
    console.log(`🚀 使用ERC20代币支付: ${saleInfo.payToken}`);
    console.log(`🚀 价格: ${ethers.utils.formatEther(saleInfo.price)} 代币`);

    // 重要提示：合约设计缺陷警告
    throw new Error(
      "合约设计存在严重缺陷，无法正确处理任何类型的支付。\n\n问题详情：\n- 合约的buy函数使用了IERC20.transfer()而不是transferFrom()\n- 这意味着合约试图从自己的余额转账，而不是从买家账户扣款\n- 除非合约地址预先持有足够的代币，否则交易必然失败\n\n这是一个严重的合约设计错误，需要重新部署修复后的合约才能正常使用。\n\n建议解决方案：\n1. 联系开发团队修复合约代码（将transfer改为transferFrom）\n2. 重新部署修复后的合约\n3. 或使用其他正确实现的NFT交易合约"
    );
  } catch (error) {
    console.error("🚀 购买NFT失败:", error);

    let errorMessage = "购买失败，请重试";
    if (error instanceof Error) {
      if (error.message.includes("buy over amount")) {
        errorMessage = "购买数量超过可售数量";
      } else if (error.message.includes("Insufficient payment token balance")) {
        errorMessage = "代币余额不足";
      } else if (error.message.includes("此NFT使用ETH定价")) {
        errorMessage = error.message;
      } else if (error.message.includes("代币余额不足")) {
        errorMessage = error.message;
      } else if (error.message.includes("无法获取NFT销售信息")) {
        errorMessage = error.message;
      } else if (error.message.includes("NFT已售出或未上架")) {
        errorMessage = "NFT已售出或未上架出售";
      }
    }

    globalFeedback.toast.error("购买失败", errorMessage);
    throw error;
  }
};

/**
 * 取消NFT出售
 * @param tokenId NFT的token ID
 * @returns 交易哈希
 */
export const cancelNFTSale = async (tokenId: string): Promise<string> => {
  try {
    const { signer } = await connectOnce();
    const addresses = getContractAddresses();

    console.log(`🚀 取消NFT出售 - Token ID: ${tokenId}`);

    // 过滤ABI，只保留函数和事件定义，排除error定义
    const filteredSaleABI = IDNFTSaleABI.filter(
      (item: { type: string }) =>
        item.type === "function" || item.type === "event"
    );

    const contract = new ethers.Contract(
      addresses.nftSale,
      filteredSaleABI,
      signer
    );
    const tx = await contract.cancleSale(tokenId);

    console.log("🚀 交易已发送:", tx.hash);
    globalFeedback.toast.success("交易已发送", "正在等待区块链确认...");

    await tx.wait();
    globalFeedback.toast.success("取消成功", `NFT #${tokenId} 已取消出售！`);

    return tx.hash;
  } catch (error) {
    console.error("🚀 取消NFT出售失败:", error);

    let errorMessage = "取消失败，请重试";
    if (error instanceof Error) {
      if (error.message.includes("Not seller")) {
        errorMessage = "只有卖家才能取消出售";
      }
    }

    globalFeedback.toast.error("取消失败", errorMessage);
    throw error;
  }
};

/**
 * 获取NFT出售信息
 * @param tokenId NFT的token ID
 * @returns 出售信息
 */
export const getNFTSaleInfo = async (
  tokenId: string
): Promise<{
  seller: string;
  price: string;
  priceInEth: string;
} | null> => {
  try {
    console.log(`⚠️ 获取NFT出售信息 - Token ID: ${tokenId}`);
    console.log("⚠️ 注意：合约中的saleInfos是私有映射，无法直接访问");
    console.log("⚠️ 需要合约添加公共getter函数或通过事件日志获取销售信息");

    // 暂时返回null，因为无法访问私有的saleInfos映射
    return null;
  } catch (error) {
    console.error("🚀 获取NFT出售信息失败:", error);
    return null;
  }
};

// ========== NFTRental 合约相关函数 ==========

/**
 * 上架NFT出租
 * @param tokenId NFT的token ID
 * @param pricePerDayInEth 每日租金（ETH单位）
 * @param maxDays 最大租赁天数
 * @param id 租赁ID
 * @param rentReceiver 租金接收地址
 * @param nftAddr NFT合约地址
 * @returns 交易哈希
 */
export const listNFTForRent = async (
  tokenId: string,
  pricePerDayInEth: string,
  maxDays: number,
  id: string = "",
  rentReceiver?: string,
  nftAddr?: string
): Promise<string> => {
  try {
    const { signer, address } = await connectOnce();
    const addresses = getContractAddresses();

    console.log(
      `🚀 上架NFT出租 - Token ID: ${tokenId}, 每日租金: ${pricePerDayInEth} ETH, 最大天数: ${maxDays}`
    );

    // 过滤ABI，只保留函数和事件定义，排除error定义
    const filteredRentABI = IDNFTRentABI.filter(
      (item: { type: string }) =>
        item.type === "function" || item.type === "event"
    );

    const contract = new ethers.Contract(
      addresses.nftRental,
      filteredRentABI,
      signer
    );
    const rentFeeInWei = ethers.utils.parseEther(pricePerDayInEth);
    const finalRentReceiver = rentReceiver || address;
    const finalNftAddr = nftAddr || addresses.nftCore;
    const payToken = "0xC74d33a78Bf73d42CD7c9c236f4c819941B35852"; // ETH

    // 根据ABI，listForRent需要7个参数：tokenId, id, nftAddr, durationDays, rentReceiver, token, rentFee
    const tx = await contract.listForRent(
      tokenId,
      id,
      finalNftAddr,
      maxDays,
      finalRentReceiver,
      payToken,
      rentFeeInWei
    );
    console.log("🚀 交易已发送:", tx.hash);

    globalFeedback.toast.success("交易已发送", "正在等待区块链确认...");

    await tx.wait();
    globalFeedback.toast.success(
      "上架成功",
      `NFT #${tokenId} 已成功上架出租！`
    );

    return tx.hash;
  } catch (error) {
    console.error("🚀 上架NFT出租失败:", error);

    let errorMessage = "上架失败，请重试";
    if (error instanceof Error) {
      if (error.message.includes("Not NFT owner")) {
        errorMessage = "只有NFT拥有者才能上架出租";
      } else if (error.message.includes("Already rented")) {
        errorMessage = "NFT已在租赁中";
      } else if (error.message.includes("PricePerDay=0")) {
        errorMessage = "每日租金必须大于0";
      } else if (error.message.includes("MaxDays=0")) {
        errorMessage = "最大天数必须大于0";
      }
    }

    globalFeedback.toast.error("上架失败", errorMessage);
    throw error;
  }
};

/**
 * 租赁NFT
 * @param tokenId NFT的token ID
 * @param daysCount 租赁天数
 * @returns 交易哈希
 */
export const rentNFT = async (
  tokenId: string,
  daysCount: number,
  id: string = ""
): Promise<string> => {
  try {
    const { signer } = await connectOnce();
    const addresses = getContractAddresses();

    console.log(`🚀 租赁NFT - Token ID: ${tokenId}, 天数: ${daysCount}`);

    // 过滤ABI，只保留函数和事件定义，排除error定义
    const filteredRentABI = IDNFTRentABI.filter(
      (item: { type: string }) =>
        item.type === "function" || item.type === "event"
    );

    const contract = new ethers.Contract(
      addresses.nftRental,
      filteredRentABI,
      signer
    );

    // 获取租赁信息
    const rentalInfo = await contract.rentInfos(tokenId);
    if (rentalInfo.lender === "0x0000000000000000000000000000000000000000") {
      throw new Error("NFT未上架出租");
    }
    if (rentalInfo.renter !== "0x0000000000000000000000000000000000000000") {
      throw new Error("NFT已被租赁");
    }

    const totalCost = rentalInfo.rentFee.mul(daysCount);
    console.log("🚀 总租金:", totalCost.toString(), "ETH");

    const tx = await contract.rent(tokenId, id, {
      value: totalCost,
    });

    console.log("🚀 交易已发送:", tx.hash);
    globalFeedback.toast.success("交易已发送", "正在等待区块链确认...");

    await tx.wait();
    globalFeedback.toast.success(
      "租赁成功",
      `NFT #${tokenId} 租赁成功，租期 ${daysCount} 天！`
    );

    return tx.hash;
  } catch (error) {
    console.error("🚀 租赁NFT失败:", error);

    let errorMessage = "租赁失败，请重试";
    if (error instanceof Error) {
      if (error.message.includes("Not for rent")) {
        errorMessage = "NFT未上架出租";
      } else if (error.message.includes("Invalid days")) {
        errorMessage = "租赁天数无效";
      } else if (error.message.includes("Already rented")) {
        errorMessage = "NFT已被租赁";
      } else if (error.message.includes("Insufficient payment")) {
        errorMessage = "支付金额不足";
      }
    }

    globalFeedback.toast.error("租赁失败", errorMessage);
    throw error;
  }
};

/**
 * 取消NFT出租
 * @param tokenId NFT的token ID
 * @returns 交易哈希
 */
export const cancelNFTRent = async (tokenId: string): Promise<string> => {
  try {
    console.log(`⚠️ 取消NFT出租 - Token ID: ${tokenId}`);
    console.log("⚠️ 注意：IDNFTRent合约中没有取消租赁的函数");
    console.log("⚠️ 需要合约添加取消租赁功能或通过其他方式实现");

    // 暂时抛出错误，因为合约中没有取消租赁的函数
    throw new Error("合约中没有取消租赁功能");
  } catch (error) {
    console.error("🚀 取消NFT出租失败:", error);

    let errorMessage = "取消失败，合约暂不支持取消租赁功能";
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    globalFeedback.toast.error("取消失败", errorMessage);
    throw error;
  }
};

/**
 * 获取NFT租赁信息
 * @param tokenId NFT的token ID
 * @returns 租赁信息
 */
export const getNFTRentalInfo = async (
  tokenId: string
): Promise<{
  lender: string;
  renter: string;
  endTime: number;
  rentFee: string;
  rentFeeInEth: string;
} | null> => {
  try {
    const { provider } = await connectOnce();
    const addresses = getContractAddresses();

    // 过滤ABI，只保留函数和事件定义，排除error定义
    const filteredRentABI = IDNFTRentABI.filter(
      (item: { type: string }) =>
        item.type === "function" || item.type === "event"
    );

    const contract = new ethers.Contract(
      addresses.nftRental,
      filteredRentABI,
      provider
    );
    // 使用公共的rentInfos映射
    const rentalInfo = await contract.rentInfos(tokenId);

    if (rentalInfo.rentFee.eq(0)) {
      return null; // 未上架出租
    }

    return {
      lender: rentalInfo.lender,
      renter: rentalInfo.renter,
      endTime: rentalInfo.endTime.toNumber(),
      rentFee: rentalInfo.rentFee.toString(),
      rentFeeInEth: ethers.utils.formatEther(rentalInfo.rentFee),
    };
  } catch (error) {
    console.error("🚀 获取NFT租赁信息失败:", error);
    return null;
  }
};

/**
 * 获取NFT活跃租赁信息
 * @param tokenId NFT的token ID
 * @returns 活跃租赁信息
 */
export const getNFTActiveRental = async (
  tokenId: string
): Promise<{
  renter: string;
  lender: string;
  endTime: number;
  isExpired: boolean;
} | null> => {
  try {
    const { provider } = await connectOnce();
    const addresses = getContractAddresses();

    // 过滤ABI，只保留函数和事件定义，排除error定义
    const filteredRentABI = IDNFTRentABI.filter(
      (item: { type: string }) =>
        item.type === "function" || item.type === "event"
    );

    const contract = new ethers.Contract(
      addresses.nftRental,
      filteredRentABI,
      provider
    );
    // 使用公共的rentInfos映射
    const rentalInfo = await contract.rentInfos(tokenId);

    if (
      rentalInfo.renter === ethers.constants.AddressZero ||
      rentalInfo.endTime.eq(0)
    ) {
      return null; // 没有活跃租赁
    }

    const currentTime = Math.floor(Date.now() / 1000);
    const endTime = rentalInfo.endTime.toNumber();

    return {
      renter: rentalInfo.renter,
      lender: rentalInfo.lender,
      endTime: endTime,
      isExpired: currentTime > endTime,
    };
  } catch (error) {
    console.error("🚀 获取NFT活跃租赁信息失败:", error);
    return null;
  }
};

/**
 * 归还过期的租赁NFT
 * @param tokenId NFT的token ID
 * @returns 交易哈希
 */
export const claimExpiredRental = async (tokenId: string): Promise<string> => {
  try {
    console.log(`⚠️ 归还过期租赁NFT - Token ID: ${tokenId}`);
    console.log("⚠️ 注意：IDNFTRent合约中没有claimExpiredRental函数");
    console.log("⚠️ 需要合约添加归还过期租赁功能或通过其他方式实现");

    // 暂时抛出错误，因为合约中没有归还过期租赁的函数
    throw new Error("合约中没有归还过期租赁功能");
  } catch (error) {
    console.error("🚀 归还过期租赁NFT失败:", error);

    let errorMessage = "归还失败，合约暂不支持归还过期租赁功能";
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    globalFeedback.toast.error("归还失败", errorMessage);
    throw error;
  }
};
