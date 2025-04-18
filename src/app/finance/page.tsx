"use client";

import React from "react";
import { useRouter } from "next/navigation";
import MobileLayout from "@/components/layout/MobileLayout";
import Card from "@/components/ui/Card";
import { useLocale } from "@/components/LocaleProvider";
import { FaArrowLeft, FaMoneyBillWave, FaList } from "react-icons/fa";

export default function FinancePage() {
  const router = useRouter();
  const { t } = useLocale();

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
            {t("finance.title")}
          </h1>
        </div>

        {/* 余额卡片 */}
        <Card
          className="mb-[24px] p-[24px] text-center"
          style={{
            backgroundColor: "var(--card-background)",
            boxShadow: "0 4px 8px var(--card-shadow)",
          }}
        >
          <div
            className="text-[0.875rem] mb-[8px]"
            style={{ color: "var(--tab-inactive-color)" }}
          >
            {t("finance.balance")}
          </div>
          <div
            className="text-[2rem] font-[700]"
            style={{ color: "var(--primary-color)" }}
          >
            5,836.00 USDT
          </div>
        </Card>

        {/* 功能列表 */}
        <Card
          className="overflow-hidden"
          style={{ backgroundColor: "var(--card-background)" }}
        >
          {/* 提现 */}
          <div
            className="p-[16px] flex items-center justify-between cursor-pointer"
            style={{
              borderWidth: "0 0 1px 0",
              borderStyle: "solid",
              borderColor: "var(--border-color)",
            }}
            onClick={() => alert("提现功能即将上线")}
          >
            <div className="flex items-center">
              <div
                className="w-[36px] h-[36px] rounded-full flex items-center justify-center mr-[12px]"
                style={{ backgroundColor: "rgba(110, 231, 183, 0.1)" }}
              >
                <FaMoneyBillWave
                  size={16}
                  style={{ color: "rgb(16, 185, 129)" }}
                />
              </div>
              <div style={{ color: "var(--foreground)" }}>
                {t("finance.withdraw")}
              </div>
            </div>
            <div
              className="text-[1rem]"
              style={{ color: "var(--tab-inactive-color)" }}
            >
              &gt;
            </div>
          </div>

          {/* 资金流水 */}
          <div
            className="p-[16px] flex items-center justify-between cursor-pointer"
            onClick={() => router.push("/finance/records")}
          >
            <div className="flex items-center">
              <div
                className="w-[36px] h-[36px] rounded-full flex items-center justify-center mr-[12px]"
                style={{ backgroundColor: "rgba(96, 165, 250, 0.1)" }}
              >
                <FaList size={16} style={{ color: "rgb(59, 130, 246)" }} />
              </div>
              <div style={{ color: "var(--foreground)" }}>
                {t("finance.records")}
              </div>
            </div>
            <div
              className="text-[1rem]"
              style={{ color: "var(--tab-inactive-color)" }}
            >
              &gt;
            </div>
          </div>
        </Card>
      </div>
    </MobileLayout>
  );
}
