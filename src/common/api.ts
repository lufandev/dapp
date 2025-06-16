import { httpClient } from "./http";
import { API_ENDPOINTS } from "@/config/api";
import {
  // 通用类型
  PaginatedResponse,

  // 用户相关类型
  User,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  WalletLoginRequest,

  // NFT/ValueID 相关类型
  ValueID,
  CreateValueIDRequest,
  ListForSaleRequest,
  ListForRentRequest,
  ValueIDQueryParams,

  // 订单相关类型
  Order,
  CreateOrderRequest,
  OrderQueryParams,

  // 交易相关类型
  Transaction,
  CreateTransactionRequest,
  TransactionQueryParams,
  TransactionStats,

  // 财务相关类型
  Wallet,
  CreateWalletRequest,
  TransferRequest,
  WithdrawRequest,
  DepositRequest,
  FinanceRecord,
  FinanceStats,
  FinanceRecordQueryParams,

  // 搜索相关类型
  SearchQueryParams,
} from "@/types";

// 订单相关数据类型
export interface BuyOrder {
  id: string;
  valueId: string;
  imageUrl: string;
  name: string;
  price: number;
  currency: string;
  status: "pending" | "completed" | "canceled";
  createTime: string;
  completedTime?: string;
  buyer: string;
  seller: string;
  txHash?: string;
}

export interface CreateBuyOrderRequest {
  valueId: string;
  price: number;
  currency: string;
}

export interface OrderListResponse {
  orders: BuyOrder[];
  total: number;
  page: number;
  pageSize: number;
}

// ValueID相关数据类型
export interface ValueIDListResponse {
  data: ValueID[];
  total: number;
  page: number;
  limit: number;
}

// NFT相关数据类型
export interface NFTItem {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  price: number;
  currency: string;
  owner: string;
  category: string;
  rarity: string;
}

// 用户相关数据类型
export interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  walletAddress: string;
  createdAt: string;
}

// API服务类
class ApiService {
  // ==================== 认证相关接口 ====================

  // 用户注册
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await httpClient.post<AuthResponse>(
      API_ENDPOINTS.AUTH.REGISTER,
      data
    );

    // 注册成功后设置token
    if (response.access_token) {
      httpClient.setAuthToken(response.access_token);
      localStorage.setItem("auth_token", response.access_token);
    }

