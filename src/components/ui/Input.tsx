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
        <label
          className="block text-[0.875rem] font-[500] mb-[8px]"
          style={{ color: "var(--foreground)" }}
        >
          {label}
        </label>
      )}
      <input
        className={`w-[100%] rounded-[0.75rem] px-[14px] py-[12px] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] ${
          error ? "border-red-500" : ""
        } ${className}`}
        style={{
          backgroundColor: "var(--search-background)",
          color: "var(--foreground)",
          borderWidth: "1px",
          borderStyle: "solid",
          borderColor: "var(--border-color)",
        }}
        {...props}
      />
      {error && <p className="mt-[6px] text-[0.75rem] text-red-500">{error}</p>}
    </div>
  );
};

export default Input;
