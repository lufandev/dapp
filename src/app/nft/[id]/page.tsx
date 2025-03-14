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
import { FaArrowLeft, FaShareAlt } from "react-icons/fa";
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
  const nft = getNFTById(id);
  const [activeTab, setActiveTab] = useState<"details" | "attributes">(
    "details"
  );

  // 检查NFT是否属于当前用户
  const isOwnedByUser = mockUser.ownedNFTs.includes(id);

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

  if (!nft) {
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

  return (
    <MobileLayout showTabBar={false}>
      <div>
        <div className="relative w-[100%] aspect-square">
          <Image src={nft.image} alt={nft.name} fill className="object-cover" />
          <div className="absolute top-[16px] left-[16px] right-[16px] flex justify-between">
            <button
              className="w-[40px] h-[40px] rounded-[9999px] bg-[rgba(0,0,0,0.5)] text-[#ffffff] flex items-center justify-center"
              onClick={() => router.back()}
            >
              <FaArrowLeft />
            </button>
            <button
              className="w-[40px] h-[40px] rounded-[9999px] bg-[rgba(0,0,0,0.5)] text-[#ffffff] flex items-center justify-center"
              onClick={() => alert(t("nft.share"))}
            >
              <FaShareAlt />
            </button>
          </div>
          {nft.rarity && (
            <div className="absolute bottom-[16px] right-[16px] bg-[rgba(0,0,0,0.7)] text-[#ffffff] text-[0.75rem] px-[12px] py-[4px] rounded-[9999px]">
              {nft.rarity}
            </div>
          )}
        </div>

        <div className="p-[16px]">
          <h1 className="text-[1.25rem] font-[700] mb-[8px]">{nft.name}</h1>
          <div className="flex justify-between items-center mb-[16px]">
            <div className="text-[1.5rem] font-[700] text-[#8b5cf6]">
              ¥{nft.price.toFixed(2)}
            </div>
            {nft.isForRent && nft.rentalPrice && (
              <div className="text-[0.875rem] text-[#6b7280]">
                {t("nft.rentalPrice", { price: nft.rentalPrice.toFixed(2) })}
              </div>
            )}
          </div>

          <div className="mb-[24px]">
            <div
              className="flex border-[#e5e5e5] dark:border-[#333333] mb-[16px]"
              style={{ borderWidth: "0 0 1px 0", borderStyle: "solid" }}
            >
              <button
                className={`py-[12px] px-[16px] text-[0.875rem] font-[500] ${
                  activeTab === "details" ? "text-[#8b5cf6]" : "text-[#6b7280]"
                }`}
                style={
                  activeTab === "details"
                    ? {
                        borderWidth: "0 0 2px 0",
                        borderStyle: "solid",
                        borderColor: "#8b5cf6",
                      }
                    : {}
                }
                onClick={() => setActiveTab("details")}
              >
                {t("nft.details")}
              </button>
              <button
                className={`py-[12px] px-[16px] text-[0.875rem] font-[500] ${
                  activeTab === "attributes"
                    ? "text-[#8b5cf6]"
                    : "text-[#6b7280]"
                }`}
                style={
                  activeTab === "attributes"
                    ? {
                        borderWidth: "0 0 2px 0",
                        borderStyle: "solid",
                        borderColor: "#8b5cf6",
                      }
                    : {}
                }
                onClick={() => setActiveTab("attributes")}
              >
                {t("nft.attributes")}
              </button>
            </div>

            {activeTab === "details" ? (
              <div>
                <p className="text-[0.875rem] text-[#4b5563] mb-[16px]">
                  {nft.description}
                </p>
                <div className="grid grid-cols-2 gap-[16px] text-[0.875rem]">
                  <div>
                    <div className="text-[#6b7280]">{t("nft.createdAt")}</div>
                    <div>{new Date(nft.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div>
                    <div className="text-[#6b7280]">{t("nft.owner")}</div>
                    <div>{nft.owner}</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-[16px]">
                {nft.attributes.map((attr, index) => (
                  <Card key={index} className="p-[12px]">
                    <div className="text-[0.75rem] text-[#6b7280]">
                      {attr.trait_type}
                    </div>
                    <div className="font-[500]">{attr.value}</div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        <div
          className="fixed bottom-[0px] left-[0px] right-[0px] p-[16px] bg-[#ffffff] dark:bg-[#1e1e1e] border-[#e5e5e5] dark:border-[#333333] flex gap-[8px]"
          style={{ borderWidth: "1px 0 0 0", borderStyle: "solid" }}
        >
          {isOwnedByUser ? (
            // 用户自己的NFT，显示出售和出租按钮
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
          ) : (
            // 不是用户自己的NFT，显示购买和租赁按钮
            <>
              {nft.isForSale && (
                <Button
                  variant="primary"
                  fullWidth
                  onClick={() => alert(t("nft.buyNow"))}
                >
                  {t("nft.buyNow")}
                </Button>
              )}
              {nft.isForRent && (
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
              <label className="block text-[0.875rem] text-[#6b7280] mb-[8px]">
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
              <label className="block text-[0.875rem] text-[#6b7280] mb-[8px]">
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
              <label className="block text-[0.875rem] text-[#6b7280] mb-[8px]">
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
              <label className="block text-[0.875rem] text-[#6b7280] mb-[8px]">
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
              <label className="block text-[0.875rem] text-[#6b7280] mb-[8px]">
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
              <label className="block text-[0.875rem] text-[#6b7280] mb-[8px]">
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
              <label className="block text-[0.875rem] text-[#6b7280] mb-[8px]">
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
              <label className="block text-[0.875rem] text-[#6b7280] mb-[8px]">
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
