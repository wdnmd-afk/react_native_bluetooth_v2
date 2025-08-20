import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { HttpClient } from '../utils/HttpClient';
import { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse, UserInfo, HttpError } from '../types/http';
import { Toast } from './useToast';

/**
 * 认证状态接口
 */
interface AuthState {
  /** 是否已认证 */
  isAuthenticated: boolean;
  /** 当前用户信息 */
  user: UserInfo | null;
  /** 是否正在加载 */
  loading: boolean;
  /** 错误信息 */
  error: string | null;
}

/**
 * 认证操作接口
 */
interface AuthActions {
  /** 登录方法 */
  login: (credentials: LoginRequest) => Promise<boolean>;
  /** 注册方法 */
  register: (userData: RegisterRequest) => Promise<boolean>;
  /** 登出方法 */
  logout: () => Promise<void>;
  /** 刷新用户信息 */
  refreshUser: () => Promise<void>;
  /** 清除错误 */
  clearError: () => void;
  /** 检查认证状态 */
  checkAuthStatus: () => Promise<void>;
}

/**
 * useAuth Hook返回类型
 */
export type UseAuthReturn = AuthState & AuthActions;

/**
 * 认证状态管理Hook
 * 提供登录、登出、用户信息管理等功能
 */
export const useAuth = (): UseAuthReturn => {
  // 认证状态
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: true, // 初始加载状态
    error: null,
  });

  /**
   * 更新认证状态
   */
  const updateAuthState = useCallback((updates: Partial<AuthState>) => {
    setAuthState(prev => ({ ...prev, ...updates }));
  }, []);

  /**
   * 设置加载状态
   */
  const setLoading = useCallback((loading: boolean) => {
    updateAuthState({ loading });
  }, [updateAuthState]);

  /**
   * 设置错误信息
   */
  const setError = useCallback((error: string | null) => {
    updateAuthState({ error });
  }, [updateAuthState]);

  /**
   * 清除错误信息
   */
  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);

  /**
   * 处理HTTP错误
   */
  const handleHttpError = useCallback((error: HttpError): string => {
    console.error('HTTP请求错误:', error);
    
    // 根据错误类型返回用户友好的错误消息
    switch (error.code) {
      case 'AUTH_ERROR':
        return '用户名或密码错误';
      case 'NETWORK_ERROR':
        return '网络连接失败，请检查网络设置';
      case 'TIMEOUT_ERROR':
        return '请求超时，请重试';
      case 'SERVER_ERROR':
        return '服务器错误，请稍后重试';
      default:
        return error.message || '未知错误';
    }
  }, []);

  /**
   * 登录方法
   */
  const login = useCallback(async (credentials: LoginRequest): Promise<boolean> => {
    try {
      setLoading(true);
      clearError();

      console.log('🔐 开始登录请求');
      console.log('👤 用户名:', credentials.usernameOrEmail);
      console.log('🔒 密码长度:', credentials.password?.length || 0);
      console.log('💾 记住登录:', credentials.rememberMe);
      console.log('📋 完整登录数据:', JSON.stringify(credentials, null, 2));

      // 发送登录请求
      const response = await HttpClient.post<LoginResponse>('auth/login', credentials, {
        withAuth: false, // 登录请求不需要token
      });

      console.log('🔍 登录响应详情:');
      console.log('✅ 响应成功:', response.success);
      console.log('📦 响应数据:', JSON.stringify(response.data, null, 2));
      console.log('📊 完整响应:', JSON.stringify(response, null, 2));

      if (response.success && response.data) {
        const { accessToken, user } = response.data;

        console.log('🔑 提取的token:', accessToken);
        console.log('👤 提取的用户:', JSON.stringify(user, null, 2));

        // 验证token是否存在
        if (!accessToken) {
          throw new Error('服务器返回的token为空');
        }

        // 存储token
        await HttpClient.setToken(accessToken);

        // 更新认证状态
        updateAuthState({
          isAuthenticated: true,
          user,
          loading: false,
          error: null,
        });

        console.log('登录成功:', { userId: user.id, username: user.username });
        Toast.success(`欢迎回来，${user.username}！`, '登录成功');
        return true;
      } else {
        throw new Error('登录响应数据无效');
      }
    } catch (error) {
      console.error('登录失败:', error);
      
      let errorMessage = '登录失败';
      if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = handleHttpError(error as HttpError);
      }

      updateAuthState({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: errorMessage,
      });

      // 显示错误提示
      Toast.error(errorMessage, '登录失败');
      return false;
    }
  }, [updateAuthState, clearError, handleHttpError]);

  /**
   * 注册方法
   */
  const register = useCallback(async (userData: RegisterRequest): Promise<boolean> => {
    try {
      setLoading(true);
      clearError();

      console.log('开始注册请求:', { username: userData.username, email: userData.email });

      // 发送注册请求
      const response = await HttpClient.post<RegisterResponse>('users', userData, {
        withAuth: false, // 注册请求不需要token
      });

      if (response.success && response.data) {
        const { user } = response.data;

        // 注册成功后自动登录
        const loginResponse = await HttpClient.post<LoginResponse>('auth/login', {
          usernameOrEmail: userData.username,
          password: userData.password,
        }, {
          withAuth: false,
        });

        if (loginResponse.success && loginResponse.data) {
          const { accessToken, user: loginUser } = loginResponse.data;

          // 存储token
          await HttpClient.setToken(accessToken);

          // 更新认证状态
          updateAuthState({
            isAuthenticated: true,
            user: loginUser,
            loading: false,
            error: null,
          });

          console.log('注册并登录成功:', { userId: loginUser.id, username: loginUser.username });
          Toast.success(`注册成功，欢迎加入，${loginUser.username}！`, '注册成功');
          return true;
        } else {
          // 注册成功但登录失败，提示用户手动登录
          updateAuthState({
            isAuthenticated: false,
            user: null,
            loading: false,
            error: '注册成功，请手动登录',
          });
          Toast.warning('注册成功，请手动登录', '注册成功');
          return true;
        }
      } else {
        throw new Error('注册响应数据无效');
      }
    } catch (error) {
      console.error('注册失败:', error);

      let errorMessage = '注册失败';
      if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = handleHttpError(error as HttpError);
      }

      updateAuthState({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: errorMessage,
      });

      // 显示错误提示
      Toast.error(errorMessage, '注册失败');
      return false;
    }
  }, [updateAuthState, clearError, handleHttpError]);

  /**
   * 登出方法
   */
  const logout = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);

      // 调用后端登出接口（可选）
      try {
        await HttpClient.post('auth/logout');
      } catch (error) {
        console.warn('后端登出请求失败:', error);
        // 即使后端登出失败，也继续本地登出流程
      }

      // 清除本地token
      await HttpClient.clearToken();

      // 重置认证状态
      updateAuthState({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: null,
      });

      console.log('登出成功');
    } catch (error) {
      console.error('登出过程中发生错误:', error);
      
      // 即使发生错误，也要清除本地状态
      await HttpClient.clearToken();
      updateAuthState({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: null,
      });
    }
  }, [updateAuthState]);

  /**
   * 刷新用户信息
   */
  const refreshUser = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      clearError();

      const response = await HttpClient.get<UserInfo>('auth/profile');

      if (response.success && response.data) {
        updateAuthState({
          user: response.data,
          isAuthenticated: true,
          loading: false,
        });
      } else {
        throw new Error('获取用户信息失败');
      }
    } catch (error) {
      console.error('刷新用户信息失败:', error);
      
      // 如果是认证错误，执行登出
      if (error && typeof error === 'object' && 'code' in error && error.code === 'AUTH_ERROR') {
        await logout();
      } else {
        updateAuthState({
          loading: false,
          error: handleHttpError(error as HttpError),
        });
      }
    }
  }, [updateAuthState, clearError, handleHttpError, logout]);

  /**
   * 检查认证状态
   */
  const checkAuthStatus = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);

      // 检查是否有存储的token
      const token = await HttpClient.getToken();
      
      if (!token) {
        // 没有token，设置为未认证状态
        updateAuthState({
          isAuthenticated: false,
          user: null,
          loading: false,
        });
        return;
      }

      // 有token，尝试获取用户信息验证token有效性
      await refreshUser();
    } catch (error) {
      console.error('检查认证状态失败:', error);
      
      // 认证检查失败，清除token并设置为未认证状态
      await HttpClient.clearToken();
      updateAuthState({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: null,
      });
    }
  }, [updateAuthState, refreshUser]);

  /**
   * 组件挂载时检查认证状态
   */
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  return {
    // 状态
    isAuthenticated: authState.isAuthenticated,
    user: authState.user,
    loading: authState.loading,
    error: authState.error,

    // 操作方法
    login,
    register,
    logout,
    refreshUser,
    clearError,
    checkAuthStatus,
  };
};
