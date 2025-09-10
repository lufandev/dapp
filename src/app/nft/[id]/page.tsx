"use client";

import React, { useState, ChangeEvent, useEffect } from "react";
import Image from "next/image";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import MobileLayout from "@/components/layout/MobileLayout";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
// import { apiService } from "@/common/api";
// import { mockUser } from "@/data/mockData";
import { FaArrowLeft, FaHeart, FaRegHeart } from "react-icons/fa";
import { useLocale } from "@/components/LocaleProvider";
import { useFeedback } from "@/components/ui/Feedback";
import { ValueID } from "@/types";
// 动态导入connection-service避免服务端渲染问题
// import {
//   connectOnce,
//   listNFTForSale,
//   cancelNFTSale,
//   buyNFTFromSale,
// } from "@/common/connection-service";
import { ethers } from "ethers";
// 支付币种选项 - 只支持ETH
const currencyOptions = [{ value: "ETH", label: "currency.eth" }];

export default function NFTDetailPage() {
  const { t } = useLocale();
  const { toast, confirm } = useFeedback();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const fromList = searchParams.get("fromList");

  const [valueId, setValueId] = useState<ValueID | null>(null);
  // const [user, setUser] = useState<User | null>(null);
  const [userAddress, setUserAddress] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      // 检查是否从列表页面跳转过来，如果是，优先使用 sessionStorage 中的数据
      if (fromList === "true") {
        const storageKey = `nft_data_${id}`;
        const cachedData =
          typeof window !== "undefined"
            ? sessionStorage.getItem(storageKey)
            : null;

        if (cachedData) {
          try {
            const parsedData = JSON.parse(cachedData);
            console.log("🚀 使用缓存的NFT数据:", parsedData);
            setValueId(parsedData);

            // 使用完后清理缓存
            if (typeof window !== "undefined") {
              sessionStorage.removeItem(storageKey);
            }
            return;
          } catch (error) {
            console.error("🚀 解析缓存数据失败:", error);
          }
        }
      }

      // 如果没有缓存数据或不是从列表跳转，则请求接口
      // try {
      //   console.log("🚀 从接口获取NFT数据...");
      //   const response = await apiService.getValueIDDetail(id);
      //   console.log("🚀 接口返回数据:", response);
      //   setValueId(response);
      // } catch (error) {
      //   console.error("🚀 获取NFT详情失败:", error);
      // }
    };
    loadData();
  }, [id, fromList]);

  useEffect(() => {
    const loadData = async () => {
      // const response = await apiService.getUserProfile(1);
      // setUser(response);
      // console.log(response);
      if (typeof window !== "undefined") {
        const { connectOnce } = await import("@/common/connection-service");
        const { address } = await connectOnce();
        setUserAddress(address);
        setSellAddress(address); // 设置收款地址为当前用户钱包地址
      }
    };
    loadData();
  }, []);

  const [activeTab, setActiveTab] = useState<"details" | "attributes">(
    "details"
  );

  // 检查ID是否属于当前用户
  const isOwnedByUser =
    valueId &&
    userAddress &&
    (valueId.owner.id.toString().toLowerCase() === userAddress.toLowerCase() ||
      valueId.owner.username.toLowerCase() === userAddress.toLowerCase());
  console.log("🚀 ~ NFTDetailPage ~ isOwnedByUser:", isOwnedByUser, id);

  // 检查是否是租赁的ID
  // const isRentedByUser = user?.rentedValueIDs?.some(
  //   (item) => item.id.toString() === id.toString()
  // );
  const isRentedByUser = false;

  // // 检查ID是否已收藏
  const [isFavorite, setIsFavorite] = useState(
    false
    // user?.favorites?.some((item) => item.id.toString() === id.toString())
  );

  // 处理收藏/取消收藏
  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
    // 在实际应用中，这里应该调用API来更新用户的收藏列表
    // 这里仅做前端状态更新
    if (!isFavorite) {
      toast.success(t("nft.addedToFavorites"));
    } else {
      toast.info(t("nft.removedFromFavorites"));
    }
  };

  // 出售弹框状态
  const [sellModalOpen, setSellModalOpen] = useState(false);
  const [sellPrice, setSellPrice] = useState("");
  const [sellCurrency, setSellCurrency] = useState("ETH");
  const [sellAddress, setSellAddress] = useState("");

  // 出租弹框状态
  const [rentModalOpen, setRentModalOpen] = useState(false);
  const [rentPrice, setRentPrice] = useState("");
  const [rentDeposit, setRentDeposit] = useState("");
  const [rentDuration, setRentDuration] = useState("");
  const [rentCurrency, setRentCurrency] = useState("ETH");
  const [rentAddress, setRentAddress] = useState("");

  // 处理出售表单提交
  const handleSellSubmit = async () => {
    if (!sellPrice || parseFloat(sellPrice) <= 0) {
      toast.error("错误", "请输入有效的价格");
      return;
    }

    if (!sellAddress) {
      toast.error("错误", "收款地址不能为空");
      return;
    }

    const confirmed = await confirm({
      title: "确认出售",
      message: `确认以 ${sellPrice} ETH 的价格出售此NFT吗？`,
      type: "info",
      confirmText: "确认出售",
      cancelText: "取消",
    });

    if (confirmed && valueId) {
      try {
        // NFTSale合约使用ETH支付，将价格转换为wei
        const priceInWei = ethers.utils.parseEther(sellPrice);

        console.log("🚀 调用NFTSale合约挂售");
        console.log("🚀 参数:", {
          tokenId: valueId.tokenId,
          priceInEth: sellPrice,
          priceInWei: priceInWei.toString(),
        });

        // 调用NFTSale合约的listForSale方法
        if (typeof window === "undefined") {
          throw new Error("客户端环境不可用");
        }

        const { listNFTForSale } = await import("@/common/connection-service");
        const txHash = await listNFTForSale(
          valueId.tokenId,
          sellPrice // 直接传入ETH价格字符串
        );

        console.log("🚀 挂售交易哈希:", txHash);

        // 更新NFT状态为出售中
        setValueId({
          ...valueId,
          isForSale: true,
          price: parseFloat(sellPrice),
          paymentCurrency: "ETH",
          paymentAddress: sellAddress,
        });

        setSellModalOpen(false);
      } catch (error) {
        console.error("🚀 挂售失败:", error);
        // 错误已经在listForSale函数中处理了
      }
    }
  };

  // 处理出租表单提交
  const handleRentSubmit = async () => {
    const confirmed = await confirm({
      title: "确认出租",
      message: `确认以 ${rentPrice} ${rentCurrency}/天的价格出租此NFT ${rentDuration}天吗？`,
      type: "info",
      confirmText: "确认出租",
      cancelText: "取消",
    });

    if (confirmed) {
      toast.success(
        "出租成功",
        t("rent.success", {
          price: rentPrice,
          currency: rentCurrency,
          deposit: rentDeposit,
          duration: rentDuration,
          address: rentAddress as string,
        })
      );
      setRentModalOpen(false);
      // 更新NFT状态为出租中
      if (valueId) {
        setValueId({
          ...valueId,
          isForRent: true,
          rentalPrice: parseFloat(rentPrice),
        });
      }
    }
  };

  // 处理取消出售
  const handleCancelSale = async () => {
    const confirmed = await confirm({
      title: t("nft.cancelSale"),
      message: "确认要取消出售此NFT吗？",
      type: "warning",
      confirmText: "确认取消",
      cancelText: "返回",
    });

    if (confirmed && valueId) {
      try {
        console.log("🚀 调用取消挂售合约");
        console.log("🚀 参数:", { tokenId: valueId.tokenId });

        // 调用NFTSale合约的cancelSale方法
        if (typeof window === "undefined") {
          throw new Error("客户端环境不可用");
        }

        const { cancelNFTSale } = await import("@/common/connection-service");
        const txHash = await cancelNFTSale(valueId.tokenId);

        console.log("🚀 取消挂售交易哈希:", txHash);

        // 更新NFT状态为非出售
        setValueId({
          ...valueId,
          isForSale: false,
          price: 0,
          paymentCurrency: "",
          paymentAddress: "",
        });
      } catch (error) {
        console.error("🚀 取消挂售失败:", error);
        // 错误已经在cancelSale函数中处理了
      }
    }
  };

  // 处理取消出租
  const handleCancelRent = async () => {
    const confirmed = await confirm({
      title: t("nft.cancelRent"),
      message: "确认要取消出租此NFT吗？",
      type: "warning",
      confirmText: "确认取消",
      cancelText: "返回",
    });

    if (confirmed) {
      toast.success("已取消出租");
      // 更新NFT状态为非出租
      if (valueId) {
        setValueId({ ...valueId, isForRent: false, rentalPrice: 0 });
      }
    }
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
              {React.createElement(
                FaArrowLeft as React.ComponentType<{
                  size?: number;
                  style?: React.CSSProperties;
                }>
              )}
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
              {React.createElement(
                FaArrowLeft as React.ComponentType<{
                  size?: number;
                  style?: React.CSSProperties;
                }>
              )}
            </button>
            <button
              className="w-[40px] h-[40px] rounded-[9999px] bg-[rgba(0,0,0,0.5)] text-[#ffffff] flex items-center justify-center"
              onClick={handleToggleFavorite}
            >
              {isFavorite
                ? React.createElement(
                    FaHeart as React.ComponentType<{ className?: string }>,
                    { className: "text-[#ff4d4f]" }
                  )
                : React.createElement(
                    FaRegHeart as React.ComponentType<{
                      size?: number;
                      style?: React.CSSProperties;
                    }>
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
                    ? `${valueId.rentalPrice.toFixed(2)}`
                    : `${valueId.price.toFixed(2)}`}
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
                      {valueId.owner.username}
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
                      {attr.traitType}
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
            // 用户自己的NFT
            <>
              {/* 出售按钮逻辑 */}
              {!valueId.isForSale ? (
                // 如果当前NFT不是出售状态，显示出售按钮
                <Button
                  variant="primary"
                  fullWidth
                  onClick={() => setSellModalOpen(true)}
                >
                  {t("nft.sellNow")}
                </Button>
              ) : (
                // 如果当前NFT是出售状态，显示取消出售按钮
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={handleCancelSale}
                >
                  {t("nft.cancelSale")}
                </Button>
              )}

              {/* 出租按钮逻辑 */}
              {!valueId.isForRent ? (
                // 如果当前NFT不是出租状态，显示出租按钮
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => setRentModalOpen(true)}
                >
                  {t("nft.rentOut")}
                </Button>
              ) : (
                // 如果当前NFT是出租状态，显示取消出租按钮
                <Button variant="outline" fullWidth onClick={handleCancelRent}>
                  {t("nft.cancelRent")}
                </Button>
              )}
            </>
          ) : isRentedByUser ? (
            // 用户租赁的NFT，显示归还按钮
            <Button
              variant="primary"
              fullWidth
              onClick={async () => {
                const confirmed = await confirm({
                  title: t("nft.returnRental"),
                  message: "确认要归还此租赁的NFT吗？",
                  type: "info",
                  confirmText: "确认归还",
                  cancelText: "取消",
                });
                if (confirmed) {
                  toast.success("归还成功", t("nft.returnRental"));
                }
              }}
            >
              {t("nft.returnRental")}
            </Button>
          ) : (
            // 不是用户自己的NFT
            <>
              {/* 根据页面来源判断显示的按钮 */}
              {fromList === "true" ? (
                // 从列表页跳转过来，根据页面类型显示按钮
                <>
                  {/* 从首页（Value ID页面）跳转，表示是出售状态 */}
                  {valueId.isForSale && (
                    <Button
                      variant="primary"
                      fullWidth
                      onClick={async () => {
                        const confirmed = await confirm({
                          title: t("nft.buyNow"),
                          message: `确认购买此NFT吗？价格：${valueId.price.toFixed(
                            2
                          )} ETH`,
                          type: "info",
                          confirmText: "确认购买",
                          cancelText: "取消",
                        });
                        if (confirmed) {
                          try {
                            console.log("🚀 调用购买合约");
                            console.log("🚀 参数:", {
                              tokenId: valueId.tokenId,
                            });

                            // 调用合约的buy方法
                            if (typeof window === "undefined") {
                              throw new Error("客户端环境不可用");
                            }

                            const { buyNFTFromSale } = await import(
                              "@/common/connection-service"
                            );
                            const txHash = await buyNFTFromSale(
                              valueId.tokenId
                            );

                            console.log("🚀 购买交易哈希:", txHash);

                            // 购买成功后，NFT应该不再处于出售状态
                            // 注意：实际的NFT所有权转移需要从区块链获取最新状态
                            setValueId({
                              ...valueId,
                              isForSale: false,
                              price: 0,
                            });
                          } catch (error) {
                            console.error("🚀 购买失败:", error);
                            // 错误已经在buyNFT函数中处理了
                          }
                        }
                      }}
                    >
                      {t("nft.buyNow")}
                    </Button>
                  )}

                  {/* 从租赁页面跳转，表示是出租状态 */}
                  {valueId.isForRent && (
                    <Button
                      variant="primary"
                      fullWidth
                      onClick={async () => {
                        const confirmed = await confirm({
                          title: t("nft.rentNow"),
                          message: `确认租赁此NFT吗？租金：${(
                            valueId.rentalPrice || 0
                          ).toFixed(2)} ETH/天`,
                          type: "info",
                          confirmText: "确认租赁",
                          cancelText: "取消",
                        });
                        if (confirmed) {
                          toast.success("租赁成功", t("nft.rentNow"));
                        }
                      }}
                    >
                      {t("nft.rentNow")}
                    </Button>
                  )}
                </>
              ) : (
                // 直接访问详情页，显示所有可用的操作按钮
                <>
                  {valueId.isForSale && (
                    <Button
                      variant="primary"
                      fullWidth
                      onClick={async () => {
                        const confirmed = await confirm({
                          title: t("nft.buyNow"),
                          message: `确认购买此NFT吗？价格：${valueId.price.toFixed(
                            2
                          )} ETH`,
                          type: "info",
                          confirmText: "确认购买",
                          cancelText: "取消",
                        });
                        if (confirmed) {
                          try {
                            console.log("🚀 调用购买合约");
                            console.log("🚀 参数:", {
                              tokenId: valueId.tokenId,
                            });

                            // 调用合约的buy方法
                            if (typeof window === "undefined") {
                              throw new Error("客户端环境不可用");
                            }

                            const { buyNFTFromSale } = await import(
                              "@/common/connection-service"
                            );
                            const txHash = await buyNFTFromSale(
                              valueId.tokenId
                            );

                            console.log("🚀 购买交易哈希:", txHash);

                            // 购买成功后，NFT应该不再处于出售状态
                            // 注意：实际的NFT所有权转移需要从区块链获取最新状态
                            setValueId({
                              ...valueId,
                              isForSale: false,
                              price: 0,
                            });
                          } catch (error) {
                            console.error("🚀 购买失败:", error);
                            // 错误已经在buyNFT函数中处理了
                          }
                        }
                      }}
                    >
                      {t("nft.buyNow")}
                    </Button>
                  )}
                  {valueId.isForRent && (
                    <Button
                      variant="outline"
                      fullWidth
                      onClick={async () => {
                        const confirmed = await confirm({
                          title: t("nft.rentNow"),
                          message: `确认租赁此NFT吗？租金：${(
                            valueId.rentalPrice || 0
                          ).toFixed(2)} ETH/天`,
                          type: "info",
                          confirmText: "确认租赁",
                          cancelText: "取消",
                        });
                        if (confirmed) {
                          toast.success("租赁成功", t("nft.rentNow"));
                        }
                      }}
                    >
                      {t("nft.rentNow")}
                    </Button>
                  )}
                </>
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
                readOnly
                disabled
                style={{
                  backgroundColor: "var(--disabled-background, #f5f5f5)",
                  color: "var(--disabled-color, #888)",
                }}
                placeholder="钱包地址加载中..."
              />
              <div className="text-xs text-gray-500 mt-1">
                收款地址为您当前连接的钱包地址
              </div>
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
