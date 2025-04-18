"use client";

import React from "react";
import { useRouter } from "next/navigation";
import MobileLayout from "@/components/layout/MobileLayout";
import Card from "@/components/ui/Card";
import { useLocale } from "@/components/LocaleProvider";
import { FaArrowLeft } from "react-icons/fa";
import Button from "@/components/ui/Button";
import Image from "next/image";

// 更新的我的租赁订单数据
const leaseOrders = [
  {
    id: "lo1",
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
    owner: "0x8f24...7ab2",
    productImage: "/images/nft1.jpg",
  },
  {
    id: "lo2",
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
    owner: "0x7e33...9cf1",
    productImage: "/images/nft2.jpg",
  },
  {
    id: "lo3",
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
    owner: "0x1a42...3d8e",
    productImage: "/images/nft3.jpg",
  },
  {
    id: "lo4",
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
    owner: "0x3b67...2ef4",
    productImage: "/images/nft4.jpg",
    canWithdraw: true, // 可以提取押金
  },
];

export default function LeaseOrdersPage() {
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
        : "您还没有租赁记录",
    goToRent: locale === "en" ? "Go to Rent" : "去租赁",
    cancelLease: locale === "en" ? "Cancel Rental" : "取消租赁",
    viewDetails: locale === "en" ? "View Details" : "查看详情",
    orderId: locale === "en" ? "Order ID" : "订单号",
    rentalPrice: locale === "en" ? "Rental Price" : "租金",
    deposit: locale === "en" ? "Deposit" : "押金",
    period: locale === "en" ? "Period" : "租期",
    owner: locale === "en" ? "Owner" : "所有者",
    perDay: locale === "en" ? "/day" : "/天",
    days: locale === "en" ? "days" : "天",
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
            {t("profile.leaseOrders")}
          </h1>
        </div>

        {leaseOrders.length > 0 ? (
          leaseOrders.map((order) => (
            <Card
              key={order.id}
              className="mb-[16px] p-[16px] cursor-pointer"
              style={{ backgroundColor: "var(--card-background)" }}
              onClick={() => router.push(`/orders/lease/${order.id}`)}
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
                    {texts.rentalPrice}: {order.rentalPrice.toFixed(2)}{" "}
                    {order.currency}
                    {texts.perDay}
                  </div>
                  <div
                    className="text-[0.875rem] font-[600]"
                    style={{ color: "var(--primary-color)" }}
                  >
                    {texts.deposit}: {order.deposit.toFixed(2)} {order.currency}
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
                    {texts.owner}:
                  </span>
                  <span style={{ color: "var(--foreground)" }}>
                    {order.owner}
                  </span>
                </div>
                <div className="flex justify-between py-[8px]">
                  <span style={{ color: "var(--tab-inactive-color)" }}>
                    {texts.createTime}:
                  </span>
                  <span style={{ color: "var(--foreground)" }}>
                    {new Date(order.createTime).toLocaleString()}
                  </span>
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
              </div>
            </Card>
          ))
        ) : (
          <div
            className="text-center py-[64px]"
            style={{ color: "var(--tab-inactive-color)" }}
          >
            {texts.noOrders}
            <div className="mt-[16px]">
              <Button variant="primary" onClick={() => router.push("/rental")}>
                {texts.goToRent}
              </Button>
            </div>
          </div>
        )}
      </div>
    </MobileLayout>
  );
}
