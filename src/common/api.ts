import { httpClient } from "./http";
import { API_ENDPOINTS } from "@/config/api";
import { ValueID } from "@/types";

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

export interface ValueIDQueryParams {
  page?: number;
  pageSize?: number;
  category?: "all" | "recommended" | "latest";
  rarity?: ValueID["rarity"];
  isForSale?: boolean;
  isForRent?: boolean;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
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

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: UserProfile;
  expiresIn: number;
}

// API服务类
class ApiService {
  // ========== 用户相关接口 ==========

  // 用户登录
  async login(loginData: LoginRequest): Promise<LoginResponse> {
    const response = await httpClient.post<LoginResponse>(
      API_ENDPOINTS.USER.LOGIN,
      loginData
    );

    // 登录成功后设置token
    if (response.token) {
      httpClient.setAuthToken(response.token);
      localStorage.setItem("auth_token", response.token);
    }

    return response;
  }

  // 获取用户信息
  async getUserProfile(): Promise<UserProfile> {
    return httpClient.get<UserProfile>(API_ENDPOINTS.USER.PROFILE);
  }

  // 用户退出登录
  async logout(): Promise<void> {
    try {
      await httpClient.post(API_ENDPOINTS.USER.LOGOUT);
    } finally {
      httpClient.clearAuthToken();
      localStorage.removeItem("auth_token");
    }
  }

  // ========== ValueID相关接口 ==========

  // 获取ValueID列表
  async getValueIDList(
    params: ValueIDQueryParams = {}
  ): Promise<ValueIDListResponse> {
    const queryParams = new URLSearchParams();

    // 构建查询参数
    if (params.page) queryParams.append("page", params.page.toString());
    if (params.pageSize)
      queryParams.append("pageSize", params.pageSize.toString());
    if (params.category) queryParams.append("category", params.category);
    if (params.rarity) queryParams.append("rarity", params.rarity);
    if (params.isForSale !== undefined)
      queryParams.append("isForSale", params.isForSale.toString());
    if (params.isForRent !== undefined)
      queryParams.append("isForRent", params.isForRent.toString());
    if (params.minPrice)
      queryParams.append("minPrice", params.minPrice.toString());
    if (params.maxPrice)
      queryParams.append("maxPrice", params.maxPrice.toString());
    if (params.search) queryParams.append("search", params.search);

    const queryString = queryParams.toString();
    const url = queryString
      ? `${API_ENDPOINTS.NFT.LIST}?${queryString}`
      : API_ENDPOINTS.NFT.LIST;

    return httpClient.get<ValueIDListResponse>(url);
  }

  // 获取所有ValueID
  async getAllValueIDs(): Promise<ValueID[]> {
    const response = await this.getValueIDList();
    console.log("🚀 ~ ApiService ~ getAllValueIDs ~ response:", response);
    return response.data;
  }

  // 获取推荐ValueID
  async getRecommendedValueIDs(): Promise<ValueID[]> {
    const response = await this.getValueIDList({ category: "recommended" });
    return response.data;
  }

  // 获取最新ValueID
  async getLatestValueIDs(): Promise<ValueID[]> {
    const response = await this.getValueIDList({ category: "latest" });
    return response.data;
  }

  // 搜索ValueID
  async searchValueIDs(query: string): Promise<ValueID[]> {
    const response = await this.getValueIDList({ search: query });
    return response.data;
  }

  // 获取ValueID详情
  async getValueIDDetail(id: string): Promise<ValueID> {
    return httpClient.get<ValueID>(API_ENDPOINTS.NFT.DETAIL(id));
  }

  // ========== 订单相关接口 ==========

  // 获取订单列表
  async getOrderList(page = 1, pageSize = 20): Promise<OrderListResponse> {
    return httpClient.get<OrderListResponse>(
      `${API_ENDPOINTS.ORDERS.LIST}?page=${page}&pageSize=${pageSize}`
    );
  }

  // 获取订单详情
  async getOrderDetail(orderId: string): Promise<BuyOrder> {
    return httpClient.get<BuyOrder>(API_ENDPOINTS.ORDERS.DETAIL(orderId));
  }

  // 创建购买订单
  async createBuyOrder(orderData: CreateBuyOrderRequest): Promise<BuyOrder> {
    return httpClient.post<BuyOrder>(API_ENDPOINTS.ORDERS.BUY, orderData);
  }

  // 取消订单
  async cancelOrder(orderId: string): Promise<void> {
    return httpClient.post<void>(API_ENDPOINTS.ORDERS.CANCEL(orderId));
  }

  // ========== NFT相关接口 ==========

  // 获取NFT列表
  async getNFTList(page = 1, pageSize = 20): Promise<NFTItem[]> {
    return httpClient.get<NFTItem[]>(
      `${API_ENDPOINTS.NFT.LIST}?page=${page}&pageSize=${pageSize}`
    );
  }

  // 获取NFT详情
  async getNFTDetail(nftId: string): Promise<NFTItem> {
    return httpClient.get<NFTItem>(API_ENDPOINTS.NFT.DETAIL(nftId));
  }

  // ========== 工具方法 ==========

  // 初始化token（页面刷新时调用）
  initializeAuth(): void {
    const token = localStorage.getItem("auth_token");
    if (token) {
      httpClient.setAuthToken(token);
    }
  }

  // 检查是否已登录
  isAuthenticated(): boolean {
    return !!localStorage.getItem("auth_token");
  }
}

// 导出单例实例
export const apiService = new ApiService();
