"use client";

import React from "react";
import { useRouter } from "next/navigation";
import MobileLayout from "@/components/layout/MobileLayout";
import Card from "@/components/ui/Card";
import { useLocale } from "@/components/LocaleProvider";
import { FaArrowLeft } from "react-icons/fa";
import Button from "@/components/ui/Button";

// 假设的出售订单数据
const sellOrders = [
  {
    id: "so1",
    valueId: "1",
    name: "Value ID #001",
    price: 1299.99,
    currency: "ETH",
    status: "pending", // pending, completed, canceled
    createTime: "2023-05-10T08:30:00Z",
  },
  {
    id: "so2",
    valueId: "3",
    name: "Value ID #128",
    price: 5999.99,
    currency: "BTC",
    status: "completed",
    createTime: "2023-04-20T14:15:00Z",
  },
  {
    id: "so3",
    valueId: "5",
    name: "Value ID #215",
    price: 499.99,
    currency: "USDT",
    status: "canceled",
    createTime: "2023-03-15T10:45:00Z",
  },
];

export default function SellOrdersPage() {
  const router = useRouter();
  const { t, locale } = useLocale();

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
    noOrders:
      locale === "en" ? "You don't have any sale records" : "您还没有出售记录",
    goToSell: locale === "en" ? "Go to Sell" : "去出售",
    cancelSale: locale === "en" ? "Cancel Sale" : "取消出售",
    viewDetails: locale === "en" ? "View Details" : "查看详情",
    orderId: locale === "en" ? "Order ID" : "订单号",
    price: locale === "en" ? "Price" : "价格",
    createTime: locale === "en" ? "Create Time" : "创建时间",
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
            {t("profile.sellOrders")}
          </h1>
        </div>

        {sellOrders.length > 0 ? (
          sellOrders.map((order) => (
            <Card
              key={order.id}
              className="mb-[16px] p-[16px] cursor-pointer"
              style={{ backgroundColor: "var(--card-background)" }}
              onClick={() => router.push(`/orders/sell/${order.id}`)}
            >
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
                className="text-[0.75rem] mb-[8px]"
                style={{ color: "var(--tab-inactive-color)" }}
              >
                {texts.orderId}: {order.id}
              </div>
              <div
                className="text-[0.875rem] font-[600] mb-[4px]"
                style={{ color: "var(--primary-color)" }}
              >
                {texts.price}: {order.price.toFixed(2)} {order.currency}
              </div>
              <div
                className="text-[0.75rem] mb-[8px]"
                style={{ color: "var(--tab-inactive-color)" }}
              >
                {texts.createTime}:{" "}
                {new Date(order.createTime).toLocaleString()}
              </div>

              {/* {order.status === "pending" && (
                <div
                  className="flex gap-[8px] mt-[8px]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    variant="outline"
                    fullWidth
                    onClick={() => alert("取消出售")}
                  >
                    {texts.cancelSale}
                  </Button>
                  <Button
                    variant="primary"
                    fullWidth
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/nft/${order.valueId}`);
                    }}
                  >
                    {texts.viewDetails}
                  </Button>
                </div>
              )} */}
            </Card>
          ))
        ) : (
          <div
            className="text-center py-[64px]"
            style={{ color: "var(--tab-inactive-color)" }}
          >
            {texts.noOrders}
            <div className="mt-[16px]">
              <Button
                variant="primary"
                onClick={() => router.push("/inventory")}
              >
                {texts.goToSell}
              </Button>
            </div>
          </div>
        )}
      </div>
    </MobileLayout>
  );
}
