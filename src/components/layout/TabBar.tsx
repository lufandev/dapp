"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { FaHome, FaExchangeAlt, FaWarehouse, FaUser } from "react-icons/fa";
import { useLocale } from "@/components/LocaleProvider";

const TabBar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useLocale();

  const tabs = [
    { name: t("tabbar.home"), path: "/", icon: FaHome },
    { name: t("tabbar.rental"), path: "/rental", icon: FaExchangeAlt },
    { name: t("tabbar.inventory"), path: "/inventory", icon: FaWarehouse },
    { name: t("tabbar.profile"), path: "/profile", icon: FaUser },
  ];

  const handleTabClick = (path: string) => {
    router.push(path);
  };

  return (
    <div className="ios-tab-bar" style={{ zIndex: 50 }}>
      {tabs.map((tab) => {
        const isActive = pathname === tab.path;
        const Icon = tab.icon;
        return (
          <button
            key={tab.path}
            className={`ios-tab-item ${
              isActive ? "ios-tab-item-active" : "ios-tab-item-inactive"
            }`}
            onClick={() => handleTabClick(tab.path)}
          >
            <Icon
              className={`text-[1.5rem] mb-[4px] ${
                isActive ? "text-[#8b5cf6]" : "text-[#6b7280]"
              }`}
            />
            <span className={`${isActive ? "font-[600]" : "font-[400]"}`}>
              {tab.name}
            </span>
            {isActive && (
              <div className="absolute bottom-[70px] w-[6px] h-[6px] rounded-full bg-[#8b5cf6]"></div>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default TabBar;
