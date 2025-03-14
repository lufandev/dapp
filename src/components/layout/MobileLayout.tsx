"use client";

import React from "react";
import TabBar from "./TabBar";

interface MobileLayoutProps {
  children: React.ReactNode;
  showTabBar?: boolean;
}

const MobileLayout: React.FC<MobileLayoutProps> = ({
  children,
  showTabBar = true,
}) => {
  return (
    <div className="ios-screen">
      <div className="ios-content">{children}</div>
      {showTabBar && <TabBar />}
    </div>
  );
};

export default MobileLayout;
