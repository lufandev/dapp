"use client";

import React from "react";
import { useRouter } from "next/navigation";
import MobileLayout from "@/components/layout/MobileLayout";
import Card from "@/components/ui/Card";
import { useLocale } from "@/components/LocaleProvider";
import { FaArrowLeft } from "react-icons/fa";
import Image from "next/image";
import Button from "@/components/ui/Button";

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
    productImage: "/images/nft1.jpg",
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
    productImage: "/images/nft2.jpg",
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
    productImage: "/images/nft3.jpg",
  },
];

export default function SellOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { locale } = useLocale();
  const resolvedParams = React.use(params);

  // 查找对应订单
  const order = sellOrders.find((order) => order.id === resolvedParams.id);

  if (!order) {
    return (
      <MobileLayout showTabBar={false}>
        <div className="p-[16px]">
          <div className="flex items-center mb-[16px]">
            <button
              className="mr-[8px] text-[1.25rem]"
              onClick={() => router.back()}
            >
              {React.createElement(FaArrowLeft as React.ComponentType<{ size?: number; style?: React.CSSProperties }>)}
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
    title: locale === "en" ? "Order Details" : "订单详情",
    orderId: locale === "en" ? "Order ID" : "订单号",
    productId: locale === "en" ? "Product ID" : "商品ID",
    buyer: locale === "en" ? "Buyer" : "买家",
    orderTime: locale === "en" ? "Order Time" : "下单时间",
    orderStatus: locale === "en" ? "Order Status" : "订单状态",
    transactionAmount: locale === "en" ? "Transaction Amount" : "交易金额",
    price: locale === "en" ? "Price" : "价格",
    viewProduct: locale === "en" ? "View Product" : "查看商品",
  };

  return (
    <MobileLayout showTabBar={false}>
      <div className="p-[16px] pb-[100px]">
        <div className="flex items-center mb-[16px]">
          <button
            className="mr-[8px] text-[1.25rem]"
            onClick={() => router.back()}
          >
            {React.createElement(FaArrowLeft as React.ComponentType<{ size?: number; style?: React.CSSProperties }>)}
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
                src={order.productImage}
                alt={order.name}
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
                  {order.name}
                </h3>
                {renderStatus(order.status)}
              </div>
              <div
                className="text-[0.875rem] font-[600] mb-[4px]"
                style={{ color: "var(--primary-color)" }}
              >
                {texts.price}: {order.price.toFixed(2)} {order.currency}
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
              <span style={{ color: "var(--foreground)" }}>{order.id}</span>
            </div>
            <div className="flex justify-between py-[8px]">
              <span style={{ color: "var(--tab-inactive-color)" }}>
                {texts.productId}:
              </span>
              <span style={{ color: "var(--foreground)" }}>
                {order.valueId}
              </span>
            </div>
            <div className="flex justify-between py-[8px]">
              <span style={{ color: "var(--tab-inactive-color)" }}>
                {texts.buyer}:
              </span>
              <span style={{ color: "var(--foreground)" }}>{order.buyer}</span>
            </div>
            <div className="flex justify-between py-[8px]">
              <span style={{ color: "var(--tab-inactive-color)" }}>
                {texts.orderTime}:
              </span>
              <span style={{ color: "var(--foreground)" }}>
                {new Date(order.createTime).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between py-[8px]">
              <span style={{ color: "var(--tab-inactive-color)" }}>
                {texts.orderStatus}:
              </span>
              <div>{renderStatus(order.status)}</div>
            </div>
            <div className="flex justify-between py-[8px]">
              <span style={{ color: "var(--tab-inactive-color)" }}>
                {texts.transactionAmount}:
              </span>
              <span style={{ color: "var(--primary-color)" }}>
                {order.price.toFixed(2)} {order.currency}
              </span>
            </div>
          </div>

          <div className="flex gap-[8px] mt-[16px]">
            <Button
              variant="primary"
              fullWidth
              onClick={() => router.push(`/nft/${order.valueId}`)}
            >
              {texts.viewProduct}
            </Button>
          </div>
        </Card>
      </div>
    </MobileLayout>
  );
}
