"use client";

import React, { useState } from "react";
import MobileLayout from "@/components/layout/MobileLayout";
import SearchBar from "@/components/ui/SearchBar";
import TabView from "@/components/ui/TabView";
import ValueIDCard from "@/components/ui/NFTCard";
import Button from "@/components/ui/Button";
import {
  mockValueIDs,
  getRecommendedNFTs,
  getLatestNFTs,
} from "@/data/mockData";
import { FaWallet } from "react-icons/fa";
import { useLocale } from "@/components/LocaleProvider";

export default function Home() {
  const { t } = useLocale();
  const [searchResults, setSearchResults] = useState<
    typeof mockValueIDs | null
  >(null);

  const handleSearch = (query: string) => {
    if (!query.trim()) {
      setSearchResults(null);
      return;
    }

    const results = mockValueIDs.filter(
      (valueId) =>
        valueId.name.toLowerCase().includes(query.toLowerCase()) ||
        valueId.description.toLowerCase().includes(query.toLowerCase())
    );
    setSearchResults(results);
  };

  const renderValueIDGrid = (valueIDs: typeof mockValueIDs) => {
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

  const tabs = [
    {
      label: t("home.all"),
      content: renderValueIDGrid(mockValueIDs),
    },
    {
      label: t("home.recommended"),
      content: renderValueIDGrid(getRecommendedNFTs()),
    },
    {
      label: t("home.latest"),
      content: renderValueIDGrid(getLatestNFTs()),
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

        {searchResults ? (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">
                {t("common.searchResults")}
              </h2>
              <button
                className="text-[#3b82f6] text-sm"
                onClick={() => setSearchResults(null)}
              >
                {t("common.back")}
              </button>
            </div>
            {searchResults.length > 0 ? (
              renderValueIDGrid(searchResults)
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
