"use client";

import React from "react";
import { useRouter } from "next/navigation";
import MobileLayout from "@/components/layout/MobileLayout";
import Card from "@/components/ui/Card";
import { useLocale } from "@/components/LocaleProvider";
import { FaArrowLeft } from "react-icons/fa";
import Button from "@/components/ui/Button";

// 假设的出租订单数据
const rentalOrders = [
  {
    id: "ro1",
    valueId: "1",
    name: "Value ID #001",
    rentalPrice: 99.99,
    deposit: 500,
    duration: 7,
    currency: "ETH",
    status: "active", // active, completed, canceled
    startDate: "2023-06-15T08:30:00Z",
    endDate: "2023-06-22T08:30:00Z",
  },
  {
    id: "ro2",
    valueId: "3",
    name: "Value ID #128",
    rentalPrice: 299.99,
    deposit: 2000,
    duration: 30,
    currency: "BTC",
    status: "completed",
    startDate: "2023-05-01T14:15:00Z",
    endDate: "2023-05-31T14:15:00Z",
  },
  {
    id: "ro3",
    valueId: "5",
    name: "Value ID #215",
    rentalPrice: 49.99,
    deposit: 200,
    duration: 14,
    currency: "USDT",
    status: "canceled",
    startDate: "2023-04-10T10:45:00Z",
    endDate: "2023-04-24T10:45:00Z",
  },
];

export default function RentalOrdersPage() {
  const router = useRouter();
  const { t, locale } = useLocale();

  // 渲染订单状态
  const renderStatus = (status: string) => {
    let statusText = "";
    switch (status) {
      case "active":
        statusText = locale === "en" ? "Active" : "租赁中";
        return (
          <span
            className="text-xs px-2 py-1 rounded"
            style={{
              backgroundColor: "var(--status-active-bg)",
              color: "var(--status-active-text)",
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

  // 格式化日期
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // 本地化显示文本
  const texts = {
    noOrders:
      locale === "en"
        ? "You don't have any rental records"
        : "您还没有出租记录",
    goToRent: locale === "en" ? "Go to Rent" : "去出租",
    cancelRental: locale === "en" ? "Cancel Rental" : "取消出租",
    viewDetails: locale === "en" ? "View Details" : "查看详情",
    orderId: locale === "en" ? "Order ID" : "订单号",
    rentalPrice: locale === "en" ? "Rental Price" : "租金",
    deposit: locale === "en" ? "Deposit" : "押金",
    period: locale === "en" ? "Period" : "租期",
    perDay: locale === "en" ? "/day" : "/天",
    days: locale === "en" ? "days" : "天",
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
            {t("profile.rentalOrders")}
          </h1>
        </div>

        {rentalOrders.length > 0 ? (
          rentalOrders.map((order) => (
            <Card
              key={order.id}
              className="mb-[16px] p-[16px] cursor-pointer"
              style={{ backgroundColor: "var(--card-background)" }}
              onClick={() => router.push(`/orders/rental/${order.id}`)}
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
                {texts.rentalPrice}: {order.rentalPrice.toFixed(2)}{" "}
                {order.currency}
                {texts.perDay}
              </div>
              <div
                className="text-[0.75rem] mb-[4px]"
                style={{ color: "var(--tab-inactive-color)" }}
              >
                {texts.deposit}: {order.deposit.toFixed(2)} {order.currency}
              </div>
              <div
                className="text-[0.75rem] mb-[8px]"
                style={{ color: "var(--tab-inactive-color)" }}
              >
                {texts.period}: {formatDate(order.startDate)} 至{" "}
                {formatDate(order.endDate)} ({order.duration}
                {texts.days})
              </div>

              {order.status === "active" && (
                <div
                  className="flex gap-[8px] mt-[8px]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    variant="outline"
                    fullWidth
                    onClick={() => alert("取消出租")}
                  >
                    {texts.cancelRental}
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
              )}
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
                {texts.goToRent}
              </Button>
            </div>
          </div>
        )}
      </div>
    </MobileLayout>
  );
}