    return response;
  }

  // 用户登录
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await httpClient.post<AuthResponse>(
      API_ENDPOINTS.AUTH.LOGIN,
      data
    );

    // 登录成功后设置token
    if (response.access_token) {
      httpClient.setAuthToken(response.access_token);
      localStorage.setItem("auth_token", response.access_token);
    }

    return response;
  }

  // 钱包签名登录
  async walletLogin(data: WalletLoginRequest): Promise<AuthResponse> {
    const response = await httpClient.post<AuthResponse>(
      API_ENDPOINTS.AUTH.WALLET_LOGIN,
      data
    );

    // 登录成功后设置token
    if (response.access_token) {
      httpClient.setAuthToken(response.access_token);
      localStorage.setItem("auth_token", response.access_token);
    }

    return response;
  }

  // ==================== 用户相关接口 ====================

  // 获取用户列表
  async getUserList(): Promise<User[]> {
    return httpClient.get<User[]>(API_ENDPOINTS.USER.LIST);
  }

  // 获取用户详情
  async getUserDetail(id: number): Promise<User> {
    return httpClient.get<User>(API_ENDPOINTS.USER.DETAIL(id));
  }

  // 更新用户信息
  async updateUser(id: number, data: Partial<User>): Promise<User> {
    return httpClient.patch<User>(API_ENDPOINTS.USER.UPDATE(id), data);
  }

  // 获取用户信息
  async getUserProfile(id: number): Promise<User> {
    return httpClient.get<User>(API_ENDPOINTS.USER.PROFILE(id));
  }

  // 获取当前用户所拥有的ValueID列表
  async getCurrentUserValueIDs(): Promise<{ ownedValueIDs: ValueID[] }> {
    return httpClient.get<{ ownedValueIDs: ValueID[] }>(
      API_ENDPOINTS.USER.OWNED_VALUE_IDS(1)
    );
  }

  // 获取当前用户所租赁的ValueID列表
  async getCurrentUserRentedValueIDs(): Promise<{
    rentedValueIDs: ValueID[];
  }> {
    return httpClient.get<{ rentedValueIDs: ValueID[] }>(
      API_ENDPOINTS.USER.RENTED_VALUE_IDS(1)
    );
  }

  // 获取当前用户所收藏的ValueID列表
  async getCurrentUserFavoriteValueIDs(): Promise<{
    favorites: ValueID[];
  }> {
    return httpClient.get<{ favorites: ValueID[] }>(
      API_ENDPOINTS.USER.FAVORITE_VALUE_IDS(1)
    );
  }

  // ==================== NFT/ValueID 相关接口 ====================

  // 获取ValueID列表
  async getValueIDList(
    params: ValueIDQueryParams = {}
  ): Promise<PaginatedResponse<ValueID>> {
    const queryParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    const queryString = queryParams.toString();
    const url = queryString
      ? `${API_ENDPOINTS.VALUE_IDS.LIST}?${queryString}`
      : API_ENDPOINTS.VALUE_IDS.LIST;

    return httpClient.get<PaginatedResponse<ValueID>>(url);
  }

  // 获取ValueID详情
  async getValueIDDetail(id: number): Promise<ValueID> {
    return httpClient.get<ValueID>(API_ENDPOINTS.VALUE_IDS.DETAIL(id));
  }

  // 创建ValueID
  async createValueID(data: CreateValueIDRequest): Promise<ValueID> {
    return httpClient.post<ValueID>(API_ENDPOINTS.VALUE_IDS.CREATE, data);
  }

  // 更新ValueID
  async updateValueID(
    id: number,
    data: Partial<CreateValueIDRequest>
  ): Promise<ValueID> {
    return httpClient.patch<ValueID>(API_ENDPOINTS.VALUE_IDS.UPDATE(id), data);
  }

  // 删除ValueID
  async deleteValueID(id: number): Promise<void> {
    return httpClient.delete<void>(API_ENDPOINTS.VALUE_IDS.DELETE(id));
  }

  // 上架销售
  async listForSale(id: number, data: ListForSaleRequest): Promise<void> {
    return httpClient.post<void>(
      API_ENDPOINTS.VALUE_IDS.LIST_FOR_SALE(id),
      data
    );
  }

  // 上架租赁
  async listForRent(id: number, data: ListForRentRequest): Promise<void> {
    return httpClient.post<void>(
      API_ENDPOINTS.VALUE_IDS.LIST_FOR_RENT(id),
      data
    );
  }

  // 取消销售
  async cancelSale(id: number): Promise<void> {
    return httpClient.post<void>(API_ENDPOINTS.VALUE_IDS.CANCEL_SALE(id));
  }

  // 取消租赁
  async cancelRent(id: number): Promise<void> {
    return httpClient.post<void>(API_ENDPOINTS.VALUE_IDS.CANCEL_RENT(id));
  }

  // 添加收藏
  async addFavorite(id: number): Promise<void> {
    return httpClient.post<void>(API_ENDPOINTS.VALUE_IDS.ADD_FAVORITE(id));
  }

  // 取消收藏
  async removeFavorite(id: number): Promise<void> {
    return httpClient.delete<void>(API_ENDPOINTS.VALUE_IDS.REMOVE_FAVORITE(id));
  }

  // 获取推荐ValueID
  async getRecommendedValueIDs(limit = 10): Promise<ValueID[]> {
    return httpClient.get<ValueID[]>(
      `${API_ENDPOINTS.VALUE_IDS.RECOMMENDATIONS}?limit=${limit}`
    );
  }

  // 获取最新ValueID
  async getLatestValueIDs(limit = 10): Promise<ValueID[]> {
    return httpClient.get<ValueID[]>(
      `${API_ENDPOINTS.VALUE_IDS.LATEST}?limit=${limit}`
    );
  }

  // ==================== 订单相关接口 ====================

  // 创建订单
  async createOrder(data: CreateOrderRequest): Promise<Order> {
    return httpClient.post<Order>(API_ENDPOINTS.ORDERS.CREATE, data);
  }

  // 获取订单列表
  async getOrderList(
    params: OrderQueryParams = {}
  ): Promise<PaginatedResponse<Order>> {
    const queryParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    const queryString = queryParams.toString();
    const url = queryString
      ? `${API_ENDPOINTS.ORDERS.LIST}?${queryString}`
      : API_ENDPOINTS.ORDERS.LIST;

    return httpClient.get<PaginatedResponse<Order>>(url);
  }

  // 获取所有订单（管理员）
  async getAllOrders(
    params: OrderQueryParams = {}
  ): Promise<PaginatedResponse<Order>> {
    const queryParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    const queryString = queryParams.toString();
    const url = queryString
      ? `${API_ENDPOINTS.ORDERS.ALL}?${queryString}`
      : API_ENDPOINTS.ORDERS.ALL;

    return httpClient.get<PaginatedResponse<Order>>(url);
  }

  // 获取订单详情
  async getOrderDetail(id: number): Promise<Order> {
    return httpClient.get<Order>(API_ENDPOINTS.ORDERS.DETAIL(id));
  }

  // 更新订单
  async updateOrder(
    id: number,
    data: Partial<CreateOrderRequest>
  ): Promise<Order> {
    return httpClient.patch<Order>(API_ENDPOINTS.ORDERS.UPDATE(id), data);
  }

  // 取消订单
  async cancelOrder(id: number): Promise<void> {
    return httpClient.post<void>(API_ENDPOINTS.ORDERS.CANCEL(id));
  }

  // 完成订单
  async completeOrder(id: number): Promise<void> {
    return httpClient.post<void>(API_ENDPOINTS.ORDERS.COMPLETE(id));
  }

  // 删除订单
  async deleteOrder(id: number): Promise<void> {
    return httpClient.delete<void>(API_ENDPOINTS.ORDERS.DELETE(id));
  }

  // ==================== 交易相关接口 ====================

  // 创建交易
  async createTransaction(
    data: CreateTransactionRequest
  ): Promise<Transaction> {
    return httpClient.post<Transaction>(
      API_ENDPOINTS.TRANSACTIONS.CREATE,
      data
    );
  }

  // 获取交易列表
  async getTransactionList(
    params: TransactionQueryParams = {}
  ): Promise<PaginatedResponse<Transaction>> {
    const queryParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    const queryString = queryParams.toString();
    const url = queryString
      ? `${API_ENDPOINTS.TRANSACTIONS.LIST}?${queryString}`
      : API_ENDPOINTS.TRANSACTIONS.LIST;

    return httpClient.get<PaginatedResponse<Transaction>>(url);
  }

  // 获取交易详情
  async getTransactionDetail(id: number): Promise<Transaction> {
    return httpClient.get<Transaction>(API_ENDPOINTS.TRANSACTIONS.DETAIL(id));
  }

  // 获取交易统计
  async getTransactionStats(): Promise<TransactionStats> {
    return httpClient.get<TransactionStats>(API_ENDPOINTS.TRANSACTIONS.STATS);
  }

  // 确认交易
  async confirmTransaction(id: number): Promise<void> {
    return httpClient.post<void>(API_ENDPOINTS.TRANSACTIONS.CONFIRM(id));
  }

  // 标记交易失败
  async failTransaction(id: number, reason: string): Promise<void> {
    return httpClient.post<void>(API_ENDPOINTS.TRANSACTIONS.FAIL(id), {
      reason,
    });
  }

  // ==================== 财务相关接口 ====================

  // 创建钱包
  async createWallet(data: CreateWalletRequest): Promise<Wallet> {
    return httpClient.post<Wallet>(API_ENDPOINTS.FINANCE.WALLETS, data);
  }

  // 获取钱包列表
  async getWalletList(): Promise<Wallet[]> {
    return httpClient.get<Wallet[]>(API_ENDPOINTS.FINANCE.WALLETS);
  }

  // 获取钱包详情
  async getWalletDetail(id: number): Promise<Wallet> {
    return httpClient.get<Wallet>(API_ENDPOINTS.FINANCE.WALLET_DETAIL(id));
  }

  // 更新钱包
  async updateWallet(
    id: number,
    data: Partial<CreateWalletRequest>
  ): Promise<Wallet> {
    return httpClient.patch<Wallet>(
      API_ENDPOINTS.FINANCE.WALLET_UPDATE(id),
      data
    );
  }

  // 查询余额
  async getBalance(currency: string): Promise<{ balance: number }> {
    return httpClient.get<{ balance: number }>(
      API_ENDPOINTS.FINANCE.BALANCE(currency)
    );
  }

  // 用户间转账
  async transfer(data: TransferRequest): Promise<void> {
    return httpClient.post<void>(API_ENDPOINTS.FINANCE.TRANSFER, data);
  }

  // 提现
  async withdraw(data: WithdrawRequest): Promise<void> {
    return httpClient.post<void>(API_ENDPOINTS.FINANCE.WITHDRAW, data);
  }

  // 充值
  async deposit(data: DepositRequest): Promise<void> {
    return httpClient.post<void>(API_ENDPOINTS.FINANCE.DEPOSIT, data);
  }

  // 获取财务记录
  async getFinanceRecords(
    params: FinanceRecordQueryParams = {}
  ): Promise<PaginatedResponse<FinanceRecord>> {
    const queryParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    const queryString = queryParams.toString();
    const url = queryString
      ? `${API_ENDPOINTS.FINANCE.RECORDS}?${queryString}`
      : API_ENDPOINTS.FINANCE.RECORDS;

    return httpClient.get<PaginatedResponse<FinanceRecord>>(url);
  }

  // 获取财务统计
  async getFinanceStats(currency?: string): Promise<FinanceStats> {
    const url = currency
      ? `${API_ENDPOINTS.FINANCE.STATS}?currency=${currency}`
      : API_ENDPOINTS.FINANCE.STATS;

    return httpClient.get<FinanceStats>(url);
  }

  // ==================== 搜索相关接口 ====================

  // 搜索ValueID
  async searchValueIDs(
    params: SearchQueryParams = {}
  ): Promise<PaginatedResponse<ValueID>> {
    const queryParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    const queryString = queryParams.toString();
    const url = queryString
      ? `${API_ENDPOINTS.SEARCH.VALUE_IDS}?${queryString}`
      : API_ENDPOINTS.SEARCH.VALUE_IDS;

    return httpClient.get<PaginatedResponse<ValueID>>(url);
  }

  // 获取搜索推荐
  async getSearchRecommendations(limit = 10): Promise<ValueID[]> {
    return httpClient.get<ValueID[]>(
      `${API_ENDPOINTS.SEARCH.RECOMMENDATIONS}?limit=${limit}`
    );
  }

  // 获取搜索最新
  async getSearchLatest(limit = 10): Promise<ValueID[]> {
    return httpClient.get<ValueID[]>(
      `${API_ENDPOINTS.SEARCH.LATEST}?limit=${limit}`
    );
  }

  // 获取搜索热门
  async getSearchTrending(limit = 10): Promise<ValueID[]> {
    return httpClient.get<ValueID[]>(
      `${API_ENDPOINTS.SEARCH.TRENDING}?limit=${limit}`
    );
  }

  // ==================== 认证状态管理 ====================

  // 初始化认证状态
  initializeAuth(): void {
    const token = localStorage.getItem("auth_token");
    if (token) {
      httpClient.setAuthToken(token);
    }
  }

  // 检查是否已认证
  isAuthenticated(): boolean {
    return !!localStorage.getItem("auth_token");
  }

  // 退出登录
  logout(): void {
    httpClient.clearAuthToken();
    localStorage.removeItem("auth_token");
  }

  // ==================== 兼容性方法（保持旧代码工作） ====================

  // 获取所有ValueID (兼容)
  async getAllValueIDs(): Promise<ValueID[]> {
    const response = await this.getValueIDList();
    return response.data;
  }

  // 搜索ValueID (兼容)
  async searchValueIDs_old(query: string): Promise<ValueID[]> {
    const response = await this.searchValueIDs({ q: query });
    return response.data;
  }

  // 创建购买订单 (兼容)
  async createBuyOrder(data: {
    valueId: string;
    price: number;
    currency: string;
  }): Promise<Order> {
    return this.createOrder({
      type: "buy",
      valueIdId: parseInt(data.valueId.replace("nft-", "")),
      amount: data.price,
      currency: data.currency,
    });
  }

  // 获取订单列表 (兼容)
  async getOrderList_old(
    page = 1,
    pageSize = 20
  ): Promise<{
    orders: Order[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const response = await this.getOrderList({ page, limit: pageSize });
    return {
      orders: response.data,
      total: response.total,
      page: response.page,
      pageSize: response.limit,
    };
  }
}

// 导出单例实例
export const apiService = new ApiService();
