"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import Modal from "./Modal";
import Button from "./Button";
import Input from "./Input";
import { useLocale } from "../LocaleProvider";
import { FaCheckCircle, FaExclamationCircle, FaSpinner } from "react-icons/fa";
// 动态导入connection-service避免服务端渲染问题

interface RegisterIDModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = "payment" | "input" | "processing" | "success" | "failed" | "error";

const RegisterIDModal: React.FC<RegisterIDModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { t } = useLocale();
  const [step, setStep] = useState<Step>("payment");
  const [id, setId] = useState("");
  const [registeredId, setRegisteredId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [transactionHash, setTransactionHash] = useState("");
  const [tokenId, setTokenId] = useState<number | null>(null);

  // 重置状态
  const resetModal = () => {
    setStep("payment");
    setId("");
    setRegisteredId("");
    setErrorMessage("");
    setTransactionHash("");
    setTokenId(null);
  };

  // 处理模态框关闭
  const handleClose = () => {
    resetModal();
    onClose();
  };

  // 验证ID格式
  const validateId = (inputId: string): boolean => {
    // 3-10位字符，只能包含字母和数字
    const regex = /^[a-zA-Z0-9]{3,10}$/;
    return regex.test(inputId);
  };

  // 处理支付 - 简化版本，直接跳转到输入步骤
  const handlePayment = async () => {
    try {
      setStep("processing");
      setErrorMessage("");

      // 检查钱包是否安装
      if (!(window as any).ethereum) {
        throw new Error("请安装 MetaMask 钱包!");
      }

      // 尝试连接钱包
      await (window as any).ethereum.request({
        method: "eth_requestAccounts",
      });

      setStep("input");
    } catch (error: any) {
      console.error("连接钱包失败:", error);
      setErrorMessage(error.message || "连接钱包失败，请重试");
      setStep("error");
    }
  };

  // 处理注册 - 使用新的 registerNFT 函数
  const handleRegister = async () => {
    if (!validateId(id)) {
      alert(t("register.invalidIdDesc"));
      return;
    }

    try {
      setStep("processing");
      setRegisteredId(id);
      setErrorMessage("");

      console.log("🚀 开始注册流程");
      console.log("🚀 注册ID:", id.toLowerCase());

      // 调用集成的注册函数
      if (typeof window === "undefined") {
        throw new Error("服务端渲染环境下无法注册NFT");
      }

      const { registerNFT } = await import("@/common/connection-service");
      const result = await registerNFT(id.toLowerCase());

      console.log("🚀 注册成功!");
      console.log("🚀 交易哈希:", result.txHash);
      console.log("🚀 Token ID:", result.tokenId);

      setTransactionHash(result.txHash);
      if (result.tokenId) {
        setTokenId(parseInt(result.tokenId));
      }

      setStep("success");
    } catch (error: any) {
      console.error("🚀 注册失败:", error);

      // 处理特定错误
      let errorMsg = error.message || "注册失败，请重试";

      if (error.message?.includes("ID长度必须在3-10个字符之间")) {
        errorMsg = "ID长度必须为3-10个字符";
      } else if (error.message?.includes("ID只能包含字母和数字")) {
        errorMsg = "ID只能包含字母和数字";
      } else if (error.message?.includes("该ID注册次数已达上限")) {
        errorMsg = `ID "${id}" 已达到最大注册次数限制`;
      } else if (error.message?.includes("用户取消")) {
        errorMsg = "用户取消了交易";
      } else if (error.message?.includes("余额不足")) {
        errorMsg = "余额不足，无法支付注册费用";
      }

      setErrorMessage(errorMsg);
      setStep("error");
    }
  };

  const renderContent = () => {
    switch (step) {
      case "payment":
        return (
          <div className="text-center">
            <div className="mb-6">
              <p
                className="text-sm mb-4"
                style={{ color: "var(--tab-inactive-color)" }}
              >
                {t("register.paymentDesc")}
              </p>
              <div
                className="text-lg font-semibold mb-6"
                style={{ color: "var(--primary-color)" }}
              >
                {t("register.paymentAmount")}
              </div>
              <p
                className="text-xs"
                style={{ color: "var(--tab-inactive-color)" }}
              >
                请确保您的钱包已连接到 Sepolia 测试网络
              </p>
            </div>
          </div>
        );

      case "input":
        return (
          <div>
            <div className="mb-6">
              <p
                className="text-sm mb-4"
                style={{ color: "var(--tab-inactive-color)" }}
              >
                {t("register.inputDesc")}
              </p>
              <Input
                value={id}
                onChange={(e) => setId(e.target.value.toUpperCase())}
                placeholder={t("register.inputPlaceholder")}
                maxLength={10}
                className="text-center text-lg font-mono"
              />
              <p
                className="text-xs mt-2"
                style={{ color: "var(--tab-inactive-color)" }}
              >
                {id.length}/10 {t("register.invalidIdDesc")}
              </p>
            </div>
          </div>
        );

      case "processing":
        return (
          <div className="text-center py-8">
            {React.createElement(
              FaSpinner as React.ComponentType<{
                className?: string;
                style?: React.CSSProperties;
              }>,
              {
                className: "animate-spin mx-auto mb-4 text-3xl",
                style: { color: "var(--primary-color)" },
              }
            )}
            <p style={{ color: "var(--foreground)" }}>
              {registeredId ? "正在区块链上注册..." : "正在连接钱包..."}
            </p>
            {transactionHash && (
              <p
                className="text-xs mt-2"
                style={{ color: "var(--tab-inactive-color)" }}
              >
                交易哈希: {transactionHash.slice(0, 10)}...
              </p>
            )}
          </div>
        );

      case "success":
        return (
          <div className="text-center py-4">
            {React.createElement(
              FaCheckCircle as React.ComponentType<{
                className?: string;
                style?: React.CSSProperties;
              }>,
              {
                className: "mx-auto mb-4 text-4xl",
                style: { color: "#10b981" },
              }
            )}
            <h3
              className="text-lg font-semibold mb-2"
              style={{ color: "var(--foreground)" }}
            >
              {t("register.success")}
            </h3>
            <p
              className="text-sm mb-3"
              style={{ color: "var(--tab-inactive-color)" }}
            >
              {t("register.successDesc").replace("{id}", registeredId)}
            </p>
            {tokenId && (
              <p
                className="text-sm mb-2"
                style={{ color: "var(--primary-color)" }}
              >
                Token ID: {tokenId}
              </p>
            )}
            {transactionHash && (
              <a
                href={`https://sepolia.etherscan.io/tx/${transactionHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs underline"
                style={{ color: "var(--primary-color)" }}
              >
                在 Etherscan 上查看交易
              </a>
            )}
          </div>
        );

      case "failed":
        return (
          <div className="text-center py-4">
            {React.createElement(
              FaExclamationCircle as React.ComponentType<{
                className?: string;
                style?: React.CSSProperties;
              }>,
              {
                className: "mx-auto mb-4 text-4xl",
                style: { color: "#ef4444" },
              }
            )}
            <h3
              className="text-lg font-semibold mb-2"
              style={{ color: "var(--foreground)" }}
            >
              {t("register.failed")}
            </h3>
            <p
              className="text-sm"
              style={{ color: "var(--tab-inactive-color)" }}
            >
              {t("register.failedDesc").replace("{id}", registeredId)}
            </p>
          </div>
        );

      case "error":
        return (
          <div className="text-center py-4">
            {React.createElement(
              FaExclamationCircle as React.ComponentType<{
                className?: string;
                style?: React.CSSProperties;
              }>,
              {
                className: "mx-auto mb-4 text-4xl",
                style: { color: "#ef4444" },
              }
            )}
            <h3
              className="text-lg font-semibold mb-2"
              style={{ color: "var(--foreground)" }}
            >
              操作失败
            </h3>
            <p
              className="text-sm"
              style={{ color: "var(--tab-inactive-color)" }}
            >
              {errorMessage}
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  const renderFooter = () => {
    switch (step) {
      case "payment":
        return (
          <>
            <Button variant="secondary" onClick={handleClose}>
              {t("register.cancel")}
            </Button>
            <Button onClick={handlePayment}>{t("register.payNow")}</Button>
          </>
        );

      case "input":
        return (
          <>
            <Button variant="secondary" onClick={handleClose}>
              {t("register.cancel")}
            </Button>
            <Button onClick={handleRegister} disabled={!validateId(id)}>
              {t("register.register")}
            </Button>
          </>
        );

      case "processing":
        return null;

      case "success":
        return <Button onClick={handleClose}>{t("register.close")}</Button>;

      case "failed":
      case "error":
        return (
          <>
            <Button onClick={handleClose}>{t("register.close")}</Button>
            <Button
              variant="secondary"
              onClick={() => {
                setStep("input");
                setId("");
                setErrorMessage("");
              }}
            >
              重试
            </Button>
          </>
        );

      default:
        return null;
    }
  };

  const getTitle = () => {
    switch (step) {
      case "payment":
        return t("register.paymentTitle");
      case "input":
        return t("register.inputTitle");
      case "processing":
        return t("register.processing");
      case "success":
        return t("register.success");
      case "failed":
        return t("register.failed");
      case "error":
        return "操作失败";
      default:
        return t("register.title");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={step === "processing" ? () => {} : handleClose}
      title={getTitle()}
      footer={renderFooter()}
    >
      {renderContent()}
    </Modal>
  );
};

export default RegisterIDModal;
