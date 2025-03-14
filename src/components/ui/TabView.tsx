"use client";

import React, { useState } from "react";

interface TabViewProps {
  tabs: {
    label: string;
    content: React.ReactNode;
  }[];
  defaultTab?: number;
}

const TabView: React.FC<TabViewProps> = ({ tabs, defaultTab = 0 }) => {
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <div>
      <div
        className="flex border-[#333333]"
        style={{ borderWidth: "0 0 1px 0", borderStyle: "solid" }}
      >
        {tabs.length > 0 &&
          tabs.map((tab, index) => (
            <button
              key={index}
              className={`py-[12px] px-[16px] text-[0.875rem] font-[500] ${
                activeTab === index ? "text-[#8b5cf6]" : "text-[#6b7280]"
              }`}
              style={
                activeTab === index
                  ? {
                      borderWidth: "0 0 2px 0",
                      borderStyle: "solid",
                      borderColor: "#8b5cf6",
                    }
                  : {}
              }
              onClick={() => setActiveTab(index)}
            >
              {tab.label}
            </button>
          ))}
      </div>
      <div className="py-[16px]">{tabs[activeTab].content}</div>
    </div>
  );
};

export default TabView;
