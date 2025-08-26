import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  HttpResponse,
  HttpError,
  RequestOptions,
  HttpMethod,
  ContentType,
  HTTP_STATUS,
  ErrorType,
} from '../types/http';
import { AppConfig } from './config';

/**
 * HTTP客户端类
 * 基于fetch API的轻量级HTTP请求封装，专为React Native优化
 */
export class HttpClient {
  /** 基础URL */
  private static baseURL: string = 'http://192.168.0.143:3000/api/v1';
  
  /** 默认请求头 */
  private static defaultHeaders: Record<string, string> = {
    'Content-Type': ContentType.JSON,
    'Accept': ContentType.JSON,
  };
  
  /** 默认超时时间（毫秒） */
  private static defaultTimeout: number = 10000;
  
  /** JWT token存储键 */
  private static readonly TOKEN_KEY = 'auth_token';

  /**
   * 设置基础URL
   * @param url 基础URL
   */
  static setBaseURL(url: string): void {
    this.baseURL = url.replace(/\/$/, ''); // 移除末尾斜杠
  }

  /**
   * 设置默认请求头
   * @param headers 请求头对象
   */
  static setDefaultHeaders(headers: Record<string, string>): void {
    this.defaultHeaders = { ...this.defaultHeaders, ...headers };
  }

