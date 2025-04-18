"use client";

import React from "react";
import { useRouter } from "next/navigation";
import MobileLayout from "@/components/layout/MobileLayout";
import Card from "@/components/ui/Card";
import { useLocale } from "@/components/LocaleProvider";
import { FaArrowLeft } from "react-icons/fa";
import Image from "next/image";

// 假设的订单详情数据
const sellOrders = [
  {
    id: "so1",
    valueId: "1",
    name: "Value ID #001",
    price: 1299.99,
    currency: "ETH",
    status: "pending", // pending, completed, canceled
    createTime: "2023-05-10T08:30:00Z",
    buyer: "0x1a2b...3c4d",
    productImage: "/images/nft-sample-1.png",
  },
  {
    id: "so2",
    valueId: "3",
    name: "Value ID #128",
    price: 5999.99,
    currency: "BTC",
    status: "completed",
    createTime: "2023-04-20T14:15:00Z",
    buyer: "0x5e6f...7g8h",
    productImage: "/images/nft-sample-2.png",
  },
  {
    id: "so3",
    valueId: "5",
    name: "Value ID #215",
    price: 499.99,
    currency: "USDT",
    status: "canceled",
    createTime: "2023-03-15T10:45:00Z",
    buyer: "0x9i0j...1k2l",
    productImage: "/images/nft-sample-3.png",
  },
];

export default function SellOrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const { locale } = useLocale();

  // 查找对应订单
  const order = sellOrders.find((order) => order.id === params.id);

  if (!order) {
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
            <h1
              className="text-[1.25rem] font-[700]"
              style={{ color: "var(--foreground)" }}
            >
              {locale === "en" ? "Order Details" : "订单详情"}
            </h1>
          </div>
          <div
            className="text-center py-[64px]"
            style={{ color: "var(--tab-inactive-color)" }}
          >
            {locale === "en" ? "Order not found" : "订单不存在"}
          </div>
        </div>
      </MobileLayout>
    );
  }

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
    orderDetails: locale === "en" ? "Order Details" : "订单详情",
    orderId: locale === "en" ? "Order ID" : "订单号",
    buyer: locale === "en" ? "Buyer" : "买家",
    orderTime: locale === "en" ? "Order Time" : "下单时间",
    orderStatus: locale === "en" ? "Order Status" : "订单状态",
    transactionAmount: locale === "en" ? "Transaction Amount" : "交易金额",
    product: locale === "en" ? "Product (ID)" : "商品(ID)",
    viewDetails: locale === "en" ? "View Product Details" : "查看商品详情",
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
            {texts.orderDetails}
          </h1>
        </div>

        <Card
          className="p-[16px] mb-[16px]"
          style={{ backgroundColor: "var(--card-background)" }}
        >
          <div className="flex items-center justify-between mb-[12px]">
            <h2
              className="text-[1.125rem] font-[600]"
              style={{ color: "var(--foreground)" }}
            >
              {order.name}
            </h2>
            {renderStatus(order.status)}
          </div>

          <div className="grid grid-cols-1 gap-[12px]">
            <div
              className="border-b border-opacity-10"
              style={{ borderColor: "var(--border-color)" }}
            >
              <div
                className="text-[0.875rem] mb-[4px]"
                style={{ color: "var(--tab-inactive-color)" }}
              >
                {texts.orderId}
              </div>
              <div
                className="text-[0.875rem] mb-[8px]"
                style={{ color: "var(--foreground)" }}
              >
                {order.id}
              </div>
            </div>

            <div
              className="border-b border-opacity-10"
              style={{ borderColor: "var(--border-color)" }}
            >
              <div
                className="text-[0.875rem] mb-[4px]"
                style={{ color: "var(--tab-inactive-color)" }}
              >
                {texts.buyer}
              </div>
              <div
                className="text-[0.875rem] mb-[8px]"
                style={{ color: "var(--foreground)" }}
              >
                {order.buyer}
              </div>
            </div>

            <div
              className="border-b border-opacity-10"
              style={{ borderColor: "var(--border-color)" }}
            >
              <div
                className="text-[0.875rem] mb-[4px]"
                style={{ color: "var(--tab-inactive-color)" }}
              >
                {texts.orderTime}
              </div>
              <div
                className="text-[0.875rem] mb-[8px]"
                style={{ color: "var(--foreground)" }}
              >
                {new Date(order.createTime).toLocaleString()}
              </div>
            </div>

            <div
              className="border-b border-opacity-10"
              style={{ borderColor: "var(--border-color)" }}
            >
              <div
                className="text-[0.875rem] mb-[4px]"
                style={{ color: "var(--tab-inactive-color)" }}
              >
                {texts.orderStatus}
              </div>
              <div
                className="text-[0.875rem] mb-[8px]"
                style={{ color: "var(--foreground)" }}
              >
                {renderStatus(order.status)}
              </div>
            </div>

            <div
              className="border-b border-opacity-10"
              style={{ borderColor: "var(--border-color)" }}
            >
              <div
                className="text-[0.875rem] mb-[4px]"
                style={{ color: "var(--tab-inactive-color)" }}
              >
                {texts.transactionAmount}
              </div>
              <div
                className="text-[1rem] font-[600] mb-[8px]"
                style={{ color: "var(--primary-color)" }}
              >
                {order.price.toFixed(2)} {order.currency}
              </div>
            </div>

            <div>
              <div
                className="text-[0.875rem] mb-[4px]"
                style={{ color: "var(--tab-inactive-color)" }}
              >
                {texts.product}
              </div>
              <div
                className="flex items-center cursor-pointer"
                onClick={() => router.push(`/nft/${order.valueId}`)}
              >
                <div className="w-[48px] h-[48px] relative rounded-md overflow-hidden mr-[12px]">
                  <Image
                    src={order.productImage}
                    alt={order.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <div
                    className="text-[0.875rem]"
                    style={{ color: "var(--foreground)" }}
                  >
                    {order.name}
                  </div>
                  <div
                    className="text-[0.75rem]"
                    style={{ color: "var(--primary-color)" }}
                  >
                    {texts.viewDetails}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </MobileLayout>
  );
}
