"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import MobileLayout from "@/components/layout/MobileLayout";
import Card from "@/components/ui/Card";
import { mockUser } from "@/data/mockData";
import {
  FaWallet,
  FaQrcode,
  FaShieldAlt,
  FaLanguage,
  FaMoon,
  FaSun,
} from "react-icons/fa";
import { useLocale } from "@/components/LocaleProvider";
import { useTheme } from "@/components/ThemeProvider";

export default function ProfilePage() {
  const router = useRouter();
  const { t, locale, setLocale } = useLocale();
  const { theme, toggleTheme } = useTheme();

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
      icon: <FaQrcode style={{ color: "var(--primary-color)" }} />,
      title: t("profile.registerID"),
      onClick: () => alert(t("profile.registerID")),
    },
    {
      icon: <FaWallet style={{ color: "var(--primary-color)" }} />,
      title: t("profile.walletAddress"),
      onClick: () =>
        alert(t("profile.walletAddress") + ": " + mockUser.address),
    },
    {
      icon: <FaShieldAlt style={{ color: "var(--primary-color)" }} />,
      title: t("profile.platformAuth"),
      onClick: () => alert(t("profile.platformAuth")),
    },
    {
      icon: <FaLanguage style={{ color: "var(--primary-color)" }} />,
      title: t("profile.language"),
      onClick: handleLanguageChange,
      extra: locale === "en" ? t("language.english") : t("language.chinese"),
    },
    {
      icon:
        theme === "light" ? (
          <FaMoon style={{ color: "var(--primary-color)" }} />
        ) : (
          <FaSun style={{ color: "var(--primary-color)" }} />
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
                  {mockUser.ownedNFTs.length}
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
                  {mockUser.rentedNFTs.length}
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
                  {mockUser.favoriteNFTs.length}
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
    </MobileLayout>
  );
}
