import { useState, useEffect, useCallback, useRef, createContext } from 'react';
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

  // 防护标志，避免重复的认证检查
  const isCheckingAuth = useRef(false);

  // 强制重新渲染计数器 - 用于调试状态更新问题
  const [forceRenderCount, setForceRenderCount] = useState(0);

  /**
   * 更新认证状态 - 深度调试版本，跟踪状态更新和组件重新渲染
   */
  const updateAuthState = useCallback((updates: Partial<AuthState>) => {
    console.log('🔄 开始更新认证状态:', {
      timestamp: new Date().toISOString(),
      updates,
      updateKeys: Object.keys(updates),
      stackTrace: new Error().stack?.split('\n').slice(1, 4) // 显示调用栈
    });

    setAuthState(prev => {
      const newState = { ...prev, ...updates };
      const stateChanged = JSON.stringify(prev) !== JSON.stringify(newState);

      console.log('✅ 认证状态更新完成:', {
        timestamp: new Date().toISOString(),
        stateChanged,
        previousState: {
          isAuthenticated: prev.isAuthenticated,
          loading: prev.loading,
          hasUser: !!prev.user,
          userId: prev.user?.id
        },
        newState: {
          isAuthenticated: newState.isAuthenticated,
          loading: newState.loading,
          hasUser: !!newState.user,
          userId: newState.user?.id
        }
      });

      // 如果是登录成功的状态更新，添加额外的验证日志
      if (!prev.isAuthenticated && newState.isAuthenticated && newState.user) {
        console.log('🎉 登录状态更新成功 - 应该触发AuthNavigator重新渲染:', {
          timestamp: new Date().toISOString(),
          userId: newState.user.id,
          username: newState.user.username,
          isAuthenticated: newState.isAuthenticated,
          loading: newState.loading,
          expectedNavigation: 'AuthNavigator应该显示MainNavigator'
        });
      }

      // 如果是登出状态更新
      if (prev.isAuthenticated && !newState.isAuthenticated) {
        console.log('🚪 登出状态更新成功 - 应该触发AuthNavigator重新渲染:', {
          timestamp: new Date().toISOString(),
          previousUser: prev.user?.username,
          isAuthenticated: newState.isAuthenticated,
          loading: newState.loading,
          expectedNavigation: 'AuthNavigator应该显示AuthNavigator'
        });
      }

      return newState;
    });

    // 强制触发组件重新渲染 - 用于调试
    setForceRenderCount(prev => prev + 1);

    // 使用setTimeout确保状态更新后的日志
    setTimeout(() => {
      console.log('⏰ 状态更新后验证 (异步):', {
        timestamp: new Date().toISOString(),
        message: '如果AuthNavigator没有重新渲染，说明存在问题',
        forceRenderCount: forceRenderCount + 1
      });
    }, 0);
  }, [forceRenderCount]); // 添加forceRenderCount依赖

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
      // 注意：rememberMe日志已移除，因为后端API不接受此字段
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
        console.log('💾 开始存储token到AsyncStorage...');
        await HttpClient.setToken(accessToken);
        console.log('✅ Token存储成功');

        // 直接更新认证状态，不使用复杂的Promise包装
        console.log('🔄 更新认证状态...');
        updateAuthState({
          isAuthenticated: true,
          user,
          loading: false,
          error: null,
        });

        console.log('🎉 登录流程完成:', {
          userId: user.id,
          username: user.username,
          timestamp: new Date().toISOString()
        });

        // 显示成功提示
        Toast.success(`欢迎回来，${user.username}！`);

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
      Toast.error(errorMessage); // 修复：移除第二个参数，使用默认duration
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
          Toast.success(`注册成功，欢迎加入，${loginUser.username}！`); // 修复：移除第二个参数
          return true;
        } else {
          // 注册成功但登录失败，提示用户手动登录
          updateAuthState({
            isAuthenticated: false,
            user: null,
            loading: false,
            error: '注册成功，请手动登录',
          });
          Toast.warning('注册成功，请手动登录'); // 修复：移除第二个参数
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
      Toast.error(errorMessage); // 修复：移除第二个参数，使用默认duration
      return false;
    }
  }, [updateAuthState, clearError, handleHttpError]);

  /**
   * 登出方法 - 完整的退出登录功能实现
   */
  const logout = useCallback(async (): Promise<void> => {
    try {
      console.log('🚪 开始登出流程:', {
        timestamp: new Date().toISOString(),
        currentUser: authState.user?.username,
        userId: authState.user?.id
      });

      setLoading(true);

      // 第一步：调用后端登出接口
      try {
        console.log('🌐 调用后端登出接口...');
        const response = await HttpClient.post('auth/logout', {}, {
          withAuth: true, // 需要携带token进行认证
        });

        if (response.success) {
          console.log('✅ 后端登出接口调用成功');
        } else {
          console.warn('⚠️ 后端登出接口返回失败状态，但继续本地登出流程');
        }
      } catch (error) {
        console.warn('❌ 后端登出请求失败:', error);
        console.log('📋 继续执行本地登出流程，确保用户能够成功退出');
        // 即使后端登出失败，也继续本地登出流程
      }

      // 第二步：清除本地存储的所有认证相关数据
      console.log('🧽 清除本地认证数据...');
      await HttpClient.clearToken();
      console.log('✅ 本地token已清除');

      // 第三步：重置应用的认证状态
      console.log('🔄 重置认证状态...');
      updateAuthState({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: null,
      });

      console.log('🎉 登出流程完成:', {
        timestamp: new Date().toISOString(),
        message: '用户已成功退出，AuthNavigator将自动跳转到登录界面'
      });

      // 显示成功提示
      Toast.success('已成功退出登录');

    } catch (error) {
      console.error('❌ 登出过程中发生意外错误:', error);

      // 即使发生错误，也要确保本地状态被清除
      console.log('🛡️ 执行兜底清理逻辑...');
      try {
        await HttpClient.clearToken();
        updateAuthState({
          isAuthenticated: false,
          user: null,
          loading: false,
          error: null,
        });
        console.log('✅ 兜底清理完成，用户状态已重置');
        Toast.success('已退出登录');
      } catch (cleanupError) {
        console.error('❌ 兜底清理也失败:', cleanupError);
        // 强制重置状态，确保用户能够退出
        updateAuthState({
          isAuthenticated: false,
          user: null,
          loading: false,
          error: null,
        });
        Toast.warning('退出登录完成，如有问题请重启应用');
      }
    }
  }, [updateAuthState, setLoading, authState.user]);

  /**
   * 刷新用户信息
   */
  const refreshUser = useCallback(async (): Promise<void> => {
    try {
      console.log('🔄 开始刷新用户信息...');
      clearError();

      console.log('🌐 发送用户信息请求到 /auth/profile...');
      const response = await HttpClient.get<UserInfo>('auth/profile');

      console.log('📦 用户信息响应:', { success: response.success, hasData: !!response.data });
      if (response.success && response.data) {
        console.log('✅ 用户信息获取成功:', { userId: response.data.id, username: response.data.username });
        updateAuthState({
          user: response.data,
          isAuthenticated: true,
          loading: false,
        });
        console.log('✅ 认证状态已更新为已认证');
      } else {
        throw new Error('获取用户信息失败');
      }
    } catch (error) {
      console.error('❌ 刷新用户信息失败:', error);

      // 如果是认证错误，执行登出
      if (error && typeof error === 'object' && 'code' in error && error.code === 'AUTH_ERROR') {
        console.log('🚪 认证错误，执行自动登出...');
        await logout();
      } else {
        console.log('📊 设置错误状态，loading设为false');
        updateAuthState({
          loading: false,
          error: handleHttpError(error as HttpError),
        });
      }
    }
  }, [updateAuthState, clearError, handleHttpError, logout]);

  /**
   * 检查认证状态 - 添加防护机制避免重复调用和登录后的意外重置
   */
  const checkAuthStatus = useCallback(async (): Promise<void> => {
    // 防护机制：如果已经在检查中，直接返回
    if (isCheckingAuth.current) {
      console.log('⚠️ 认证状态检查已在进行中，跳过重复调用');
      return;
    }

    // 强化防护：如果用户已经认证且不在加载状态，跳过检查避免状态重置
    if (authState.isAuthenticated && authState.user && !authState.loading) {
      console.log('✅ 用户已认证且状态稳定，跳过状态检查:', {
        userId: authState.user.id,
        username: authState.user.username,
        isAuthenticated: authState.isAuthenticated,
        loading: authState.loading,
        timestamp: new Date().toISOString()
      });
      return;
    }

    try {
      console.log('🔍 开始检查认证状态...');
      isCheckingAuth.current = true;
      updateAuthState({ loading: true });

      // 检查是否有存储的token
      console.log('💾 检查本地存储的token...');
      const token = await HttpClient.getStoredToken();

      if (!token) {
        // 没有token，设置为未认证状态
        console.log('❌ 未找到本地token，设置为未认证状态');
        updateAuthState({
          isAuthenticated: false,
          user: null,
          loading: false,
          error: null,
        });
        return;
      }

      console.log('✅ 找到本地token，开始验证token有效性...');
      // 直接调用API验证token，避免使用refreshUser（它可能触发logout）
      try {
        const response = await HttpClient.get<UserInfo>('auth/profile');

        if (response.success && response.data) {
          console.log('✅ Token验证成功，更新认证状态');
          updateAuthState({
            isAuthenticated: true,
            user: response.data,
            loading: false,
            error: null,
          });
        } else {
          throw new Error('Token验证失败');
        }
      } catch (tokenError) {
        console.log('❌ Token验证失败，清除无效token');
        throw tokenError; // 重新抛出错误，让外层catch处理
      }
    } catch (error) {
      console.error('❌ 检查认证状态失败:', error);

      // 认证检查失败，清除token并设置为未认证状态
      console.log('🧽 清除无效token并重置认证状态...');
      await HttpClient.clearToken();
      updateAuthState({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: null,
      });
      console.log('✅ 认证状态已重置');
    } finally {
      // 确保防护标志被重置
      isCheckingAuth.current = false;
      console.log('🔓 认证检查完成，重置防护标志');
    }
  }, [updateAuthState, refreshUser, authState.isAuthenticated, authState.user]);

  /**
   * 组件挂载时检查认证状态 - 只在真正需要时执行
   */
  useEffect(() => {
    console.log('🚀 useAuth Hook初始化，检查是否需要验证认证状态');

    // 只有在初始状态（loading=true且未认证）时才检查认证状态
    if (authState.loading && !authState.isAuthenticated && !authState.user) {
      console.log('📋 执行初始认证状态检查');
      checkAuthStatus();
    } else {
      console.log('⏭️ 跳过认证状态检查，当前状态:', {
        loading: authState.loading,
        isAuthenticated: authState.isAuthenticated,
        hasUser: !!authState.user
      });
      // 如果不是初始状态，直接设置loading为false
      if (authState.loading) {
        updateAuthState({ loading: false });
      }
    }
  }, []); // 空依赖数组，只在组件挂载时执行一次

  /**
   * 监听认证状态变化，用于调试
   */
  useEffect(() => {
    console.log('🔍 useAuth状态变化监听:', {
      timestamp: new Date().toISOString(),
      isAuthenticated: authState.isAuthenticated,
      hasUser: !!authState.user,
      userId: authState.user?.id,
      username: authState.user?.username,
      loading: authState.loading,
      hasError: !!authState.error
    });
  }, [authState.isAuthenticated, authState.user, authState.loading, authState.error]);

  // 创建返回对象并添加调试信息
  const returnValue = {
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

    // 调试用的强制渲染计数器
    _forceRenderCount: forceRenderCount,
  };

  // 调试：记录useAuth返回的状态
  console.log('📤 useAuth返回状态:', {
    timestamp: new Date().toISOString(),
    isAuthenticated: returnValue.isAuthenticated,
    loading: returnValue.loading,
    hasUser: !!returnValue.user,
    userId: returnValue.user?.id,
    username: returnValue.user?.username,
    hasError: !!returnValue.error,
    forceRenderCount: returnValue._forceRenderCount
  });

  return returnValue;
};

/**
 * 认证上下文 - 确保全局状态共享
 */
export const AuthContext = createContext<UseAuthReturn | null>(null);
