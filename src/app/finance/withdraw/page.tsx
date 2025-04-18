"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import MobileLayout from "@/components/layout/MobileLayout";
import Card from "@/components/ui/Card";
import { useLocale } from "@/components/LocaleProvider";
import { FaArrowLeft, FaEthereum } from "react-icons/fa";
import Button from "@/components/ui/Button";

export default function WithdrawPage() {
  const router = useRouter();
  const { locale } = useLocale();
  const [amount, setAmount] = useState("");
  const [address, setAddress] = useState("");

  // 处理提交
  const handleSubmit = () => {
    if (!amount || !address) {
      alert(locale === "en" ? "Please fill all fields" : "请填写所有字段");
      return;
    }

    // 这里可以添加实际的提现逻辑
    alert(
      locale === "en"
        ? `Withdraw request submitted: ${amount} USDT to ${address}`
        : `提现请求已提交：${amount} USDT 到 ${address}`
    );
    router.back();
  };

  // 本地化显示文本
  const texts = {
    title: locale === "en" ? "Withdraw" : "提现",
    amount: locale === "en" ? "Amount" : "金额",
    walletAddress:
      locale === "en" ? "Wallet Address (Ethereum)" : "钱包地址（以太链）",
    availableBalance: locale === "en" ? "Available Balance" : "可用余额",
    submit: locale === "en" ? "Confirm" : "确认",
    enterAmount: locale === "en" ? "Enter amount" : "输入金额",
    enterAddress: locale === "en" ? "Enter wallet address" : "输入钱包地址",
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
          <div
            className="text-[0.875rem] mb-[8px] flex justify-between"
            style={{ color: "var(--tab-inactive-color)" }}
          >
            <div>{texts.availableBalance}</div>
            <div>5,836.00 USDT</div>
          </div>

          <div className="mb-[16px]">
            <label
              className="block text-[0.875rem] mb-[8px]"
              style={{ color: "var(--foreground)" }}
            >
              {texts.amount}
            </label>
            <div className="relative">
              <input
                type="number"
                className="w-full h-[48px] px-[16px] rounded-[8px] border"
                style={{
                  backgroundColor: "var(--card-background)",
                  color: "var(--foreground)",
                  borderColor: "var(--border-color)",
                }}
                placeholder={texts.enterAmount}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <div
                className="absolute right-[16px] top-0 h-[48px] flex items-center"
                style={{ color: "var(--tab-inactive-color)" }}
              >
                USDT
              </div>
            </div>
          </div>

          <div className="mb-[24px]">
            <label
              className="block text-[0.875rem] mb-[8px] flex items-center"
              style={{ color: "var(--foreground)" }}
            >
              <FaEthereum className="mr-[4px]" />
              {texts.walletAddress}
            </label>
            <input
              type="text"
              className="w-full h-[48px] px-[16px] rounded-[8px] border"
              style={{
                backgroundColor: "var(--card-background)",
                color: "var(--foreground)",
                borderColor: "var(--border-color)",
              }}
              placeholder={texts.enterAddress}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <Button variant="primary" fullWidth onClick={handleSubmit}>
            {texts.submit}
          </Button>
        </Card>
      </div>
    </MobileLayout>
  );
}
