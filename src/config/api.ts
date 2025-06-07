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
  // 用户相关
  USER: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    PROFILE: "/user/profile",
    LOGOUT: "/auth/logout",
  },

  // 订单相关
  ORDERS: {
    LIST: "/orders",
    DETAIL: (id: string) => `/orders/${id}`,
    BUY: "/orders/buy",
    SELL: "/orders/sell",
    CANCEL: (id: string) => `/orders/${id}/cancel`,
  },

  // NFT相关
  NFT: {
    LIST: "/value-ids",
    DETAIL: (id: string) => `/value-ids/${id}`,
    MINT: "/value-ids/mint",
  },

  // 租赁相关
  RENTAL: {
    LIST: "/rentals",
    DETAIL: (id: string) => `/rentals/${id}`,
    CREATE: "/rentals/create",
  },
};

// HTTP状态码
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};
