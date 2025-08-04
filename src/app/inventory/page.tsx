"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import MobileLayout from "@/components/layout/MobileLayout";
import TabView from "@/components/ui/TabView";
import ValueIDCard from "@/components/ui/NFTCard";
import Button from "@/components/ui/Button";
import { useLocale } from "@/components/LocaleProvider";
import { ValueID } from "@/types";
import { useState } from "react";
import { apiService } from "@/common/api";

export default function InventoryPage() {
  const { t } = useLocale();
  const router = useRouter();
  const [ownedValueIDs, setOwnedValueIDs] = useState<ValueID[]>([]);
  const [rentedValueIDs, setRentedValueIDs] = useState<ValueID[]>([]);
  const [favoriteValueIDs, setFavoriteValueIDs] = useState<ValueID[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const [ownedResponse, rentedResponse, favoriteResponse] =
        await Promise.all([
          apiService.getCurrentUserValueIDs(),
          apiService.getCurrentUserRentedValueIDs(),
          apiService.getCurrentUserFavoriteValueIDs(),
        ]);
      console.log(ownedResponse, rentedResponse, favoriteResponse);
      setOwnedValueIDs(ownedResponse.ownedValueIDs);
      setRentedValueIDs(rentedResponse.rentedValueIDs);
      setFavoriteValueIDs(
        favoriteResponse.favorites.map((item) => item.valueID)
      );
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
          {ownedValueIDs.length > 0 ? (
            renderValueIDGrid(ownedValueIDs, "inventory")
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
