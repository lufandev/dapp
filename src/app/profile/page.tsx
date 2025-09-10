"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import MobileLayout from "@/components/layout/MobileLayout";
import Card from "@/components/ui/Card";
import RegisterIDModal from "@/components/ui/RegisterIDModal";
import ContractAdmin from "@/components/ui/ContractAdmin";
import { mockUser } from "@/data/mockData";
import {
  FaWallet,
  FaQrcode,
  FaShieldAlt,
  FaLanguage,
  FaMoon,
  FaSun,
  FaChevronLeft,
  FaChevronRight,
  FaShoppingBag,
  FaExchangeAlt,
  FaShoppingCart,
  FaHandshake,
} from "react-icons/fa";
import { useLocale } from "@/components/LocaleProvider";
import { useTheme } from "@/components/ThemeProvider";

// 轮播图数据
const bannerImages = [
  {
    id: 1,
    src: "/images/image.png",
    alt: "Value ID Banner",
    link: "/nft/1",
  },
];

export default function ProfilePage() {
  const router = useRouter();
  const { t, locale, setLocale } = useLocale();
  const { theme, toggleTheme } = useTheme();

  // 模态框状态
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  // 轮播图状态
  const [currentBanner, setCurrentBanner] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  // 自动轮播
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % bannerImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // 处理轮播图滑动
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 50) {
      // 向左滑动
      setCurrentBanner((prev) => (prev + 1) % bannerImages.length);
    }

    if (touchStart - touchEnd < -50) {
      // 向右滑动
      setCurrentBanner((prev) =>
        prev === 0 ? bannerImages.length - 1 : prev - 1
      );
    }
  };

  // 切换到下一张图片
  const nextBanner = () => {
    setCurrentBanner((prev) => (prev + 1) % bannerImages.length);
  };

  // 切换到上一张图片
  const prevBanner = () => {
    setCurrentBanner((prev) =>
      prev === 0 ? bannerImages.length - 1 : prev - 1
    );
  };

  // 点击指示器切换图片
  const goToBanner = (index: number) => {
    setCurrentBanner(index);
  };

  const handleLanguageChange = () => {
    // 切换语言
    const newLocale = locale === "en" ? "zh" : "en";
    setLocale(newLocale);
  };

  const handleThemeChange = () => {
    // 切换主题
    toggleTheme();
  };

  const menuItems = [
    {
      icon: React.createElement(
        FaQrcode as React.ComponentType<{ style?: React.CSSProperties }>,
        { style: { color: "var(--primary-color)" } }
      ),
      title: t("profile.registerID"),
      onClick: () => setIsRegisterModalOpen(true),
    },
    {
      icon: React.createElement(
        FaWallet as React.ComponentType<{ style?: React.CSSProperties }>,
        { style: { color: "var(--primary-color)" } }
      ),
      title: t("profile.walletBalance"),
      extra: "5,836.00 USDT",
      onClick: () => router.push("/finance"),
    },
    {
      icon: React.createElement(
        FaShieldAlt as React.ComponentType<{ style?: React.CSSProperties }>,
        { style: { color: "var(--primary-color)" } }
      ),
      title: t("profile.platformAuth"),
      onClick: () => alert(t("profile.platformAuth")),
    },
    {
      icon: React.createElement(
        FaShoppingBag as React.ComponentType<{ style?: React.CSSProperties }>,
        { style: { color: "var(--primary-color)" } }
      ),
      title: t("profile.sellOrders"),
      onClick: () => router.push("/orders/sell"),
    },
    {
      icon: React.createElement(
        FaExchangeAlt as React.ComponentType<{ style?: React.CSSProperties }>,
        { style: { color: "var(--primary-color)" } }
      ),
      title: t("profile.rentalOrders"),
      onClick: () => router.push("/orders/rental"),
    },
    {
      icon: React.createElement(
        FaShoppingCart as React.ComponentType<{ style?: React.CSSProperties }>,
        { style: { color: "var(--primary-color)" } }
      ),
      title: t("profile.buyOrders"),
      onClick: () => router.push("/orders/buy"),
    },
    {
      icon: React.createElement(
        FaHandshake as React.ComponentType<{ style?: React.CSSProperties }>,
        { style: { color: "var(--primary-color)" } }
      ),
      title: t("profile.leaseOrders"),
      onClick: () => router.push("/orders/lease"),
    },
    {
      icon: React.createElement(
        FaLanguage as React.ComponentType<{ style?: React.CSSProperties }>,
        { style: { color: "var(--primary-color)" } }
      ),
      title: t("profile.language"),
      onClick: handleLanguageChange,
      extra: locale === "en" ? t("language.english") : t("language.chinese"),
    },
    {
      icon:
        theme === "light"
          ? React.createElement(
              FaMoon as React.ComponentType<{ style?: React.CSSProperties }>,
              { style: { color: "var(--primary-color)" } }
            )
          : React.createElement(
              FaSun as React.ComponentType<{ style?: React.CSSProperties }>,
              { style: { color: "var(--primary-color)" } }
            ),
      title: t("profile.theme"),
      onClick: handleThemeChange,
      extra: theme === "light" ? t("theme.light") : t("theme.dark"),
    },
    // 如果需要添加更多菜单项，可以取消下面的注释
    // {
    //   icon: <FaInfoCircle className="text-[#8b5cf6]" />,
    //   title: t('profile.aboutUs'),
    //   onClick: () => alert(t('profile.aboutUs')),
    // },
    // {
    //   icon: <FaQuestionCircle className="text-[#8b5cf6]" />,
    //   title: t('profile.helpCenter'),
    //   onClick: () => alert(t('profile.helpCenter')),
    // },
    // {
    //   icon: <FaCog className="text-[#8b5cf6]" />,
    //   title: t('profile.settings'),
    //   onClick: () => alert(t('profile.settings')),
    // },
  ];

  return (
    <MobileLayout>
      <div className="p-[16px] pb-[100px]">
        {/* 合约管理功能 */}
        <ContractAdmin />

        <div className="mb-[24px]">
          <Card
            className="p-[20px]"
            style={{ backgroundColor: "var(--card-background)" }}
          >
            <div className="flex items-center">
              <div className="relative w-[64px] h-[64px] rounded-[9999px] overflow-hidden mr-[16px]">
                <Image
                  src={mockUser.avatar}
                  alt={mockUser.username}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h2
                  className="text-[1.125rem] font-[700]"
                  style={{ color: "var(--foreground)" }}
                >
                  {mockUser.username}
                </h2>

                <p
                  className="text-[0.75rem] mt-[4px]"
                  style={{ color: "var(--tab-inactive-color)" }}
                >
                  钱包地址:{mockUser.address}
                </p>
                <p
                  className="text-[0.75rem] mt-[4px]"
                  style={{ color: "var(--tab-inactive-color)" }}
                >
                  余额:{mockUser.balance}
                </p>
              </div>
            </div>
          </Card>
        </div>

        <div className="mb-[24px]">
          <Card
            className="p-0 overflow-hidden"
            style={{ backgroundColor: "var(--card-background)" }}
          >
            <div
              className="grid grid-cols-3"
              style={{
                borderWidth: "0 0 0 0",
                borderStyle: "solid",
                borderColor: "var(--border-color)",
              }}
            >
              <div
                className="p-[16px] text-center cursor-pointer"
                style={{
                  borderWidth: "0 1px 0 0",
                  borderStyle: "solid",
                  borderColor: "var(--border-color)",
                }}
                onClick={() => router.push("/inventory")}
              >
                <div
                  className="text-[1.125rem] font-[700]"
                  style={{ color: "var(--primary-color)" }}
                >
                  {mockUser.ownedValueIDs?.length || 0}
                </div>
                <div
                  className="text-[0.75rem] mt-[4px]"
                  style={{ color: "var(--tab-inactive-color)" }}
                >
                  {t("profile.owned")}
                </div>
              </div>
              <div
                className="p-[16px] text-center cursor-pointer"
                style={{
                  borderWidth: "0 1px 0 0",
                  borderStyle: "solid",
                  borderColor: "var(--border-color)",
                }}
                onClick={() => router.push("/inventory?tab=1")}
              >
                <div
                  className="text-[1.125rem] font-[700]"
                  style={{ color: "var(--primary-color)" }}
                >
                  {mockUser.rentedValueIDs?.length || 0}
                </div>
                <div
                  className="text-[0.75rem] mt-[4px]"
                  style={{ color: "var(--tab-inactive-color)" }}
                >
                  {t("profile.rented")}
                </div>
              </div>
              <div
                className="p-[16px] text-center cursor-pointer"
                onClick={() => router.push("/inventory?tab=2")}
              >
                <div
                  className="text-[1.125rem] font-[700]"
                  style={{ color: "var(--primary-color)" }}
                >
                  {mockUser.favorites?.length || 0}
                </div>
                <div
                  className="text-[0.75rem] mt-[4px]"
                  style={{ color: "var(--tab-inactive-color)" }}
                >
                  {t("profile.favorites")}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* 轮播图 */}
        <div className="mb-[24px]">
          <div
            className="relative w-full h-[180px] rounded-[0.75rem] overflow-hidden"
            style={{
              boxShadow: "0 2px 4px var(--card-shadow)",
              borderWidth: "1px",
              borderStyle: "solid",
              borderColor: "var(--border-color)",
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {bannerImages.map((banner, index) => (
              <div
                key={banner.id}
                className={`absolute top-0 left-0 w-full h-full transition-opacity duration-500 ${
                  index === currentBanner
                    ? "opacity-100"
                    : "opacity-0 pointer-events-none"
                }`}
                onClick={() => router.push(banner.link)}
              >
                <Image
                  src={banner.src}
                  alt={banner.alt}
                  fill
                  className="object-cover"
                />
              </div>
            ))}

            {/* 左右箭头 */}
            <button
              className="absolute left-[10px] top-1/2 transform -translate-y-1/2 w-[30px] h-[30px] rounded-full bg-[rgba(0,0,0,0.3)] text-white flex items-center justify-center z-10"
              onClick={(e) => {
                e.stopPropagation();
                prevBanner();
              }}
            >
              {React.createElement(
                FaChevronLeft as React.ComponentType<{
                  size?: number;
                  style?: React.CSSProperties;
                }>,
                { size: 14 }
              )}
            </button>

            <button
              className="absolute right-[10px] top-1/2 transform -translate-y-1/2 w-[30px] h-[30px] rounded-full bg-[rgba(0,0,0,0.3)] text-white flex items-center justify-center z-10"
              onClick={(e) => {
                e.stopPropagation();
                nextBanner();
              }}
            >
              {React.createElement(
                FaChevronRight as React.ComponentType<{
                  size?: number;
                  style?: React.CSSProperties;
                }>,
                { size: 14 }
              )}
            </button>

            {/* 指示器 */}
            <div className="absolute bottom-[10px] left-0 right-0 flex justify-center gap-[8px] z-10">
              {bannerImages.map((_, index) => (
                <button
                  key={index}
                  className={`w-[8px] h-[8px] rounded-full ${
                    index === currentBanner
                      ? "bg-white"
                      : "bg-[rgba(255,255,255,0.5)]"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    goToBanner(index);
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        <div>
          <Card
            className="p-0 overflow-hidden"
            style={{ backgroundColor: "var(--card-background)" }}
          >
            <div
              style={{
                borderWidth: "0 0 0 0",
                borderStyle: "solid",
                borderColor: "var(--border-color)",
              }}
            >
              {menuItems.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center p-[16px] cursor-pointer"
                  style={{
                    borderWidth:
                      index < menuItems.length - 1 ? "0 0 1px 0" : "0",
                    borderStyle: "solid",
                    borderColor: "var(--border-color)",
                  }}
                  onClick={item.onClick}
                >
                  <div className="w-[24px] h-[24px] flex items-center justify-center mr-[12px]">
                    {item.icon}
                  </div>
                  <div
                    className="flex-1"
                    style={{ color: "var(--foreground)" }}
                  >
                    {item.title}
                  </div>
                  <div style={{ color: "var(--tab-inactive-color)" }}>
                    {item.extra ? (
                      <span
                        className="mr-2"
                        style={{ color: "var(--tab-inactive-color)" }}
                      >
                        {item.extra}
                      </span>
                    ) : null}
                    ›
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* 注册ID模态框 */}
      <RegisterIDModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
      />
    </MobileLayout>
  );
}
