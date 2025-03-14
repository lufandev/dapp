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
        <label className="block text-[0.875rem] text-white font-[500] mb-[8px]">
          {label}
        </label>
      )}
      <select
        className={`w-[100%] bg-[#333333] border border-[#444444] rounded-[0.75rem] px-[14px] py-[12px] text-white appearance-none focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] focus:border-[#8b5cf6] ${
          error ? "border-red-500" : ""
        } ${className}`}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23ffffff'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 14px center",
          backgroundSize: "16px",
        }}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} className="py-[10px]">
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-[6px] text-[0.75rem] text-red-500">{error}</p>}

      <style jsx>{`
        select {
          -webkit-appearance: none;
          -moz-appearance: none;
          appearance: none;
        }

        select option {
          background-color: #333333;
          color: white;
          padding: 12px;
          font-size: 14px;
        }

        /* 修复Firefox中的样式 */
        @-moz-document url-prefix() {
          select {
            text-indent: 0.01px;
            text-overflow: "";
            padding-right: 30px;
          }
        }
      `}</style>
    </div>
  );
};

export default Select;
