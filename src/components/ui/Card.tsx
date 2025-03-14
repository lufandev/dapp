import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}

const Card: React.FC<CardProps> = ({
  children,
  className = "",
  onClick,
  style,
}) => {
  return (
    <div
      className={`bg-[#ffffff] dark:bg-[#252525] text-[#1a1a1a] dark:text-[#ffffff] rounded-[0.75rem] shadow-[0_4px_8px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_8px_rgba(0,0,0,0.2)] border border-[#e5e5e5] dark:border-[#333333] p-[16px] ${
        onClick ? "cursor-pointer active:opacity-[0.8]" : ""
      } ${className}`}
      onClick={onClick}
      style={style}
    >
      {children}
    </div>
  );
};

export default Card;
