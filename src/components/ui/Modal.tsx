import React, { useEffect } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="w-screen h-screen top-[0px] left-[0px] fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black bg-opacity-70"
        onClick={onClose}
      ></div>
      <div className="relative bg-[#252525] rounded-[1.25rem] w-[85%] max-w-[480px] max-h-[90vh] overflow-auto shadow-2xl">
        <div className="flex justify-center items-center p-[16px] border-b border-[#333333]">
          <h3 className="text-[1.125rem] font-[600] text-white">{title}</h3>
        </div>
        <div className="p-[20px]">{children}</div>
        {footer && (
          <div className="p-[16px] border-t border-[#333333] flex justify-center gap-[16px]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
