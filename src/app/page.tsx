"use client";

import React, { useState, useEffect } from "react";
import MobileLayout from "@/components/layout/MobileLayout";
import SearchBar from "@/components/ui/SearchBar";
import TabView from "@/components/ui/TabView";
import ValueIDCard from "@/components/ui/NFTCard";
import Button from "@/components/ui/Button";
import { FaWallet } from "react-icons/fa";
import { useLocale } from "@/components/LocaleProvider";
import { useAuth } from "@/common/hooks";
import { apiService } from "@/common/api";
import { ValueID } from "@/types";

export default function Home() {
  const { t } = useLocale();
  const { isAuthenticated } = useAuth();

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

  // 加载数据
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const response = await apiService.getValueIDList({
          isForSale: true,
        });
        setAllValueIDs(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "加载失败");
      } finally {
        setLoading(false);
      }
    };

    const loadRecommended = async () => {
      try {
        setRecommendedLoading(true);
        const response = await apiService.getValueIDList({
          isForSale: true,
          sortBy: "favoriteCount",
          sortOrder: "DESC",
          limit: 20,
        });
        setRecommendedValueIDs(response.data);
      } catch (err) {
        console.error("加载推荐数据失败:", err);
      } finally {
        setRecommendedLoading(false);
      }
    };

    const loadLatest = async () => {
      try {
        setLatestLoading(true);
        const response = await apiService.getValueIDList({
          isForSale: true,
          sortBy: "createdAt",
          sortOrder: "DESC",
          limit: 20,
        });
        setLatestValueIDs(response.data);
      } catch (err) {
        console.error("加载最新数据失败:", err);
      } finally {
        setLatestLoading(false);
      }
    };

    loadData();
    loadRecommended();
    loadLatest();
  }, []);

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
      const response = await apiService.getValueIDList({
        isForSale: true,
      });
      setAllValueIDs(response.data);
    } catch (err) {
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
            paymentCurrency={valueId.paymentCurrency || "ETH"}
            displayMode="sale"
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
            paymentCurrency={valueId.paymentCurrency || "ETH"}
            displayMode="sale"
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
            onClick={() => {
              if (isAuthenticated) {
                alert("钱包已连接");
              } else {
                alert(t("common.connectWallet") || "连接钱包");
              }
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
