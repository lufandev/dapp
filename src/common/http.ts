import { API_CONFIG } from "@/config/api";

// 请求选项接口
interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  headers?: Record<string, string>;
  body?: unknown;
  timeout?: number;
}

// 响应数据接口
interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
  success: boolean;
}

// 错误处理类
class ApiError extends Error {
  public code: number;
  public details?: unknown;

  constructor(options: { code: number; message: string; details?: unknown }) {
    super(options.message);
    this.code = options.code;
    this.details = options.details;
    this.name = "ApiError";
  }
}

class HttpClient {
  private baseURL: string;
  private timeout: number;
  private defaultHeaders: Record<string, string>;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
    this.defaultHeaders = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
  }

  // 设置认证token
  setAuthToken(token: string) {
    this.defaultHeaders["Authorization"] = `Bearer ${token}`;
  }

  // 清除认证token
  clearAuthToken() {
    delete this.defaultHeaders["Authorization"];
  }

  // 通用请求方法
  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const {
      method = "GET",
      headers = {},
      body,
      timeout = this.timeout,
    } = options;

    const url = `${this.baseURL}${endpoint}`;

    const config: RequestInit = {
      method,
      headers: {
        ...this.defaultHeaders,
        ...headers,
      },
    };

    // 处理请求体
    if (body) {
      if (body instanceof FormData) {
        // FormData不需要设置Content-Type，浏览器会自动设置
        const headers = config.headers as Record<string, string>;
        delete headers["Content-Type"];
        config.body = body;
      } else {
        config.body = JSON.stringify(body);
      }
    }

    try {
      // 设置超时
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      config.signal = controller.signal;

      const response = await fetch(url, config);
      clearTimeout(timeoutId);

      // 检查HTTP状态
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError({
          code: response.status,
          message: errorData.message || `HTTP Error: ${response.status}`,
          details: errorData,
        });
      }

      const data: ApiResponse<T> = await response.json();

      // 检查业务状态
      if (!data.success) {
        throw new ApiError({
          code: data.code,
          message: data.message,
          details: data,
        });
      }

      return data.data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      // 处理网络错误等其他错误
      throw new ApiError({
        code: 0,
        message: error instanceof Error ? error.message : "网络请求失败",
        details: error,
      });
    }
  }

  // GET请求
  async get<T>(endpoint: string, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: "GET", headers });
  }

  // POST请求
  async post<T>(
    endpoint: string,
    body?: unknown,
    headers?: Record<string, string>
  ): Promise<T> {
    return this.request<T>(endpoint, { method: "POST", body, headers });
  }

  // PUT请求
  async put<T>(
    endpoint: string,
    body?: unknown,
    headers?: Record<string, string>
  ): Promise<T> {
    return this.request<T>(endpoint, { method: "PUT", body, headers });
  }

  // DELETE请求
  async delete<T>(
    endpoint: string,
    headers?: Record<string, string>
  ): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE", headers });
  }

  // PATCH请求
  async patch<T>(
    endpoint: string,
    body?: unknown,
    headers?: Record<string, string>
  ): Promise<T> {
    return this.request<T>(endpoint, { method: "PATCH", body, headers });
  }
}

// 导出单例实例
export const httpClient = new HttpClient();
export { ApiError };
export type { ApiResponse };
