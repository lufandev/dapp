"use client"
import React, { useState, useEffect, createContext, useContext } from "react";
import { FaCheckCircle, FaExclamationCircle, FaTimesCircle, FaInfoCircle, FaTimes } from "react-icons/fa";

// Toast消息类型
export type ToastType = "success" | "error" | "warning" | "info";

// Toast消息接口
export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  autoClose?: boolean;
}

// 确认对话框接口
export interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "info" | "warning" | "error";
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
}

// 反馈上下文接口
interface FeedbackContextType {
  // Toast方法
  toast: {
    success: (title: string, message?: string, duration?: number) => void;
    error: (title: string, message?: string, duration?: number) => void;
    warning: (title: string, message?: string, duration?: number) => void;
    info: (title: string, message?: string, duration?: number) => void;
  };
  // 确认对话框方法
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  // 移除Toast
  removeToast: (id: string) => void;
}

const FeedbackContext = createContext<FeedbackContextType | undefined>(undefined);

// 全局反馈服务实例
let globalFeedbackService: FeedbackContextType | null = null;

// Toast组件
const Toast: React.FC<{
  toast: ToastMessage;
  onClose: (id: string) => void;
}> = ({ toast, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // 进入动画
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // 自动关闭
    if (toast.autoClose !== false && toast.duration) {
      const timer = setTimeout(() => {
        handleClose();
      }, toast.duration);
      return () => clearTimeout(timer);
    }
  }, [toast.autoClose, toast.duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose(toast.id);
    }, 300);
  };

  const getIcon = () => {
    switch (toast.type) {
      case "success":
        return React.createElement(FaCheckCircle as React.ComponentType<{ style?: React.CSSProperties }>, { style: { color: "var(--success-color)" } });
      case "error":
        return React.createElement(FaTimesCircle as React.ComponentType<{ style?: React.CSSProperties }>, { style: { color: "var(--error-color)" } });
      case "warning":
        return React.createElement(FaExclamationCircle as React.ComponentType<{ style?: React.CSSProperties }>, { style: { color: "var(--warning-color)" } });
      case "info":
        return React.createElement(FaInfoCircle as React.ComponentType<{ style?: React.CSSProperties }>, { style: { color: "var(--primary-color)" } });
      default:
        return React.createElement(FaInfoCircle as React.ComponentType<{ style?: React.CSSProperties }>, { style: { color: "var(--primary-color)" } });
    }
  };

  const getBorderColor = () => {
    switch (toast.type) {
      case "success":
        return "var(--success-color)";
      case "error":
        return "var(--error-color)";
      case "warning":
        return "var(--warning-color)";
      case "info":
        return "var(--primary-color)";
      default:
        return "var(--primary-color)";
    }
  };

  return (
    <div
      className={`fixed right-[16px] z-[9999] w-[90%] max-w-[400px] rounded-[0.75rem] p-[16px] shadow-lg transition-all duration-300 ${
        isVisible && !isExiting
          ? "transform translate-x-0 opacity-100"
          : "transform translate-x-full opacity-0"
      }`}
      style={{
        backgroundColor: "var(--card-background)",
        borderLeft: `4px solid ${getBorderColor()}`,
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      }}
    >
      <div className="flex items-start gap-[12px]">
        <div className="flex-shrink-0 text-[1.25rem] mt-[2px]">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <h4
            className="font-[600] text-[0.875rem] mb-[4px]"
            style={{ color: "var(--foreground)" }}
          >
            {toast.title}
          </h4>
          {toast.message && (
            <p
              className="text-[0.75rem] leading-[1.4]"
              style={{ color: "var(--tab-inactive-color)" }}
            >
              {toast.message}
            </p>
          )}
        </div>
        <button
          onClick={handleClose}
          className="flex-shrink-0 text-[0.875rem] p-[4px] rounded-[4px] hover:bg-[rgba(0,0,0,0.05)] dark:hover:bg-[rgba(255,255,255,0.05)] transition-colors"
          style={{ color: "var(--tab-inactive-color)" }}
        >
          {React.createElement(FaTimes as React.ComponentType)}
        </button>
      </div>
    </div>
  );
};

