import React, { useState, useEffect } from "react";
import { apiService, CreateBuyOrderRequest } from "@/common/api";
import { ApiError } from "@/common/http";
import { Order } from "@/types";

const ApiExample: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 获取订单列表
  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.getOrderList({ page: 1, limit: 10 });
      setOrders(response.data);
    } catch (err) {
      console.error("获取订单列表失败:", err);

      if (err instanceof ApiError) {
        setError(`API错误: ${err.message} (代码: ${err.code})`);
      } else {
        setError("网络连接失败，请检查网络设置");
      }
    } finally {
      setLoading(false);
    }
  };

  // 创建购买订单
  const createOrder = async () => {
    try {
      const orderData: CreateBuyOrderRequest = {
        valueId: "nft-123",
        price: 100.5,
        currency: "ETH",
      };

      const newOrder = await apiService.createBuyOrder(orderData);
      console.log("创建订单成功:", newOrder);

      // 刷新订单列表
      await fetchOrders();

      alert("订单创建成功！");
    } catch (err) {
      console.error("创建订单失败:", err);

      if (err instanceof ApiError) {
        alert(`创建失败: ${err.message}`);
      } else {
        alert("网络错误，请重试");
      }
    }
  };

  // 用户登录示例
  const handleLogin = async () => {
    try {
      const loginData = {
        address: "user@example.com",
        password: "password123",
      };

      const response = await apiService.login(loginData);
      console.log("登录成功:", response);

      alert(`登录成功！欢迎 ${response.user.username}`);
    } catch (err) {
      console.error("登录失败:", err);

      if (err instanceof ApiError) {
        if (err.code === 401) {
          alert("用户名或密码错误");
        } else {
          alert(`登录失败: ${err.message}`);
        }
      } else {
        alert("网络错误，请重试");
      }
    }
  };

  // 组件加载时获取数据
  useEffect(() => {
    // 初始化认证状态
    apiService.initializeAuth();

    // 如果已登录，获取订单列表
    if (apiService.isAuthenticated()) {
      fetchOrders();
    }
  }, []);

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">API使用示例</h2>

      {/* 认证状态 */}
      <div className="mb-4 p-3 bg-gray-100 rounded">
        <p className="text-sm">
          登录状态: {apiService.isAuthenticated() ? "已登录" : "未登录"}
        </p>
      </div>

      {/* 操作按钮 */}
      <div className="space-y-2 mb-4">
        <button
          onClick={handleLogin}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          模拟登录
        </button>

        <button
          onClick={fetchOrders}
          disabled={loading}
          className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
        >
          {loading ? "加载中..." : "获取订单列表"}
        </button>

        <button
          onClick={createOrder}
          className="w-full px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          创建测试订单
        </button>

        <button
          onClick={() => {
            apiService.logout();
            setOrders([]);
          }}
          className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          退出登录
        </button>
      </div>

      {/* 错误信息 */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          <strong>错误:</strong> {error}
        </div>
      )}

      {/* 订单列表 */}
      <div>
        <h3 className="text-lg font-semibold mb-2">
          订单列表 ({orders.length})
        </h3>
        {orders.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            {loading ? "加载中..." : "暂无订单数据"}
          </p>
        ) : (
          <div className="space-y-2">
            {orders.map((order) => (
              <div key={order.id} className="p-3 border rounded">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{order.valueID.name}</p>
                    <p className="text-sm text-gray-600">
                      {order.amount} {order.currency}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      order.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : order.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">ID: {order.id}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ApiExample;
