"use client";

import React, { useState } from "react";
import MobileLayout from "@/components/layout/MobileLayout";
import SearchBar from "@/components/ui/SearchBar";
import NFTCard from "@/components/ui/NFTCard";
import { getRentalNFTs } from "@/data/mockData";
import { useLocale } from "@/components/LocaleProvider";

export default function RentalPage() {
  const { t } = useLocale();
  const [searchResults, setSearchResults] = useState<ReturnType<
    typeof getRentalNFTs
  > | null>(null);
  const rentalNFTs = getRentalNFTs();

  const handleSearch = (query: string) => {
    if (!query.trim()) {
      setSearchResults(null);
      return;
    }

    const results = rentalNFTs.filter(
      (nft) =>
        nft.name.toLowerCase().includes(query.toLowerCase()) ||
        nft.description.toLowerCase().includes(query.toLowerCase())
    );
    setSearchResults(results);
  };

  const renderNFTGrid = (nfts: ReturnType<typeof getRentalNFTs>) => {
    return (
      <div className="grid grid-cols-2 gap-[16px] mb-[83px]">
        {nfts.map((nft) => (
          <NFTCard
            key={nft.id}
            id={nft.id}
            name={nft.name}
            image={nft.image}
            price={nft.price}
            rarity={nft.rarity}
            isRental={true}
            rentalPrice={nft.rentalPrice}
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
              renderNFTGrid(searchResults)
            ) : (
              <div className="text-center py-8 text-gray-500">
                {t("common.noResults")}
              </div>
            )}
          </div>
        ) : (
          renderNFTGrid(rentalNFTs)
        )}
      </div>
    </MobileLayout>
  );
}