// 确认对话框组件
const ConfirmDialog: React.FC<{
  isOpen: boolean;
  options: ConfirmOptions;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ isOpen, options, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (options.type) {
      case "warning":
        return React.createElement(FaExclamationCircle as React.ComponentType<{ style?: React.CSSProperties }>, { style: { color: "var(--warning-color)" } });
      case "error":
        return React.createElement(FaTimesCircle as React.ComponentType<{ style?: React.CSSProperties }>, { style: { color: "var(--error-color)" } });
      case "info":
      default:
        return React.createElement(FaInfoCircle as React.ComponentType<{ style?: React.CSSProperties }>, { style: { color: "var(--primary-color)" } });
    }
  };

  return (
    <div className="w-screen h-screen top-[0px] left-[0px] fixed inset-0 z-[9999] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black bg-opacity-70"
        onClick={onCancel}
      ></div>
      <div
        className="relative rounded-[1.25rem] w-[85%] max-w-[400px] shadow-2xl"
        style={{
          backgroundColor: "var(--card-background)",
          borderWidth: "1px",
          borderStyle: "solid",
          borderColor: "var(--border-color)",
        }}
      >
        <div className="p-[24px] text-center">
          <div className="flex justify-center mb-[16px]">
            <div className="text-[2.5rem]">
              {getIcon()}
            </div>
          </div>
          <h3
            className="text-[1.125rem] font-[600] mb-[8px]"
            style={{ color: "var(--foreground)" }}
          >
            {options.title}
          </h3>
          <p
            className="text-[0.875rem] leading-[1.5] mb-[24px]"
            style={{ color: "var(--tab-inactive-color)" }}
          >
            {options.message}
          </p>
          <div className="flex gap-[12px] justify-center">
            <button
              onClick={onCancel}
              className="flex-1 max-w-[120px] py-[12px] px-[20px] rounded-[0.75rem] font-[600] text-[0.875rem] transition-all border-2 active:opacity-[0.8]"
              style={{
                backgroundColor: "transparent",
                borderColor: "var(--border-color)",
                color: "var(--tab-inactive-color)",
              }}
            >
              {options.cancelText || "取消"}
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 max-w-[120px] py-[12px] px-[20px] rounded-[0.75rem] font-[600] text-[0.875rem] transition-all active:opacity-[0.8]"
              style={{
                backgroundColor: options.type === "error" ? "var(--error-color)" : "var(--primary-color)",
                color: "#ffffff",
              }}
            >
              {options.confirmText || "确认"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Toast容器组件
const ToastContainer: React.FC<{ toasts: ToastMessage[]; onRemove: (id: string) => void }> = ({
  toasts,
  onRemove,
}) => {
  return (
    <div className="fixed top-[60px] right-[0px] z-[9999] space-y-[12px] pointer-events-none">
      <div className="space-y-[12px] pointer-events-auto">
        {toasts.map((toast, index) => (
          <div
            key={toast.id}
            style={{
              top: `${index * 80}px`,
            }}
          >
            <Toast toast={toast} onClose={onRemove} />
          </div>
        ))}
      </div>
    </div>
  );
};

// Feedback Provider组件
export const FeedbackProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    options: ConfirmOptions;
    resolve: (value: boolean) => void;
  }>({
    isOpen: false,
    options: { title: "", message: "" },
    resolve: () => {},
  });

  // 生成唯一ID
  const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

  // 添加Toast
  const addToast = (type: ToastType, title: string, message?: string, duration = 4000) => {
    const id = generateId();
    const newToast: ToastMessage = {
      id,
      type,
      title,
      message,
      duration,
      autoClose: true,
    };
    setToasts(prev => [...prev, newToast]);
  };

  // 移除Toast
  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // Toast方法
  const toast = {
    success: (title: string, message?: string, duration?: number) => 
      addToast("success", title, message, duration),
    error: (title: string, message?: string, duration?: number) => 
      addToast("error", title, message, duration),
    warning: (title: string, message?: string, duration?: number) => 
      addToast("warning", title, message, duration),
    info: (title: string, message?: string, duration?: number) => 
      addToast("info", title, message, duration),
  };

  // 确认对话框方法
  const confirm = (options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmDialog({
        isOpen: true,
        options,
        resolve,
      });
    });
  };

  // 处理确认
  const handleConfirm = async () => {
    if (confirmDialog.options.onConfirm) {
      await confirmDialog.options.onConfirm();
    }
    confirmDialog.resolve(true);
    setConfirmDialog(prev => ({ ...prev, isOpen: false }));
  };

  // 处理取消
  const handleCancel = () => {
    if (confirmDialog.options.onCancel) {
      confirmDialog.options.onCancel();
    }
    confirmDialog.resolve(false);
    setConfirmDialog(prev => ({ ...prev, isOpen: false }));
  };

  const contextValue: FeedbackContextType = {
    toast,
    confirm,
    removeToast,
  };

  // 设置全局反馈服务实例
  useEffect(() => {
    globalFeedbackService = contextValue;
    return () => {
      globalFeedbackService = null;
    };
  }, [contextValue]);

  return (
    <FeedbackContext.Provider value={contextValue}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        options={confirmDialog.options}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </FeedbackContext.Provider>
  );
};

// 使用反馈的Hook
export const useFeedback = () => {
  const context = useContext(FeedbackContext);
  if (!context) {
    throw new Error("useFeedback must be used within a FeedbackProvider");
  }
  return context;
};

// 全局反馈调用函数（用于非 React 组件中）
export const globalFeedback = {
  toast: {
    success: (title: string, message?: string, duration?: number) => {
      if (globalFeedbackService) {
        globalFeedbackService.toast.success(title, message, duration);
      } else {
        console.warn("FeedbackProvider not initialized");
      }
    },
    error: (title: string, message?: string, duration?: number) => {
      if (globalFeedbackService) {
        globalFeedbackService.toast.error(title, message, duration);
      } else {
        console.warn("FeedbackProvider not initialized");
      }
    },
    warning: (title: string, message?: string, duration?: number) => {
      if (globalFeedbackService) {
        globalFeedbackService.toast.warning(title, message, duration);
      } else {
        console.warn("FeedbackProvider not initialized");
      }
    },
    info: (title: string, message?: string, duration?: number) => {
      if (globalFeedbackService) {
        globalFeedbackService.toast.info(title, message, duration);
      } else {
        console.warn("FeedbackProvider not initialized");
      }
    },
  },
  confirm: async (options: ConfirmOptions): Promise<boolean> => {
    if (globalFeedbackService) {
      return await globalFeedbackService.confirm(options);
    } else {
      console.warn("FeedbackProvider not initialized");
      return false;
    }
  },
};

export default FeedbackProvider;