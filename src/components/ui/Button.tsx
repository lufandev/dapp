import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "text";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  fullWidth = false,
  children,
  className = "",
  ...props
}) => {
  const baseClasses =
    "rounded-[0.75rem] font-[600] transition-all focus:outline-none shadow-sm";

  const variantClasses = {
    primary: "text-[#ffffff] active:opacity-[0.8]",
    secondary: "text-[#ffffff] active:opacity-[0.8]",
    outline: "bg-transparent border-2 active:bg-[rgba(139,92,246,0.1)]",
    text: "bg-transparent hover:bg-[rgba(139,92,246,0.1)]",
  };

  const sizeClasses = {
    sm: "text-[0.875rem] py-[8px] px-[16px]",
    md: "text-[1rem] py-[12px] px-[20px]",
    lg: "text-[1.125rem] py-[16px] px-[28px]",
  };

  const widthClass = fullWidth ? "w-[100%]" : "";

  const buttonClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${className}`;

  const buttonStyle = {
    ...(variant === "primary" && {
      backgroundColor: "var(--primary-color)",
      color: "#ffffff",
    }),
    ...(variant === "secondary" && {
      backgroundColor: "var(--secondary-color)",
      color: "#ffffff",
    }),
    ...(variant === "outline" && {
      borderColor: "var(--primary-color)",
      color: "var(--primary-color)",
    }),
    ...(variant === "text" && {
      color: "var(--primary-color)",
    }),
  };

  return (
    <button className={buttonClasses} style={buttonStyle} {...props}>
      {children}
    </button>
  );
};

export default Button;
