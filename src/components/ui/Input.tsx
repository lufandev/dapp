import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  className = "",
  ...props
}) => {
  return (
    <div className="mb-[16px]">
      {label && (
        <label className="block text-[0.875rem] text-[#1a1a1a] dark:text-[#ffffff] font-[500] mb-[8px]">
          {label}
        </label>
      )}
      <input
        className={`w-[100%] bg-[#f5f5f5] dark:bg-[#333333] border border-[#e5e5e5] dark:border-[#444444] rounded-[0.75rem] px-[14px] py-[12px] text-[#1a1a1a] dark:text-[#ffffff] placeholder-[#888888] focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] focus:border-[#8b5cf6] ${
          error ? "border-red-500" : ""
        } ${className}`}
        {...props}
      />
      {error && <p className="mt-[6px] text-[0.75rem] text-red-500">{error}</p>}
    </div>
  );
};

export default Input;
