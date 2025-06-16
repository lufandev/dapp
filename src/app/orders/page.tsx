"use client";

import React, { useState } from "react";
import MobileLayout from "@/components/layout/MobileLayout";
import Button from "@/components/ui/Button";
import { useOrders, useAuth } from "@/common/hooks";
import { Order, OrderQueryParams } from "@/types";

export default function OrdersPage() {
  const { isAuthenticated } = useAuth();
  const [filter, setFilter] = useState<"all" | "buy" | "sell" | "rent">("all");
  const [page, setPage] = useState(1);

  // 构建查询参数
  const queryParams: OrderQueryParams = {
    page,
    limit: 10,
    ...(filter !== "all" && { type: filter as Order["type"] }),
  };

  const {
    data: orders,
    total,
    loading,
    error,
    refresh,
    createOrder,
    cancelOrder,
    completeOrder,
  } = useOrders(queryParams);

  // 处理创建订单
  const handleCreateOrder = async (
    valueIdId: number,
    type: "buy" | "sell" | "rent"
  ) => {
    try {
      await createOrder({
        type,
        valueIdId,
        amount: 100, // 示例金额
        currency: "ETH",
        ...(type === "rent" && { rentalPeriod: 30 }),
      });
      alert("订单创建成功！");
    } catch (err) {
      alert(
        "创建订单失败：" + (err instanceof Error ? err.message : "未知错误")
      );
    }
  };

  // 处理取消订单
  const handleCancelOrder = async (orderId: number) => {
    try {
      await cancelOrder(orderId);
      alert("订单已取消");
    } catch (err) {
      alert(
        "取消订单失败：" + (err instanceof Error ? err.message : "未知错误")
      );
    }
  };

  // 处理完成订单
  const handleCompleteOrder = async (orderId: number) => {
    try {
      await completeOrder(orderId);
      alert("订单已完成");
    } catch (err) {
      alert(
        "完成订单失败：" + (err instanceof Error ? err.message : "未知错误")
      );
    }
  };

  // 获取状态颜色
  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "canceled":
        return "bg-red-100 text-red-800";
      case "failed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // 获取状态文本
  const getStatusText = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return "进行中";
      case "completed":
        return "已完成";
      case "canceled":
        return "已取消";
      case "failed":
        return "失败";
      default:
        return status;
    }
  };

  // 获取类型文本
  const getTypeText = (type: Order["type"]) => {
    switch (type) {
      case "buy":
        return "购买";
      case "sell":
        return "出售";
      case "rent":
        return "租赁";
      default:
        return type;
    }
  };

  if (!isAuthenticated) {
    return (
      <MobileLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px] p-[16px]">
          <p className="text-gray-500 mb-4">请先登录查看订单</p>
          <Button onClick={() => alert("请先登录")}>去登录</Button>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <div className="p-[16px]">
        {/* 标题和筛选 */}
        <div className="mb-[16px]">
          <h1 className="text-xl font-bold mb-4">我的订单</h1>

          {/* 筛选按钮 */}
          <div className="flex gap-2 mb-4">
            {[
              { key: "all", label: "全部" },
              { key: "buy", label: "购买" },
              { key: "sell", label: "出售" },
              { key: "rent", label: "租赁" },
            ].map((item) => (
              <Button
                key={item.key}
                size="sm"
                variant={filter === item.key ? "primary" : "outline"}
                onClick={() => {
                  setFilter(item.key as typeof filter);
                  setPage(1);
                }}
              >
                {item.label}
              </Button>
            ))}
          </div>

          {/* 刷新按钮 */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => refresh()}
            disabled={loading}
          >
            {loading ? "刷新中..." : "刷新"}
          </Button>
        </div>

        {/* 订单列表 */}
        {loading && orders.length === 0 ? (
          <div className="flex justify-center items-center py-16">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-500">加载中...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={() => refresh()}>重试</Button>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 mb-4">暂无订单</p>
            <Button onClick={() => handleCreateOrder(1, "buy")}>
              创建测试订单
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white p-4 rounded-lg shadow-sm border"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {order.valueID.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        订单号: #{order.id}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {getStatusText(order.status)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                    <div>
                      <span className="text-gray-500">类型：</span>
                      <span className="font-medium">
                        {getTypeText(order.type)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">金额：</span>
                      <span className="font-medium">
                        {order.amount} {order.currency}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">买家：</span>
                      <span className="font-medium">
                        {order.buyer.username}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">卖家：</span>
                      <span className="font-medium">
                        {order.seller.username}
                      </span>
                    </div>
                  </div>

                  {order.rentalPeriod && (
                    <div className="mb-3 text-sm">
                      <span className="text-gray-500">租赁期限：</span>
                      <span className="font-medium">
                        {order.rentalPeriod} 天
                      </span>
                    </div>
                  )}

                  <div className="text-xs text-gray-500 mb-3">
                    创建时间: {new Date(order.createdAt).toLocaleString()}
                  </div>

                  {/* 操作按钮 */}
                  <div className="flex gap-2">
                    {order.status === "pending" && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCancelOrder(order.id)}
                        >
                          取消订单
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleCompleteOrder(order.id)}
                        >
                          完成订单
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* 分页 */}
            {total > 10 && (
              <div className="flex justify-center items-center gap-4 mt-6">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  上一页
                </Button>
                <span className="text-sm text-gray-500">
                  第 {page} 页 / 共 {Math.ceil(total / 10)} 页
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page * 10 >= total}
                  onClick={() => setPage(page + 1)}
                >
                  下一页
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </MobileLayout>
  );
}
