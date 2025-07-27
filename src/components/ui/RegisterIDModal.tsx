"use client";

import React, { useState } from "react";
import Modal from "./Modal";
import Button from "./Button";
import Input from "./Input";
import { useLocale } from "../LocaleProvider";
import { FaCheckCircle, FaExclamationCircle, FaSpinner } from "react-icons/fa";

interface RegisterIDModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = "payment" | "input" | "processing" | "success" | "failed";

// 模拟已存在的ID列表
const existingIDs = ["ABC123", "TEST", "DEMO", "USER1", "ADMIN"];

const RegisterIDModal: React.FC<RegisterIDModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { t } = useLocale();
  const [step, setStep] = useState<Step>("payment");
  const [id, setId] = useState("");
  const [registeredId, setRegisteredId] = useState("");

  // 重置状态
  const resetModal = () => {
    setStep("payment");
    setId("");
    setRegisteredId("");
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

  // 处理支付
  const handlePayment = () => {
    // 模拟支付过程
    setStep("processing");
    setTimeout(() => {
      setStep("input");
    }, 1500);
  };

  // 处理注册
  const handleRegister = () => {
    if (!validateId(id)) {
      alert(t("register.invalidIdDesc"));
      return;
    }

    setStep("processing");
    setRegisteredId(id);

    // 模拟注册过程
    setTimeout(() => {
      // 检查ID是否已存在（模拟）
      const isExisting = existingIDs.includes(id.toUpperCase());

      if (isExisting) {
        setStep("failed");
      } else {
        setStep("success");
        // 模拟添加到已存在列表
        existingIDs.push(id.toUpperCase());
      }
    }, 2000);
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
            <FaSpinner
              className="animate-spin mx-auto mb-4 text-3xl"
              style={{ color: "var(--primary-color)" }}
            />
            <p style={{ color: "var(--foreground)" }}>
              {step === "processing" && registeredId
                ? t("register.processing")
                : t("register.paymentSuccess")}
            </p>
          </div>
        );

      case "success":
        return (
          <div className="text-center py-4">
            <FaCheckCircle
              className="mx-auto mb-4 text-4xl"
              style={{ color: "#10b981" }}
            />
            <h3
              className="text-lg font-semibold mb-2"
              style={{ color: "var(--foreground)" }}
            >
              {t("register.success")}
            </h3>
            <p
              className="text-sm"
              style={{ color: "var(--tab-inactive-color)" }}
            >
              {t("register.successDesc").replace("{id}", registeredId)}
            </p>
          </div>
        );

      case "failed":
        return (
          <div className="text-center py-4">
            <FaExclamationCircle
              className="mx-auto mb-4 text-4xl"
              style={{ color: "#ef4444" }}
            />
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
      case "failed":
        return (
          <>
            <Button onClick={handleClose}>{t("register.close")}</Button>
            {step === "failed" && (
              <Button
                variant="secondary"
                onClick={() => {
                  setStep("input");
                  setId("");
                }}
              >
                {t("register.register")}
              </Button>
            )}
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
