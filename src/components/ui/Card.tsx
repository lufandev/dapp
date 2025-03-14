import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ children, className = "", onClick }) => {
  return (
    <div
      className={`bg-[#252525] rounded-[0.75rem] shadow-[0_4px_8px_rgba(0,0,0,0.2)] p-[16px] ${
        onClick ? "cursor-pointer active:opacity-[0.8]" : ""
      } ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;
