"use client";

import React, { useState } from "react";
import MobileLayout from "@/components/layout/MobileLayout";
import Button from "@/components/ui/Button";
import {
  useAuth,
  useWallets,
  useBalance,
  useFinanceStats,
} from "@/common/hooks";
import { apiService } from "@/common/api";

export default function FinancePage() {
  const { isAuthenticated } = useAuth();
  const { data: wallets, loading: walletsLoading, createWallet } = useWallets();
  const {
    balance,
    loading: balanceLoading,
    refresh: refreshBalance,
  } = useBalance("ETH");
  const { data: stats, loading: statsLoading } = useFinanceStats("ETH");

  const [showCreateWallet, setShowCreateWallet] = useState(false);
  const [newWallet, setNewWallet] = useState({
    address: "",
    currency: "ETH",
    type: "metamask",
    label: "",
    isDefault: false,
  });

  // 处理创建钱包
  const handleCreateWallet = async () => {
    try {
      await createWallet(newWallet);
      setShowCreateWallet(false);
      setNewWallet({
        address: "",
        currency: "ETH",
        type: "metamask",
        label: "",
        isDefault: false,
      });
      alert("钱包创建成功！");
    } catch (err) {
      alert(
        "创建钱包失败：" + (err instanceof Error ? err.message : "未知错误")
      );
    }
  };

  // 处理转账
  const handleTransfer = async () => {
    try {
      await apiService.transfer({
        fromUserId: 1, // 示例用户ID
        toUserId: 2, // 示例目标用户ID
        amount: 10,
        currency: "ETH",
        description: "测试转账",
      });
      refreshBalance();
      alert("转账成功！");
    } catch (err) {
      alert("转账失败：" + (err instanceof Error ? err.message : "未知错误"));
    }
  };

  // 处理提现
  const handleWithdraw = async () => {
    try {
      await apiService.withdraw({
        amount: 50,
        currency: "ETH",
        toAddress: "0x1234567890123456789012345678901234567890",
        description: "提现到外部钱包",
      });
      refreshBalance();
      alert("提现申请已提交！");
    } catch (err) {
      alert("提现失败：" + (err instanceof Error ? err.message : "未知错误"));
    }
  };

  // 处理充值
  const handleDeposit = async () => {
    try {
      await apiService.deposit({
        amount: 100,
        currency: "ETH",
        fromAddress: "0x1234567890123456789012345678901234567890",
        transactionHash: "0xabcdef1234567890",
        description: "从外部钱包充值",
      });
      refreshBalance();
      alert("充值记录已添加！");
    } catch (err) {
      alert("充值失败：" + (err instanceof Error ? err.message : "未知错误"));
    }
  };

  if (!isAuthenticated) {
    return (
      <MobileLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px] p-[16px]">
          <p className="text-gray-500 mb-4">请先登录查看财务信息</p>
          <Button onClick={() => alert("请先登录")}>去登录</Button>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <div className="p-[16px]">
        <h1 className="text-xl font-bold mb-6">财务管理</h1>

        {/* 余额卡片 */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-lg mb-6">
          <h2 className="text-lg font-semibold mb-2">我的余额</h2>
          <div className="text-3xl font-bold">
            {balanceLoading ? (
              <div className="animate-pulse">加载中...</div>
            ) : (
              `${balance} ETH`
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="mt-4 text-white border-white hover:bg-white hover:text-blue-600"
            onClick={() => refreshBalance()}
            disabled={balanceLoading}
          >
            {balanceLoading ? "刷新中..." : "刷新余额"}
          </Button>
        </div>

        {/* 统计信息 */}
        {stats && (
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <h3 className="text-sm text-gray-500 mb-1">总收入</h3>
              <p className="text-xl font-bold text-green-600">
                {statsLoading ? "..." : `${stats.totalIncome} ETH`}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <h3 className="text-sm text-gray-500 mb-1">总支出</h3>
              <p className="text-xl font-bold text-red-600">
                {statsLoading ? "..." : `${stats.totalExpense} ETH`}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <h3 className="text-sm text-gray-500 mb-1">总手续费</h3>
              <p className="text-xl font-bold text-gray-600">
                {statsLoading ? "..." : `${stats.totalFees} ETH`}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <h3 className="text-sm text-gray-500 mb-1">净收益</h3>
              <p
                className={`text-xl font-bold ${
                  stats.netAmount >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {statsLoading ? "..." : `${stats.netAmount} ETH`}
              </p>
            </div>
          </div>
        )}

        {/* 操作按钮 */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Button variant="primary" onClick={handleDeposit} className="py-3">
            充值
          </Button>
          <Button variant="outline" onClick={handleWithdraw} className="py-3">
            提现
          </Button>
          <Button variant="secondary" onClick={handleTransfer} className="py-3">
            转账
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowCreateWallet(true)}
            className="py-3"
          >
            添加钱包
          </Button>
        </div>

        {/* 钱包列表 */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4">我的钱包</h2>
          {walletsLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : wallets.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              暂无钱包，点击上方按钮添加钱包
            </div>
          ) : (
            <div className="space-y-3">
              {wallets.map((wallet) => (
                <div
                  key={wallet.id}
                  className="bg-white p-4 rounded-lg shadow-sm border"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium">{wallet.label}</h3>
                      <p className="text-sm text-gray-500">{wallet.type}</p>
                    </div>
                    {wallet.isDefault && (
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                        默认
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">
                      {wallet.balance} {wallet.currency}
                    </span>
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        wallet.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {wallet.status === "active" ? "活跃" : "冻结"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 创建钱包弹窗 */}
        {showCreateWallet && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-sm">
              <h3 className="text-lg font-semibold mb-4">添加新钱包</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    钱包地址
                  </label>
                  <input
                    type="text"
                    value={newWallet.address}
                    onChange={(e) =>
                      setNewWallet({ ...newWallet, address: e.target.value })
                    }
                    className="w-full p-2 border rounded-md text-sm"
                    placeholder="0x..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">标签</label>
                  <input
                    type="text"
                    value={newWallet.label}
                    onChange={(e) =>
                      setNewWallet({ ...newWallet, label: e.target.value })
                    }
                    className="w-full p-2 border rounded-md text-sm"
                    placeholder="我的钱包"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">类型</label>
                  <select
                    value={newWallet.type}
                    onChange={(e) =>
                      setNewWallet({ ...newWallet, type: e.target.value })
                    }
                    className="w-full p-2 border rounded-md text-sm"
                  >
                    <option value="metamask">MetaMask</option>
                    <option value="walletconnect">WalletConnect</option>
                    <option value="coinbase">Coinbase Wallet</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={newWallet.isDefault}
                    onChange={(e) =>
                      setNewWallet({
                        ...newWallet,
                        isDefault: e.target.checked,
                      })
                    }
                    className="mr-2"
                  />
                  <label htmlFor="isDefault" className="text-sm">
                    设为默认钱包
                  </label>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateWallet(false)}
                  className="flex-1"
                >
                  取消
                </Button>
                <Button
                  variant="primary"
                  onClick={handleCreateWallet}
                  disabled={!newWallet.address || !newWallet.label}
                  className="flex-1"
                >
                  添加
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MobileLayout>
  );
}