  /**
   * 获取存储的JWT token（私有方法）
   * @returns Promise<string | null>
   */
  private static async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(this.TOKEN_KEY);
    } catch (error) {
      console.warn('获取token失败:', error);
      return null;
    }
  }

  /**
   * 获取存储的JWT token（公共方法）
   * @returns Promise<string | null>
   */
  static async getStoredToken(): Promise<string | null> {
    return this.getToken();
  }

  /**
   * 存储JWT token
   * @param token JWT token
   */
  static async setToken(token: string): Promise<void> {
    try {
      // 验证token是否有效
      if (!token || typeof token !== 'string' || token.trim() === '') {
        console.error('❌ 无效的token，无法存储:', { token, type: typeof token });
        throw new Error('Token不能为空或undefined');
      }

      console.log('💾 存储token:', token.substring(0, 20) + '...');
      await AsyncStorage.setItem(this.TOKEN_KEY, token);
      console.log('✅ Token存储成功');
    } catch (error) {
      console.error('❌ 存储token失败:', error);
      throw error; // 重新抛出错误，让调用方知道存储失败
    }
  }

  /**
   * 清除JWT token
   */
  static async clearToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.TOKEN_KEY);
    } catch (error) {
      console.error('清除token失败:', error);
    }
  }

  /**
   * 构建完整URL
   * @param url 相对或绝对URL
   * @param baseURL 自定义基础URL
   * @returns 完整URL
   */
  private static buildURL(url: string, baseURL?: string): string {
    // 如果是绝对URL，直接返回
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    const base = baseURL || this.baseURL;
    const cleanUrl = url.startsWith('/') ? url.slice(1) : url;
    return `${base}/${cleanUrl}`;
  }

  /**
   * 构建请求头
   * @param options 请求选项
   * @returns Promise<Record<string, string>>
   */
  private static async buildHeaders(options: RequestOptions = {}): Promise<Record<string, string>> {
    const headers = { ...this.defaultHeaders, ...options.headers };
    
    // 如果需要认证且未禁用
    if (options.withAuth !== false) {
      const token = await this.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }
    
    return headers;
  }

  /**
   * 处理响应
   * @param response fetch响应对象
   * @returns Promise<HttpResponse>
   */
  private static async handleResponse<T>(response: Response): Promise<HttpResponse<T>> {
    const headers: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });

    let data: T;
    const contentType = response.headers.get('content-type');
    
    try {
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = (await response.text()) as unknown as T;
      }
    } catch (error) {
      throw this.createError('响应解析失败', ErrorType.UNKNOWN_ERROR, response.status, error);
    }

    const result: HttpResponse<T> = {
      data,
      status: response.status,
      statusText: response.statusText,
      headers,
      success: response.ok,
    };

    if (!response.ok) {
      // 尝试从响应数据中提取错误信息
      let errorMessage = `请求失败: ${response.statusText}`;

      if (data && typeof data === 'object') {
        // 检查常见的错误信息字段
        if (data.message) {
          errorMessage = Array.isArray(data.message) ? data.message.join(', ') : data.message;
        } else if (data.error) {
          errorMessage = data.error;
        } else if (data.msg) {
          errorMessage = data.msg;
        }
      }

      console.log('🔍 解析的错误信息:', errorMessage);
      console.log('📦 原始响应数据:', data);

      throw this.createError(
        errorMessage,
        this.getErrorType(response.status),
        response.status,
        result
      );
    }

    return result;
  }

  /**
   * 创建错误对象
   * @param message 错误消息
   * @param type 错误类型
   * @param status HTTP状态码
   * @param originalError 原始错误
   * @returns HttpError
   */
  private static createError(
    message: string,
    type: ErrorType,
    status?: number,
    originalError?: any
  ): HttpError {
    return {
      message,
      code: type,
      status,
      originalError,
      details: originalError,
    };
  }

  /**
   * 根据状态码获取错误类型
   * @param status HTTP状态码
   * @returns ErrorType
   */
  private static getErrorType(status: number): ErrorType {
    switch (status) {
      case HTTP_STATUS.UNAUTHORIZED:
        return ErrorType.AUTH_ERROR;
      case HTTP_STATUS.BAD_REQUEST:
        return ErrorType.VALIDATION_ERROR;
      case HTTP_STATUS.INTERNAL_SERVER_ERROR:
        return ErrorType.SERVER_ERROR;
      default:
        return ErrorType.UNKNOWN_ERROR;
    }
  }

  /**
   * 执行HTTP请求
   * @param method HTTP方法
   * @param url 请求URL
   * @param data 请求数据
   * @param options 请求选项
   * @returns Promise<HttpResponse<T>>
   */
  private static async request<T>(
    method: HttpMethod,
    url: string,
    data?: any,
    options: RequestOptions = {}
  ): Promise<HttpResponse<T>> {
    const fullURL = this.buildURL(url, options.baseURL);
    const headers = await this.buildHeaders(options);
    const timeout = options.timeout || this.defaultTimeout;

    const requestInit: RequestInit = {
      method,
      headers,
    };

    // 添加请求体（GET请求除外）
    if (method !== HttpMethod.GET && data !== undefined) {
      if (headers['Content-Type'] === ContentType.JSON) {
        requestInit.body = JSON.stringify(data);
      } else {
        requestInit.body = data;
      }
    }

    // 🔍 详细请求日志
    console.log('🚀 HTTP请求开始');
    console.log('📍 完整URL:', fullURL);
    console.log('🔧 请求方法:', method);
    console.log('📋 请求头:', JSON.stringify(headers, null, 2));
    console.log('📦 请求数据:', data ? JSON.stringify(data, null, 2) : '无数据');
    console.log('⏱️ 超时时间:', timeout + 'ms');
    console.log('🔗 基础URL配置:', this.baseURL);
    console.log('📱 请求配置:', JSON.stringify(requestInit, null, 2));

    try {
      // 创建超时Promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(this.createError('请求超时', ErrorType.TIMEOUT_ERROR));
        }, timeout);
      });

      // 执行请求
      const response = await Promise.race([
        fetch(fullURL, requestInit),
        timeoutPromise,
      ]);

      console.log('✅ 请求发送成功，开始处理响应');
      return await this.handleResponse<T>(response);
    } catch (error) {
      // 🔍 详细错误日志
      console.log('❌ HTTP请求失败');
      console.log('🔗 请求URL:', fullURL);
      console.log('🔧 请求方法:', method);
      console.log('📦 请求数据:', data ? JSON.stringify(data, null, 2) : '无数据');
      console.log('❗ 错误类型:', error?.constructor?.name || 'Unknown');
      console.log('❗ 错误消息:', error?.message || '未知错误');
      console.log('❗ 完整错误对象:', error);

      if (error instanceof Error) {
        throw this.createError(
          error.message || '网络请求失败',
          ErrorType.NETWORK_ERROR,
          undefined,
          error
        );
      }
      throw error;
    }
  }

  /**
   * GET请求
   * @param url 请求URL
   * @param options 请求选项
   * @returns Promise<HttpResponse<T>>
   */
  static async get<T = any>(url: string, options?: RequestOptions): Promise<HttpResponse<T>> {
    return this.request<T>(HttpMethod.GET, url, undefined, options);
  }

  /**
   * POST请求
   * @param url 请求URL
   * @param data 请求数据
   * @param options 请求选项
   * @returns Promise<HttpResponse<T>>
   */
  static async post<T = any>(url: string, data?: any, options?: RequestOptions): Promise<HttpResponse<T>> {
    return this.request<T>(HttpMethod.POST, url, data, options);
  }

  /**
   * PUT请求
   * @param url 请求URL
   * @param data 请求数据
   * @param options 请求选项
   * @returns Promise<HttpResponse<T>>
   */
  static async put<T = any>(url: string, data?: any, options?: RequestOptions): Promise<HttpResponse<T>> {
    return this.request<T>(HttpMethod.PUT, url, data, options);
  }

  /**
   * DELETE请求
   * @param url 请求URL
   * @param options 请求选项
   * @returns Promise<HttpResponse<T>>
   */
  static async delete<T = any>(url: string, options?: RequestOptions): Promise<HttpResponse<T>> {
    return this.request<T>(HttpMethod.DELETE, url, undefined, options);
  }
}

// 导出Http别名，方便使用
export const Http = HttpClient;
