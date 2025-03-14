"use client";

import React from "react";
import MobileLayout from "@/components/layout/MobileLayout";
import TabView from "@/components/ui/TabView";
import NFTCard from "@/components/ui/NFTCard";
import Button from "@/components/ui/Button";
import { mockNFTs } from "@/data/mockData";
import { mockUser } from "@/data/mockData";
import { useLocale } from "@/components/LocaleProvider";

export default function InventoryPage() {
  const { t } = useLocale();
  const ownedNFTs = mockNFTs.filter((nft) =>
    mockUser.ownedNFTs.includes(nft.id)
  );
  const rentedNFTs = mockNFTs.filter((nft) =>
    mockUser.rentedNFTs.includes(nft.id)
  );

  const renderNFTGrid = (nfts: typeof mockNFTs) => {
    return (
      <div className="grid grid-cols-2 gap-[16px] mb-[100px]">
        {nfts.map((nft) => (
          <NFTCard
            key={nft.id}
            id={nft.id}
            name={nft.name}
            image={nft.image}
            price={nft.price}
            rarity={nft.rarity}
            isRental={nft.isForRent}
            rentalPrice={nft.rentalPrice}
          />
        ))}
      </div>
    );
  };

  const tabs = [
    {
      label: t("inventory.owned"),
      content: (
        <div>
          <div className="mb-6 flex justify-between items-center">
            <div className="text-sm text-gray-500">
              {t("inventory.total", { count: ownedNFTs.length })}
            </div>
            <div className="flex gap-3">
              {/* <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                onClick={() => alert("筛选功能")}
              >
                <FaEllipsisH />
                <span>{t("inventory.filter")}</span>
              </Button> */}
            </div>
          </div>
          {ownedNFTs.length > 0 ? (
            <>
              {/* <div className="flex gap-4 mb-6">
                <Button
                  variant="primary"
                  className="flex-1 flex items-center justify-center gap-2"
                  onClick={() => alert("出售功能")}
                >
                  <FaPlus />
                  <span>{t("inventory.sell")}</span>
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 flex items-center justify-center gap-2"
                  onClick={() => alert("出租功能")}
                >
                  <FaPlus />
                  <span>{t("inventory.rent")}</span>
                </Button>
              </div> */}
              {renderNFTGrid(ownedNFTs)}
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">
              {t("inventory.noOwned")}
              <div className="mt-6">
                <Button
                  variant="primary"
                  onClick={() => alert(t("inventory.buy"))}
                >
                  {t("inventory.buy")}
                </Button>
              </div>
            </div>
          )}
        </div>
      ),
    },
    {
      label: t("inventory.rented"),
      content: (
        <div>
          <div className="mb-6 flex justify-between items-center">
            <div className="text-sm text-gray-500">
              {t("inventory.total", { count: rentedNFTs.length })}
            </div>
            {/* <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              onClick={() => alert("筛选功能")}
            >
              <FaEllipsisH />
              <span>{t("inventory.filter")}</span>
            </Button> */}
          </div>
          {rentedNFTs.length > 0 ? (
            renderNFTGrid(rentedNFTs)
          ) : (
            <div className="text-center py-8 text-gray-500">
              {t("inventory.noRented")}
              <div className="mt-6">
                <Button
                  variant="primary"
                  onClick={() => alert(t("inventory.goRent"))}
                >
                  {t("inventory.goRent")}
                </Button>
              </div>
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <MobileLayout>
      <div className="p-[16px]">
        <div className="flex justify-between items-center mb-[16px]">
          <h1 className="text-xl font-bold">{t("inventory.title")}</h1>
        </div>
        <TabView tabs={tabs} />
      </div>
    </MobileLayout>
  );
}
