"use client";

import React, { useState, useEffect } from "react";
import MobileLayout from "@/components/layout/MobileLayout";
import SearchBar from "@/components/ui/SearchBar";
import ValueIDCard from "@/components/ui/NFTCard";
// import { getRentalNFTs } from "@/data/mockData";
import { useLocale } from "@/components/LocaleProvider";
import { apiService } from "@/common/api";
import { ValueID } from "@/types";

export default function RentalPage() {
  const { t } = useLocale();
  const [searchResults, setSearchResults] = useState<ValueID[]>([]);
  useEffect(() => {
    const loadData = async () => {
      const response = await apiService.getValueIDList({
        isForRent: true,
      });
      setSearchResults(response.data);
    };
    loadData();
  }, []);

  const handleSearch = async (query: string) => {
    const results = await apiService.getValueIDList({
      isForRent: true,
      name: query,
    });
    setSearchResults(results.data);
  };

  const renderValueIDGrid = (valueIDs: ReturnType<typeof getRentalNFTs>) => {
    return (
      <div className="grid grid-cols-2 gap-[16px] mb-[83px]">
        {valueIDs.map((valueId) => (
          <ValueIDCard
            key={valueId.id}
            id={valueId.id}
            name={valueId.name}
            image={valueId.image}
            indexNumber={valueId.indexNumber}
            price={valueId.price}
            rarity={valueId.rarity}
            isRental={true}
            rentalPrice={valueId.rentalPrice}
            paymentCurrency={valueId.paymentCurrency}
            displayMode="rental"
          />
        ))}
      </div>
    );
  };

  return (
    <MobileLayout>
      <div className="p-[16px]">
        <div className="flex justify-between items-center mb-[16px]">
          <h1 className="text-xl font-bold">{t("rental.market")}</h1>
        </div>

        <div className="mb-[24px]">
          <SearchBar
            onSearch={handleSearch}
            placeholder={t("common.searchRental")}
          />
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
          renderValueIDGrid(rentalNFTs)
        )}
      </div>
    </MobileLayout>
  );
}
