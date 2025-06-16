import { useState, useEffect, useCallback } from "react";
import { apiService } from "./api";
import {
  ValueID,
  ValueIDQueryParams,
  Order,
  OrderQueryParams,
  Transaction,
  TransactionQueryParams,
  FinanceRecord,
  FinanceRecordQueryParams,
  User,
  Wallet,
  PaginatedResponse,
  TransactionStats,
  FinanceStats,
} from "@/types";

// ==================== 通用Hook ====================

// 通用加载状态Hook
export function useAsyncOperation<T>() {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (operation: () => Promise<T>) => {
    try {
      setLoading(true);
      setError(null);
      const result = await operation();
      setData(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "操作失败";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { data, loading, error, execute, reset };
}

// ==================== 认证相关Hook ====================

// 认证状态Hook
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 初始化认证状态
    apiService.initializeAuth();
    setLoading(false);
  }, []);

  const login = useCallback(async (address: string, password: string) => {
    const response = await apiService.login({ address, password });
    setUser(response.user);
    return response;
  }, []);

  const register = useCallback(
    async (address: string, username: string, password: string) => {
      const response = await apiService.register({
        address,
        username,
        password,
      });
      setUser(response.user);
      return response;
    },
    []
  );

  const walletLogin = useCallback(
    async (address: string, signature: string, message: string) => {
      const response = await apiService.walletLogin({
        address,
        signature,
        message,
      });
      setUser(response.user);
      return response;
    },
    []
  );

  const logout = useCallback(() => {
    apiService.logout();
    setUser(null);
  }, []);

  const isAuthenticated = apiService.isAuthenticated();

  return {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    walletLogin,
    logout,
  };
}

// ==================== ValueID/NFT相关Hook ====================

