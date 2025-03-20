"use client";

import React, { useState, ChangeEvent } from "react";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import MobileLayout from "@/components/layout/MobileLayout";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { getNFTById } from "@/data/mockData";
import { mockUser } from "@/data/mockData";
import { FaArrowLeft, FaHeart, FaRegHeart } from "react-icons/fa";
import { useLocale } from "@/components/LocaleProvider";

// 支付币种选项
const currencyOptions = [
  { value: "ETH", label: "currency.eth" },
  { value: "CNY", label: "currency.cny" },
  { value: "USDT", label: "currency.usdt" },
  { value: "BTC", label: "currency.btc" },
];

export default function NFTDetailPage() {
  const { t } = useLocale();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const valueId = getNFTById(id);
  const [activeTab, setActiveTab] = useState<"details" | "attributes">(
    "details"
  );

  // 检查ID是否属于当前用户
  const isOwnedByUser = mockUser.ownedNFTs.includes(id);

  // 检查是否是租赁的ID
  const isRentedByUser = mockUser.rentedNFTs.includes(id);

  // 检查ID是否已收藏
  const [isFavorite, setIsFavorite] = useState(
    mockUser.favoriteNFTs.includes(id)
  );

  // 处理收藏/取消收藏
  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
    // 在实际应用中，这里应该调用API来更新用户的收藏列表
    // 这里仅做前端状态更新
    if (!isFavorite) {
      alert(t("nft.addedToFavorites"));
    } else {
      alert(t("nft.removedFromFavorites"));
    }
  };

  // 出售弹框状态
  const [sellModalOpen, setSellModalOpen] = useState(false);
  const [sellPrice, setSellPrice] = useState("");
  const [sellCurrency, setSellCurrency] = useState("ETH");
  const [sellAddress, setSellAddress] = useState(mockUser.address);

  // 出租弹框状态
  const [rentModalOpen, setRentModalOpen] = useState(false);
  const [rentPrice, setRentPrice] = useState("");
  const [rentDeposit, setRentDeposit] = useState("");
  const [rentDuration, setRentDuration] = useState("");
  const [rentCurrency, setRentCurrency] = useState("ETH");
  const [rentAddress, setRentAddress] = useState(mockUser.address);

  // 处理出售表单提交
  const handleSellSubmit = () => {
    alert(
      t("sell.success", {
        price: sellPrice,
        currency: sellCurrency,
        address: sellAddress,
      })
    );
    setSellModalOpen(false);
  };

  // 处理出租表单提交
  const handleRentSubmit = () => {
    alert(
      t("rent.success", {
        price: rentPrice,
        currency: rentCurrency,
        deposit: rentDeposit,
        duration: rentDuration,
        address: rentAddress,
      })
    );
    setRentModalOpen(false);
  };

  if (!valueId) {
    return (
      <MobileLayout showTabBar={false}>
        <div className="p-[16px]">
          <div className="flex items-center mb-[16px]">
            <button
              className="mr-[8px] text-[1.25rem]"
              onClick={() => router.back()}
            >
              <FaArrowLeft />
            </button>
            <h1 className="text-[1.25rem] font-[700]">{t("nft.detail")}</h1>
          </div>
          <div className="text-center py-[64px] text-[#6b7280]">
            {t("nft.notFound")}
            <div className="mt-[16px]">
              <Button variant="primary" onClick={() => router.push("/")}>
                {t("nft.returnHome")}
              </Button>
            </div>
          </div>
        </div>
      </MobileLayout>
    );
  }

  // 格式化币种选项，添加翻译
  const formattedCurrencyOptions = currencyOptions.map((option) => ({
    value: option.value,
    label: t(option.label),
  }));

  // 确定当前ID的显示模式
  const displayMode =
    isOwnedByUser || isRentedByUser
      ? "inventory"
      : valueId.isForRent
      ? "rental"
      : "sale";

  return (
    <MobileLayout showTabBar={false}>
      <div>
        <div className="relative w-[100%] aspect-square">
          <Image
            src={valueId.image}
            alt={valueId.name}
            fill
            className="object-cover"
          />
          <div className="absolute top-[16px] left-[16px] right-[16px] flex justify-between">
            <button
              className="w-[40px] h-[40px] rounded-[9999px] bg-[rgba(0,0,0,0.5)] text-[#ffffff] flex items-center justify-center"
              onClick={() => router.back()}
            >
              <FaArrowLeft />
            </button>
            <button
              className="w-[40px] h-[40px] rounded-[9999px] bg-[rgba(0,0,0,0.5)] text-[#ffffff] flex items-center justify-center"
              onClick={handleToggleFavorite}
            >
              {isFavorite ? (
                <FaHeart className="text-[#ff4d4f]" />
              ) : (
                <FaRegHeart />
              )}
            </button>
          </div>
          {valueId.rarity && (
            <div className="absolute bottom-[16px] right-[16px] bg-[rgba(0,0,0,0.7)] text-[#ffffff] text-[0.75rem] px-[12px] py-[4px] rounded-[9999px]">
              {valueId.rarity}
            </div>
          )}
        </div>

        <div className="p-[16px] pb-[100px]">
          <div className="mb-[16px]">
            <h1
              className="text-[1.5rem] font-[700]"
              style={{ color: "var(--foreground)" }}
            >
              {valueId.name}
            </h1>
            <div className="flex justify-between items-center mt-[8px]">
              <div
                className="text-[0.875rem]"
                style={{ color: "var(--tab-inactive-color)" }}
              >
                {valueId.indexNumber}
              </div>
              {displayMode !== "inventory" && (
                <div
                  className="text-[1.125rem] font-[700]"
                  style={{ color: "var(--primary-color)" }}
                >
                  {displayMode === "rental" && valueId.rentalPrice
                    ? `¥${valueId.rentalPrice.toFixed(2)}`
                    : `¥${valueId.price.toFixed(2)}`}
                </div>
              )}
            </div>
          </div>

          <div className="mb-[24px]">
            <div
              className="flex mb-[16px]"
              style={{
                borderWidth: "0 0 1px 0",
                borderStyle: "solid",
                borderColor: "var(--border-color)",
              }}
            >
              <button
                className={`py-[12px] px-[16px] text-[0.875rem] font-[500]`}
                style={
                  activeTab === "details"
                    ? {
                        borderWidth: "0 0 2px 0",
                        borderStyle: "solid",
                        borderColor: "var(--primary-color)",
                        color: "var(--primary-color)",
                      }
                    : {
                        color: "var(--tab-inactive-color)",
                      }
                }
                onClick={() => setActiveTab("details")}
              >
                {t("nft.details")}
              </button>
              <button
                className={`py-[12px] px-[16px] text-[0.875rem] font-[500]`}
                style={
                  activeTab === "attributes"
                    ? {
                        borderWidth: "0 0 2px 0",
                        borderStyle: "solid",
                        borderColor: "var(--primary-color)",
                        color: "var(--primary-color)",
                      }
                    : {
                        color: "var(--tab-inactive-color)",
                      }
                }
                onClick={() => setActiveTab("attributes")}
              >
                {t("nft.attributes")}
              </button>
            </div>

            {activeTab === "details" ? (
              <div>
                <p
                  className="text-[0.875rem] mb-[16px]"
                  style={{ color: "var(--foreground)" }}
                >
                  {valueId.description}
                </p>
                <div className="grid grid-cols-2 gap-[16px] text-[0.875rem]">
                  <div>
                    <div style={{ color: "var(--tab-inactive-color)" }}>
                      {t("nft.createdAt")}
                    </div>
                    <div style={{ color: "var(--foreground)" }}>
                      {new Date(valueId.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: "var(--tab-inactive-color)" }}>
                      {t("nft.owner")}
                    </div>
                    <div style={{ color: "var(--foreground)" }}>
                      {valueId.owner}
                    </div>
                  </div>

                  {displayMode !== "inventory" && (
                    <>
                      <div>
                        <div style={{ color: "var(--tab-inactive-color)" }}>
                          {t("nft.paymentCurrency")}
                        </div>
                        <div style={{ color: "var(--foreground)" }}>
                          {valueId.paymentCurrency || "ETH"}
                        </div>
                      </div>
                      <div>
                        <div style={{ color: "var(--tab-inactive-color)" }}>
                          {t("nft.paymentAddress")}
                        </div>
                        <div style={{ color: "var(--foreground)" }}>
                          {valueId.paymentAddress}
                        </div>
                      </div>
                    </>
                  )}

                  {displayMode === "rental" && valueId.rentalPeriod && (
                    <div>
                      <div style={{ color: "var(--tab-inactive-color)" }}>
                        {t("nft.rentalPeriod")}
                      </div>
                      <div style={{ color: "var(--foreground)" }}>
                        {valueId.rentalPeriod} {t("nft.days")}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-[16px]">
                {valueId.attributes.map((attr, index) => (
                  <Card
                    key={index}
                    className="p-[12px]"
                    style={{ backgroundColor: "var(--card-background)" }}
                  >
                    <div
                      className="text-[0.75rem]"
                      style={{ color: "var(--tab-inactive-color)" }}
                    >
                      {attr.trait_type}
                    </div>
                    <div
                      className="font-[500]"
                      style={{ color: "var(--foreground)" }}
                    >
                      {attr.value}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        <div
          className="fixed bottom-[0px] left-[0px] right-[0px] p-[16px] flex gap-[8px]"
          style={{
            borderWidth: "1px 0 0 0",
            borderStyle: "solid",
            borderColor: "var(--border-color)",
            backgroundColor: "var(--card-background)",
          }}
        >
          {isOwnedByUser ? (
            // 用户自己的ID，显示出售和出租按钮
            <>
              <Button
                variant="primary"
                fullWidth
                onClick={() => setSellModalOpen(true)}
              >
                {t("nft.sellNow")}
              </Button>
              <Button
                variant="outline"
                fullWidth
                onClick={() => setRentModalOpen(true)}
              >
                {t("nft.rentOut")}
              </Button>
            </>
          ) : isRentedByUser ? (
            // 用户租赁的ID，显示归还按钮
            <Button
              variant="primary"
              fullWidth
              onClick={() => alert(t("nft.returnRental"))}
            >
              {t("nft.returnRental")}
            </Button>
          ) : (
            // 不是用户自己的ID，显示购买和租赁按钮
            <>
              {valueId.isForSale && (
                <Button
                  variant="primary"
                  fullWidth
                  onClick={() => alert(t("nft.buyNow"))}
                >
                  {t("nft.buyNow")}
                </Button>
              )}
              {valueId.isForRent && (
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => alert(t("nft.rentNow"))}
                >
                  {t("nft.rentNow")}
                </Button>
              )}
            </>
          )}
        </div>

        {/* 出售弹框 */}
        <Modal
          isOpen={sellModalOpen}
          title={t("nft.sellNow")}
          onClose={() => setSellModalOpen(false)}
        >
          <div className="p-[16px]">
            <div className="mb-[16px]">
              <label
                className="block text-[0.875rem] mb-[8px]"
                style={{ color: "var(--tab-inactive-color)" }}
              >
                {t("sell.price")}
              </label>
              <Input
                type="number"
                value={sellPrice}
                onChange={(e) => setSellPrice(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div className="mb-[16px]">
              <label
                className="block text-[0.875rem] mb-[8px]"
                style={{ color: "var(--tab-inactive-color)" }}
              >
                {t("sell.currency")}
              </label>
              <Select
                value={sellCurrency}
                onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                  setSellCurrency(e.target.value)
                }
                options={formattedCurrencyOptions}
              />
            </div>
            <div className="mb-[24px]">
              <label
                className="block text-[0.875rem] mb-[8px]"
                style={{ color: "var(--tab-inactive-color)" }}
              >
                {t("sell.address")}
              </label>
              <Input
                type="text"
                value={sellAddress}
                onChange={(e) => setSellAddress(e.target.value)}
              />
            </div>
            <div className="flex gap-[16px]">
              <Button
                variant="outline"
                fullWidth
                onClick={() => setSellModalOpen(false)}
              >
                {t("sell.cancel")}
              </Button>
              <Button variant="primary" fullWidth onClick={handleSellSubmit}>
                {t("sell.submit")}
              </Button>
            </div>
          </div>
        </Modal>

        {/* 出租弹框 */}
        <Modal
          isOpen={rentModalOpen}
          title={t("nft.rentOut")}
          onClose={() => setRentModalOpen(false)}
        >
          <div className="p-[16px]">
            <div className="mb-[16px]">
              <label
                className="block text-[0.875rem] mb-[8px]"
                style={{ color: "var(--tab-inactive-color)" }}
              >
                {t("rent.price")}
              </label>
              <Input
                type="number"
                value={rentPrice}
                onChange={(e) => setRentPrice(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div className="mb-[16px]">
              <label
                className="block text-[0.875rem] mb-[8px]"
                style={{ color: "var(--tab-inactive-color)" }}
              >
                {t("rent.deposit")}
              </label>
              <Input
                type="number"
                value={rentDeposit}
                onChange={(e) => setRentDeposit(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div className="mb-[16px]">
              <label
                className="block text-[0.875rem] mb-[8px]"
                style={{ color: "var(--tab-inactive-color)" }}
              >
                {t("rent.duration")}
              </label>
              <Input
                type="number"
                value={rentDuration}
                onChange={(e) => setRentDuration(e.target.value)}
                placeholder="1"
              />
            </div>
            <div className="mb-[16px]">
              <label
                className="block text-[0.875rem] mb-[8px]"
                style={{ color: "var(--tab-inactive-color)" }}
              >
                {t("rent.currency")}
              </label>
              <Select
                value={rentCurrency}
                onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                  setRentCurrency(e.target.value)
                }
                options={formattedCurrencyOptions}
              />
            </div>
            <div className="mb-[24px]">
              <label
                className="block text-[0.875rem] mb-[8px]"
                style={{ color: "var(--tab-inactive-color)" }}
              >
                {t("rent.address")}
              </label>
              <Input
                type="text"
                value={rentAddress}
                onChange={(e) => setRentAddress(e.target.value)}
              />
            </div>
            <div className="flex gap-[16px]">
              <Button
                variant="outline"
                fullWidth
                onClick={() => setRentModalOpen(false)}
              >
                {t("rent.cancel")}
              </Button>
              <Button variant="primary" fullWidth onClick={handleRentSubmit}>
                {t("rent.submit")}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </MobileLayout>
  );
}
