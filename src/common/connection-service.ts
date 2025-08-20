import { ethers } from "ethers";
import { globalFeedback } from "@/components/ui/Feedback";
import { configuration } from "../config/blockChain";

// 导入新的合约ABI
import NFTCoreABI from "@/artifacts/NFTCore.json";
import NFTSaleABI from "@/artifacts/NFTSale.json";
import NFTRentalABI from "@/artifacts/NFTRental.json";

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
    user: string;
    tokenId: ethers.BigNumber;
    finalID: string;
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
  try {
    const { provider, address } = await connectOnce();
    const targetAddress = userAddress || address;
    const addresses = getContractAddresses();

    console.log("🚀 开始获取用户NFT资产（基于事件日志）");
    console.log("🚀 用户地址:", targetAddress);
    console.log("🚀 NFTCore合约地址:", addresses.nftCore);

    // 创建NFTCore合约实例
    const nftCoreContract = new ethers.Contract(
      addresses.nftCore,
      NFTCoreABI,
      provider
    );

    // 获取用户的注册事件
    const filter = nftCoreContract.filters.Registered(targetAddress);
    const logs = await nftCoreContract.queryFilter(filter, 0, "latest");

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
        const finalID = logEvent.args.finalID;

        console.log(
          `🚀 第${
            i + 1
          }个NFT - Token ID: ${tokenIdString}, Final ID: ${finalID}`
        );

        // 检查用户是否仍然拥有这个NFT（可能已经转出）
        let currentOwner;
        try {
          currentOwner = await nftCoreContract.ownerOf(tokenIdString);
        } catch (error) {
          console.log(`🚀 NFT #${tokenIdString} 可能已被销毁，跳过`, error);
          continue;
        }

        // 只返回用户当前拥有的NFT
        if (currentOwner.toLowerCase() !== targetAddress.toLowerCase()) {
          console.log(
            `🚀 NFT #${tokenIdString} 已转给其他用户: ${currentOwner}，跳过`
          );
          continue;
        }

        // 获取tokenURI
        let tokenURI;
        try {
          tokenURI = await nftCoreContract.tokenURI(tokenIdString);
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
              payToken: "0x0000000000000000000000000000000000000000", // ETH
              receiver: nftSaleInfo.seller,
              isForSale: true,
            };
          } else {
            saleInfo = {
              seller: "0x0000000000000000000000000000000000000000",
              price: "0",
              payToken: "0x0000000000000000000000000000000000000000",
              receiver: "0x0000000000000000000000000000000000000000",
              isForSale: false,
            };
          }
        } catch (error) {
          console.log(`🚀 无法获取NFT #${tokenIdString} 的出售信息:`, error);
          saleInfo = {
            seller: "0x0000000000000000000000000000000000000000",
            price: "0",
            payToken: "0x0000000000000000000000000000000000000000",
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
 * 获取所有有价格的NFT（用于市场展示）- 使用NFTCore和NFTSale合约
 * @returns 所有正在出售的NFT资产列表
 */
export const getAllNFTsWithSaleInfo = async (): Promise<UserNFTAsset[]> => {
  try {
    const { provider } = await connectOnce();
    const addresses = getContractAddresses();

    console.log("🚀 开始获取所有NFT及出售信息...");

    // 创建NFTCore合约实例
    const nftCoreContract = new ethers.Contract(
      addresses.nftCore,
      NFTCoreABI,
      provider
    );

    // 创建NFTSale合约实例
    const nftSaleContract = new ethers.Contract(
      addresses.nftSale,
      NFTSaleABI,
      provider
    );

    // 分页获取所有NFT ID（从getIDsPaginated开始，先获取少量数据测试）
    const batchSize = 20; // 每批获取20个
    const allNFTs: UserNFTAsset[] = [];
    let offset = 0;
    let hasMore = true;

    while (hasMore) {
      try {
        // 使用NFTCore的getIDsPaginated方法获取NFT ID列表
        const idList = await nftCoreContract.getIDsPaginated(offset, batchSize);

        if (idList.length === 0) {
          hasMore = false;
          break;
        }

        console.log(
          `🚀 第${Math.floor(offset / batchSize) + 1}批 - 获取到 ${
            idList.length
          } 个NFT ID`
        );

        // 处理这一批NFT
        for (let i = 0; i < idList.length; i++) {
          try {
            const tokenId = offset + i + 1; // tokenId从1开始
            const tokenIdString = tokenId.toString();
            const finalID = idList[i];

            console.log(
              `🚀 处理NFT - Token ID: ${tokenIdString}, Final ID: ${finalID}`
            );

            // 获取NFT的基本信息
            let owner;
            let tokenURI;
            try {
              owner = await nftCoreContract.ownerOf(tokenIdString);
              tokenURI = await nftCoreContract.tokenURI(tokenIdString);
            } catch {
              console.log(`🚀 NFT #${tokenIdString} 可能已被销毁，跳过`);
              continue;
            }

            // 使用NFTSale合约的sales方法获取出售信息
            let saleInfo: NFTSaleInfo;
            try {
              const saleResult = await nftSaleContract.sales(tokenIdString);
              const price = saleResult.price.toString();
              const isForSale = price !== "0";

              saleInfo = {
                seller: saleResult.seller,
                price: price,
                payToken: "0x0000000000000000000000000000000000000000", // ETH
                receiver: saleResult.seller,
                isForSale: isForSale,
              };

              console.log(`🚀 NFT #${tokenIdString} 出售信息:`, {
                isForSale,
                price: isForSale ? price + " ETH" : "0",
                seller: saleResult.seller,
              });
            } catch (error) {
              console.log(
                `🚀 无法获取NFT #${tokenIdString} 的出售信息:`,
                error
              );
              saleInfo = {
                seller: "0x0000000000000000000000000000000000000000",
                price: "0",
                payToken: "0x0000000000000000000000000000000000000000",
                receiver: "0x0000000000000000000000000000000000000000",
                isForSale: false,
              };
            }

            // 只处理有价格的NFT（正在出售的）
            if (saleInfo.isForSale && parseFloat(saleInfo.price) > 0) {
              console.log(
                `🚀 发现出售中的NFT - ID: ${finalID}, 价格: ${saleInfo.price} ETH, 所有者: ${owner}`
              );

              // 构造NFT资产对象
              const asset: UserNFTAsset = {
                tokenId: tokenIdString,
                name: finalID || `NFT #${tokenIdString}`,
                idString: finalID,
                tokenURI: tokenURI,
                image: `/images/nft${(i % 6) + 1}.jpg`, // 临时使用本地图片
                saleInfo: saleInfo,
                owner: owner,
              };

              allNFTs.push(asset);
            } else {
              console.log(`🚀 跳过未出售的NFT - Token ID: ${tokenIdString}`);
            }
          } catch (error) {
            console.error(`🚀 处理NFT #${offset + i + 1} 失败:`, error);
          }
        }

        // 如果返回的数量少于批次大小，说明已经是最后一批
        if (idList.length < batchSize) {
          hasMore = false;
        } else {
          offset += batchSize;
        }
      } catch (error) {
        console.error(
          `🚀 获取第${Math.floor(offset / batchSize) + 1}批NFT失败:`,
          error
        );
        hasMore = false;
      }
    }

    console.log(`🚀 获取所有出售中的NFT完成: 共${allNFTs.length}个`);
    return allNFTs;
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
    const { signer } = await connectOnce();
    const addresses = getContractAddresses();

    console.log("🚀 注册NFT - ID:", id);

    const contract = new ethers.Contract(addresses.nftCore, NFTCoreABI, signer);

    // 检查注册费用
    const registerFee = await contract.registerFee();
    const paymentToken = await contract.paymentToken();

    console.log("🚀 注册费用:", registerFee.toString(), "ETH");
    console.log("🚀 支付代币:", paymentToken);

    // 调用注册函数
    const tx = await contract.register(id);
    console.log("🚀 交易已发送:", tx.hash);

    globalFeedback.toast.success("交易已发送", "正在等待区块链确认...");

    // 等待交易确认
    const receipt = await tx.wait();
    console.log("🚀 交易确认:", receipt);

    // 从事件日志中获取tokenId
    let tokenId;
    if (receipt.events) {
      const registeredEvent = receipt.events.find(
        (event: unknown) => (event as TransactionEvent).event === "Registered"
      );
      if (registeredEvent) {
        tokenId = registeredEvent.args.tokenId.toString();
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
 * 获取用户注册的所有ID
 * @param userAddress 用户地址，不传则获取当前用户
 * @returns 用户注册的ID列表
 */
export const getUserRegisteredIDs = async (
  userAddress?: string
): Promise<
  {
    tokenId: string;
    finalID: string;
    blockNumber: number;
    transactionHash: string;
  }[]
> => {
  try {
    const { provider, address } = await connectOnce();
    const addresses = getContractAddresses();
    const targetAddress = userAddress || address;

    console.log("🚀 获取用户注册的ID - 地址:", targetAddress);

    const contract = new ethers.Contract(
      addresses.nftCore,
      NFTCoreABI,
      provider
    );

    // 通过事件日志获取注册记录
    const filter = contract.filters.Registered(targetAddress);
    const logs = await contract.queryFilter(filter, 0, "latest");

    const registrations = logs.map((log: unknown) => {
      const logEvent = log as LogEvent;
      return {
        tokenId: logEvent.args.tokenId.toString(),
        finalID: logEvent.args.finalID,
        blockNumber: logEvent.blockNumber,
        transactionHash: logEvent.transactionHash,
      };
    });

    console.log(`🚀 找到 ${registrations.length} 条注册记录`);
    return registrations;
  } catch (error) {
    console.error("🚀 获取用户注册ID失败:", error);
    globalFeedback.toast.error("获取失败", "无法获取注册的ID列表");
    return [];
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

    const contract = new ethers.Contract(
      addresses.nftCore,
      NFTCoreABI,
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
  priceInEth: string
): Promise<string> => {
  try {
    const { signer } = await connectOnce();
    const addresses = getContractAddresses();

    console.log(
      `🚀 上架NFT出售 - Token ID: ${tokenId}, 价格: ${priceInEth} ETH`
    );

    const contract = new ethers.Contract(addresses.nftSale, NFTSaleABI, signer);
    const priceInWei = ethers.utils.parseEther(priceInEth);

    const tx = await contract.listForSale(tokenId, priceInWei);
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
 * @returns 交易哈希
 */
export const buyNFTFromSale = async (tokenId: string): Promise<string> => {
  try {
    const { signer } = await connectOnce();
    const addresses = getContractAddresses();

    console.log(`🚀 购买NFT - Token ID: ${tokenId}`);

    const contract = new ethers.Contract(addresses.nftSale, NFTSaleABI, signer);

    // 获取NFT价格
    const saleInfo = await contract.sales(tokenId);
    if (saleInfo.price.eq(0)) {
      throw new Error("NFT未上架出售");
    }

    console.log("🚀 NFT价格:", saleInfo.price, "ETH");

    const tx = await contract.buy(tokenId, {
      value: saleInfo.price,
    });

    console.log("🚀 交易已发送:", tx.hash);
    globalFeedback.toast.success("交易已发送", "正在等待区块链确认...");

    await tx.wait();
    globalFeedback.toast.success("购买成功", `NFT #${tokenId} 购买成功！`);

    return tx.hash;
  } catch (error) {
    console.error("🚀 购买NFT失败:", error);

    let errorMessage = "购买失败，请重试";
    if (error instanceof Error) {
      if (error.message.includes("Not for sale")) {
        errorMessage = "NFT未上架出售";
      } else if (error.message.includes("Insufficient payment")) {
        errorMessage = "支付金额不足";
      } else if (error.message.includes("NFT is rented")) {
        errorMessage = "NFT正在租赁中，无法购买";
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

    const contract = new ethers.Contract(addresses.nftSale, NFTSaleABI, signer);
    const tx = await contract.cancelSale(tokenId);

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
    const { provider } = await connectOnce();
    const addresses = getContractAddresses();

    const contract = new ethers.Contract(
      addresses.nftSale,
      NFTSaleABI,
      provider
    );
    const saleInfo = await contract.sales(tokenId);

    if (saleInfo.price.eq(0)) {
      return null; // 未上架出售
    }

    return {
      seller: saleInfo.seller,
      price: saleInfo.price.toString(),
      priceInEth: saleInfo.price.toString(), // 直接使用wei值作为ETH显示
    };
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
 * @returns 交易哈希
 */
export const listNFTForRent = async (
  tokenId: string,
  pricePerDayInEth: string,
  maxDays: number
): Promise<string> => {
  try {
    const { signer } = await connectOnce();
    const addresses = getContractAddresses();

    console.log(
      `🚀 上架NFT出租 - Token ID: ${tokenId}, 每日租金: ${pricePerDayInEth} ETH, 最大天数: ${maxDays}`
    );

    const contract = new ethers.Contract(
      addresses.nftRental,
      NFTRentalABI,
      signer
    );
    const pricePerDayInWei = ethers.utils.parseEther(pricePerDayInEth);

    const tx = await contract.listForRent(tokenId, pricePerDayInWei, maxDays);
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
  daysCount: number
): Promise<string> => {
  try {
    const { signer } = await connectOnce();
    const addresses = getContractAddresses();

    console.log(`🚀 租赁NFT - Token ID: ${tokenId}, 天数: ${daysCount}`);

    const contract = new ethers.Contract(
      addresses.nftRental,
      NFTRentalABI,
      signer
    );

    // 获取租赁信息
    const rentalInfo = await contract.rentals(tokenId);
    if (rentalInfo.pricePerDay.eq(0)) {
      throw new Error("NFT未上架出租");
    }

    const totalCost = rentalInfo.pricePerDay.mul(daysCount);
    console.log("🚀 总租金:", totalCost.toString(), "ETH");

    const tx = await contract.rentToken(tokenId, daysCount, {
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
    const { signer } = await connectOnce();
    const addresses = getContractAddresses();

    console.log(`🚀 取消NFT出租 - Token ID: ${tokenId}`);

    const contract = new ethers.Contract(
      addresses.nftRental,
      NFTRentalABI,
      signer
    );
    const tx = await contract.cancelRentOffer(tokenId);

    console.log("🚀 交易已发送:", tx.hash);
    globalFeedback.toast.success("交易已发送", "正在等待区块链确认...");

    await tx.wait();
    globalFeedback.toast.success("取消成功", `NFT #${tokenId} 已取消出租！`);

    return tx.hash;
  } catch (error) {
    console.error("🚀 取消NFT出租失败:", error);

    let errorMessage = "取消失败，请重试";
    if (error instanceof Error) {
      if (error.message.includes("Not lender")) {
        errorMessage = "只有出租人才能取消出租";
      }
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
  pricePerDay: string;
  pricePerDayInEth: string;
  maxDays: number;
} | null> => {
  try {
    const { provider } = await connectOnce();
    const addresses = getContractAddresses();

    const contract = new ethers.Contract(
      addresses.nftRental,
      NFTRentalABI,
      provider
    );
    const rentalInfo = await contract.rentals(tokenId);

    if (rentalInfo.pricePerDay.eq(0)) {
      return null; // 未上架出租
    }

    return {
      lender: rentalInfo.lender,
      pricePerDay: rentalInfo.pricePerDay.toString(),
      pricePerDayInEth: rentalInfo.pricePerDay.toString(), // 直接使用wei值作为ETH显示
      maxDays: rentalInfo.maxDays.toNumber(),
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

    const contract = new ethers.Contract(
      addresses.nftRental,
      NFTRentalABI,
      provider
    );
    const activeRental = await contract.activeRentals(tokenId);

    if (activeRental.renter === ethers.constants.AddressZero) {
      return null; // 没有活跃租赁
    }

    const currentTime = Math.floor(Date.now() / 1000);
    const endTime = activeRental.endTime.toNumber();

    return {
      renter: activeRental.renter,
      lender: activeRental.lender,
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
    const { signer } = await connectOnce();
    const addresses = getContractAddresses();

    console.log(`🚀 归还过期租赁NFT - Token ID: ${tokenId}`);

    const contract = new ethers.Contract(
      addresses.nftRental,
      NFTRentalABI,
      signer
    );
    const tx = await contract.claimExpiredRental(tokenId);

    console.log("🚀 交易已发送:", tx.hash);
    globalFeedback.toast.success("交易已发送", "正在等待区块链确认...");

    await tx.wait();
    globalFeedback.toast.success("归还成功", `NFT #${tokenId} 已成功归还！`);

    return tx.hash;
  } catch (error) {
    console.error("🚀 归还过期租赁NFT失败:", error);

    let errorMessage = "归还失败，请重试";
    if (error instanceof Error) {
      if (error.message.includes("Not rented")) {
        errorMessage = "NFT未在租赁中";
      } else if (error.message.includes("Rental active")) {
        errorMessage = "租期尚未到期";
      }
    }

    globalFeedback.toast.error("归还失败", errorMessage);
    throw error;
  }
};
