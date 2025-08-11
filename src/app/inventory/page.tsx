"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import MobileLayout from "@/components/layout/MobileLayout";
import TabView from "@/components/ui/TabView";
import ValueIDCard from "@/components/ui/NFTCard";
import Button from "@/components/ui/Button";
import { useLocale } from "@/components/LocaleProvider";
import { ValueID } from "@/types";
import {
  getCurrentUserNFTAssets,
  UserNFTAsset,
} from "@/common/connection-service";

export default function InventoryPage() {
  const { t } = useLocale();
  const router = useRouter();
  const [ownedValueIDs, setOwnedValueIDs] = useState<ValueID[]>([]);
  const [rentedValueIDs, setRentedValueIDs] = useState<ValueID[]>([]);
  const [favoriteValueIDs, setFavoriteValueIDs] = useState<ValueID[]>([]);
  const [loading, setLoading] = useState(true);

  // 将UserNFTAsset转换为ValueID格式
  const convertNFTAssetToValueID = (asset: UserNFTAsset): ValueID => {
    return {
      id: asset.tokenId,
      name: asset.name,
      description: `NFT with ID: ${asset.idString}`,
      image: asset.image || "/images/nft1.jpg",
      tokenId: asset.tokenId,
      indexNumber: asset.tokenId,
      price: 0, // NFT本身不出售，价格为0
      paymentAddress: "",
      paymentCurrency: "USDT",
      rarity: "common", // 默认稀有度
      isForSale: false,
      isForRent: false, // 默认不出租
      rentalPrice: 0,
      rentalPeriod: 0,
      viewCount: 0,
      favoriteCount: 0,
      owner: {
        id: 0,
        username: "当前用户",
      },
      attributes: [],
      createdAt: new Date().toISOString(),
    };
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        console.log("🚀 开始加载用户NFT资产...");

        // 获取用户持有的NFT
        const userAssets = await getCurrentUserNFTAssets();
        console.log("🚀 获取到的NFT资产:", userAssets);

        // 转换为ValueID格式
        const ownedAssets = userAssets.map(convertNFTAssetToValueID);
        setOwnedValueIDs(ownedAssets);

        // 暂时设置空的租赁和收藏列表（可以后续实现）
        setRentedValueIDs([]);
        setFavoriteValueIDs([]);

        console.log("🚀 NFT资产加载完成:", ownedAssets);
      } catch (error) {
        console.error("🚀 加载NFT资产失败:", error);
        // 发生错误时设置为空数组
        setOwnedValueIDs([]);
        setRentedValueIDs([]);
        setFavoriteValueIDs([]);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const renderValueIDGrid = (
    valueIDs: ValueID[],
    displayMode: "inventory" | "sale" | "rental" = "inventory"
  ) => {
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
            displayMode={displayMode}
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
              {t("inventory.total", { count: ownedValueIDs.length })}
            </div>
          </div>
          {loading ? (
            <div className="text-center py-8 text-gray-500">
              正在加载您的NFT资产...
            </div>
          ) : ownedValueIDs.length > 0 ? (
            renderValueIDGrid(ownedValueIDs, "inventory")
          ) : (
            <div className="text-center py-8 text-gray-500">
              {t("inventory.noOwned")}
              <div className="mt-6">
                <Button
                  variant="primary"
                  onClick={() => router.push("/profile")}
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
              {t("inventory.total", { count: rentedValueIDs.length })}
            </div>
          </div>
          {rentedValueIDs.length > 0 ? (
            renderValueIDGrid(rentedValueIDs, "inventory")
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
    {
      label: t("inventory.favorites"),
      content: (
        <div>
          <div className="mb-6 flex justify-between items-center">
            <div className="text-sm text-gray-500">
              {t("inventory.total", { count: favoriteValueIDs.length })}
            </div>
          </div>
          {favoriteValueIDs.length > 0 ? (
            renderValueIDGrid(favoriteValueIDs, "inventory")
          ) : (
            <div className="text-center py-8 text-gray-500">
              {t("inventory.noFavorites")}
              <div className="mt-6">
                <Button variant="primary" onClick={() => router.push("/")}>
                  {t("inventory.browse")}
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