// ValueID列表Hook
export function useValueIDs(params?: ValueIDQueryParams) {
  const [data, setData] = useState<PaginatedResponse<ValueID> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(
    async (newParams?: ValueIDQueryParams) => {
      try {
        setLoading(true);
        setError(null);
        const result = await apiService.getValueIDList(newParams || params);
        setData(result);
        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "获取数据失败";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [params]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refresh = useCallback(() => fetchData(), [fetchData]);

  return {
    data: data?.data || [],
    total: data?.total || 0,
    page: data?.page || 1,
    limit: data?.limit || 10,
    loading,
    error,
    refresh,
    fetchData,
  };
}

// ValueID详情Hook
export function useValueID(id: number | null) {
  const [data, setData] = useState<ValueID | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);
      const result = await apiService.getValueIDDetail(id);
      setData(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "获取详情失败";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ValueID操作方法
  const listForSale = useCallback(
    async (price: number, paymentAddress: string, paymentCurrency: string) => {
      if (!id) throw new Error("无效的ValueID");
      await apiService.listForSale(id, {
        price,
        paymentAddress,
        paymentCurrency,
      });
      await fetchData(); // 刷新数据
    },
    [id, fetchData]
  );

  const listForRent = useCallback(
    async (
      rentalPrice: number,
      rentalPeriod: number,
      paymentAddress: string,
      paymentCurrency: string
    ) => {
      if (!id) throw new Error("无效的ValueID");
      await apiService.listForRent(id, {
        rentalPrice,
        rentalPeriod,
        paymentAddress,
        paymentCurrency,
      });
      await fetchData(); // 刷新数据
    },
    [id, fetchData]
  );

  const cancelSale = useCallback(async () => {
    if (!id) throw new Error("无效的ValueID");
    await apiService.cancelSale(id);
    await fetchData(); // 刷新数据
  }, [id, fetchData]);

  const cancelRent = useCallback(async () => {
    if (!id) throw new Error("无效的ValueID");
    await apiService.cancelRent(id);
    await fetchData(); // 刷新数据
  }, [id, fetchData]);

  const addFavorite = useCallback(async () => {
    if (!id) throw new Error("无效的ValueID");
    await apiService.addFavorite(id);
    await fetchData(); // 刷新数据
  }, [id, fetchData]);

  const removeFavorite = useCallback(async () => {
    if (!id) throw new Error("无效的ValueID");
    await apiService.removeFavorite(id);
    await fetchData(); // 刷新数据
  }, [id, fetchData]);

  return {
    data,
    loading,
    error,
    refresh: fetchData,
    listForSale,
    listForRent,
    cancelSale,
    cancelRent,
    addFavorite,
    removeFavorite,
  };
}

// ==================== 订单相关Hook ====================

// 订单列表Hook
export function useOrders(params?: OrderQueryParams) {
  const [data, setData] = useState<PaginatedResponse<Order> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(
    async (newParams?: OrderQueryParams) => {
      try {
        setLoading(true);
        setError(null);
        const result = await apiService.getOrderList(newParams || params);
        setData(result);
        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "获取订单失败";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [params]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const createOrder = useCallback(
    async (orderData: {
      type: "buy" | "sell" | "rent";
      valueIdId: number;
      amount: number;
      currency: string;
      rentalPeriod?: number;
    }) => {
      const result = await apiService.createOrder(orderData);
      await fetchData(); // 刷新列表
      return result;
    },
    [fetchData]
  );

  const cancelOrder = useCallback(
    async (orderId: number) => {
      await apiService.cancelOrder(orderId);
      await fetchData(); // 刷新列表
    },
    [fetchData]
  );

  const completeOrder = useCallback(
    async (orderId: number) => {
      await apiService.completeOrder(orderId);
      await fetchData(); // 刷新列表
    },
    [fetchData]
  );

  return {
    data: data?.data || [],
    total: data?.total || 0,
    page: data?.page || 1,
    limit: data?.limit || 10,
    loading,
    error,
    refresh: fetchData,
    createOrder,
    cancelOrder,
    completeOrder,
  };
}

// ==================== 交易相关Hook ====================

// 交易列表Hook
export function useTransactions(params?: TransactionQueryParams) {
  const [data, setData] = useState<PaginatedResponse<Transaction> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(
    async (newParams?: TransactionQueryParams) => {
      try {
        setLoading(true);
        setError(null);
        const result = await apiService.getTransactionList(newParams || params);
        setData(result);
        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "获取交易记录失败";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [params]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data: data?.data || [],
    total: data?.total || 0,
    page: data?.page || 1,
    limit: data?.limit || 10,
    loading,
    error,
    refresh: fetchData,
  };
}

// 交易统计Hook
export function useTransactionStats() {
  const [data, setData] = useState<TransactionStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiService.getTransactionStats();
      setData(result);
      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "获取统计数据失败";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refresh: fetchData,
  };
}

// ==================== 财务相关Hook ====================

// 钱包列表Hook
export function useWallets() {
  const [data, setData] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiService.getWalletList();
      setData(result);
      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "获取钱包列表失败";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const createWallet = useCallback(
    async (walletData: {
      address: string;
      currency: string;
      type: string;
      label: string;
      isDefault: boolean;
    }) => {
      const result = await apiService.createWallet(walletData);
      await fetchData(); // 刷新列表
      return result;
    },
    [fetchData]
  );

  return {
    data,
    loading,
    error,
    refresh: fetchData,
    createWallet,
  };
}

// 余额Hook
export function useBalance(currency: string) {
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiService.getBalance(currency);
      setBalance(result.balance);
      return result.balance;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "获取余额失败";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currency]);

  useEffect(() => {
    if (currency) {
      fetchBalance();
    }
  }, [fetchBalance, currency]);

  return {
    balance,
    loading,
    error,
    refresh: fetchBalance,
  };
}

// 财务记录Hook
export function useFinanceRecords(params?: FinanceRecordQueryParams) {
  const [data, setData] = useState<PaginatedResponse<FinanceRecord> | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(
    async (newParams?: FinanceRecordQueryParams) => {
      try {
        setLoading(true);
        setError(null);
        const result = await apiService.getFinanceRecords(newParams || params);
        setData(result);
        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "获取财务记录失败";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [params]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data: data?.data || [],
    total: data?.total || 0,
    page: data?.page || 1,
    limit: data?.limit || 10,
    loading,
    error,
    refresh: fetchData,
  };
}

// 财务统计Hook
export function useFinanceStats(currency?: string) {
  const [data, setData] = useState<FinanceStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiService.getFinanceStats(currency);
      setData(result);
      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "获取财务统计失败";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currency]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refresh: fetchData,
  };
}

// ==================== 搜索相关Hook ====================

// 搜索Hook
export function useSearch() {
  const { data, loading, error, execute } =
    useAsyncOperation<PaginatedResponse<ValueID>>();

  const search = useCallback(
    async (
      query: string,
      params?: Omit<import("@/types").SearchQueryParams, "q">
    ) => {
      return execute(() => apiService.searchValueIDs({ q: query, ...params }));
    },
    [execute]
  );

  const getRecommendations = useCallback(async (limit = 10) => {
    return apiService.getSearchRecommendations(limit);
  }, []);

  const getLatest = useCallback(async (limit = 10) => {
    return apiService.getSearchLatest(limit);
  }, []);

  const getTrending = useCallback(async (limit = 10) => {
    return apiService.getSearchTrending(limit);
  }, []);

  return {
    results: data?.data || [],
    total: data?.total || 0,
    loading,
    error,
    search,
    getRecommendations,
    getLatest,
    getTrending,
  };
}
