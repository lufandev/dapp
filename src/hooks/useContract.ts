import { useState, useEffect, useCallback } from "react";
import { UserNFTAsset } from "../common/connection-service";
import { globalFeedback } from "../components/ui/Feedback";

// 使用动态导入避免服务端渲染问题
const getConnectionService = async () => {
  if (typeof window === "undefined") {
    return {
      getUserNFTAssets: async () => [],
      getAllNFTsWithSaleInfo: async () => [],
      getCurrentUserNFTAssets: async () => [],
      buyNFTFromSale: async () => "",
      rentNFT: async () => "",
      listNFTForSale: async () => "",
      listNFTForRent: async () => "",
      cancelNFTSale: async () => "",
      cancelNFTRent: async () => "",
    };
  }
  const connectionService = await import("../common/connection-service");
  return {
    getUserNFTAssets: connectionService.getUserNFTAssets,
    getAllNFTsWithSaleInfo: connectionService.getAllNFTsWithSaleInfo,
    getCurrentUserNFTAssets: connectionService.getCurrentUserNFTAssets,
    buyNFTFromSale: connectionService.buyNFTFromSale,
    rentNFT: connectionService.rentNFT,
    listNFTForSale: connectionService.listNFTForSale,
    listNFTForRent: connectionService.listNFTForRent,
    cancelNFTSale: connectionService.cancelNFTSale,
    cancelNFTRent: connectionService.cancelNFTRent,
  };
};

// 通用合约操作Hook
export const useContract = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const executeTransaction = useCallback(
    async (operation: () => Promise<string>) => {
      setLoading(true);
      setError(null);
      try {
        const result = await operation();
        globalFeedback.toast.success("交易成功");
        return result;
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "交易失败";
        setError(errorMessage);
        globalFeedback.toast.error("交易失败", errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    loading,
    error,
    executeTransaction,
  };
};

// 用户NFT相关Hook
export const useUserNFTs = (userAddress?: string) => {
  const [nfts, setNfts] = useState<UserNFTAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserNFTs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const service = await getConnectionService();
      const result = userAddress
        ? await service.getUserNFTAssets(userAddress)
        : await service.getCurrentUserNFTAssets();
      setNfts(result);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "获取NFT失败");
    } finally {
      setLoading(false);
    }
  }, [userAddress]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    fetchUserNFTs();
  }, [fetchUserNFTs]);

  return {
    nfts,
    loading,
    error,
    refetch: fetchUserNFTs,
  };
};

// 市场NFT相关Hook
export const useMarketNFTs = () => {
  const [saleNFTs, setSaleNFTs] = useState<UserNFTAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMarketNFTs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const service = await getConnectionService();
      const result = await service.getAllNFTsWithSaleInfo();
      setSaleNFTs(result);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "获取市场NFT失败");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    fetchMarketNFTs();
  }, [fetchMarketNFTs]);

  return {
    saleNFTs,
    loading,
    error,
    refetch: fetchMarketNFTs,
  };
};

// NFT交易Hook
export const useNFTTrading = () => {
  const { executeTransaction } = useContract();

  const buyNFT = useCallback(
    async (tokenId: string) => {
      return executeTransaction(async () => {
        const service = await getConnectionService();
        return service.buyNFTFromSale("", tokenId);
      });
    },
    [executeTransaction]
  );

  const rentNFTToken = useCallback(
    async (tokenId: string, days: number) => {
      return executeTransaction(async () => {
        const service = await getConnectionService();
        return service.rentNFT(tokenId, days);
      });
    },
    [executeTransaction]
  );

  const listForSale = useCallback(
    async (tokenId: string, priceInEth: string) => {
      return executeTransaction(async () => {
        const service = await getConnectionService();
        return service.listNFTForSale(tokenId, priceInEth);
      });
    },
    [executeTransaction]
  );

  const listForRent = useCallback(
    async (tokenId: string, pricePerDayInEth: string, maxDays: number) => {
      return executeTransaction(async () => {
        const service = await getConnectionService();
        return service.listNFTForRent(tokenId, pricePerDayInEth, maxDays);
      });
    },
    [executeTransaction]
  );

  const cancelSale = useCallback(
    async (tokenId: string) => {
      return executeTransaction(async () => {
        const service = await getConnectionService();
        return service.cancelNFTSale(tokenId);
      });
    },
    [executeTransaction]
  );

  const cancelRent = useCallback(
    async (tokenId: string) => {
      return executeTransaction(async () => {
        const service = await getConnectionService();
        return service.cancelNFTRent(tokenId);
      });
    },
    [executeTransaction]
  );

  return {
    buyNFT,
    rentNFTToken,
    listForSale,
    listForRent,
    cancelSale,
    cancelRent,
  };
};

// 组合Hook - NFT管理器
export const useNFTManager = (userAddress?: string) => {
  const userNFTs = useUserNFTs(userAddress);
  const marketNFTs = useMarketNFTs();
  const trading = useNFTTrading();

  const refetchAll = useCallback(() => {
    userNFTs.refetch();
    marketNFTs.refetch();
  }, [userNFTs, marketNFTs]);

  return {
    userNFTs,
    marketNFTs,
    trading,
    refetchAll,
  };
};

// 简化的特定功能Hooks
export const useUserSaleList = (userAddress?: string) => {
  const { nfts, loading, error, refetch } = useUserNFTs(userAddress);
  const saleNFTs = nfts.filter((nft) => nft.saleInfo?.isForSale);

  return {
    saleNFTs,
    loading,
    error,
    refetch,
  };
};

export const useAllSaleList = () => {
  const { saleNFTs, loading, error, refetch } = useMarketNFTs();
  const forSaleNFTs = saleNFTs.filter((nft) => nft.saleInfo?.isForSale);

  return {
    saleNFTs: forSaleNFTs,
    loading,
    error,
    refetch,
  };
};

// 注意：租赁相关的功能需要根据实际的connection-service中的租赁接口来实现
// 目前connection-service中有租赁相关的函数，但可能需要额外的数据获取逻辑
export const useUserRentalList = () => {
  // 这里需要根据实际的租赁数据结构来实现
  // 暂时返回空数组，需要后续完善
  return {
    rentalNFTs: [],
    loading: false,
    error: null,
    refetch: () => {},
  };
};

export const useAllRentalList = () => {
  // 这里需要根据实际的租赁数据结构来实现
  // 暂时返回空数组，需要后续完善
  return {
    rentalNFTs: [],
    loading: false,
    error: null,
    refetch: () => {},
  };
};
