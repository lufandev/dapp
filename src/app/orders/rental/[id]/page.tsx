"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import MobileLayout from "@/components/layout/MobileLayout";
import Card from "@/components/ui/Card";
import { useLocale } from "@/components/LocaleProvider";
import { FaArrowLeft } from "react-icons/fa";
import Button from "@/components/ui/Button";

// 假设的出租订单详情数据
const getRentalOrderData = (id: string) => {
  // 这里可以替换为从API获取数据
  return {
    id: id,
    valueId: "128",
    imageUrl: "/images/nft2.jpg",
    name: "Value ID #128",
    rentalPrice: 299.99,
    deposit: 2000,
    duration: 30,
    currency: "ETH",
    status: "active", // active, completed, canceled
    startDate: "2023-05-01T14:15:00Z",
    endDate: "2023-05-31T14:15:00Z",
    renter: "0x2468...1357",
    owner: "0xefgh...9876",
    txHash: "0xabcd...ef01",
  };
};

export default function RentalOrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const { locale } = useLocale();
  const orderData = getRentalOrderData(params.id as string);

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
    title: locale === "en" ? "Rental Order Details" : "租赁订单详情",
    orderId: locale === "en" ? "Order ID" : "订单ID",
    productId: locale === "en" ? "Product ID" : "产品ID",
    renter: locale === "en" ? "Renter" : "租户",
    owner: locale === "en" ? "Owner" : "所有者",
    startDate: locale === "en" ? "Start Date" : "开始日期",
    endDate: locale === "en" ? "End Date" : "到期日期",
    duration: locale === "en" ? "Duration" : "租期",
    orderStatus: locale === "en" ? "Order Status" : "订单状态",
    rentalPrice: locale === "en" ? "Rental Price" : "租金",
    deposit: locale === "en" ? "Deposit" : "押金",
    totalAmount: locale === "en" ? "Total Amount" : "总金额",
    txHash: locale === "en" ? "Transaction Hash" : "交易哈希",
    viewOnChain: locale === "en" ? "View on Chain" : "在链上查看",
    backToList: locale === "en" ? "Back to List" : "返回列表",
    viewProduct: locale === "en" ? "View Product" : "查看产品",
    days: locale === "en" ? "days" : "天",
    perDay: locale === "en" ? "/day" : "/天",
  };

  // 计算总金额
  const totalAmount =
    orderData.rentalPrice * orderData.duration + orderData.deposit;

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
                {texts.rentalPrice}: {orderData.rentalPrice.toFixed(2)}{" "}
                {orderData.currency}
                {texts.perDay}
              </div>
              <div
                className="text-[0.75rem] mb-[4px]"
                style={{ color: "var(--tab-inactive-color)" }}
              >
                {texts.duration}: {orderData.duration} {texts.days}
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
                {texts.renter}:
              </span>
              <span style={{ color: "var(--foreground)" }}>
                {orderData.renter}
              </span>
            </div>
            <div className="flex justify-between py-[8px]">
              <span style={{ color: "var(--tab-inactive-color)" }}>
                {texts.owner}:
              </span>
              <span style={{ color: "var(--foreground)" }}>
                {orderData.owner}
              </span>
            </div>
            <div className="flex justify-between py-[8px]">
              <span style={{ color: "var(--tab-inactive-color)" }}>
                {texts.startDate}:
              </span>
              <span style={{ color: "var(--foreground)" }}>
                {formatDate(orderData.startDate)}
              </span>
            </div>
            <div className="flex justify-between py-[8px]">
              <span style={{ color: "var(--tab-inactive-color)" }}>
                {texts.endDate}:
              </span>
              <span style={{ color: "var(--foreground)" }}>
                {formatDate(orderData.endDate)}
              </span>
            </div>
            <div className="flex justify-between py-[8px]">
              <span style={{ color: "var(--tab-inactive-color)" }}>
                {texts.deposit}:
              </span>
              <span style={{ color: "var(--foreground)" }}>
                {orderData.deposit.toFixed(2)} {orderData.currency}
              </span>
            </div>
            <div className="flex justify-between py-[8px]">
              <span style={{ color: "var(--tab-inactive-color)" }}>
                {texts.totalAmount}:
              </span>
              <span style={{ color: "var(--primary-color)" }}>
                {totalAmount.toFixed(2)} {orderData.currency}
              </span>
            </div>
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
