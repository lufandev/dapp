"use client";

import React from "react";
import { useRouter } from "next/navigation";
import MobileLayout from "@/components/layout/MobileLayout";
import Card from "@/components/ui/Card";
import { useLocale } from "@/components/LocaleProvider";
import { FaArrowLeft, FaArrowUp, FaArrowDown } from "react-icons/fa";

// 假设的资金流水数据
const transactions = [
  {
    id: "tx1",
    type: "deposit", // deposit, withdraw, payment, refund
    amount: 1000,
    currency: "USDT",
    time: "2023-06-15T08:30:00Z",
    status: "completed", // pending, completed, failed
    description: {
      en: "Deposit",
      zh: "充值",
    },
  },
  {
    id: "tx2",
    type: "payment",
    amount: -258.99,
    currency: "USDT",
    time: "2023-06-10T14:15:00Z",
    status: "completed",
    description: {
      en: "Purchase Value ID #038",
      zh: "购买 Value ID #038",
    },
  },
  {
    id: "tx3",
    type: "withdraw",
    amount: -500,
    currency: "USDT",
    time: "2023-06-05T10:45:00Z",
    status: "completed",
    description: {
      en: "Withdraw",
      zh: "提现",
    },
  },
  {
    id: "tx4",
    type: "refund",
    amount: 258.99,
    currency: "USDT",
    time: "2023-06-01T16:20:00Z",
    status: "completed",
    description: {
      en: "Refund Value ID #025",
      zh: "退款 Value ID #025",
    },
  },
  {
    id: "tx5",
    type: "withdraw",
    amount: -300,
    currency: "USDT",
    time: "2023-05-28T09:10:00Z",
    status: "failed",
    description: {
      en: "Withdraw Failed",
      zh: "提现失败",
    },
  },
];

export default function FinanceRecordsPage() {
  const router = useRouter();
  const { locale } = useLocale();

  // 格式化金额显示
  const formatAmount = (amount: number) => {
    const prefix = amount >= 0 ? "+" : "";
    return `${prefix}${amount.toFixed(2)}`;
  };

  // 格式化日期显示
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return locale === "en"
      ? date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : date.toLocaleDateString("zh-CN", {
          year: "numeric",
          month: "numeric",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
  };

  // 本地化交易类型文本
  const transactionTypeText = (type: string) => {
    switch (type) {
      case "deposit":
        return locale === "en" ? "Deposit" : "充值";
      case "withdraw":
        return locale === "en" ? "Withdraw" : "提现";
      case "payment":
        return locale === "en" ? "Payment" : "支付";
      case "refund":
        return locale === "en" ? "Refund" : "退款";
      default:
        return type;
    }
  };

  // 交易图标
  const getTransactionIcon = (type: string, amount: number) => {
    if (amount > 0) {
      return (
        <div
          className="w-[36px] h-[36px] rounded-full flex items-center justify-center"
          style={{ backgroundColor: "rgba(52, 211, 153, 0.1)" }}
        >
          {React.createElement(FaArrowDown as React.ComponentType<{ size?: number; style?: React.CSSProperties }>, { size: 14, style: { color: "rgb(16, 185, 129)" } })}
        </div>
      );
    } else {
      return (
        <div
          className="w-[36px] h-[36px] rounded-full flex items-center justify-center"
          style={{ backgroundColor: "rgba(248, 113, 113, 0.1)" }}
        >
          {React.createElement(FaArrowUp as React.ComponentType<{ size?: number; style?: React.CSSProperties }>, { size: 14, style: { color: "rgb(239, 68, 68)" } })}
        </div>
      );
    }
  };

  // 标题文本
  const titleText = {
    title: locale === "en" ? "Transaction Records" : "资金流水",
    noRecords: locale === "en" ? "No transaction records" : "暂无交易记录",
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
            {titleText.title}
          </h1>
        </div>

        {transactions.length > 0 ? (
          <div>
            {transactions.map((transaction) => (
              <Card
                key={transaction.id}
                className="mb-[12px] p-[16px]"
                style={{ backgroundColor: "var(--card-background)" }}
              >
                <div className="flex items-center">
                  <div className="mr-[16px]">
                    {getTransactionIcon(transaction.type, transaction.amount)}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <div
                          className="text-[0.9rem] font-[600] mb-[4px]"
                          style={{ color: "var(--foreground)" }}
                        >
                          {typeof transaction.description === "object"
                            ? transaction.description[locale]
                            : transactionTypeText(transaction.type)}
                        </div>
                        <div
                          className="text-[0.75rem]"
                          style={{ color: "var(--tab-inactive-color)" }}
                        >
                          {formatDate(transaction.time)}
                        </div>
                      </div>
                      <div
                        className="text-[1rem] font-[700]"
                        style={{
                          color:
                            transaction.amount >= 0
                              ? "rgb(16, 185, 129)"
                              : "rgb(239, 68, 68)",
                        }}
                      >
                        {formatAmount(transaction.amount)}{" "}
                        {transaction.currency}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div
            className="text-center py-[64px]"
            style={{ color: "var(--tab-inactive-color)" }}
          >
            {titleText.noRecords}
          </div>
        )}
      </div>
    </MobileLayout>
  );
}
