"use client";

import React, { useState, useEffect, useCallback } from "react";
import MobileLayout from "@/components/layout/MobileLayout";
import SearchBar from "@/components/ui/SearchBar";
import TabView from "@/components/ui/TabView";
import ValueIDCard from "@/components/ui/NFTCard";
import Button from "@/components/ui/Button";
import { FaWallet } from "react-icons/fa";
import { useLocale } from "@/components/LocaleProvider";
// import { useAuth } from "@/common/hooks";
import { apiService } from "@/common/api";
import { ValueID } from "@/types";
// import { ethers } from "ethers";
// import { useFeedback } from "@/components/ui/Feedback";
import {
  connect,
  getAllNFTsWithSaleInfo,
  UserNFTAsset,
} from "@/common/connection-service";
export default function Home() {
  const { t } = useLocale();
  // const { isAuthenticated } = useAuth();
  const isAuthenticated = false;

  // 状态管理
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab] = useState(0);
  const [allValueIDs, setAllValueIDs] = useState<ValueID[]>([]);
  const [recommendedValueIDs, setRecommendedValueIDs] = useState<ValueID[]>([]);
  const [latestValueIDs, setLatestValueIDs] = useState<ValueID[]>([]);
  const [searchResults, setSearchResults] = useState<ValueID[]>([]);
  const [loading, setLoading] = useState(true);
  const [recommendedLoading, setRecommendedLoading] = useState(true);
  const [latestLoading, setLatestLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // 代币地址映射
  const getTokenSymbol = useCallback((payTokenAddress: string): string => {
    const tokenMap: Record<string, string> = {
      "0x358AA13c52544ECCEF6B0ADD0f801012ADAD5eE3": "USDT", // 默认USDT地址
      "0x0000000000000000000000000000000000000000": "ETH", // 零地址代表ETH
    };

    return tokenMap[payTokenAddress.toLowerCase()] || "UNKNOWN";
  }, []);

  // 将UserNFTAsset转换为ValueID格式
  const convertNFTAssetToValueID = useCallback(
    (asset: UserNFTAsset): ValueID => {
      const saleInfo = asset.saleInfo;

      return {
        id: asset.tokenId,
        name: asset.name,
        description: `NFT with ID: ${asset.idString}`,
        image: asset.image || "/images/nft1.jpg",
        tokenId: asset.tokenId,
        indexNumber: asset.tokenId,
        price: saleInfo?.isForSale ? parseFloat(saleInfo.price) : 0, // 将wei转换为ether
        paymentAddress: saleInfo?.receiver || "",
        paymentCurrency: saleInfo?.payToken
          ? getTokenSymbol(saleInfo.payToken)
          : "ETH",
        rarity: "common", // 默认稀有度
        isForSale: saleInfo?.isForSale || false,
        isForRent: false, // 默认不出租
        rentalPrice: 0,
        rentalPeriod: 0,
        viewCount: 0,
        favoriteCount: 0,
        owner: {
          id: asset.owner,
          username: asset.owner,
        },
        attributes: [],
        createdAt: new Date().toISOString(),
      };
    },
    [getTokenSymbol]
  );

  // 加载数据
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        console.log("🚀 开始从合约加载所有出售中的NFT...");

        // 从合约获取所有有价格的NFT
        const nftsWithSaleInfo = await getAllNFTsWithSaleInfo();

        // 转换为ValueID格式
        const valueIDs = nftsWithSaleInfo.map(convertNFTAssetToValueID);

        console.log("🚀 转换后的ValueID数据:", valueIDs);
        setAllValueIDs(valueIDs);
      } catch (err) {
        console.error("🚀 加载合约数据失败:", err);
        setError(err instanceof Error ? err.message : "加载失败");
      } finally {
        setLoading(false);
      }
    };

    const loadRecommended = async () => {
      try {
        setRecommendedLoading(true);
        console.log("🚀 开始从合约加载推荐NFT...");

        // 从合约获取所有有价格的NFT
        const nftsWithSaleInfo = await getAllNFTsWithSaleInfo();

        // 转换为ValueID格式并按收藏数排序（这里暂时随机排序，可以后续改进）
        const valueIDs = nftsWithSaleInfo
          .map(convertNFTAssetToValueID)
          .sort(() => Math.random() - 0.5) // 暂时随机排序作为推荐
          .slice(0, 20); // 限制20个

        setRecommendedValueIDs(valueIDs);
      } catch (err) {
        console.error("🚀 加载推荐数据失败:", err);
        setRecommendedValueIDs([]);
      } finally {
        setRecommendedLoading(false);
      }
    };

    const loadLatest = async () => {
      try {
        setLatestLoading(true);
        console.log("🚀 开始从合约加载最新NFT...");

        // 从合约获取所有有价格的NFT
        const nftsWithSaleInfo = await getAllNFTsWithSaleInfo();

        // 转换为ValueID格式并按tokenId倒序排序（新的NFT通常有更大的tokenId）
        const valueIDs = nftsWithSaleInfo
          .map(convertNFTAssetToValueID)
          .sort((a, b) => parseInt(b.tokenId) - parseInt(a.tokenId))
          .slice(0, 20); // 限制20个

        setLatestValueIDs(valueIDs);
      } catch (err) {
        console.error("🚀 加载最新数据失败:", err);
        setLatestValueIDs([]);
      } finally {
        setLatestLoading(false);
      }
    };

    loadData();
    loadRecommended();
    loadLatest();
  }, [convertNFTAssetToValueID]);

  // 搜索处理
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setSearchLoading(true);
      const response = await apiService.getValueIDList({
        isForSale: true,
        name: query,
      });
      setSearchResults(response.data);
    } catch (err) {
      console.error("搜索失败:", err);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // 刷新数据
  const refresh = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("🚀 刷新合约数据...");

      // 从合约获取所有有价格的NFT
      const nftsWithSaleInfo = await getAllNFTsWithSaleInfo();

      // 转换为ValueID格式
      const valueIDs = nftsWithSaleInfo.map(convertNFTAssetToValueID);

      setAllValueIDs(valueIDs);
    } catch (err) {
      console.error("🚀 刷新合约数据失败:", err);
      setError(err instanceof Error ? err.message : "刷新失败");
    } finally {
      setLoading(false);
    }
  };

  // 渲染ValueID网格
  const renderValueIDGrid = (
    valueIDs: ValueID[],
    isLoading: boolean,
    errorMsg?: string | null
  ) => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-500">加载中...</p>
          </div>
        </div>
      );
    }

    if (errorMsg) {
      return (
        <div className="text-center py-16">
          <p className="text-red-500 mb-4">{errorMsg}</p>
          <Button onClick={refresh} className="px-4 py-2">
            重试
          </Button>
        </div>
      );
    }

    if (valueIDs.length === 0) {
      return (
        <div className="text-center py-16">
          <p className="text-gray-500">暂无数据</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 gap-[16px] mb-[100px]">
        {valueIDs.map((valueId) => (
          <ValueIDCard
            key={valueId.id}
            id={valueId.id.toString()}
            name={valueId.name}
            image={valueId.image}
            indexNumber={valueId.indexNumber || ""}
            price={valueId.price}
            rarity={valueId.rarity}
            isRental={valueId.isForRent}
            rentalPrice={valueId.rentalPrice}
            displayMode="sale"
            valueIDData={valueId} // 传递完整的 ValueID 数据
          />
        ))}
      </div>
    );
  };

  // 渲染搜索结果
  const renderSearchResults = () => {
    if (searchLoading) {
      return (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mr-2"></div>
          <span className="text-gray-500">搜索中...</span>
        </div>
      );
    }

    if (!searchQuery || searchResults.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500">
            {!searchQuery ? "输入关键词开始搜索" : "没有找到相关结果"}
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 gap-[16px] mb-[100px]">
        {searchResults.map((valueId) => (
          <ValueIDCard
            key={valueId.id}
            id={valueId.id.toString()}
            name={valueId.name}
            image={valueId.image}
            indexNumber={valueId.indexNumber || ""}
            price={valueId.price}
            rarity={valueId.rarity}
            isRental={valueId.isForRent}
            rentalPrice={valueId.rentalPrice}
            displayMode="sale"
            valueIDData={valueId} // 传递完整的 ValueID 数据
          />
        ))}
      </div>
    );
  };

  // 标签页配置
  const tabs = [
    {
      label: t("home.all") || "全部",
      content: renderValueIDGrid(allValueIDs, loading, error),
    },
    {
      label: t("home.recommended") || "推荐",
      content: renderValueIDGrid(recommendedValueIDs, recommendedLoading),
    },
    {
      label: t("home.latest") || "最新",
      content: renderValueIDGrid(latestValueIDs, latestLoading),
    },
  ];

  return (
    <MobileLayout>
      <div className="p-[16px]">
        <div className="flex justify-between items-center mb-[16px]">
          <h1 className="text-xl font-bold">Value ID</h1>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-[4px] bg-[#8b5cf6] text-[#ffffff] border-none px-[12px] py-[8px] rounded-[20px]"
            onClick={async () => {
              await connect();
              // if (isAuthenticated) {
              //   toast.success("钱包已连接");
              // } else {
              // toast.info(t("common.connectWallet") || "连接钱包");
              // const provider = new ethers.providers.Web3Provider(
              //   window.ethereum
              // );
              // await provider.send("eth_requestAccounts", []);
              // const signer = provider.getSigner();
              // console.log(signer);
              // const address = await signer.getAddress();
              // console.log(address);
              // isAuthenticated = true;
              // }
            }}
          >
            <FaWallet size={12} />
            <span className="text-xs font-medium">
              {isAuthenticated
                ? "已连接"
                : t("common.connectWallet") || "连接钱包"}
            </span>
          </Button>
        </div>

        {/* 搜索栏 */}
        <div className="mb-[16px]">
          <SearchBar onSearch={handleSearch} placeholder="搜索 Value ID" />
        </div>

        {/* 搜索结果 */}
        {searchQuery && (
          <div className="mb-[16px]">
            <h2 className="text-lg font-semibold mb-[12px]">
              搜索结果 &quot;{searchQuery}&quot;
            </h2>
            {renderSearchResults()}
          </div>
        )}

        {/* 标签页内容 */}
        {!searchQuery && <TabView tabs={tabs} defaultTab={activeTab} />}
      </div>
    </MobileLayout>
  );
}
