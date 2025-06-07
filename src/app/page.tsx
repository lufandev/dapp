"use client";

import React, { useState, useEffect } from "react";
import MobileLayout from "@/components/layout/MobileLayout";
import SearchBar from "@/components/ui/SearchBar";
import TabView from "@/components/ui/TabView";
import ValueIDCard from "@/components/ui/NFTCard";
import Button from "@/components/ui/Button";
import { FaWallet } from "react-icons/fa";
import { useLocale } from "@/components/LocaleProvider";
import { apiService } from "@/common/api";
import { ApiError } from "@/common/http";
import { ValueID } from "@/types";

export default function Home() {
  const { t } = useLocale();

  // 状态管理
  const [allValueIDs, setAllValueIDs] = useState<ValueID[]>([]);
  const [recommendedValueIDs, setRecommendedValueIDs] = useState<ValueID[]>([]);
  const [latestValueIDs, setLatestValueIDs] = useState<ValueID[]>([]);
  const [searchResults, setSearchResults] = useState<ValueID[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);

  // 加载ValueID数据
  useEffect(() => {
    const fetchValueIDs = async () => {
      try {
        setLoading(true);
        setError(null);

        // 并行请求所有数据
        const [allData, recommendedData, latestData] = await Promise.all([
          apiService.getAllValueIDs(),
          // apiService.getRecommendedValueIDs(),
          // apiService.getLatestValueIDs(),
        ]);

        setAllValueIDs(allData);
        // setRecommendedValueIDs(recommendedData);
        // setLatestValueIDs(latestData);
      } catch (err) {
        console.error("获取ValueID数据失败:", err);

        if (err instanceof ApiError) {
          setError(`加载失败: ${err.message}`);
        } else {
          setError("网络连接失败，请检查网络设置");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchValueIDs();
  }, []);

  // 搜索处理
  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults(null);
      return;
    }

    try {
      setSearchLoading(true);
      const results = await apiService.searchValueIDs(query);
      setSearchResults(results);
    } catch (err) {
      console.error("搜索失败:", err);
      // 搜索失败时使用本地过滤作为备选方案
      const localResults = allValueIDs.filter(
        (valueId) =>
          valueId.name.toLowerCase().includes(query.toLowerCase()) ||
          valueId.description.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(localResults);
    } finally {
      setSearchLoading(false);
    }
  };

  // 渲染ValueID网格
  const renderValueIDGrid = (valueIDs: ValueID[]) => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-500">加载中...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-16">
          <p className="text-red-500 mb-4">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="px-4 py-2"
          >
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
            id={valueId.id}
            name={valueId.name}
            image={valueId.image}
            indexNumber={valueId.indexNumber}
            price={valueId.price}
            rarity={valueId.rarity}
            isRental={valueId.isForRent}
            rentalPrice={valueId.rentalPrice}
            paymentCurrency={valueId.paymentCurrency}
            displayMode="sale"
          />
        ))}
      </div>
    );
  };

  // 渲染搜索结果网格
  const renderSearchResults = () => {
    if (searchLoading) {
      return (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mr-2"></div>
          <span className="text-gray-500">搜索中...</span>
        </div>
      );
    }

    if (!searchResults) return null;

    return (
      <div className="grid grid-cols-2 gap-[16px] mb-[100px]">
        {searchResults.map((valueId) => (
          <ValueIDCard
            key={valueId.id}
            id={valueId.id}
            name={valueId.name}
            image={valueId.image}
            indexNumber={valueId.indexNumber}
            price={valueId.price}
            rarity={valueId.rarity}
            isRental={valueId.isForRent}
            rentalPrice={valueId.rentalPrice}
            paymentCurrency={valueId.paymentCurrency}
            displayMode="sale"
          />
        ))}
      </div>
    );
  };

  // 标签页配置
  const tabs = [
    {
      label: t("home.all"),
      content: renderValueIDGrid(allValueIDs),
    },
    {
      label: t("home.recommended"),
      content: renderValueIDGrid(recommendedValueIDs),
    },
    {
      label: t("home.latest"),
      content: renderValueIDGrid(latestValueIDs),
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
            onClick={() => alert(t("common.connectWallet"))}
          >
            <FaWallet className="text-[14px]" />
            <span>{t("common.connectWallet")}</span>
          </Button>
        </div>

        <div className="mb-6">
          <SearchBar onSearch={handleSearch} placeholder={t("common.search")} />
        </div>

        {searchResults !== null ? (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">
                {t("common.searchResults")} ({searchResults.length})
              </h2>
              <button
                className="text-[#3b82f6] text-sm"
                onClick={() => setSearchResults(null)}
              >
                {t("common.back")}
              </button>
            </div>
            {searchResults.length > 0 ? (
              renderSearchResults()
            ) : (
              <div className="text-center py-8 text-gray-500">
                {t("common.noResults")}
              </div>
            )}
          </div>
        ) : (
          <TabView tabs={tabs} />
        )}
      </div>
    </MobileLayout>
  );
}
