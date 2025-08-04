"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import Modal from "./Modal";
import Button from "./Button";
import Input from "./Input";
import { useLocale } from "../LocaleProvider";
import { FaCheckCircle, FaExclamationCircle, FaSpinner } from "react-icons/fa";
import { ethers } from "ethers";

interface RegisterIDModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = "payment" | "input" | "processing" | "success" | "failed" | "error";

// 合约地址
const CONTRACT_ADDRESS = "0xf27b70557f83956823c3174bf7955660b7c13a4d";

// Sepolia 测试网配置
const SEPOLIA_CHAIN_ID = "0xaa36a7"; // 11155111 in hex
const SEPOLIA_USDT_ADDRESS = "0x358AA13c52544ECCEF6B0ADD0f801012ADAD5eE3"; // Sepolia USDT

// 合约 ABI - 只包含需要的函数
const CONTRACT_ABI = [
  {
    inputs: [{ internalType: "string", name: "id", type: "string" }],
    name: "register",
    outputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "registerFee",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "paymentToken",
    outputs: [{ internalType: "contract IERC20", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "string", name: "", type: "string" }],
    name: "idRegistrationCount",
    outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
];

// ERC20 Token ABI - 用于 USDT 交互
const ERC20_ABI = [
  {
    inputs: [
      { internalType: "address", name: "spender", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "owner", type: "address" },
      { internalType: "address", name: "spender", type: "address" },
    ],
    name: "allowance",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
];

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

  // 检查并切换到Sepolia网络
  const checkAndSwitchNetwork = async () => {
    if (!(window as any).ethereum) {
      throw new Error("请安装 MetaMask 钱包!");
    }

    const provider = new ethers.providers.Web3Provider(
      (window as any).ethereum
    );
    const network = await provider.getNetwork();

    if (network.chainId !== 11155111) {
      try {
        await (window as any).ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: SEPOLIA_CHAIN_ID }],
        });
      } catch (switchError: any) {
        // 如果网络不存在，添加网络
        if (switchError.code === 4902) {
          await (window as any).ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: SEPOLIA_CHAIN_ID,
                chainName: "Sepolia Test Network",
                nativeCurrency: {
                  name: "SepoliaETH",
                  symbol: "ETH",
                  decimals: 18,
                },
                rpcUrls: ["https://sepolia.infura.io/v3/"],
                blockExplorerUrls: ["https://sepolia.etherscan.io/"],
              },
            ],
          });
        } else {
          throw switchError;
        }
      }
    }
  };

  // 处理支付
  const handlePayment = async () => {
    try {
      setStep("processing");
      setErrorMessage("");

      if (!(window as any).ethereum) {
        throw new Error("请安装 MetaMask 钱包!");
      }

      await checkAndSwitchNetwork();

      // 连接钱包
      const provider = new ethers.providers.Web3Provider(
        (window as any).ethereum
      );
      await provider.send("eth_requestAccounts", []);

      setStep("input");
    } catch (error: any) {
      console.error("支付失败:", error);
      setErrorMessage(error.message || "支付失败，请重试");
      setStep("error");
    }
  };

  // 处理注册 - 调用真实合约
  const handleRegister = async () => {
    if (!validateId(id)) {
      alert(t("register.invalidIdDesc"));
      return;
    }

    try {
      setStep("processing");
      setRegisteredId(id);
      setErrorMessage("");

      if (!(window as any).ethereum) {
        throw new Error("请安装 MetaMask 钱包!");
      }

      await checkAndSwitchNetwork();

      const provider = new ethers.providers.Web3Provider(
        (window as any).ethereum
      );
      const signer = provider.getSigner();
      const userAddress = await signer.getAddress();

      // 创建合约实例
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer
      );

      console.log("🚀 开始注册流程");
      console.log("🚀 用户地址:", userAddress);
      console.log("🚀 注册ID:", id.toLowerCase());

      // 检查ID是否已被注册
      const registrationCount = await contract.idRegistrationCount(
        id.toLowerCase()
      );
      console.log("🚀 ID注册次数:", registrationCount.toString());

      if (registrationCount >= 50) {
        throw new Error(`ID "${id}" 已达到最大注册次数限制`);
      }

      // 获取注册费和支付代币
      const registerFee = await contract.registerFee();
      const paymentTokenAddress = await contract.paymentToken();

      console.log(
        "🚀 注册费用:",
        ethers.utils.formatUnits(registerFee, 6),
        "USDT"
      );
      console.log("🚀 支付代币地址:", paymentTokenAddress);

      // 调用注册函数
      console.log("🚀 开始调用合约注册函数...");
      const tx = await contract.register(id.toLowerCase());

      console.log("🚀 注册交易已提交");
      console.log("🚀 交易哈希:", tx.hash);
      setTransactionHash(tx.hash);

      // 等待交易确认
      console.log("🚀 等待交易确认...");
      const receipt = await tx.wait();
      console.log("🚀 交易已确认");
      console.log("🚀 交易收据:", receipt);

      if (receipt.status === 1) {
        // 从交易日志中获取 tokenId
        const logs = receipt.logs;
        console.log("🚀 交易日志:", logs);

        // 查找 Transfer 事件来获取 tokenId
        for (const log of logs) {
          try {
            if (
              log.topics[0] ===
              ethers.utils.id("Transfer(address,address,uint256)")
            ) {
              const parsedLog = new ethers.utils.Interface([
                "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
              ]).parseLog(log);

              if (parsedLog.args.from === ethers.constants.AddressZero) {
                const newTokenId = parsedLog.args.tokenId.toNumber();
                console.log("🚀 新生成的 Token ID:", newTokenId);
                setTokenId(newTokenId);
                break;
              }
            }
          } catch {
            // 忽略解析错误
          }
        }

        console.log("🚀 注册成功!");
        setStep("success");
      } else {
        throw new Error("交易失败");
      }
    } catch (error: any) {
      console.error("🚀 注册失败:", error);

      // 处理特定错误
      let errorMsg = error.message || "注册失败，请重试";

      if (error.message?.includes("Max 50 registrations per ID")) {
        errorMsg = `ID "${id}" 已达到最大注册次数限制`;
      } else if (error.message?.includes("ID length must be 3~10")) {
        errorMsg = "ID长度必须为3-10个字符";
      } else if (error.message?.includes("ID must be alphanumeric")) {
        errorMsg = "ID只能包含字母和数字";
      } else if (error.code === 4001) {
        errorMsg = "用户取消了交易";
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
            <FaSpinner
              className="animate-spin mx-auto mb-4 text-3xl"
              style={{ color: "var(--primary-color)" }}
            />
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

      case "error":
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
