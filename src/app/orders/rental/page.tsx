"use client";

import React from "react";
import { useRouter } from "next/navigation";
import MobileLayout from "@/components/layout/MobileLayout";
import Card from "@/components/ui/Card";
import { useLocale } from "@/components/LocaleProvider";
import { FaArrowLeft } from "react-icons/fa";
import Button from "@/components/ui/Button";

// 更新的出租订单数据
const rentalOrders = [
  {
    id: "ro1",
    valueId: "1",
    name: "Value ID #001",
    rentalPrice: 99.99,
    deposit: 500,
    duration: 7,
    currency: "USDT",
    status: "unpaid", // 未付款状态
    createTime: "2023-10-15T08:30:00Z",
    startDate: null,
    endDate: null,
    renter: "0x8f24...7ab2",
    productImage: "/images/image.png",
  },
  {
    id: "ro2",
    valueId: "3",
    name: "Value ID #128",
    rentalPrice: 299.99,
    deposit: 2000,
    duration: 30,
    currency: "USDT",
    status: "paid", // 已付款状态
    createTime: "2023-09-01T14:15:00Z",
    startDate: null,
    endDate: null,
    renter: "0x7e33...9cf1",
    productImage: "/images/image.png",
  },
  {
    id: "ro3",
    valueId: "5",
    name: "Value ID #215",
    rentalPrice: 49.99,
    deposit: 200,
    duration: 14,
    currency: "USDT",
    status: "active", // 进行中状态
    createTime: "2023-11-10T10:45:00Z",
    startDate: "2023-11-10T10:45:00Z",
    endDate: "2023-11-24T10:45:00Z",
    renter: "0x1a42...3d8e",
    productImage: "/images/image.png",
  },
  {
    id: "ro4",
    valueId: "7",
    name: "Value ID #376",
    rentalPrice: 159.99,
    deposit: 800,
    duration: 21,
    currency: "USDT",
    status: "expired", // 已到期状态
    createTime: "2023-08-05T12:30:00Z",
    startDate: "2023-08-05T12:30:00Z",
    endDate: "2023-08-26T12:30:00Z",
    renter: "0x3b67...2ef4",
    productImage: "/images/image.png",
    canWithdraw: true, // 可以提取租金
  },
];

export default function RentalOrdersPage() {
  const router = useRouter();
  const { t, locale } = useLocale();

  // 渲染订单状态
  const renderStatus = (status: string) => {
    let statusText = "";
    let bgColor = "";
    let textColor = "";

    switch (status) {
      case "unpaid":
        statusText = locale === "en" ? "Unpaid" : "未付款";
        bgColor = "var(--status-pending-bg)";
        textColor = "var(--status-pending-text)";
        break;
      case "paid":
        statusText = locale === "en" ? "Paid" : "已付款";
        bgColor = "var(--status-pending-bg)";
        textColor = "var(--status-pending-text)";
        break;
      case "active":
        statusText = locale === "en" ? "In Progress" : "进行中";
        bgColor = "var(--status-active-bg)";
        textColor = "var(--status-active-text)";
        break;
      case "expired":
        statusText = locale === "en" ? "Expired" : "已到期";
        bgColor = "var(--status-completed-bg)";
        textColor = "var(--status-completed-text)";
        break;
      case "canceled":
        statusText = locale === "en" ? "Canceled" : "已取消";
        bgColor = "var(--status-canceled-bg)";
        textColor = "var(--status-canceled-text)";
        break;
      default:
        return null;
    }

    return (
      <span
        className="text-xs px-2 py-1 rounded"
        style={{
          backgroundColor: bgColor,
          color: textColor,
        }}
      >
        {statusText}
      </span>
    );
  };

  // 格式化日期
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
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
    renter: locale === "en" ? "Renter" : "租户",
    createTime: locale === "en" ? "Create Time" : "创建时间",
    perDay: locale === "en" ? "/day" : "/天",
    days: locale === "en" ? "days" : "天",
    withdraw: locale === "en" ? "Withdraw Rent" : "提取租金",
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
                className="text-[0.75rem] mb-[4px]"
                style={{ color: "var(--tab-inactive-color)" }}
              >
                {texts.renter}: {order.renter}
              </div>
              <div
                className="text-[0.75rem] mb-[4px]"
                style={{ color: "var(--tab-inactive-color)" }}
              >
                {texts.createTime}: {formatDate(order.createTime)}
              </div>
              {(order.status === "active" || order.status === "expired") && (
                <div
                  className="text-[0.75rem] mb-[8px]"
                  style={{ color: "var(--tab-inactive-color)" }}
                >
                  {texts.period}: {formatDate(order.startDate)} 至{" "}
                  {formatDate(order.endDate)} ({order.duration}
                  {texts.days})
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
