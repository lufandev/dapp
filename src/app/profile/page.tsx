"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import MobileLayout from "@/components/layout/MobileLayout";
import Card from "@/components/ui/Card";
import { mockUser } from "@/data/mockData";
import { FaWallet, FaQrcode, FaShieldAlt, FaLanguage } from "react-icons/fa";
import { useLocale } from "@/components/LocaleProvider";

export default function ProfilePage() {
  const router = useRouter();
  const { t, locale, setLocale } = useLocale();

  const handleLanguageChange = () => {
    // 切换语言
    const newLocale = locale === "en" ? "zh" : "en";
    setLocale(newLocale);
  };

  const menuItems = [
    {
      icon: <FaQrcode className="text-[#8b5cf6]" />,
      title: t("profile.registerID"),
      onClick: () => alert(t("profile.registerID")),
    },
    {
      icon: <FaWallet className="text-[#8b5cf6]" />,
      title: t("profile.walletAddress"),
      onClick: () =>
        alert(t("profile.walletAddress") + ": " + mockUser.address),
    },
    {
      icon: <FaShieldAlt className="text-[#8b5cf6]" />,
      title: t("profile.platformAuth"),
      onClick: () => alert(t("profile.platformAuth")),
    },
    {
      icon: <FaLanguage className="text-[#8b5cf6]" />,
      title: t("profile.language"),
      onClick: handleLanguageChange,
      extra: locale === "en" ? t("language.english") : t("language.chinese"),
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
          <Card className="p-[20px]">
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
                <h2 className="text-[1.125rem] font-[700]">
                  {mockUser.username}
                </h2>
                <p className="text-[0.875rem] text-[#6b7280] mt-[4px]">
                  ID: {mockUser.id}
                </p>
                <p className="text-[0.75rem] text-[#6b7280] mt-[4px]">
                  {mockUser.address}
                </p>
              </div>
            </div>
          </Card>
        </div>

        <div className="mb-[24px]">
          <Card className="p-0 overflow-hidden">
            <div className="grid grid-cols-2 divide-x divide-[#e5e5e5] dark:divide-[#333333]">
              <div
                className="p-[16px] text-center cursor-pointer active:bg-[#f3f4f6]"
                onClick={() => router.push("/inventory")}
              >
                <div className="text-[1.125rem] font-[700] text-[#8b5cf6]">
                  {mockUser.ownedNFTs.length}
                </div>
                <div className="text-[0.75rem] text-[#6b7280] mt-[4px]">
                  {t("profile.owned")}
                </div>
              </div>
              <div
                className="p-[16px] text-center cursor-pointer active:bg-[#f3f4f6]"
                onClick={() => router.push("/inventory?tab=1")}
              >
                <div className="text-[1.125rem] font-[700] text-[#8b5cf6]">
                  {mockUser.rentedNFTs.length}
                </div>
                <div className="text-[0.75rem] text-[#6b7280] mt-[4px]">
                  {t("profile.rented")}
                </div>
              </div>
              {/* <div
                className="p-[16px] text-center cursor-pointer active:bg-[#f3f4f6]"
                onClick={() => alert("收藏功能")}
              >
                <div className="text-[1.125rem] font-[700] text-[#8b5cf6]">
                  0
                </div>
                <div className="text-[0.75rem] text-[#6b7280] mt-[4px]">
                  {t('profile.favorites')}
                </div>
              </div> */}
            </div>
          </Card>
        </div>

        <div>
          <Card className="p-0 overflow-hidden">
            <div className="divide-y divide-[#e5e5e5] dark:divide-[#333333]">
              {menuItems.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center p-[16px] cursor-pointer active:bg-[#f3f4f6]"
                  onClick={item.onClick}
                >
                  <div className="w-[24px] h-[24px] flex items-center justify-center mr-[12px]">
                    {item.icon}
                  </div>
                  <div className="flex-1">{item.title}</div>
                  <div className="text-[#9ca3af]">
                    {item.extra ? (
                      <span className="mr-2 text-[#6b7280]">{item.extra}</span>
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
