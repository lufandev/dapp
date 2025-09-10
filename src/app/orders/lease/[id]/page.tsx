"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import MobileLayout from "@/components/layout/MobileLayout";
import Card from "@/components/ui/Card";
import { useLocale } from "@/components/LocaleProvider";
import { FaArrowLeft } from "react-icons/fa";
import Button from "@/components/ui/Button";

// 我的租赁订单详情数据
const getLeaseOrderData = (id: string) => {
  // 根据订单ID返回对应的订单数据
  const orders: {
    [key: string]: {
      id: string;
      valueId: string;
      imageUrl: string;
      name: string;
      rentalPrice: number;
      deposit: number;
      duration: number;
      currency: string;
      status: string;
      createTime: string;
      startDate: string | null;
      endDate: string | null;
      owner: string;
      txHash: string;
      canWithdraw?: boolean;
    };
  } = {
    lo1: {
      id: "lo1",
      valueId: "1",
      imageUrl: "/images/nft1.jpg",
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
      txHash: "0xabcd...ef01",
    },
    lo2: {
      id: "lo2",
      valueId: "3",
      imageUrl: "/images/nft2.jpg",
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
      txHash: "0xbcde...fg12",
    },
    lo3: {
      id: "lo3",
      valueId: "5",
      imageUrl: "/images/nft3.jpg",
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
      txHash: "0xcdef...gh23",
    },
    lo4: {
      id: "lo4",
      valueId: "7",
      imageUrl: "/images/nft4.jpg",
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
      txHash: "0xdefg...hi34",
      canWithdraw: true, // 可以提取押金
    },
  };

  return orders[id] || orders.lo1; // 如果找不到对应的订单，返回默认订单
};

export default function LeaseOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { locale } = useLocale();
  const resolvedParams = React.use(params);
  const orderData = getLeaseOrderData(resolvedParams.id);

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
    title: locale === "en" ? "Lease Order Details" : "租赁订单详情",
    orderId: locale === "en" ? "Order ID" : "订单ID",
    productId: locale === "en" ? "Product ID" : "产品ID",
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
    viewProduct: locale === "en" ? "View Product" : "查看产品",
    days: locale === "en" ? "days" : "天",
    perDay: locale === "en" ? "/day" : "/天",
    withdraw: locale === "en" ? "Withdraw Deposit" : "提取押金",
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
                className="text-[0.875rem] font-[600]"
                style={{ color: "var(--primary-color)" }}
              >
                {texts.deposit}: {orderData.deposit.toFixed(2)}{" "}
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
                {texts.duration}:
              </span>
              <span style={{ color: "var(--foreground)" }}>
                {orderData.duration} {texts.days}
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
                {texts.totalAmount}:
              </span>
              <span style={{ color: "var(--primary-color)" }}>
                {totalAmount.toFixed(2)} {orderData.currency}
              </span>
            </div>
            <div className="flex justify-between py-[8px]">
              <span style={{ color: "var(--tab-inactive-color)" }}>
                {texts.txHash}:
              </span>
              <span style={{ color: "var(--foreground)" }}>
                {orderData.txHash}
              </span>
            </div>
          </div>

          <div className="flex gap-[8px] mt-[16px]">
            {orderData.status === "expired" && orderData.canWithdraw ? (
              <>
                <Button
                  variant="primary"
                  fullWidth
                  onClick={() => {
                    alert(
                      locale === "en"
                        ? "Deposit withdrawn successfully"
                        : "押金提取成功"
                    );
                  }}
                >
                  {texts.withdraw}
                </Button>
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => router.push(`/nft/${orderData.valueId}`)}
                >
                  {texts.viewProduct}
                </Button>
              </>
            ) : (
              <Button
                variant="primary"
                fullWidth
                onClick={() => router.push(`/nft/${orderData.valueId}`)}
              >
                {texts.viewProduct}
              </Button>
            )}
          </div>
        </Card>
      </div>
    </MobileLayout>
  );
}
