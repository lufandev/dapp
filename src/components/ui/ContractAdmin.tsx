"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import Button from "./Button";
import Input from "./Input";
import Modal from "./Modal";
import { useLocale } from "../LocaleProvider";
// 动态导入ethers避免服务端渲染问题
// import { ethers } from "ethers";
import { FaSpinner, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";

// 合约地址 - 您的NFT合约地址
const CONTRACT_ADDRESS = "0xf27b70557f83956823c3174bf7955660b7c13a4d";

// 从ABI.json中提取的管理函数ABI
const ADMIN_ABI = [
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
    ],
    name: "setPaymentToken",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "fee",
        type: "uint256",
      },
    ],
    name: "setRegisterFee",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

type AdminAction = "setRegisterFee" | "setPaymentToken" | null;

const ContractAdmin: React.FC = () => {
  const {} = useLocale();
  const [isMounted, setIsMounted] = useState(false);

  // 状态管理
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentAction, setCurrentAction] = useState<AdminAction>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");

  // 输入值
  const [registerFee, setRegisterFee] = useState("");
  const [tokenAddress, setTokenAddress] = useState("");

  // 确保只在客户端渲染
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 监听 currentAction 的变化
  useEffect(() => {
    if (currentAction) {
      console.log("currentAction 已更新为:", currentAction);
    }
  }, [currentAction]);

  if (!isMounted) {
    return null;
  }

  // 检查是否连接了钱包并且是合约所有者
  const checkOwnership = async () => {
    if (!(window as any).ethereum) {
      throw new Error("请安装 MetaMask 钱包!");
    }

    const { ethers } = await import('ethers');
    
    const provider = new ethers.providers.Web3Provider(
      (window as any).ethereum
    );
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const userAddress = await signer.getAddress();
    console.log("🚀 ~ checkOwnership ~ userAddress:", userAddress);

    const contract = new ethers.Contract(CONTRACT_ADDRESS, ADMIN_ABI, provider);
    const owner = await contract.owner();
    console.log("🚀 ~ checkOwnership ~ owner:", owner);

    // if (userAddress.toLowerCase() !== owner.toLowerCase()) {
    //   throw new Error("只有合约所有者才能执行此操作!");
    // }

    return signer;
  };

  // 设置注册费
  const handleSetRegisterFee = async () => {
    try {
      setIsLoading(true);
      setMessage("");
      setMessageType("");

      if (
        !registerFee ||
        isNaN(Number(registerFee)) ||
        Number(registerFee) < 0
      ) {
        throw new Error("请输入有效的注册费用!");
      }

      const signer = await checkOwnership();
      const { ethers } = await import('ethers');
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ADMIN_ABI, signer);

      // 将费用转换为wei (假设输入的是USDT数量，需要乘以10^6)
      const feeInWei = ethers.utils.parseUnits(registerFee, 6);

      console.log("设置注册费:", registerFee, "USDT");
      const tx = await contract.setRegisterFee(feeInWei);

      setMessage("交易已提交，等待确认...");
      setMessageType("success");

      const receipt = await tx.wait();
      console.log("交易已确认:", receipt);

      setMessage(`注册费已成功设置为 ${registerFee} USDT`);
      setMessageType("success");

      // 3秒后关闭模态框
      setTimeout(() => {
        setIsModalOpen(false);
        resetForm();
      }, 3000);
    } catch (error: any) {
      console.error("设置注册费失败:", error);
      setMessage(error.message || "设置失败，请重试");
      setMessageType("error");
    } finally {
      setIsLoading(false);
    }
  };

  // 设置支付代币
  const handleSetPaymentToken = async () => {
    try {
      setIsLoading(true);
      setMessage("");
      setMessageType("");

      const { ethers } = await import('ethers');
      
      if (!tokenAddress || !ethers.utils.isAddress(tokenAddress)) {
        throw new Error("请输入有效的代币地址!");
      }

      const signer = await checkOwnership();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ADMIN_ABI, signer);

      console.log("设置支付代币地址:", tokenAddress);
      const tx = await contract.setPaymentToken(tokenAddress);

      setMessage("交易已提交，等待确认...");
      setMessageType("success");

      const receipt = await tx.wait();
      console.log("交易已确认:", receipt);

      setMessage(`支付代币地址已成功设置为 ${tokenAddress}`);
      setMessageType("success");

      // 3秒后关闭模态框
      setTimeout(() => {
        setIsModalOpen(false);
        resetForm();
      }, 3000);
    } catch (error: any) {
      console.error("设置支付代币失败:", error);
      setMessage(error.message || "设置失败，请重试");
      setMessageType("error");
    } finally {
      setIsLoading(false);
    }
  };

  // 重置表单输入
  const resetFormInputs = () => {
    setRegisterFee("");
    setTokenAddress("");
    setMessage("");
    setMessageType("");
    setIsLoading(false);
  };

  // 完全重置表单（包括action）
  const resetForm = () => {
    setCurrentAction(null);
    resetFormInputs();
  };

  // 打开模态框
  const openModal = (action: AdminAction) => {
    setCurrentAction(action);
    setIsModalOpen(true);
    resetFormInputs(); // 只重置输入，不重置action
    console.log("正在打开模态框，操作类型:", action);
  };

  // 关闭模态框
  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  // 渲染模态框内容
  const renderModalContent = () => {
    if (isLoading) {
      return (
        <div className="text-center py-6">
          {React.createElement(FaSpinner as React.ComponentType<{ className?: string; style?: React.CSSProperties }>, {
            className: "mx-auto mb-4 text-4xl animate-spin",
            style: { color: "var(--primary-color)" }
          })}
          <p style={{ color: "var(--foreground)" }}>正在处理交易...</p>
        </div>
      );
    }

    if (message) {
      return (
        <div className="text-center py-6">
          {messageType === "success" ? (
            React.createElement(FaCheckCircle as React.ComponentType<{ className?: string; style?: React.CSSProperties }>, {
              className: "mx-auto mb-4 text-4xl",
              style: { color: "#10b981" }
            })
          ) : (
            React.createElement(FaExclamationCircle as React.ComponentType<{ className?: string; style?: React.CSSProperties }>, {
              className: "mx-auto mb-4 text-4xl",
              style: { color: "#ef4444" }
            })
          )}
          <p style={{ color: "var(--foreground)" }}>{message}</p>
        </div>
      );
    }

    if (currentAction === "setRegisterFee") {
      return (
        <div className="space-y-4">
          <p style={{ color: "var(--foreground)" }}>
            设置新的注册费用（单位：USDT）
          </p>
          <Input
            type="number"
            value={registerFee}
            onChange={(e) => setRegisterFee(e.target.value)}
            placeholder="输入注册费用，如：10"
            min="0"
            step="0.000001"
          />
          <p className="text-sm" style={{ color: "var(--tab-inactive-color)" }}>
            当前合约地址: {CONTRACT_ADDRESS}
          </p>
        </div>
      );
    }

    if (currentAction === "setPaymentToken") {
      return (
        <div className="space-y-4">
          <p style={{ color: "var(--foreground)" }}>设置新的支付代币合约地址</p>
          <Input
            type="text"
            value={tokenAddress}
            onChange={(e) => setTokenAddress(e.target.value)}
            placeholder="输入代币合约地址，如：0x..."
          />
          <div
            className="text-sm space-y-1"
            style={{ color: "var(--tab-inactive-color)" }}
          >
            <p>常用代币地址示例：</p>
            <p>• USDT (Mainnet): 0xdAC17F958D2ee523a2206206994597C13D831ec7</p>
            <p>• USDT (Sepolia): 0x358AA13c52544ECCEF6B0ADD0f801012ADAD5eE3</p>
          </div>
        </div>
      );
    }

    return null;
  };

  // 渲染模态框按钮
  const renderModalButtons = () => {
    if (isLoading || message) {
      return null;
    }

    return (
      <>
        <Button variant="secondary" onClick={closeModal}>
          取消
        </Button>
        <Button
          onClick={
            currentAction === "setRegisterFee"
              ? handleSetRegisterFee
              : handleSetPaymentToken
          }
          disabled={
            (currentAction === "setRegisterFee" && !registerFee) ||
            (currentAction === "setPaymentToken" && !tokenAddress)
          }
        >
          确认设置
        </Button>
      </>
    );
  };

  return (
    <>
      {/* 管理按钮 */}
      <div className="flex gap-2 mb-4">
        <Button
          variant="secondary"
          onClick={() => openModal("setRegisterFee")}
          style={{ fontSize: "14px", padding: "8px 16px" }}
        >
          设置注册费
        </Button>
        <Button
          variant="secondary"
          onClick={() => openModal("setPaymentToken")}
          style={{ fontSize: "14px", padding: "8px 16px" }}
        >
          设置支付代币
        </Button>
      </div>

      {/* 模态框 */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={
          currentAction === "setRegisterFee"
            ? "设置注册费"
            : currentAction === "setPaymentToken"
            ? "设置支付代币"
            : "合约管理"
        }
        footer={renderModalButtons()}
      >
        {renderModalContent()}
      </Modal>
    </>
  );
};

export default ContractAdmin;
