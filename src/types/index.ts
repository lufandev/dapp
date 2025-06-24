// ==================== 通用类型 ====================
export interface ApiResponse<T = unknown> {
  success: true;
  data: T;
  message: string;
  timestamp: string;
}

export interface ApiError {
  success: false;
  statusCode: number;
  message: string;
  timestamp: string;
  path: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// ==================== 用户相关类型 ====================
export interface User {
  id: number;
  address: string;
  username: string;
  avatar: string;
  balance: number;
  createdAt: string;
  ownedValueIDs?: ValueID[];
  rentedValueIDs?: ValueID[];
  favorites?: ValueID[];
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface LoginRequest {
  address: string;
  password: string;
}

export interface RegisterRequest {
  address: string;
  username: string;
  password: string;
}

export interface WalletLoginRequest {
  address: string;
  signature: string;
  message: string;
}

// ==================== NFT/ValueID 相关类型 ====================
export interface ValueIDAttribute {
  traitType: string;
  value: string;
  rarity?: number;
}

export interface ValueID {
  id: string;
  name: string;
  description: string;
  image: string;
  tokenId: string;
  indexNumber: string;
  price: number;
  paymentAddress?: string;
  paymentCurrency?: string;
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
  isForSale: boolean;
  isForRent: boolean;
  rentalPrice?: number;
  rentalPeriod?: number;
  viewCount: number;
  favoriteCount: number;
  owner: {
    id: number;
    username: string;
  };
  attributes: ValueIDAttribute[];
  createdAt: string;
}

export interface CreateValueIDRequest {
  name: string;
  description: string;
  image: string;
  tokenId: string;
  indexNumber: string;
  price: number;
  paymentAddress: string;
  paymentCurrency: string;
  rarity: ValueID["rarity"];
  attributes: ValueIDAttribute[];
}

export interface ListForSaleRequest {
  price: number;
  paymentAddress: string;
  paymentCurrency: string;
}

export interface ListForRentRequest {
  rentalPrice: number;
  rentalPeriod: number;
  paymentAddress: string;
  paymentCurrency: string;
}

// 为了保持兼容性，保留NFT类型别名
export type NFT = ValueID;

// ==================== 订单相关类型 ====================
export interface Order {
  id: number;
  type: "buy" | "sell" | "rent";
  status: "pending" | "completed" | "canceled" | "failed";
  amount: number;
  currency: string;
  rentalPeriod?: number;
  valueID: {
    id: number;
    name: string;
  };
  buyer: {
    id: number;
    username: string;
  };
  seller: {
    id: number;
    username: string;
  };
  createdAt: string;
}

export interface CreateOrderRequest {
  type: "buy" | "sell" | "rent";
  valueIdId: number;
  amount: number;
  currency: string;
  rentalPeriod?: number;
}

// ==================== 交易相关类型 ====================
export interface Transaction {
  id: number;
  transactionHash: string;
  type: "purchase" | "sale" | "rental";
  status: "pending" | "completed" | "failed";
  amount: number;
  fee: number;
  netAmount: number;
  currency: string;
  fromAddress?: string;
  toAddress?: string;
  buyer: {
    id: number;
    username: string;
  };
  seller: {
    id: number;
    username: string;
  };
  valueID: {
    id: number;
    name: string;
  };
  createdAt: string;
}

export interface CreateTransactionRequest {
  transactionHash: string;
  type: "purchase" | "sale" | "rental";
  amount: number;
  fee: number;
  currency: string;
  fromAddress: string;
  toAddress: string;
  valueIdId: number;
  buyerId: number;
  sellerId: number;
  orderId: number;
}

export interface TransactionStats {
  totalTransactions: number;
  totalPurchased: number;
  totalEarned: number;
  totalFees: number;
}

// ==================== 财务相关类型 ====================
export interface Wallet {
  id: number;
  address: string;
  currency: string;
  balance: number;
  frozenBalance: number;
  type: string;
  status: string;
  isDefault: boolean;
  label: string;
  createdAt: string;
}

export interface CreateWalletRequest {
  address: string;
  currency: string;
  type: string;
  label: string;
  isDefault: boolean;
}

export interface TransferRequest {
  fromUserId: number;
  toUserId: number;
  amount: number;
  currency: string;
  description: string;
}

export interface WithdrawRequest {
  amount: number;
  currency: string;
  toAddress: string;
  description: string;
}

export interface DepositRequest {
  amount: number;
  currency: string;
  fromAddress: string;
  transactionHash: string;
  description: string;
}

export interface FinanceRecord {
  id: number;
  type: "income" | "expense" | "fee";
  category: "trading" | "rental" | "platform_fee";
  amount: number;
  currency: string;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  createdAt: string;
}

export interface FinanceStats {
  totalIncome: number;
  totalExpense: number;
  totalFees: number;
  totalRecords: number;
  netAmount: number;
}

// ==================== 查询参数类型 ====================
export interface ValueIDQueryParams {
  page?: number;
  limit?: number;
  name?: string;
  rarity?: ValueID["rarity"];
  isForSale?: boolean;
  isForRent?: boolean;
  minPrice?: number;
  maxPrice?: number;
  ownerId?: number;
  sortBy?: "price" | "createdAt" | "viewCount" | "favoriteCount";
  sortOrder?: "ASC" | "DESC";
}

export interface OrderQueryParams {
  page?: number;
  limit?: number;
  type?: Order["type"];
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
}

export interface TransactionQueryParams {
  page?: number;
  limit?: number;
  type?: Transaction["type"];
  status?: Transaction["status"];
  currency?: string;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
}

export interface FinanceRecordQueryParams {
  page?: number;
  limit?: number;
  type?: FinanceRecord["type"];
  category?: FinanceRecord["category"];
  currency?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
}

export interface SearchQueryParams {
  q?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  rarity?: ValueID["rarity"];
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
  page?: number;
  limit?: number;
}

export type TabType = "all" | "recommended" | "latest";
