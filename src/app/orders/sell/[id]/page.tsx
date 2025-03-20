"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import MobileLayout from "@/components/layout/MobileLayout";
import Card from "@/components/ui/Card";
import { useLocale } from "@/components/LocaleProvider";
import { FaArrowLeft } from "react-icons/fa";
import Button from "@/components/ui/Button";

// 假设的出售订单详情数据
const getSellOrderData = (id: string) => {
  // 这里可以替换为从API获取数据
  return {
    id: id,
    valueId: "128",
    imageUrl: "/images/nft1.jpg",
    name: "Value ID #128",
    price: 5999.99,
    currency: "ETH",
    status: "completed", // pending, completed, canceled
    createTime: "2023-04-20T14:15:00Z",
    completedTime: "2023-04-22T09:30:00Z",
    buyer: "0x1234...5678",
    seller: "0xabcd...ef01",
    txHash: "0x7890...1234",
  };
};

export default function SellOrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const { locale } = useLocale();
  const orderData = getSellOrderData(params.id as string);

  // 渲染订单状态
  const renderStatus = (status: string) => {
    let statusText = "";
    switch (status) {
      case "pending":
        statusText = locale === "en" ? "In Progress" : "进行中";
        return (
          <span
            className="text-xs px-2 py-1 rounded"
            style={{
              backgroundColor: "var(--status-pending-bg)",
              color: "var(--status-pending-text)",
            }}
          >
            {statusText}
          </span>
        );
      case "completed":
        statusText = locale === "en" ? "Completed" : "已完成";
        return (
          <span
            className="text-xs px-2 py-1 rounded"
            style={{
              backgroundColor: "var(--status-completed-bg)",
              color: "var(--status-completed-text)",
            }}
          >
            {statusText}
          </span>
        );
      case "canceled":
        statusText = locale === "en" ? "Canceled" : "已取消";
        return (
          <span
            className="text-xs px-2 py-1 rounded"
            style={{
              backgroundColor: "var(--status-canceled-bg)",
              color: "var(--status-canceled-text)",
            }}
          >
            {statusText}
          </span>
        );
      default:
        return null;
    }
  };

  // 本地化显示文本
  const texts = {
    title: locale === "en" ? "Order Details" : "订单详情",
    orderId: locale === "en" ? "Order ID" : "订单ID",
    productId: locale === "en" ? "Product ID" : "产品ID",
    buyer: locale === "en" ? "Buyer" : "买家",
    seller: locale === "en" ? "Seller" : "卖家",
    orderTime: locale === "en" ? "Order Time" : "订单时间",
    completedTime: locale === "en" ? "Completed Time" : "完成时间",
    orderStatus: locale === "en" ? "Order Status" : "订单状态",
    amount: locale === "en" ? "Transaction Amount" : "交易金额",
    txHash: locale === "en" ? "Transaction Hash" : "交易哈希",
    viewOnChain: locale === "en" ? "View on Chain" : "在链上查看",
    backToList: locale === "en" ? "Back to List" : "返回列表",
    viewProduct: locale === "en" ? "View Product" : "查看产品",
  };

  return (
    <MobileLayout showTabBar={false}>
      <div className="p-[16px] pb-[100px]">
        <div className="flex items-center mb-[16px]">
          <button
            className="mr-[8px] text-[1.25rem]"
            onClick={() => router.back()}
          >
            <FaArrowLeft />
          </button>
          <h1
            className="text-[1.25rem] font-[700]"
            style={{ color: "var(--foreground)" }}
          >
            {texts.title}
          </h1>
        </div>

        <Card
          className="mb-[16px] p-[16px]"
          style={{ backgroundColor: "var(--card-background)" }}
        >
          <div className="flex mb-[16px]">
            <div className="w-[120px] h-[120px] relative rounded-[8px] overflow-hidden mr-[16px]">
              <Image
                src={orderData.imageUrl}
                alt={orderData.name}
                fill
                style={{ objectFit: "cover" }}
              />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start mb-[8px]">
                <h3
                  className="font-[600]"
                  style={{ color: "var(--foreground)" }}
                >
                  {orderData.name}
                </h3>
                {renderStatus(orderData.status)}
              </div>
              <div
                className="text-[0.875rem] font-[600] mb-[4px]"
                style={{ color: "var(--primary-color)" }}
              >
                {texts.amount}: {orderData.price.toFixed(2)}{" "}
                {orderData.currency}
              </div>
            </div>
          </div>

          <div
            className="border-t border-solid"
            style={{ borderColor: "var(--border-color)" }}
          ></div>

          <div className="py-[8px]">
            <div className="flex justify-between py-[8px]">
              <span style={{ color: "var(--tab-inactive-color)" }}>
                {texts.orderId}:
              </span>
              <span style={{ color: "var(--foreground)" }}>{orderData.id}</span>
            </div>
            <div className="flex justify-between py-[8px]">
              <span style={{ color: "var(--tab-inactive-color)" }}>
                {texts.productId}:
              </span>
              <span style={{ color: "var(--foreground)" }}>
                {orderData.valueId}
              </span>
            </div>
            <div className="flex justify-between py-[8px]">
              <span style={{ color: "var(--tab-inactive-color)" }}>
                {texts.buyer}:
              </span>
              <span style={{ color: "var(--foreground)" }}>
                {orderData.buyer}
              </span>
            </div>
            <div className="flex justify-between py-[8px]">
              <span style={{ color: "var(--tab-inactive-color)" }}>
                {texts.seller}:
              </span>
              <span style={{ color: "var(--foreground)" }}>
                {orderData.seller}
              </span>
            </div>
            <div className="flex justify-between py-[8px]">
              <span style={{ color: "var(--tab-inactive-color)" }}>
                {texts.orderTime}:
              </span>
              <span style={{ color: "var(--foreground)" }}>
                {new Date(orderData.createTime).toLocaleString()}
              </span>
            </div>
            {orderData.status === "completed" && (
              <div className="flex justify-between py-[8px]">
                <span style={{ color: "var(--tab-inactive-color)" }}>
                  {texts.completedTime}:
                </span>
                <span style={{ color: "var(--foreground)" }}>
                  {new Date(orderData.completedTime).toLocaleString()}
                </span>
              </div>
            )}
            <div className="flex justify-between py-[8px]">
              <span style={{ color: "var(--tab-inactive-color)" }}>
                {texts.orderStatus}:
              </span>
              <div>{renderStatus(orderData.status)}</div>
            </div>
            <div className="flex justify-between py-[8px]">
              <span style={{ color: "var(--tab-inactive-color)" }}>
                {texts.txHash}:
              </span>
              <span
                style={{ color: "var(--primary-color)" }}
                className="cursor-pointer"
                onClick={() => alert("查看交易详情")}
              >
                {orderData.txHash.substring(0, 6)}...
                {orderData.txHash.substring(orderData.txHash.length - 4)}
              </span>
            </div>
          </div>

          <div className="flex gap-[8px] mt-[16px]">
            <Button variant="outline" fullWidth onClick={() => router.back()}>
              {texts.backToList}
            </Button>
            <Button
              variant="primary"
              fullWidth
              onClick={() => router.push(`/nft/${orderData.valueId}`)}
            >
              {texts.viewProduct}
            </Button>
          </div>
        </Card>
      </div>
    </MobileLayout>
  );
}
