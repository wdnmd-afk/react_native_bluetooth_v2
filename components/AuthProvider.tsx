import React, { useContext } from 'react';
import { useAuth, AuthContext, UseAuthReturn } from '../hooks/useAuth';

/**
 * 认证提供者组件
 * 确保整个应用使用同一个认证状态实例
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const authValue = useAuth();
  
  console.log('🏗️ AuthProvider渲染:', {
    timestamp: new Date().toISOString(),
    isAuthenticated: authValue.isAuthenticated,
    loading: authValue.loading,
    hasUser: !!authValue.user,
    userId: authValue.user?.id
  });

  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * 使用认证上下文的Hook
 * 替代直接使用useAuth，确保状态同步
 */
export const useAuthContext = (): UseAuthReturn => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  
  console.log('🔗 useAuthContext调用:', {
    timestamp: new Date().toISOString(),
    isAuthenticated: context.isAuthenticated,
    loading: context.loading,
    hasUser: !!context.user,
    userId: context.user?.id
  });
  
  return context;
};
