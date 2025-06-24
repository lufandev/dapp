// API配置文件
export const API_CONFIG = {
  // 后端API基础URL - 根据环境变量或默认值
  BASE_URL:
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000/api/v1",

  // 请求超时时间
  TIMEOUT: 10000,

  // API版本
  VERSION: "v1",
};

// API端点配置
export const API_ENDPOINTS = {
  // ==================== 认证相关 ====================
  AUTH: {
    REGISTER: "/auth/register",
    LOGIN: "/auth/login",
    WALLET_LOGIN: "/auth/wallet-login",
  },

  // ==================== 用户相关 ====================
  USER: {
    LIST: "/user",
    DETAIL: (id: number) => `/user/${id}`,
    UPDATE: (id: number) => `/user/${id}`,
    PROFILE: (id: number) => `/user/${id}/profile`,
    OWNED_VALUE_IDS: (id: number) => `/user/${id}/owned-value-ids`,
    RENTED_VALUE_IDS: (id: number) => `/user/${id}/rented-value-ids`,
    FAVORITE_VALUE_IDS: (id: number) => `/user/${id}/favorites`,
  },

  // ==================== NFT/ValueID相关 ====================
  VALUE_IDS: {
    LIST: "/value-ids",
    DETAIL: (id: string) => `/value-ids/${id}`,
    CREATE: "/value-ids",
    UPDATE: (id: number) => `/value-ids/${id}`,
    DELETE: (id: number) => `/value-ids/${id}`,
    LIST_FOR_SALE: (id: number) => `/value-ids/${id}/list-for-sale`,
    LIST_FOR_RENT: (id: number) => `/value-ids/${id}/list-for-rent`,
    CANCEL_SALE: (id: number) => `/value-ids/${id}/cancel-sale`,
    CANCEL_RENT: (id: number) => `/value-ids/${id}/cancel-rent`,
    ADD_FAVORITE: (id: number) => `/value-ids/${id}/favorites`,
    REMOVE_FAVORITE: (id: number) => `/value-ids/${id}/favorites`,
    RECOMMENDATIONS: "/value-ids/recommendations",
    LATEST: "/value-ids/latest",
  },

  // ==================== 订单相关 ====================
  ORDERS: {
    LIST: "/orders",
    ALL: "/orders/all",
    DETAIL: (id: number) => `/orders/${id}`,
    CREATE: "/orders",
    UPDATE: (id: number) => `/orders/${id}`,
    CANCEL: (id: number) => `/orders/${id}/cancel`,
    COMPLETE: (id: number) => `/orders/${id}/complete`,
    DELETE: (id: number) => `/orders/${id}`,
  },

  // ==================== 交易相关 ====================
  TRANSACTIONS: {
    LIST: "/transactions",
    DETAIL: (id: number) => `/transactions/${id}`,
    CREATE: "/transactions",
    STATS: "/transactions/stats",
    CONFIRM: (id: number) => `/transactions/${id}/confirm`,
    FAIL: (id: number) => `/transactions/${id}/fail`,
  },

  // ==================== 财务相关 ====================
  FINANCE: {
    // 钱包管理
    WALLETS: "/finance/wallets",
    WALLET_DETAIL: (id: number) => `/finance/wallets/${id}`,
    WALLET_UPDATE: (id: number) => `/finance/wallets/${id}`,

    // 余额管理
    BALANCE: (currency: string) => `/finance/balance/${currency}`,

    // 转账功能
    TRANSFER: "/finance/transfer",

    // 提现和充值
    WITHDRAW: "/finance/withdraw",
    DEPOSIT: "/finance/deposit",

    // 财务记录
    RECORDS: "/finance/records",
    STATS: "/finance/stats",
  },

  // ==================== 搜索相关 ====================
  SEARCH: {
    VALUE_IDS: "/search/value-ids",
    RECOMMENDATIONS: "/search/recommendations",
    LATEST: "/search/latest",
    TRENDING: "/search/trending",
  },
};

// HTTP状态码
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
};
