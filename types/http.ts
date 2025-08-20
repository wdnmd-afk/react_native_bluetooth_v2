/**
 * HTTP客户端相关类型定义
 * 为React Native应用提供类型安全的HTTP请求接口
 */

/**
 * HTTP响应接口
 * @template T 响应数据类型
 */
export interface HttpResponse<T = any> {
  /** 响应数据 */
  data: T;
  /** HTTP状态码 */
  status: number;
  /** 状态文本 */
  statusText: string;
  /** 响应头 */
  headers: Record<string, string>;
  /** 请求是否成功 */
  success: boolean;
}

/**
 * HTTP错误接口
 */
export interface HttpError {
  /** 错误消息 */
  message: string;
  /** HTTP状态码 */
  status?: number;
  /** 错误代码 */
  code?: string;
  /** 详细错误信息 */
  details?: any;
  /** 原始错误对象 */
  originalError?: Error;
}

/**
 * 请求配置选项
 */
export interface RequestOptions {
  /** 请求头 */
  headers?: Record<string, string>;
  /** 请求超时时间（毫秒） */
  timeout?: number;
  /** 是否自动添加认证token */
  withAuth?: boolean;
  /** 自定义基础URL */
  baseURL?: string;
  /** 请求重试次数 */
  retries?: number;
  /** 是否显示加载状态 */
  showLoading?: boolean;
}

/**
 * 登录请求数据
 */
export interface LoginRequest {
  /** 用户名或邮箱 */
  usernameOrEmail: string;
  /** 密码 */
  password: string;
  /** 是否记住登录状态 */
  rememberMe?: boolean;
}

/**
 * 注册请求数据
 */
export interface RegisterRequest {
  /** 用户名 */
  username: string;
  /** 邮箱地址 */
  email: string;
  /** 密码 */
  password: string;
  /** 用户全名 */
  fullName?: string;
  /** 手机号码 */
  phone?: string;
  /** 用户角色 */
  role?: string;
}

/**
 * 登录响应数据
 */
export interface LoginResponse {
  /** JWT访问令牌 */
  accessToken: string;
  /** 令牌类型 */
  tokenType: string;
  /** 令牌过期时间（秒） */
  expiresIn: number;
  /** 用户信息 */
  user: UserInfo;
}

/**
 * 注册响应数据
 */
export interface RegisterResponse {
  /** 注册成功的用户信息 */
  user: UserInfo;
  /** 注册成功消息 */
  message?: string;
}

/**
 * 用户信息接口
 */
export interface UserInfo {
  /** 用户ID */
  id: string;
  /** 用户名 */
  username: string;
  /** 邮箱地址 */
  email: string;
  /** 用户全名 */
  fullName?: string;
  /** 手机号码 */
  phone?: string;
  /** 用户角色 */
  role: string;
  /** 账户是否激活 */
  isActive: boolean;
  /** 邮箱是否已验证 */
  emailVerified: boolean;
  /** 最后登录时间 */
  lastLoginAt?: string;
  /** 用户偏好设置 */
  preferences?: Record<string, any>;
  /** 创建时间 */
  createdAt: string;
  /** 更新时间 */
  updatedAt: string;
}

/**
 * API响应基础结构
 */
export interface ApiResponse<T = any> {
  /** 响应数据 */
  data?: T;
  /** 响应消息 */
  message?: string;
  /** 响应状态码 */
  statusCode: number;
  /** 是否成功 */
  success: boolean;
  /** 错误信息 */
  error?: string;
  /** 时间戳 */
  timestamp?: string;
}

/**
 * 分页查询参数
 */
export interface PaginationParams {
  /** 页码（从1开始） */
  page?: number;
  /** 每页数量 */
  limit?: number;
  /** 排序字段 */
  sortBy?: string;
  /** 排序方向 */
  sortOrder?: 'asc' | 'desc';
}

/**
 * 分页响应数据
 */
export interface PaginatedResponse<T = any> {
  /** 数据列表 */
  items: T[];
  /** 总数量 */
  total: number;
  /** 当前页码 */
  page: number;
  /** 每页数量 */
  limit: number;
  /** 总页数 */
  totalPages: number;
  /** 是否有下一页 */
  hasNext: boolean;
  /** 是否有上一页 */
  hasPrev: boolean;
}

/**
 * HTTP方法枚举
 */
export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH',
}

/**
 * 内容类型枚举
 */
export enum ContentType {
  JSON = 'application/json',
  FORM_DATA = 'multipart/form-data',
  URL_ENCODED = 'application/x-www-form-urlencoded',
  TEXT = 'text/plain',
}

/**
 * HTTP状态码常量
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

/**
 * 错误类型枚举
 */
export enum ErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  AUTH_ERROR = 'AUTH_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}
