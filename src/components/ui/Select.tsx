import React from "react";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
}

const Select: React.FC<SelectProps> = ({
  label,
  options,
  error,
  className = "",
  ...props
}) => {
  return (
    <div className="mb-[16px] relative">
      {label && (
        <label className="block text-[0.875rem] text-[#1a1a1a] dark:text-[#ffffff] font-[500] mb-[8px]">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          className={`w-[100%] bg-[#f5f5f5] dark:bg-[#333333] border border-[#e5e5e5] dark:border-[#444444] rounded-[0.75rem] px-[14px] py-[12px] text-[#1a1a1a] dark:text-[#ffffff] appearance-none focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] focus:border-[#8b5cf6] pr-[40px] ${
            error ? "border-red-500" : ""
          } ${className}`}
          {...props}
        >
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              className="py-[10px]"
            >
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute right-[14px] top-[50%] transform -translate-y-1/2 pointer-events-none">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-[#1a1a1a] dark:text-[#ffffff]"
          >
            <path d="M19 9l-7 7-7-7"></path>
          </svg>
        </div>
      </div>
      {error && <p className="mt-[6px] text-[0.75rem] text-red-500">{error}</p>}

      <style jsx>{`
        select {
          -webkit-appearance: none;
          -moz-appearance: none;
          appearance: none;
        }

        select option {
          background-color: var(--card-background);
          color: var(--foreground);
          padding: 12px;
          font-size: 14px;
        }

        /* 修复Firefox中的样式 */
        @-moz-document url-prefix() {
          select {
            text-indent: 0.01px;
            text-overflow: "";
            padding-right: 40px;
          }
        }
      `}</style>
    </div>
  );
};

export default Select;
